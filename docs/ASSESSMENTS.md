# DEFYRA Security Assessment System

**Operating Entity**: MARKEET TECHNOLOGIES PRIVATE LIMITED  
**Brand**: DEFYRA  
**Positioning**: AI Security Validation for the Agentic Era  
**Principle**: PROVE. PROTECT. TRUST.  

---

## 1. Assessment Lifecycle Overview

```
CUSTOMER
  ↓
ASSESSMENT (Scoped boundary)
  ↓
TEST PLAN (Deterministic probe selection)
  ↓
SECURITY TESTS (Python engine execution via DAG)
  ↓
OBSERVATIONS & EVIDENCE (SHA-256 Hashing)
  ↓
FINDING CANDIDATE (Quality Gate)
  ↓
HUMAN REVIEW (Confirmed / False Positive / Accepted Risk)
  ↓
REMEDIATION PLAN (Actionable engineering fixes)
  ↓
RETEST VERIFICATION (Cryptographic re-execution)
  ↓
FINAL ASSURANCE REPORT (Point-in-time SHA-256 hash)
```

---

## 2. Assessment Entity & Scope Model

### Assessment Types:
- `AI_SECURITY_VALIDATION`: Baseline system prompt and tool validation.
- `AI_RED_TEAM`: Adversarial multi-turn boundary evaluation.
- `AGENT_SECURITY`: Autonomous reasoning and unconstrained tool usage probes.
- `RAG_SECURITY`: Vector injection and retrieval document tampering.
- `TOOL_API_SECURITY`: Unauthorized API and code execution probing.
- `MCP_SECURITY`: Model Context Protocol server boundary verification.

### Scope Model:
- **Authorized Assets**: Must belong to the project/tenant.
- **Authorized Test Definitions**: Explicit test catalog IDs.
- **Environment**: Strict environment matching (`development`, `staging`, `production`).
- **Production Dual-Approval Gate**: Requires Owner and Security Lead approval.
