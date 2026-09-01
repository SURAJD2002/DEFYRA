# DEFYRA Solo Founder Operational Runbook

**Operating Entity**: MARKEET TECHNOLOGIES PRIVATE LIMITED  
**Brand**: DEFYRA  
**Positioning**: AI Security Validation for the Agentic Era  

---

## 1. Step-by-Step Commercial Delivery Workflow

```
[1] DISCOVERY & QUALIFICATION
    └── Assess customer AI stack (model provider, REST endpoint, agent framework).
[2] PROPOSAL & NDA
    └── Deliver fixed-scope Founding Assessment proposal and execute standard mutual NDA.
[3] RULES OF ENGAGEMENT & SCOPE DEFINITION
    └── Agree on asset URL(s), test IDs, staging environment, testing window, and emergency contact.
[4] CUSTOMER AUTHORIZATION & PAYMENT
    └── Customer signs RoE in DEFYRA Dashboard; founder confirms invoice receipt (PAYMENT_CONFIRMED).
[5] TARGET ONBOARDING & SECRET INGESTION
    └── Ingest ephemeral customer test credential via SecretProvider; verify target health.
[6] CONTROLLED TEST EXECUTION
    └── Trigger authorized test plan via Python Deterministic Engine; monitor live telemetry.
[7] FINDING QUALITY REVIEW
    └── Review all CANDIDATE findings; confirm valid issues with root-cause analysis and remediation notes.
[8] REMEDIATION ADVISORY
    └── Share initial findings report with customer engineering lead; provide 14-day remediation advisory.
[9] VERIFICATION RETEST
    └── Trigger cryptographic retest against customer's updated endpoint; verify vulnerability resolution.
[10] FINAL REPORT SEALING & CLOSEOUT
    └── Generate point-in-time SHA-256 report; destroy ephemeral secrets; mark assessment COMPLETED.
```

---

## 2. Emergency Operational Controls

- **Kill Switch Protocol**: If customer reports service degradation or unusual model behavior, immediately engage the **Project Kill Switch** via `/api/v1/kill-switch` or the Dashboard.
- **Incident Escalation**: Contact the customer's designated `emergencyContact` listed in the Rules of Engagement.
- **Secret Cleansing**: At the conclusion of testing, ensure `SecretProvider.clear()` or secret reference deletion is verified.
