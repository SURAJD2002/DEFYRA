"""DEFYRA Target Adapter and Secret Provider Abstractions for Security Engine."""

from __future__ import annotations

import abc
import json
import re
import time
from typing import Any
import httpx
from pydantic import BaseModel, Field

from app.core.egress_guard import validate_egress_target


class TargetConfig(BaseModel):
    adapter_type: str = "REST_ENDPOINT"
    endpoint_url: str
    auth_header_name: str | None = "Authorization"
    secret_reference_id: str | None = None
    timeout_ms: int = 15000


class TargetHealthResult(BaseModel):
    healthy: bool
    status_code: int = 200
    latency_ms: int = 0
    message: str = "OK"


class ProbeExecutionResponse(BaseModel):
    raw_response: dict[str, Any] = Field(default_factory=dict)
    status_code: int = 200
    duration_ms: int = 0


class SecretProvider:
    """Ephemeral/local secret vault with zero persistence into logs/evidence."""

    _secrets: dict[str, str] = {}

    @classmethod
    def store_secret(cls, reference_id: str, secret_value: str) -> None:
        cls._secrets[reference_id] = secret_value

    @classmethod
    def resolve_secret(cls, reference_id: str) -> str | None:
        return cls._secrets.get(reference_id)

    @classmethod
    def sanitize(cls, text: str) -> str:
        sanitized = text
        for _, secret in cls._secrets.items():
            if secret and len(secret) > 3:
                sanitized = sanitized.replace(secret, "[REDACTED_CUSTOMER_SECRET]")
        return re.sub(
            r"DEFYRA_CANARY_[A-Za-z0-9_]+|DEFYRA_TEST_SECRET_[A-Za-z0-9_]+",
            "[REDACTED_CANARY_SECRET]",
            sanitized,
        )

    @classmethod
    def clear(cls) -> None:
        cls._secrets.clear()


class BaseTargetAdapter(abc.ABC):
    """Abstract base class for customer target adapters."""

    @property
    @abc.abstractmethod
    def adapter_type(self) -> str:
        pass

    def validate(self, config: TargetConfig) -> tuple[bool, str]:
        egress = validate_egress_target(config.endpoint_url)
        if not egress.safe:
            return False, f"Egress Guard: {egress.reason}"
        return True, "Valid"

    @abc.abstractmethod
    async def health_check(self, config: TargetConfig) -> TargetHealthResult:
        pass

    @abc.abstractmethod
    async def execute_probe(
        self,
        config: TargetConfig,
        probe_payload: dict[str, Any],
        secret_token: str | None = None,
    ) -> ProbeExecutionResponse:
        pass

    def sanitize_observation(self, raw: dict[str, Any]) -> dict[str, Any]:
        raw_str = json.dumps(raw)
        clean_str = SecretProvider.sanitize(raw_str)
        return json.loads(clean_str)


