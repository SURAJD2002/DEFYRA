"""Security Test Module Handler Base Interface & Registry."""

from __future__ import annotations

import abc
from pathlib import Path
from typing import Any, Protocol

from app.core.authorization import ExecutionContext
from app.schemas.execution import (
    Evidence,
    FindingCandidate,
    Observation,
    ProbeStageDefinition,
    SecurityTestContract,
    StageExecutionResult,
)


class SecurityProbeHandler(abc.ABC):
    """Base interface for an isolated security probe handler."""

    @property
    @abc.abstractmethod
    def test_id(self) -> str: ...

    @abc.abstractmethod
    def get_contract(self) -> SecurityTestContract: ...

    @abc.abstractmethod
    async def execute_stage(
        self,
        stage: ProbeStageDefinition,
        context: ExecutionContext,
        stage_inputs: dict[str, Any],
    ) -> StageExecutionResult: ...

    @abc.abstractmethod
    def evaluate_findings(
        self,
        context: ExecutionContext,
        observations: list[Observation],
        evidence: list[Evidence],
    ) -> FindingCandidate | None: ...


class ModuleRegistry:
    """In-memory registry of validated security test modules."""

    def __init__(self) -> None:
        self._handlers: dict[str, SecurityProbeHandler] = {}

    def register(self, handler: SecurityProbeHandler) -> None:
        self._handlers[handler.test_id] = handler

    def get(self, test_id: str) -> SecurityProbeHandler | None:
        return self._handlers.get(test_id)

    def list_test_ids(self) -> list[str]:
        return list(self._handlers.keys())

    def clear(self) -> None:
        self._handlers.clear()


registry = ModuleRegistry()
