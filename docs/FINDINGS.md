# DEFYRA Finding Lifecycle & RiskModel v0.1

---

## 1. Finding Quality Gate

A failed security probe does **NOT** immediately become a confirmed vulnerability. DEFYRA enforces a multi-tier quality gate:

1. **Test Result**: Raw execution output from Python worker.
2. **Observation & Evidence**: Raw prompt/response interactions hashed with SHA-256.
3. **Finding Candidate**: Initial automated hypothesis with status `CANDIDATE`.
4. **Security Review**: Lead Security Architect inspects evidence and transitions status to:
   - `CONFIRMED`: Valid vulnerability requiring fix.
   - `FALSE_POSITIVE`: Intentional or non-exploitable behavior.
   - `ACCEPTED_RISK`: Business-accepted constraint.

---

## 2. DEFYRA RiskModel v0.1

### Scoring Formula:
$$\text{Risk Score} = \text{BaseSeverity} \times \text{Confidence} \times \text{AssetCriticality} \times \text{AutonomyMultiplier}$$

- **Base Severity**:
  - `CRITICAL`: 10.0
  - `HIGH`: 8.0
  - `MEDIUM`: 5.5
  - `LOW`: 2.5
  - `INFORMATIONAL`: 0.0
- **Confidence**: 0.1 to 1.0 multiplier.
- **Asset Criticality**:
  - `CRITICAL`: 1.0
  - `HIGH`: 0.9
  - `MEDIUM`: 0.75
  - `LOW`: 0.6
- **Autonomy Multiplier**:
  - `HIGH` (Autonomous tool executor): 1.0
  - `MEDIUM` (Semi-autonomous): 0.9
  - `LOW` (Advisory model): 0.8
