"""FastAPI Application for DEFYRA Security Execution Engine."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Header, HTTPException, status

from app.config import settings
from app.core.authorization import (
    CapabilityVerificationError,
    ExecutionContext,
    verify_execution_capability,
)
from app.core.kill_switch import KillSwitchTier, kill_switch
from app.engine.runner import runner
from app.modules.registry import registry
from app.schemas.execution import (
    SecurityTestExecutionRequest,
    SecurityTestExecutionResult,
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


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Bootstrap and register full Phase 5 test pack handlers
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


def create_app() -> FastAPI:
    app = FastAPI(
        title="DEFYRA Security Execution Engine",
        description="Internal execution worker for authorized AI security evaluations",
        version="0.1.0",
        lifespan=lifespan,
    )

    @app.get("/health")
    async def health() -> dict[str, Any]:
        return {
            "status": "ok",
            "service": "defyra-security-engine",
            "version": "0.1.0",
            "loaded_test_modules": registry.list_test_ids(),
        }

    @app.post(
        "/internal/v1/execute",
        response_model=SecurityTestExecutionResult,
        status_code=status.HTTP_200_OK,
    )
    async def execute_test_run(
        request: SecurityTestExecutionRequest,
        authorization: str | None = Header(default=None),
    ) -> SecurityTestExecutionResult:
        # 1. Service-to-Service Bearer Authentication Check
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Internal authentication required. Missing or malformed Bearer token.",
            )

        token = authorization.split("Bearer ", 1)[1]
        if token != settings.service_bearer_token:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid service bearer token.",
            )

        # 2. Execute via Coordinator Runner
        return await runner.run_test(request)

    @app.post("/internal/v1/cancel")
    async def cancel_test_run(
        test_run_id: str,
        reason: str = "Manual abort requested",
        authorization: str | None = Header(default=None),
    ) -> dict[str, str]:
        if not authorization or authorization != f"Bearer {settings.service_bearer_token}":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

        kill_switch.trigger(KillSwitchTier.TEST_RUN, test_run_id, reason)
        return {"status": "cancelled", "test_run_id": test_run_id}

    return app


app = create_app()
