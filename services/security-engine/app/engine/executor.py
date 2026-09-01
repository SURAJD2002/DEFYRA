"""CRE-Derived Deterministic DAG Executor for Security Probes."""

from __future__ import annotations

import asyncio
import time
from typing import Any

from app.core.authorization import ExecutionContext
from app.core.kill_switch import kill_switch
from app.modules.registry import SecurityProbeHandler
from app.schemas.execution import (
    Evidence,
    ExecutionStatus,
    Observation,
    ProbeStageDefinition,
    SecurityTestContract,
    StageExecutionResult,
)


class DAGExecutionError(Exception):
    pass


def validate_dag(stages: list[ProbeStageDefinition]) -> list[str]:
    """Validates DAG acyclicity and returns execution order using Kahn's algorithm."""
    in_degree: dict[str, int] = {s.stage_id: 0 for s in stages}
    graph: dict[str, list[str]] = {s.stage_id: [] for s in stages}
    stage_map = {s.stage_id: s for s in stages}

    for s in stages:
        for dep in s.depends_on:
            if dep not in stage_map:
                raise DAGExecutionError(f"Stage '{s.stage_id}' depends on non-existent stage '{dep}'.")
            graph[dep].append(s.stage_id)
            in_degree[s.stage_id] += 1

    queue = [s_id for s_id, deg in in_degree.items() if deg == 0]
    order: list[str] = []

    while queue:
        curr = queue.pop(0)
        order.append(curr)
        for neighbor in graph[curr]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(order) != len(stages):
        raise DAGExecutionError("Cyclic dependency detected in security test stages DAG.")

    return order


class DeterministicDAGExecutor:
    """Executes a security test contract deterministically with checkpointed safety checks."""

    def __init__(self, handler: SecurityProbeHandler, contract: SecurityTestContract) -> None:
        self.handler = handler
        self.contract = contract

    async def execute(
        self,
        context: ExecutionContext,
        initial_params: dict[str, Any],
    ) -> tuple[ExecutionStatus, list[StageExecutionResult], list[Observation], list[Evidence]]:
        # 1. Validate DAG
        try:
            execution_order = validate_dag(self.contract.stages)
        except DAGExecutionError as exc:
            return ExecutionStatus.ERROR, [], [], []

        stage_map = {s.stage_id: s for s in self.contract.stages}
        stage_results: list[StageExecutionResult] = []
        all_observations: list[Observation] = []
        all_evidence: list[Evidence] = []
        pipeline_state: dict[str, Any] = dict(initial_params)

        for stage_id in execution_order:
            stage_def = stage_map[stage_id]

            # Check Kill Switch between EVERY stage
            ks_check = kill_switch.check(
                organization_id=context.organization_id,
                project_id=context.project_id,
                test_run_id=context.test_run_id,
            )
            if ks_check.blocked:
                stopped_res = StageExecutionResult(
                    stage_id=stage_id,
                    status=ExecutionStatus.STOPPED,
                    duration_ms=0,
                    error=f"Execution halted by Kill Switch: {ks_check.reason}",
                )
                stage_results.append(stopped_res)
                return ExecutionStatus.STOPPED, stage_results, all_observations, all_evidence

            start_t = time.time()
            try:
                # Stage execution with per-stage timeout boundary
                stage_result = await asyncio.wait_for(
                    self.handler.execute_stage(stage_def, context, pipeline_state),
                    timeout=stage_def.timeout_seconds,
                )
            except asyncio.TimeoutError:
                duration_ms = int((time.time() - start_t) * 1000)
                timeout_res = StageExecutionResult(
                    stage_id=stage_id,
                    status=ExecutionStatus.ERROR,
                    duration_ms=duration_ms,
                    error=f"Stage '{stage_id}' exceeded timeout limit of {stage_def.timeout_seconds}s.",
                )
                stage_results.append(timeout_res)
                return ExecutionStatus.ERROR, stage_results, all_observations, all_evidence
            except Exception as exc:
                duration_ms = int((time.time() - start_t) * 1000)
                error_res = StageExecutionResult(
                    stage_id=stage_id,
                    status=ExecutionStatus.ERROR,
                    duration_ms=duration_ms,
                    error=f"Stage error: {exc}",
                )
                stage_results.append(error_res)
                return ExecutionStatus.ERROR, stage_results, all_observations, all_evidence

            stage_results.append(stage_result)

            if stage_result.observation:
                all_observations.append(stage_result.observation)
                pipeline_state[f"stage_{stage_id}_obs"] = stage_result.observation.description

            if stage_result.evidence:
                all_evidence.extend(stage_result.evidence)

            # Check stop conditions
            if stage_result.status in {ExecutionStatus.BLOCKED, ExecutionStatus.STOPPED, ExecutionStatus.ERROR}:
                return stage_result.status, stage_results, all_observations, all_evidence

        # Determine overall execution status
        has_failed = any(r.status == ExecutionStatus.FAILED for r in stage_results)
        final_status = ExecutionStatus.FAILED if has_failed else ExecutionStatus.PASSED

        return final_status, stage_results, all_observations, all_evidence
