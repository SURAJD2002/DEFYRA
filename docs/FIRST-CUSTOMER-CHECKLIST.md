# DEFYRA First Customer Delivery Master Checklist

**Operating Entity**: MARKEET TECHNOLOGIES PRIVATE LIMITED  
**Brand**: DEFYRA  
**Principle**: PROVE. PROTECT. TRUST.  
**Positioning**: AI Security Validation for the Agentic Era  

---

## 1. Pre-Sale & Qualification Phase
- [ ] **Discovery Call Completed**: Agenda and scoping questions reviewed.
- [ ] **Qualification Confirmed**:
  - [ ] Customer owns/operates the target system.
  - [ ] Staging / pre-production environment confirmed.
  - [ ] Target architecture is OpenAI-compatible / REST schema.
  - [ ] Customer has legal authorization authority.

---

## 2. Contracting & Legal Phase
- [ ] **Mutual NDA**: Fully executed by customer and founder.
- [ ] **Proposal Delivered**: Scope (1–3 assets, 3–5 days, supported tests) accepted.
- [ ] **Customer Onboarding Checklist Received**: Completed [`docs/CUSTOMER-ONBOARDING-CHECKLIST.md`](file:///Users/surajkumar/Desktop/DEFYRA/docs/CUSTOMER-ONBOARDING-CHECKLIST.md).
- [ ] **Rules of Engagement Configured**:
  - [ ] Assessment created in DEFYRA Dashboard.
  - [ ] Asset allowlist, testing window, and authorized test IDs locked.
  - [ ] Customer signed RoE in dashboard $\rightarrow$ Status: `AUTHORIZED`.

---

## 3. Commercial Phase
- [ ] **Commercial Invoice Issued**: Sent to customer billing contact.
- [ ] **Payment Confirmed**: Founder manually verifies funds receipt $\rightarrow$ Set `paymentStatus: 'PAYMENT_CONFIRMED'` in DEFYRA.

---

## 4. Technical Setup Phase
- [ ] **Target Health Verification**: `curl` or `GET /health` to customer staging endpoint succeeds.
- [ ] **Egress Firewall Allowlisting**: Customer security team confirmed DEFYRA egress IP is allowlisted.
- [ ] **Ephemeral Secret Ingestion**: Ingest test credential into `SecretProvider` on single-node runner.
- [ ] **Scope Enforcement Gate Check**: `enforceAssessmentScope()` returns `{ allowed: true }`.
- [ ] **Kill Switch Verification**: `killSwitchRegistry.check()` returns `ACTIVE`.

---

## 5. Execution & Quality Gate Phase
- [ ] **Deterministic Probe Dispatch**: Trigger authorized test plan via Python Engine.
- [ ] **Live Telemetry Monitored**: Observe stage progression and egress safety.
- [ ] **Quality Gate Review**: Inspect raw observations for all `CANDIDATE` findings; eliminate false positives.
- [ ] **Finding Confirmation**: Transition valid issues to `CONFIRMED` with root cause notes.

---

## 6. Remediation & Retest Phase
- [ ] **Remediation Advisory Delivered**: Share technical findings and fixes with customer engineering lead.
- [ ] **Customer Deploys Fix**: Customer confirms patch is live on staging endpoint.
- [ ] **Verification Retest Dispatched**: Execute retest using fresh capability token and nonce.
- [ ] **Retest Passed**: Target safely refuses probe $\rightarrow$ Transition finding to `RESOLVED`.

---

## 7. Report Delivery & Assessment Closeout Phase
- [ ] **Point-in-Time Report Generated**: Verify report preserves initial finding (`1 High`), records retest resolution (`1 Resolved`), and reflects `0` open findings.
- [ ] **SHA-256 Content Hash Sealed**: Record immutable report hash.
- [ ] **Ephemeral Secret Destroyed**: Confirm customer test token is cleared from memory.
- [ ] **Assessment Status Finalized**: Transition assessment to `COMPLETED`.
- [ ] **Final Delivery Package Transmitted**: Send report to customer leadership.
