# DEFYRA AI Security Assessment Lifecycle (Phase 6)

**Operating Entity**: MARKEET TECHNOLOGIES PRIVATE LIMITED  
**Brand**: DEFYRA  
**Principle**: PROVE. PROTECT. TRUST.  
**Positioning**: AI Security Validation for the Agentic Era  

---

## 1. The 10-Stage Assessment Lifecycle

```
[1] ONBOARDING & PROJECT INITIALIZATION
    └── Onboard customer tenant, project, and target assets (REST, RAG, Agent).
[2] RULES OF ENGAGEMENT (ROE) & SCOPE AGREEMENT
    └── Define explicit asset IDs, test IDs, environments, testing window, and emergency contacts.
[3] SCOPE AUTHORIZATION GATE
    └── Customer & Security Lead sign off -> Transitions status to AUTHORIZED.
[4] CAPABILITY TOKEN MINTING
    └── HMAC-SHA256 capability tokens minted with single-use nonce for every test run.
[5] DETERMINISTIC DAG PROBE DISPATCH
    └── Next.js control plane dispatches probe to Python Security Engine via /internal/v1/execute.
[6] EVIDENCE VAULT & AUTOMATIC REDACTION
    └── Raw interaction traces stored with sensitive secrets masked and SHA-256 hashed.
[7] FINDING QUALITY GATE (HUMAN REVIEW)
    └── Failed probes create CANDIDATE findings requiring Lead Security Architect review.
[8] ACTIONABLE REMEDIATION TRACKING
    └── Formulate precise engineering fixes, assign owner, and track to READY_FOR_RETEST.
[9] CRYPTOGRAPHIC VERIFICATION RETEST
    └── Re-execute authorized probe with fresh capability token -> Transitions finding to RESOLVED.
[10] POINT-IN-TIME ASSURANCE REPORT & COMPLETION GATE
    └── Generate structured report with SHA-256 hash; assessment marks COMPLETED.
```

---

## 2. Assessment State Machine

| Status | Description | Executable? | Next Permitted States |
|---|---|---|---|
| `DRAFT` | Initial scoping draft | No | `PENDING_APPROVAL`, `AUTHORIZED`, `CANCELLED` |
| `PENDING_APPROVAL` | Awaiting customer sign-off on Rules of Engagement | No | `AUTHORIZED`, `DRAFT`, `CANCELLED` |
| `AUTHORIZED` | Rules of Engagement signed; ready for test plan execution | **Yes** | `RUNNING`, `REVIEW`, `CANCELLED` |
| `READY` | Ready for interactive test runs | **Yes** | `RUNNING`, `REVIEW`, `CANCELLED` |
| `RUNNING` | Probes actively executing through Python security engine | **Yes** | `REVIEW`, `REMEDIATION`, `CANCELLED` |
| `REVIEW` | Probes complete; human review of candidate findings underway | **Yes** | `REMEDIATION`, `RETEST`, `COMPLETED` |
| `REMEDIATION` | Engineering team remediating confirmed findings | **Yes** | `RETEST`, `REVIEW` |
| `RETEST` | Verification retests in progress | **Yes** | `REVIEW`, `COMPLETED` |
| `COMPLETED` | Final point-in-time report generated; assessment sealed | No | None (Terminal) |
| `CANCELLED` | Assessment aborted or superseded | No | None (Terminal) |
