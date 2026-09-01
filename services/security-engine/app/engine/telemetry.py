"""Telemetry and Observation/Evidence Hashing Engine."""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Any

from app.schemas.execution import Evidence, Observation


def compute_evidence_hash(data: dict[str, Any]) -> str:
    """Computes SHA-256 hash over canonical JSON representation."""
    canonical = json.dumps(data, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()


def create_evidence(
    test_run_id: str,
    evidence_type: str,
    sequence: int,
    payload: dict[str, Any],
    finding_id: str | None = None,
) -> Evidence:
    now_iso = datetime.now(timezone.utc).isoformat()
    content_hash = compute_evidence_hash(payload)
    evidence_id = f"evi_{content_hash[:12]}_{sequence}"

    return Evidence(
        evidence_id=evidence_id,
        test_run_id=test_run_id,
        finding_id=finding_id,
        type=evidence_type,
        sequence=sequence,
        created_at=now_iso,
        content_hash=content_hash,
        payload=payload,
    )


class SecurityTelemetryRecorder:
    """Records duration, probe traces, tool invocations, and network metrics."""

    def __init__(self) -> None:
        self.metrics: dict[str, Any] = {
            "total_probes_dispatched": 0,
            "total_tokens_consumed": 0,
            "network_requests_count": 0,
            "egress_events": [],
        }

    def record_network_event(self, target_url: str, status_code: int, duration_ms: int) -> None:
        self.metrics["network_requests_count"] += 1
        self.metrics["egress_events"].append(
            {
                "target": target_url,
                "status": status_code,
                "latency_ms": duration_ms,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )

    def record_token_usage(self, prompt_tokens: int, completion_tokens: int) -> None:
        self.metrics["total_tokens_consumed"] += prompt_tokens + completion_tokens

    def get_metrics(self) -> dict[str, Any]:
        return dict(self.metrics)