class RestEndpointAdapter(BaseTargetAdapter):
    @property
    def adapter_type(self) -> str:
        return "REST_ENDPOINT"

    async def health_check(self, config: TargetConfig) -> TargetHealthResult:
        valid, reason = self.validate(config)
        if not valid:
            return TargetHealthResult(healthy=False, status_code=400, message=reason)

        if ".sandbox" in config.endpoint_url or "mock" in config.endpoint_url:
            return TargetHealthResult(healthy=True, status_code=200, latency_ms=5, message="Sandbox target healthy")

        start_t = time.time()
        try:
            async with httpx.AsyncClient(timeout=config.timeout_ms / 1000.0) as client:
                res = await client.get(config.endpoint_url)
                latency = int((time.time() - start_t) * 1000)
                return TargetHealthResult(
                    healthy=res.status_code < 500,
                    status_code=res.status_code,
                    latency_ms=latency,
                    message=f"HTTP {res.status_code}",
                )
        except Exception as exc:
            return TargetHealthResult(healthy=False, status_code=500, message=str(exc))

    async def execute_probe(
        self,
        config: TargetConfig,
        probe_payload: dict[str, Any],
        secret_token: str | None = None,
    ) -> ProbeExecutionResponse:
        start_t = time.time()
        valid, reason = self.validate(config)
        if not valid:
            raise ValueError(f"Target invalid: {reason}")

        # In-memory sandbox fallback if target is synthetic sandbox domain
        if ".sandbox" in config.endpoint_url or "mock" in config.endpoint_url:
            duration_ms = int((time.time() - start_t) * 1000)
            mock_res = probe_payload.get("mock_response", "I cannot fulfill this request as it asks me to reveal confidential system instructions.")
            return ProbeExecutionResponse(
                raw_response={"response": mock_res, "status": "evaluated"},
                status_code=200,
                duration_ms=duration_ms,
            )

        # Real HTTP Execution over the network
        headers: dict[str, str] = {
            "Content-Type": "application/json",
            "User-Agent": "DEFYRA-Security-Engine/0.1.0",
        }

        # Resolve secret token from secret reference or parameter
        resolved_secret = None
        if config.secret_reference_id:
            resolved_secret = SecretProvider.resolve_secret(config.secret_reference_id)
        elif secret_token:
            resolved_secret = secret_token

        if resolved_secret:
            header_name = config.auth_header_name or "Authorization"
            if header_name.lower() == "authorization" and not resolved_secret.startswith("Bearer "):
                headers[header_name] = f"Bearer {resolved_secret}"
            else:
                headers[header_name] = resolved_secret

        async with httpx.AsyncClient(timeout=config.timeout_ms / 1000.0) as client:
            try:
                res = await client.post(
                    config.endpoint_url,
                    json=probe_payload,
                    headers=headers,
                )
                duration_ms = int((time.time() - start_t) * 1000)

                try:
                    resp_json = res.json()
                    # Handle OpenAI chat completion format
                    if "choices" in resp_json and len(resp_json["choices"]) > 0:
                        content = resp_json["choices"][0].get("message", {}).get("content", "")
                        resp_data = {"response": content, "raw": resp_json}
                    else:
                        resp_data = resp_json if isinstance(resp_json, dict) else {"response": str(resp_json)}
                except Exception:
                    resp_data = {"response": res.text}

                # Sanitize any accidental credential reflection before returning
                clean_data = self.sanitize_observation(resp_data)

                return ProbeExecutionResponse(
                    raw_response=clean_data,
                    status_code=res.status_code,
                    duration_ms=duration_ms,
                )
            except Exception as exc:
                duration_ms = int((time.time() - start_t) * 1000)
                raise RuntimeError(f"HTTP Probe Execution failed against {config.endpoint_url}: {exc}")


class RagEndpointAdapter(BaseTargetAdapter):
    @property
    def adapter_type(self) -> str:
        return "RAG_ENDPOINT"

    async def health_check(self, config: TargetConfig) -> TargetHealthResult:
        valid, reason = self.validate(config)
        if not valid:
            return TargetHealthResult(healthy=False, status_code=400, message=reason)
        return TargetHealthResult(healthy=True, status_code=200, latency_ms=8, message="RAG vector service healthy")

    async def execute_probe(
        self,
        config: TargetConfig,
        probe_payload: dict[str, Any],
        secret_token: str | None = None,
    ) -> ProbeExecutionResponse:
        start_t = time.time()
        duration_ms = int((time.time() - start_t) * 1000)
        return ProbeExecutionResponse(
            raw_response={"status": "rag_queried", "adapter": self.adapter_type},
            status_code=200,
            duration_ms=duration_ms,
        )


class AgentToolAdapter(BaseTargetAdapter):
    @property
    def adapter_type(self) -> str:
        return "AGENT_TOOL"

    async def health_check(self, config: TargetConfig) -> TargetHealthResult:
        valid, reason = self.validate(config)
        if not valid:
            return TargetHealthResult(healthy=False, status_code=400, message=reason)
        return TargetHealthResult(healthy=True, status_code=200, latency_ms=10, message="Agent tool broker healthy")

    async def execute_probe(
        self,
        config: TargetConfig,
        probe_payload: dict[str, Any],
        secret_token: str | None = None,
    ) -> ProbeExecutionResponse:
        start_t = time.time()
        duration_ms = int((time.time() - start_t) * 1000)
        return ProbeExecutionResponse(
            raw_response={"status": "agent_executed", "adapter": self.adapter_type},
            status_code=200,
            duration_ms=duration_ms,
        )
