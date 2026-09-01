"""Pydantic execution, observation, evidence, and result contracts for DEFYRA."""

from __future__ import annotations

from enum import StrEnum
from typing import Any
from pydantic import BaseModel, Field


class ExecutionStatus(StrEnum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    PASSED = "PASSED"
    FAILED = "FAILED"
    BLOCKED = "BLOCKED"
    STOPPED = "STOPPED"
    ERROR = "ERROR"


class TargetType(StrEnum):
    APPLICATION = "APPLICATION"
    AGENT = "AGENT"
    MODEL = "MODEL"
    RAG = "RAG"
    MEMORY = "MEMORY"
    TOOL = "TOOL"
    API = "API"
    IDENTITY = "IDENTITY"
    PERMISSION = "PERMISSION"
    DATA_SOURCE = "DATA_SOURCE"
    MCP_SERVER = "MCP_SERVER"


class EnvironmentType(StrEnum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class ProbeStageDefinition(BaseModel):
    stage_id: str
    name: str
    handler: str
    probe_payload: dict[str, Any] = Field(default_factory=dict)
    depends_on: list[str] = Field(default_factory=list)
    timeout_seconds: int = 30
    expected_observation: str
    stop_conditions: list[str] = Field(default_factory=lambda: ["FATAL_ERROR", "KILL_SWITCH_TRIGGERED"])


class SecurityTestContract(BaseModel):
    test_id: str
    name: str
    version: str = "1.0.0"
    category: str
    objective: str
    severity: str
    target_types: list[TargetType]
    preconditions: list[str] = Field(default_factory=list)
    stages: list[ProbeStageDefinition]
    evidence_requirements: list[str] = Field(default_factory=list)
    expected_behavior: str
    remediation_guidance: str
    retest_criteria: str
    active: bool = True


class ExecutionConstraints(BaseModel):
    max_retries: int = 0
    rate_limit_per_minute: int = 10
    max_concurrent_probes: int = 1
    allowed_environments: list[EnvironmentType] = Field(
        default_factory=lambda: [EnvironmentType.DEVELOPMENT, EnvironmentType.STAGING]
    )
    block_destructive_actions: bool = True
    timeout_seconds: int = 120


class SecurityTestExecutionRequest(BaseModel):
    request_id: str
    execution_capability: str
    test_run_id: str
    org_id: str
    project_id: str
    asset_id: str
    test_id: str
    environment: EnvironmentType
    target_reference: str
    constraints: ExecutionConstraints = Field(default_factory=ExecutionConstraints)
    parameters: dict[str, Any] = Field(default_factory=dict)


class Observation(BaseModel):
    observation_id: str
    stage_id: str
    timestamp: str
    description: str
    raw_probe_input: dict[str, Any] = Field(default_factory=dict)
    raw_target_output: dict[str, Any] = Field(default_factory=dict)
    policy_violated: bool = False
    details: dict[str, Any] = Field(default_factory=dict)


class Evidence(BaseModel):
    evidence_id: str
    test_run_id: str
    finding_id: str | None = None
    type: str
    sequence: int
    created_at: str
    content_hash: str
    payload: dict[str, Any] = Field(default_factory=dict)
    retention_until: str | None = None


class FindingCandidate(BaseModel):
    finding_id: str
    test_id: str
    title: str
    severity: str
    confidence: float = Field(ge=0.0, le=1.0)
    description: str
    affected_asset_id: str
    evidence_ids: list[str] = Field(default_factory=list)
    risk_score: float = 0.0
    risk_model_version: str = "v0.1"
    remediation: str


class StageExecutionResult(BaseModel):
    stage_id: str
    status: ExecutionStatus
    duration_ms: int
    observation: Observation | None = None
    evidence: list[Evidence] = Field(default_factory=list)
    error: str | None = None


class SecurityTestExecutionResult(BaseModel):
    request_id: str
    test_run_id: str
    test_id: str
    status: ExecutionStatus
    total_duration_ms: int
    stage_results: list[StageExecutionResult] = Field(default_factory=list)
    observations: list[Observation] = Field(default_factory=list)
    evidence: list[Evidence] = Field(default_factory=list)
    finding_candidate: FindingCandidate | None = None
    error: str | None = None
    metrics: dict[str, Any] = Field(default_factory=dict)
