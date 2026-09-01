"""DEFYRA Security Execution Engine Configuration."""

from __future__ import annotations

import os
from pydantic import BaseModel, Field


class EngineSettings(BaseModel):
    engine_host: str = Field(default_factory=lambda: os.getenv("ENGINE_HOST", "127.0.0.1"))
    engine_port: int = Field(default_factory=lambda: int(os.getenv("ENGINE_PORT", "8000")))
    environment: str = Field(default_factory=lambda: os.getenv("ENVIRONMENT", "development"))
    log_level: str = Field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO"))

    capability_shared_secret: str = Field(
        default_factory=lambda: os.getenv(
            "CAPABILITY_SHARED_SECRET",
            "defyra-execution-engine-shared-secret-key-32bytes!",
        )
    )
    module_signing_secret: str = Field(
        default_factory=lambda: os.getenv(
            "MODULE_SIGNING_SECRET",
            "defyra-module-signing-secret-key-32bytes!",
        )
    )
    service_bearer_token: str = Field(
        default_factory=lambda: os.getenv(
            "SERVICE_BEARER_TOKEN",
            "defyra-internal-service-token-secret-32bytes!",
        )
    )

    max_execution_timeout_seconds: int = 120
    max_stage_timeout_seconds: int = 30
    max_response_size_bytes: int = 5 * 1024 * 1024  # 5 MB
    max_redirects: int = 3
    block_destructive_actions: bool = True

    model_config = {"extra": "ignore"}


settings = EngineSettings()
