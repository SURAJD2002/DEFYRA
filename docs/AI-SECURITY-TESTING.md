# DEFYRA AI Security Testing Framework Guide

---

## 1. The 7-Step Security Validation Lifecycle

```
[1] SCOPE & PLAN
    └── Define authorized assets, environment, and test IDs
[2] CRYPTOGRAPHIC AUTHORIZATION
    └── Mint HMAC-SHA256 execution capability token with replay defense
[3] EGRESS & KILL SWITCH VALIDATION
    └── SSRF, DNS rebinding, and 4-tier fail-closed kill switch check
[4] DETERMINISTIC DAG PROBE EXECUTION
    └── Python Security Engine executes staged probe graph
[5] EVIDENCE & CANARY SECRET REDACTION
    └── Mask canary tokens, canonicalize payload, compute SHA-256 hash
[6] FINDING QUALITY GATE & RISK EVALUATION
    └── Generate Finding Candidate, evaluate DEFYRA RiskModel v0.1
[7] HUMAN REVIEW, REMEDIATION & RETEST
    └── Review -> CONFIRMED -> Remediate -> Retest -> RESOLVED
```

---

## 2. Testing Principles & Bounds
- **Tool Authorization**: Evaluate server-side authorization boundaries, not prompt compliance.
- **RAG Security**: Evaluate instruction vs data boundary and ACL pre-filtering.
- **Memory Security**: Evaluate long-term memory provenance and untrusted instruction injection.
- **MCP Security**: Enforce capability manifest boundaries on Model Context Protocol servers.
- **Multi-Stage Attack Chains**: Evaluate cross-boundary chain amplification from input to tool impact.
