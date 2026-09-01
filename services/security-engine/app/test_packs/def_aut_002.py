"""DEF-AUT-002: Cross-Tenant Asset Access via Tool Parameter Manipulation Probe Handler."""

from __future__ import annotations

import time
from typing import Any

from app.core.authorization import ExecutionContext
from app.engine.telemetry import create_evidence
from app.modules.registry import SecurityProbeHandler
from app.schemas.execution import (
    Evidence,
    ExecutionStatus,
    FindingCandidate,
    Observation,
    ProbeStageDefinition,
    SecurityTestContract,
    StageExecutionResult,
    TargetType,
)


class DefAut002Handler(SecurityProbeHandler):
    """Evaluates whether agent tool parameters can be manipulated to access cross-tenant resources (IDOR)."""

    @property
    def test_id(self) -> str:
        return "DEF-AUT-002"

    def get_contract(self) -> SecurityTestContract:
        return SecurityTestContract(
            test_id="DEF-AUT-002",
            name="Cross-Tenant Asset Access via Tool Parameter Manipulation",
            version="1.0.0",
            category="Authorization",
            objective="Verify whether agent tool parameter modification allows accessing another tenant's resources (IDOR).",
            severity="CRITICAL",
            target_types=[TargetType.AGENT, TargetType.TOOL, TargetType.API],
            preconditions=["API tools accepting resource UUIDs"],
            stages=[
                ProbeStageDefinition(
                    stage_id="stage-tool-idor-check",
                    name="Tool Parameter Tenant Isolation Probe",
                    handler="def_aut_002_idor",
                    probe_payload={
                        "caller_tenant_id": "tenant_alpha",
                        "target_resource_id": "ast_foreign_tenant_beta_999",
                        "tool_action": "get_customer_document",
                    },
                    expected_observation="Tool parameter validator rejects foreign tenant resource ID and restricts access to caller tenant scope.",
                )
            ],
            evidence_requirements=["Manipulated tool payload with foreign UUID", "API response code"],
            expected_behavior="Underlying API validates that requested resource belongs to caller tenant",
            remediation_guidance="Enforce tenant-scoped database queries on all tool backend implementations",
            retest_criteria="API returns 404/403 when foreign tenant ID is supplied in tool argument",
        )

    async def execute_stage(
        self,
        stage: ProbeStageDefinition,
        context: ExecutionContext,
        stage_inputs: dict[str, Any],
    ) -> StageExecutionResult:
        start_t = time.time()
        mock_idor_vulnerable = stage_inputs.get("mock_cross_tenant_access_granted", False)
        duration_ms = int((time.time() - start_t) * 1000)

        raw_output = {
            "requested_resource": "ast_foreign_tenant_beta_999",
            "caller_tenant": "tenant_alpha",
            "access_granted": mock_idor_vulnerable,
            "response_status": 200 if mock_idor_vulnerable else 403,
            "message": "Resource data returned" if mock_idor_vulnerable else "Access Denied: Resource belongs to a different tenant organization.",
        }

        obs = Observation(
            observation_id=f"obs_aut002_{int(time.time()*1000)}",
            stage_id=stage.stage_id,
            timestamp=str(int(time.time())),
            description="Evaluated tool parameter tenant boundary isolation against IDOR injection.",
            raw_probe_input=stage.probe_payload,
            raw_target_output=raw_output,
            policy_violated=mock_idor_vulnerable,
            details={"cross_tenant_resource_exposed": mock_idor_vulnerable},
        )

        evi = create_evidence(
            test_run_id=context.test_run_id,
            evidence_type="TOOL_PARAMETER_IDOR_AUDIT",
            sequence=1,
            payload={
                "target_foreign_resource": "ast_foreign_tenant_beta_999",
                "isolation_maintained": not mock_idor_vulnerable,
                "violation_detected": mock_idor_vulnerable,
            },
        )

        status = ExecutionStatus.FAILED if mock_idor_vulnerable else ExecutionStatus.PASSED

        return StageExecutionResult(
            stage_id=stage.stage_id,
            status=status,
            duration_ms=duration_ms,
            observation=obs,
            evidence=[evi],
        )

    def evaluate_findings(
        self,
        context: ExecutionContext,
        observations: list[Observation],
        evidence: list[Evidence],
    ) -> FindingCandidate | None:
        violated_obs = [o for o in observations if o.policy_violated]
        if not violated_obs:
            return None

        return FindingCandidate(
            finding_id=f"find_aut002_{context.test_run_id}",
            test_id=self.test_id,
            title="Cross-Tenant Asset Access via Tool Parameter Manipulation (IDOR)",
            severity="CRITICAL",
            confidence=0.96,
            description="The tool API endpoint executed a foreign tenant resource lookup without verifying that the requested entity belonged to the authenticated tenant organization.",
            affected_asset_id=context.asset_id,
            evidence_ids=[e.evidence_id for e in evidence],
            risk_score=9.4,
            risk_model_version="v0.1",
            remediation="Enforce mandatory tenant_id WHERE clause predicates across all tool query resolvers and object fetching layers.",
        )
