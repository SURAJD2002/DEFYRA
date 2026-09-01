# DEFYRA First Customer Operational Runbook

**Operating Entity**: MARKEET TECHNOLOGIES PRIVATE LIMITED  
**Brand**: DEFYRA  
**Principle**: PROVE. PROTECT. TRUST.  
**Positioning**: AI Security Validation for the Agentic Era  

---

## 1. Pre-Assessment Preparation Checklist

- [ ] **Proposal & Mutual NDA**: Fully executed by customer and founder.
- [ ] **Commercial Invoice**: Sent and verified as `PAYMENT_CONFIRMED` or `WAIVED_FOR_PILOT`.
- [ ] **Completed Onboarding Checklist**: Received all items from [`docs/CUSTOMER-ONBOARDING-CHECKLIST.md`](file:///Users/surajkumar/Desktop/DEFYRA/docs/CUSTOMER-ONBOARDING-CHECKLIST.md).
- [ ] **Rules of Engagement Configured in DEFYRA Dashboard**:
  - Organization and Project created.
  - Target Asset created with staging endpoint URL.
  - Assessment created with authorized test IDs, environment, and testing window.
  - Customer signed RoE $\rightarrow$ Assessment transitioned to `AUTHORIZED`.
- [ ] **Target Health & Egress Verification**:
  - Perform simple `GET /health` or curl against target endpoint.
  - Verify DEFYRA egress IP is allowlisted on customer's firewall.
- [ ] **Secret Reference Ingestion**:
  - Ingest ephemeral customer test API key into `SecretProvider` on the single-node instance.
  - Confirm token is masked as `[REDACTED_CUSTOMER_SECRET]`.

---

## 2. Pre-Execution Readiness Gate

Before clicking "Dispatch Test Run" or running the assessment runner:
1. Verify `killSwitchRegistry.check()` returns `ACTIVE` (no active kill switches).
2. Verify `enforceAssessmentScope()` returns `{ allowed: true }`.
3. Confirm current UTC timestamp is within `testingWindowStart` and `testingWindowEnd`.
4. Confirm target environment is `staging` (or has written `productionApproved: true`).

---

## 3. During-Execution Protocol

- **Telemetry Monitoring**: Watch live execution logs in the Next.js Dashboard or terminal output.
- **Fail-Closed Triggers**: If customer reports abnormal behavior or rate-limit throttling, immediately engage the **Project Kill Switch** via `/api/v1/kill-switch`.
- **Finding Quality Gate**:
  - Every probe failure automatically creates a `CANDIDATE` finding.
  - Lead Security Architect inspects raw inputs and outputs to filter false positives.
  - If valid, update finding status to `CONFIRMED` with root cause notes.

---

## 4. Post-Execution, Remediation & Retest Protocol

1. **Deliver Initial Finding Report**:
   - Provide customer technical lead with confirmed findings and remediation guidance.
   - Set 14-day remediation tracking window.
2. **Remediation & Retest**:
   - Customer deploys fix to their staging endpoint.
   - Dispatch verification retest with fresh capability token and single-use nonce.
   - Upon successful refusal, update finding to `RESOLVED`.
3. **Generate Point-in-Time Assurance Report**:
   - Generate report via `/api/v1/assessments/[id]/report`.
   - Verify report preserves initial finding (1 Confirmed), shows retest resolution (1 Resolved), and computes residual risk (`0/10`).
   - Verify SHA-256 report integrity hash.
4. **Secret Cleansing & Assessment Closeout**:
   - Clear ephemeral secret from `SecretProvider`.
   - Transition assessment to `COMPLETED`.
   - Deliver final report package to customer.
