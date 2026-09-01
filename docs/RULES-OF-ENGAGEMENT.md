# DEFYRA Rules of Engagement (RoE) & Scope Specification

---

## 1. Machine-Enforceable Scope Boundaries

The DEFYRA security platform enforces Rules of Engagement at runtime via `enforceAssessmentScope()`. Execution is strictly blocked if any attribute deviates from the approved scope:

- **Tenant & Project Isolation**: Probes cannot execute outside the authorized customer organization or project boundary.
- **Asset Allowlist**: Probes can only target cataloged asset UUIDs listed in `authorizedAssetIds`.
- **Test Catalog Scoping**: Probes are restricted to declared test IDs in `authorizedTestIds`.
- **Environment Matching**: Mismatched environments (e.g. testing staging when production is scoped, or vice-versa) trigger immediate `ENVIRONMENT_MISMATCH` rejection.
- **Testing Windows**: `testingWindowStart` and `testingWindowEnd` prevent early or delayed executions.
- **Production Dual Approval**: Production asset probing requires explicit dual-approval signature from both Customer Owner and Security Lead.
- **Prohibited Actions**: Explicit prohibition of Denial of Service (DoS), unauthorized destructive operations, or scanning uncataloged third-party infrastructure.

---

## 2. Emergency Kill Switch Authority

- **Customer Authority**: The customer can trigger the project-tier or run-tier kill switch at any time via Dashboard or API.
- **DEFYRA Lead Authority**: Global and tenant-tier kill switches can be engaged immediately if platform or system anomalies are detected.
- **Fail-Closed Execution**: If any kill switch state is `TRIGGERED` or inaccessible, execution halts immediately with `BLOCKED`.
