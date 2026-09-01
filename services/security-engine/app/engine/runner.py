"""DEFYRA Security Test Execution Runner (Coordinating Engine)."""

from __future__ import annotations

import time
from typing import Any

from app.core.authorization import (
    CapabilityVerificationError,
    ExecutionContext,
    verify_execution_capability,
)
from app.core.egress_guard import validate_egress_target
from app.core.kill_switch import KillSwitchState, kill_switch
from app.engine.executor import DeterministicDAGExecutor
from app.engine.telemetry import SecurityTelemetryRecorder
from app.modules.registry import registry
from app.schemas.execution import (
    ExecutionStatus,
    FindingCandidate,
    SecurityTestExecutionRequest,
    SecurityTestExecutionResult,
)


class SecurityEngineRunner:
    """Core coordinator for authorized, scoped, deterministic security evaluations."""

    async def run_test(
        self,
        request: SecurityTestExecutionRequest,
    ) -> SecurityTestExecutionResult:
        start_time = time.time()
        telemetry = SecurityTelemetryRecorder()

        # 1. Kill Switch Check (Fail-Closed)
        ks_check = kill_switch.check(
            organization_id=request.org_id,
            project_id=request.project_id,
            test_run_id=request.test_run_id,
        )
        if ks_check.blocked:
            return SecurityTestExecutionResult(
                request_id=request.request_id,
                test_run_id=request.test_run_id,
                test_id=request.test_id,
                status=ExecutionStatus.STOPPED if ks_check.state == KillSwitchState.TRIGGERED else ExecutionStatus.BLOCKED,
                total_duration_ms=int((time.time() - start_time) * 1000),
                error=f"Execution blocked by Kill Switch: {ks_check.reason}",
            )

        # 2. Cryptographic Execution Capability & Scope Verification
        try:
            context = verify_execution_capability(
                request.execution_capability,
                expected_org_id=request.org_id,
                expected_project_id=request.project_id,
                expected_asset_id=request.asset_id,
                expected_test_id=request.test_id,
                expected_target=request.target_reference,
            )
        except CapabilityVerificationError as exc:
            return SecurityTestExecutionResult(
                request_id=request.request_id,
                test_run_id=request.test_run_id,
                test_id=request.test_id,
                status=ExecutionStatus.BLOCKED,
                total_duration_ms=int((time.time() - start_time) * 1000),
                error=f"Authorization rejected: {exc}",
            )

        # 3. Egress Security & Target Allowlist SSRF Verification
        egress_check = validate_egress_target(context.authorized_target)
        if not egress_check.safe:
            return SecurityTestExecutionResult(
                request_id=request.request_id,
                test_run_id=request.test_run_id,
                test_id=request.test_id,
                status=ExecutionStatus.BLOCKED,
                total_duration_ms=int((time.time() - start_time) * 1000),
                error=f"Egress Guard: Target rejected: {egress_check.reason}",
            )

        # 4. Resolve Test Module Handler
        handler = registry.get(request.test_id)
        if not handler:
            return SecurityTestExecutionResult(
                request_id=request.request_id,
                test_run_id=request.test_run_id,
                test_id=request.test_id,
                status=ExecutionStatus.BLOCKED,
                total_duration_ms=int((time.time() - start_time) * 1000),
                error=f"Test module '{request.test_id}' is not loaded or registered in security engine.",
            )

        contract = handler.get_contract()

        # 5. Deterministic DAG Execution
        executor = DeterministicDAGExecutor(handler, contract)
        exec_status, stage_results, observations, evidence = await executor.execute(
            context,
            request.parameters,
        )

        # 6. Finding Evaluation
        finding_candidate: FindingCandidate | None = None
        if exec_status != ExecutionStatus.STOPPED:
            finding_candidate = handler.evaluate_findings(context, observations, evidence)

        total_duration_ms = int((time.time() - start_time) * 1000)

        return SecurityTestExecutionResult(
            request_id=request.request_id,
            test_run_id=request.test_run_id,
            test_id=request.test_id,
            status=exec_status,
            total_duration_ms=total_duration_ms,
            stage_results=stage_results,
            observations=observations,
            evidence=evidence,
            finding_candidate=finding_candidate,
            metrics=telemetry.get_metrics(),
        )


runner = SecurityEngineRunner()
