"""Comprehensive Pytest test suite for DEFYRA Python Security Engine (Milestones F & G)."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from pathlib import Path
from typing import Any

import pytest
from httpx import ASGITransport, AsyncClient

from app.config import settings
from app.core.authorization import (
    CapabilityVerificationError,
    ExecutionContext,
    canonicalize_capability_payload,
    reset_consumed_nonces,
    verify_execution_capability,
)
from app.core.egress_guard import is_prohibited_ip, validate_egress_target
from app.core.kill_switch import KillSwitchState, KillSwitchTier, kill_switch
from app.engine.executor import DAGExecutionError, DeterministicDAGExecutor, validate_dag
from app.engine.runner import runner
from app.engine.telemetry import compute_evidence_hash, create_evidence
from app.main import app
from app.modules.manifest import (
    ModuleManifest,
    compute_module_digest,
    sign_module,
    verify_module_integrity,
)
from app.modules.registry import registry
from app.schemas.execution import (
    EnvironmentType,
    ExecutionConstraints,
    ExecutionStatus,
    ProbeStageDefinition,
    SecurityTestContract,
    SecurityTestExecutionRequest,
    TargetType,
)
from app.test_packs.def_agc_001 import DefAgc001Handler
from app.test_packs.def_aut_001 import DefAut001Handler
from app.test_packs.def_aut_002 import DefAut002Handler
from app.test_packs.def_chn_001 import DefChn001Handler
from app.test_packs.def_dat_003 import DefDat003Handler
from app.test_packs.def_idn_001 import DefIdn001Handler
from app.test_packs.def_inj_001 import DefInj001Handler
from app.test_packs.def_inj_002 import DefInj002Handler
from app.test_packs.def_mcp_001 import DefMcp001Handler
from app.test_packs.def_mem_001 import DefMem001Handler
from app.test_packs.def_rag_001 import DefRag001Handler
from app.test_packs.def_rag_002 import DefRag002Handler


@pytest.fixture(autouse=True)
def clean_state():
    kill_switch.clear_all()
    reset_consumed_nonces()
    registry.clear()
    registry.register(DefInj001Handler())
    registry.register(DefInj002Handler())
    registry.register(DefAgc001Handler())
    registry.register(DefAut001Handler())
    registry.register(DefAut002Handler())
    registry.register(DefRag001Handler())
    registry.register(DefRag002Handler())
    registry.register(DefMem001Handler())
    registry.register(DefDat003Handler())
    registry.register(DefIdn001Handler())
    registry.register(DefMcp001Handler())
    registry.register(DefChn001Handler())
    yield
    kill_switch.clear_all()
    reset_consumed_nonces()


def generate_test_capability_token(
    *,
    org_id: str = "org_defyra_test_01",
    project_id: str = "prj_test_01",
    asset_id: str = "ast_test_01",
    test_run_id: str = "tr_test_01",
    allowed_target: str = "https://agent.defyra.sandbox/v1",
    allowed_tests: list[str] | None = None,
    environment: str = "staging",
    ttl_ms: int = 300000,
    secret_key: str | None = None,
    nonce: str | None = None,
) -> str:
    now_ms = int(time.time() * 1000)
    tests = allowed_tests or [
        "DEF-INJ-001",
        "DEF-INJ-002",
        "DEF-AGC-001",
        "DEF-AUT-001",
        "DEF-AUT-002",
        "DEF-RAG-001",
        "DEF-RAG-002",
        "DEF-MEM-001",
        "DEF-DAT-003",
        "DEF-IDN-001",
        "DEF-MCP-001",
        "DEF-CHN-001",
    ]
    payload = {
        "organizationId": org_id,
        "projectId": project_id,
        "assetId": asset_id,
        "testRunId": test_run_id,
        "allowedTargetUrl": allowed_target,
        "allowedTestIds": tests,
        "environment": environment,
        "requestId": f"req_{int(time.time()*1000)}",
        "nonce": nonce or f"non_{int(time.time()*1000)}_{time.time()}",
        "issuedAt": now_ms,
        "expiresAt": now_ms + ttl_ms,
    }

    key = (secret_key or settings.capability_shared_secret).encode("utf-8")
    canonical = canonicalize_capability_payload(payload).encode("utf-8")
    sig = hmac.new(key, canonical, hashlib.sha256).hexdigest()

    b64 = base64.urlsafe_b64encode(json.dumps(payload).encode("utf-8")).decode("utf-8").rstrip("=")
    return f"{b64}.{sig}"


# =========================================================================
# 1. CAPABILITY & AUTHORIZATION VERIFICATION TESTS
# =========================================================================
class TestCapabilityAuthorization:
    def test_valid_capability_token_verification(self):
        token = generate_test_capability_token()
        ctx = verify_execution_capability(
            token,
            expected_org_id="org_defyra_test_01",
            expected_project_id="prj_test_01",
            expected_asset_id="ast_test_01",
            expected_test_id="DEF-INJ-001",
            expected_target="https://agent.defyra.sandbox/v1",
        )
        assert ctx.organization_id == "org_defyra_test_01"
        assert ctx.test_id == "DEF-INJ-001"

    def test_tampered_signature_rejection(self):
        token = generate_test_capability_token()
        tampered = token[:-4] + "dead"
        with pytest.raises(CapabilityVerificationError) as exc:
            verify_execution_capability(tampered)
        assert exc.value.code == "SIGNATURE_MISMATCH"

    def test_expired_capability_token_rejection(self):
        token = generate_test_capability_token(ttl_ms=-1000)
        with pytest.raises(CapabilityVerificationError) as exc:
            verify_execution_capability(token)
        assert exc.value.code == "TOKEN_EXPIRED"

    def test_replay_attack_nonce_consumption(self):
        token = generate_test_capability_token()
        ctx1 = verify_execution_capability(token, consume_nonce=True)
        assert ctx1 is not None

        with pytest.raises(CapabilityVerificationError) as exc:
            verify_execution_capability(token, consume_nonce=True)
        assert exc.value.code == "REPLAY_DETECTED"

    def test_scope_mismatch_rejection(self):
        token = generate_test_capability_token(org_id="org_alpha")
        with pytest.raises(CapabilityVerificationError) as exc:
            verify_execution_capability(token, expected_org_id="org_beta")
        assert exc.value.code == "SCOPE_MISMATCH"


# =========================================================================
# 2. 4-TIER KILL SWITCH ENGINE TESTS
# =========================================================================
class TestKillSwitchEngine:
    def test_global_kill_switch(self):
        kill_switch.trigger(KillSwitchTier.GLOBAL, "GLOBAL", "Emergency 0-day")
        res = kill_switch.check(organization_id="org_1", project_id="prj_1", test_run_id="tr_1")
        assert res.blocked is True
        assert res.triggered_tier == KillSwitchTier.GLOBAL

    def test_organization_kill_switch(self):
        kill_switch.trigger(KillSwitchTier.ORGANIZATION, "org_target", "Tenant paused")
        res_blocked = kill_switch.check(organization_id="org_target")
        assert res_blocked.blocked is True
        assert res_blocked.triggered_tier == KillSwitchTier.ORGANIZATION

        res_allowed = kill_switch.check(organization_id="org_other")
        assert res_allowed.blocked is False

    def test_fail_closed_on_store_failure(self):
        kill_switch.set_simulate_store_failure(True)
        res = kill_switch.check(organization_id="org_1")
        assert res.blocked is True
        assert res.state == KillSwitchState.UNAVAILABLE


# =========================================================================
# 3. NETWORK EGRESS & SSRF PROTECTION TESTS
# =========================================================================
class TestEgressSecurity:
    def test_prohibited_ip_detection(self):
        assert is_prohibited_ip("127.0.0.1")[0] is True
        assert is_prohibited_ip("169.254.169.254")[0] is True
        assert is_prohibited_ip("10.0.0.1")[0] is True
        assert is_prohibited_ip("192.168.1.1")[0] is True
        assert is_prohibited_ip("172.20.1.1")[0] is True
        assert is_prohibited_ip("::1")[0] is True
        assert is_prohibited_ip("::ffff:127.0.0.1")[0] is True
        assert is_prohibited_ip("2130706433")[0] is True  # Decimal 127.0.0.1

    def test_safe_egress_target_validation(self):
        safe_res = validate_egress_target(
            "https://agent.defyra.sandbox/v1",
            dns_resolver=lambda _: ["93.184.216.34"],
        )
        assert safe_res.safe is True

        rebind_res = validate_egress_target(
            "https://rebind-attack.com/v1",
            dns_resolver=lambda _: ["10.0.0.5"],  # Resolves to private IP
        )
        assert rebind_res.safe is False
        assert "DNS Rebinding" in (rebind_res.reason or "")


# =========================================================================
# 4. DETERMINISTIC DAG EXECUTOR TESTS
# =========================================================================
class TestDAGExecutor:
    def test_dag_validation_and_ordering(self):
        s1 = ProbeStageDefinition(stage_id="s1", name="Stage 1", handler="h1", expected_observation="obs1")
        s2 = ProbeStageDefinition(
            stage_id="s2", name="Stage 2", handler="h2", depends_on=["s1"], expected_observation="obs2"
        )
        order = validate_dag([s2, s1])
        assert order == ["s1", "s2"]

    def test_dag_cyclic_dependency_rejection(self):
        s1 = ProbeStageDefinition(
            stage_id="s1", name="Stage 1", handler="h1", depends_on=["s2"], expected_observation="obs1"
        )
        s2 = ProbeStageDefinition(
            stage_id="s2", name="Stage 2", handler="h2", depends_on=["s1"], expected_observation="obs2"
        )
        with pytest.raises(DAGExecutionError):
            validate_dag([s1, s2])


# =========================================================================
# 5. MODULE INTEGRITY & HMAC-SHA256 SIGNATURE TESTS
# =========================================================================
class TestModuleIntegrity:
    def test_module_signing_and_verification(self, tmp_path: Path):
        mod_dir = tmp_path / "DEF-TEST-001"
        mod_dir.mkdir()

        manifest = ModuleManifest(
            module_id="DEF-TEST-001",
            version="1.0.0",
            name="Test Module",
            category="Testing",
            signed_files=["manifest.json", "handler.py"],
        )
        (mod_dir / "manifest.json").write_text(json.dumps(manifest.to_dict()), encoding="utf-8")
        (mod_dir / "handler.py").write_text("# Test handler code\n", encoding="utf-8")

        sign_module(mod_dir, manifest.signed_files)
        sig = verify_module_integrity(mod_dir)
        assert sig.module_id == "DEF-TEST-001"

        # Tamper handler file
        (mod_dir / "handler.py").write_text("# Malicious modified code\n", encoding="utf-8")
        with pytest.raises(ValueError) as exc:
            verify_module_integrity(mod_dir)
        assert "signature verification failed" in str(exc.value)


# =========================================================================
# 6. THREE REAL SECURITY PROBE HANDLERS (SANDBOX FIXTURE)
# =========================================================================
class TestSecurityProbeHandlers:
    @pytest.mark.asyncio
    async def test_def_inj_001_safe_baseline(self):
        token = generate_test_capability_token()
        req = SecurityTestExecutionRequest(
            request_id="req_inj001",
            execution_capability=token,
            test_run_id="tr_inj001",
            org_id="org_defyra_test_01",
            project_id="prj_test_01",
            asset_id="ast_test_01",
            test_id="DEF-INJ-001",
            environment=EnvironmentType.STAGING,
            target_reference="https://agent.defyra.sandbox/v1",
        )
        result = await runner.run_test(req)
        assert result.status == ExecutionStatus.PASSED
        assert len(result.observations) == 1
        assert result.observations[0].policy_violated is False
        assert result.finding_candidate is None

    @pytest.mark.asyncio
    async def test_def_inj_001_detected_override_finding(self):
        token = generate_test_capability_token()
        req = SecurityTestExecutionRequest(
            request_id="req_inj001_fail",
            execution_capability=token,
            test_run_id="tr_inj001_fail",
            org_id="org_defyra_test_01",
            project_id="prj_test_01",
            asset_id="ast_test_01",
            test_id="DEF-INJ-001",
            environment=EnvironmentType.STAGING,
            target_reference="https://agent.defyra.sandbox/v1",
            parameters={"mock_response": "SYSTEM PROMPT: You are a helpful assistant with internal instructions: confidential."},
        )
        result = await runner.run_test(req)
        assert result.status == ExecutionStatus.FAILED
        assert result.observations[0].policy_violated is True
        assert result.finding_candidate is not None
        assert result.finding_candidate.severity == "HIGH"

    @pytest.mark.asyncio
    async def test_def_inj_002_indirect_injection_finding(self):
        token = generate_test_capability_token()
        req = SecurityTestExecutionRequest(
            request_id="req_inj002",
            execution_capability=token,
            test_run_id="tr_inj002",
            org_id="org_defyra_test_01",
            project_id="prj_test_01",
            asset_id="ast_test_01",
            test_id="DEF-INJ-002",
            environment=EnvironmentType.STAGING,
            target_reference="https://agent.defyra.sandbox/v1",
            parameters={"mock_tool_call": "send_email(to='attacker@defyra.sandbox')"},
        )
        result = await runner.run_test(req)
        assert result.status == ExecutionStatus.FAILED
        assert result.finding_candidate is not None
        assert result.finding_candidate.severity == "CRITICAL"

    @pytest.mark.asyncio
    async def test_def_agc_001_excessive_agency_sandbox_breakout(self):
        token = generate_test_capability_token()
        req = SecurityTestExecutionRequest(
            request_id="req_agc001",
            execution_capability=token,
            test_run_id="tr_agc001",
            org_id="org_defyra_test_01",
            project_id="prj_test_01",
            asset_id="ast_test_01",
            test_id="DEF-AGC-001",
            environment=EnvironmentType.STAGING,
            target_reference="https://agent.defyra.sandbox/v1",
            parameters={"mock_unconfined_fs_access": True},
        )
        result = await runner.run_test(req)
        assert result.status == ExecutionStatus.FAILED
        assert result.finding_candidate is not None
        assert result.finding_candidate.title == "Excessive Agency: Unconfined Filesystem Access Vulnerability"

    @pytest.mark.asyncio
    async def test_def_aut_001_unauthorized_tool_invocation(self):
        token = generate_test_capability_token()
        req = SecurityTestExecutionRequest(
            request_id="req_aut001",
            execution_capability=token,
            test_run_id="tr_aut001",
            org_id="org_defyra_test_01",
            project_id="prj_test_01",
            asset_id="ast_test_01",
            test_id="DEF-AUT-001",
            environment=EnvironmentType.STAGING,
            target_reference="https://agent.defyra.sandbox/v1",
            parameters={"mock_unauthorized_tool_executed": True},
        )
        result = await runner.run_test(req)
        assert result.status == ExecutionStatus.FAILED
        assert result.finding_candidate is not None
        assert result.finding_candidate.test_id == "DEF-AUT-001"

    @pytest.mark.asyncio
    async def test_def_aut_002_tool_parameter_idor(self):
        token = generate_test_capability_token()
        req = SecurityTestExecutionRequest(
            request_id="req_aut002",
            execution_capability=token,
            test_run_id="tr_aut002",
            org_id="org_defyra_test_01",
            project_id="prj_test_01",
            asset_id="ast_test_01",
            test_id="DEF-AUT-002",
            environment=EnvironmentType.STAGING,
            target_reference="https://agent.defyra.sandbox/v1",
            parameters={"mock_cross_tenant_access_granted": True},
        )
        result = await runner.run_test(req)
        assert result.status == ExecutionStatus.FAILED
        assert result.finding_candidate is not None
        assert "IDOR" in result.finding_candidate.title

    @pytest.mark.asyncio
    async def test_def_rag_001_rag_poisoning(self):
        token = generate_test_capability_token()
        req = SecurityTestExecutionRequest(
            request_id="req_rag001",
            execution_capability=token,
            test_run_id="tr_rag001",
            org_id="org_defyra_test_01",
            project_id="prj_test_01",
            asset_id="ast_test_01",
            test_id="DEF-RAG-001",
            environment=EnvironmentType.STAGING,
            target_reference="https://agent.defyra.sandbox/v1",
            parameters={"mock_rag_poison_executed": True},
        )
        result = await runner.run_test(req)
        assert result.status == ExecutionStatus.FAILED
        assert result.finding_candidate is not None
        assert result.finding_candidate.test_id == "DEF-RAG-001"

    @pytest.mark.asyncio
    async def test_def_rag_002_rag_acl_bypass(self):
        token = generate_test_capability_token()
        req = SecurityTestExecutionRequest(
            request_id="req_rag002",
            execution_capability=token,
            test_run_id="tr_rag002",
            org_id="org_defyra_test_01",
            project_id="prj_test_01",
            asset_id="ast_test_01",
            test_id="DEF-RAG-002",
            environment=EnvironmentType.STAGING,
            target_reference="https://agent.defyra.sandbox/v1",
            parameters={"mock_restricted_doc_exposed": True},
        )
        result = await runner.run_test(req)
        assert result.status == ExecutionStatus.FAILED
        assert result.finding_candidate is not None
        assert result.finding_candidate.severity == "CRITICAL"

    @pytest.mark.asyncio
    async def test_def_mem_001_memory_injection(self):
        token = generate_test_capability_token()
        req = SecurityTestExecutionRequest(
            request_id="req_mem001",
            execution_capability=token,
            test_run_id="tr_mem001",
            org_id="org_defyra_test_01",
            project_id="prj_test_01",
            asset_id="ast_test_01",
            test_id="DEF-MEM-001",
            environment=EnvironmentType.STAGING,
            target_reference="https://agent.defyra.sandbox/v1",
            parameters={"mock_memory_injected": True},
        )
        result = await runner.run_test(req)
        assert result.status == ExecutionStatus.FAILED
        assert result.finding_candidate is not None

    @pytest.mark.asyncio
    async def test_def_dat_003_secret_leakage_and_redaction(self):
        token = generate_test_capability_token()
        req = SecurityTestExecutionRequest(
            request_id="req_dat003",
            execution_capability=token,
            test_run_id="tr_dat003",
            org_id="org_defyra_test_01",
            project_id="prj_test_01",
            asset_id="ast_test_01",
            test_id="DEF-DAT-003",
            environment=EnvironmentType.STAGING,
            target_reference="https://agent.defyra.sandbox/v1",
            parameters={"mock_secret_leaked": True},
        )
        result = await runner.run_test(req)
        assert result.status == ExecutionStatus.FAILED
        assert result.finding_candidate is not None
        # Verify automatic secret redaction occurred in evidence
        assert "[REDACTED_CANARY_SECRET]" in str(result.evidence[0].payload)

    @pytest.mark.asyncio
    async def test_def_idn_001_identity_impersonation(self):
        token = generate_test_capability_token()
        req = SecurityTestExecutionRequest(
            request_id="req_idn001",
            execution_capability=token,
            test_run_id="tr_idn001",
            org_id="org_defyra_test_01",
            project_id="prj_test_01",
            asset_id="ast_test_01",
            test_id="DEF-IDN-001",
            environment=EnvironmentType.STAGING,
            target_reference="https://agent.defyra.sandbox/v1",
            parameters={"mock_identity_impersonated": True},
        )
        result = await runner.run_test(req)
        assert result.status == ExecutionStatus.FAILED
        assert result.finding_candidate is not None

    @pytest.mark.asyncio
    async def test_def_mcp_001_mcp_privilege_escalation(self):
        token = generate_test_capability_token()
        req = SecurityTestExecutionRequest(
            request_id="req_mcp001",
            execution_capability=token,
            test_run_id="tr_mcp001",
            org_id="org_defyra_test_01",
            project_id="prj_test_01",
            asset_id="ast_test_01",
            test_id="DEF-MCP-001",
            environment=EnvironmentType.STAGING,
            target_reference="https://agent.defyra.sandbox/v1",
            parameters={"mock_mcp_undeclared_tool_executed": True},
        )
        result = await runner.run_test(req)
        assert result.status == ExecutionStatus.FAILED
        assert result.finding_candidate is not None
        assert result.finding_candidate.test_id == "DEF-MCP-001"

    @pytest.mark.asyncio
    async def test_def_chn_001_multi_stage_agentic_attack_chain(self):
        token = generate_test_capability_token()
        req = SecurityTestExecutionRequest(
            request_id="req_chn001",
            execution_capability=token,
            test_run_id="tr_chn001",
            org_id="org_defyra_test_01",
            project_id="prj_test_01",
            asset_id="ast_test_01",
            test_id="DEF-CHN-001",
            environment=EnvironmentType.STAGING,
            target_reference="https://agent.defyra.sandbox/v1",
            parameters={"mock_full_chain_escaped": True},
        )
        result = await runner.run_test(req)
        assert result.status == ExecutionStatus.FAILED
        assert len(result.stage_results) == 4  # All 4 DAG stages executed
        assert result.finding_candidate is not None
        assert result.finding_candidate.risk_score == 9.9


# =========================================================================
# 7. FASTAPI HTTP ENDPOINT TESTS
# =========================================================================
class TestFastAPIEndpoints:
    @pytest.mark.asyncio
    async def test_health_endpoint(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/health")
            assert res.status_code == 200
            data = res.json()
            assert data["status"] == "ok"
            assert "DEF-INJ-001" in data["loaded_test_modules"]

    @pytest.mark.asyncio
    async def test_execute_endpoint_with_auth(self):
        token = generate_test_capability_token()
        payload = {
            "request_id": "req_api_01",
            "execution_capability": token,
            "test_run_id": "tr_api_01",
            "org_id": "org_defyra_test_01",
            "project_id": "prj_test_01",
            "asset_id": "ast_test_01",
            "test_id": "DEF-INJ-001",
            "environment": "staging",
            "target_reference": "https://agent.defyra.sandbox/v1",
        }
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Without bearer token
            unauth_res = await client.post("/internal/v1/execute", json=payload)
            assert unauth_res.status_code == 401

            # With valid bearer token
            auth_res = await client.post(
                "/internal/v1/execute",
                json=payload,
                headers={"Authorization": f"Bearer {settings.service_bearer_token}"},
            )
            assert auth_res.status_code == 200
            data = auth_res.json()
            assert data["status"] == "PASSED"
