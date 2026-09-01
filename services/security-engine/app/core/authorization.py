"""Cryptographic Execution Capability Token and Authorization Engine."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from dataclasses import dataclass
from typing import Any

from app.config import settings


@dataclass(frozen=True)
class ExecutionContext:
    organization_id: str
    project_id: str
    asset_id: str
    test_run_id: str
    test_id: str
    environment: str
    authorized_target: str
    allowed_tests: list[str]
    expires_at: int
    request_id: str
    nonce: str


class CapabilityVerificationError(Exception):
    def __init__(self, message: str, code: str = "CAPABILITY_INVALID") -> None:
        super().__init__(message)
        self.code = code


# Global tracker of consumed nonces to prevent replay attacks
_consumed_nonces: set[str] = set()


def canonicalize_capability_payload(data: dict[str, Any]) -> str:
    allowed_tests = data.get("allowedTestIds", [])
    if isinstance(allowed_tests, list):
        sorted_tests = ",".join(sorted(allowed_tests))
    else:
        sorted_tests = str(allowed_tests)

    return "|".join(
        [
            str(data.get("organizationId", "")),
            str(data.get("projectId", "")),
            str(data.get("assetId", "")),
            str(data.get("testRunId", "")),
            str(data.get("allowedTargetUrl", "")),
            sorted_tests,
            str(data.get("environment", "")),
            str(data.get("requestId", "")),
            str(data.get("nonce", "")),
            str(data.get("issuedAt", "")),
            str(data.get("expiresAt", "")),
        ]
    )


def verify_execution_capability(
    raw_token: str,
    *,
    expected_org_id: str | None = None,
    expected_project_id: str | None = None,
    expected_asset_id: str | None = None,
    expected_test_id: str | None = None,
    expected_target: str | None = None,
    secret_key: str | None = None,
    consume_nonce: bool = True,
) -> ExecutionContext:
    if not raw_token or "." not in raw_token:
        raise CapabilityVerificationError("Malformed capability token structure.", "INVALID_FORMAT")

    parts = raw_token.split(".")
    if len(parts) != 2:
        raise CapabilityVerificationError("Malformed capability token structure.", "INVALID_FORMAT")

    b64_payload, received_signature = parts

    try:
        # Pad base64url if needed
        padding = "=" * ((4 - len(b64_payload) % 4) % 4)
        payload_bytes = base64.urlsafe_b64decode(b64_payload + padding)
        payload: dict[str, Any] = json.loads(payload_bytes.decode("utf-8"))
    except Exception as exc:
        raise CapabilityVerificationError(f"Failed to parse capability payload: {exc}", "INVALID_PAYLOAD") from exc

    # 1. Cryptographic HMAC-SHA256 signature verification
    key = (secret_key or settings.capability_shared_secret).encode("utf-8")
    canonical = canonicalize_capability_payload(payload).encode("utf-8")
    expected_sig = hmac.new(key, canonical, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected_sig, received_signature):
        raise CapabilityVerificationError(
            "Cryptographic signature mismatch. Token is forged, tampered, or uses invalid secret.",
            "SIGNATURE_MISMATCH",
        )

    # 2. Expiry check
    now_ms = int(time.time() * 1000)
    expires_at = int(payload.get("expiresAt", 0))
    if now_ms > expires_at:
        raise CapabilityVerificationError("Execution capability token has expired.", "TOKEN_EXPIRED")

    # 3. Nonce replay protection
    nonce = str(payload.get("nonce", ""))
    if not nonce:
        raise CapabilityVerificationError("Capability token missing unique nonce.", "MISSING_NONCE")

    if nonce in _consumed_nonces:
        raise CapabilityVerificationError(
            "Capability token has already been consumed (replay attack blocked).",
            "REPLAY_DETECTED",
        )

    # 4. Scope bindings
    org_id = str(payload.get("organizationId", ""))
    project_id = str(payload.get("projectId", ""))
    asset_id = str(payload.get("assetId", ""))
    test_run_id = str(payload.get("testRunId", ""))
    allowed_target = str(payload.get("allowedTargetUrl", ""))
    allowed_tests = list(payload.get("allowedTestIds", []))
    environment = str(payload.get("environment", ""))
    request_id = str(payload.get("requestId", ""))

    if expected_org_id and org_id != expected_org_id:
        raise CapabilityVerificationError("Organization scope mismatch.", "SCOPE_MISMATCH")
    if expected_project_id and project_id != expected_project_id:
        raise CapabilityVerificationError("Project scope mismatch.", "SCOPE_MISMATCH")
    if expected_asset_id and asset_id != expected_asset_id:
        raise CapabilityVerificationError("Asset scope mismatch.", "SCOPE_MISMATCH")
    if expected_test_id and expected_test_id not in allowed_tests:
        raise CapabilityVerificationError(f"Test '{expected_test_id}' not authorized in capability.", "SCOPE_MISMATCH")
    if expected_target and allowed_target != expected_target:
        raise CapabilityVerificationError("Target reference does not match capability token.", "SCOPE_MISMATCH")

    if consume_nonce:
        _consumed_nonces.add(nonce)

    return ExecutionContext(
        organization_id=org_id,
        project_id=project_id,
        asset_id=asset_id,
        test_run_id=test_run_id,
        test_id=expected_test_id or (allowed_tests[0] if allowed_tests else ""),
        environment=environment,
        authorized_target=allowed_target,
        allowed_tests=allowed_tests,
        expires_at=expires_at,
        request_id=request_id,
        nonce=nonce,
    )


def reset_consumed_nonces() -> None:
    _consumed_nonces.clear()
