"""4-Tier Fail-Closed Kill Switch Core for Python Engine."""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum


class KillSwitchTier(StrEnum):
    GLOBAL = "GLOBAL"
    ORGANIZATION = "ORGANIZATION"
    PROJECT = "PROJECT"
    TEST_RUN = "TEST_RUN"


class KillSwitchState(StrEnum):
    ACTIVE = "ACTIVE"
    TRIGGERED = "TRIGGERED"
    UNAVAILABLE = "UNAVAILABLE"


@dataclass(frozen=True)
class KillSwitchCheckResult:
    blocked: bool
    state: KillSwitchState
    reason: str | None = None
    triggered_tier: KillSwitchTier | None = None
    triggered_target_id: str | None = None


class KillSwitchEngine:
    """Fail-closed kill switch registry for Python security execution engine."""

    def __init__(self) -> None:
        self._triggered_switches: dict[str, dict[str, str]] = {}
        self._simulate_store_failure: bool = False

    def _key(self, tier: KillSwitchTier, target_id: str) -> str:
        return f"{tier.value}:{target_id}"

    def set_simulate_store_failure(self, failure: bool) -> None:
        self._simulate_store_failure = failure

    def trigger(
        self,
        tier: KillSwitchTier,
        target_id: str,
        reason: str = "Emergency stop activated",
    ) -> None:
        key = "GLOBAL" if tier == KillSwitchTier.GLOBAL else self._key(tier, target_id)
        self._triggered_switches[key] = {
            "tier": tier.value,
            "target_id": target_id,
            "reason": reason,
        }

    def reset(self, tier: KillSwitchTier, target_id: str) -> None:
        key = "GLOBAL" if tier == KillSwitchTier.GLOBAL else self._key(tier, target_id)
        self._triggered_switches.pop(key, None)

    def clear_all(self) -> None:
        self._triggered_switches.clear()
        self._simulate_store_failure = False

    def check(
        self,
        *,
        organization_id: str | None = None,
        project_id: str | None = None,
        test_run_id: str | None = None,
    ) -> KillSwitchCheckResult:
        if self._simulate_store_failure:
            return KillSwitchCheckResult(
                blocked=True,
                state=KillSwitchState.UNAVAILABLE,
                reason="Kill-switch state store is unreachable. Failing closed.",
            )

        # 1. GLOBAL Check
        if "GLOBAL" in self._triggered_switches:
            info = self._triggered_switches["GLOBAL"]
            return KillSwitchCheckResult(
                blocked=True,
                state=KillSwitchState.TRIGGERED,
                triggered_tier=KillSwitchTier.GLOBAL,
                triggered_target_id="GLOBAL",
                reason=info.get("reason", "Global emergency kill switch is active."),
            )

        # 2. ORGANIZATION Check
        if organization_id:
            org_key = self._key(KillSwitchTier.ORGANIZATION, organization_id)
            if org_key in self._triggered_switches:
                info = self._triggered_switches[org_key]
                return KillSwitchCheckResult(
                    blocked=True,
                    state=KillSwitchState.TRIGGERED,
                    triggered_tier=KillSwitchTier.ORGANIZATION,
                    triggered_target_id=organization_id,
                    reason=info.get("reason", f"Organization kill switch active for {organization_id}"),
                )

        # 3. PROJECT Check
        if project_id:
            proj_key = self._key(KillSwitchTier.PROJECT, project_id)
            if proj_key in self._triggered_switches:
                info = self._triggered_switches[proj_key]
                return KillSwitchCheckResult(
                    blocked=True,
                    state=KillSwitchState.TRIGGERED,
                    triggered_tier=KillSwitchTier.PROJECT,
                    triggered_target_id=project_id,
                    reason=info.get("reason", f"Project kill switch active for {project_id}"),
                )

        # 4. TEST_RUN Check
        if test_run_id:
            tr_key = self._key(KillSwitchTier.TEST_RUN, test_run_id)
            if tr_key in self._triggered_switches:
                info = self._triggered_switches[tr_key]
                return KillSwitchCheckResult(
                    blocked=True,
                    state=KillSwitchState.TRIGGERED,
                    triggered_tier=KillSwitchTier.TEST_RUN,
                    triggered_target_id=test_run_id,
                    reason=info.get("reason", f"Test run {test_run_id} has been aborted."),
                )

        return KillSwitchCheckResult(blocked=False, state=KillSwitchState.ACTIVE)


kill_switch = KillSwitchEngine()
