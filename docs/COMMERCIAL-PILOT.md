# DEFYRA Founding AI Security Assessment — Commercial Pilot Specification

**Operating Entity**: MARKEET TECHNOLOGIES PRIVATE LIMITED  
**Brand**: DEFYRA  
**Principle**: PROVE. PROTECT. TRUST.  
**Positioning**: AI Security Validation for the Agentic Era  

---

## 1. Commercial Service Overview

The **DEFYRA Founding AI Security Assessment** is a scoped, point-in-time security validation service specifically designed for engineering teams deploying generative AI models, agentic workflows, and LLM-backed APIs.

### Scope Boundaries for Pilot
- **Target Customer**: B2B SaaS, FinTech, and AI companies deploying LLM-backed applications or agents.
- **Maximum Target Assets**: 1–3 cataloged endpoints (REST / OpenAI-compatible).
- **Environment**: Staging / Pre-Production (Production strictly requires signed dual-approval RoE).
- **Assessment Duration**: 3 to 5 business days.
- **Supported Test Suite**: Scoped prompt injection, instruction boundary integrity, canary secret leakage, and identity constraint validation.
- **Support Period**: 14 days of remediation advisory and 1 verification retest cycle included.

---

## 2. What DEFYRA Evaluates vs. Exclusions

### What DEFYRA Evaluates
1. **Direct & Indirect Prompt Injection**: Resistance against system prompt override, delimiter escaping, and adversarial payload injection.
2. **Context Secret & Credential Disclosure**: Detection of reflected API keys, tokens, or confidential memory artifacts with automatic token redaction.
3. **Agent Identity & Role Integrity**: Verification that the model enforces persona, role, and operational constraints.
4. **Boundary & Tool Calling Policy**: Empirical validation that safety classifiers and guardrails reject malicious instruction perturbations.

### Explicit Exclusions (Out of Scope)
- **Denial of Service (DoS)** or resource exhaustion attacks.
- **Uncataloged Third-Party Infrastructure**: No testing of third-party cloud providers, search engines, or external vector providers not explicitly listed in the scope agreement.
- **Destructive Database Modification**: No live destructive testing against production databases.
- **Automated Continuous Fuzzing**: This is a scoped, point-in-time assessment, not an unrestricted penetration test.

---

## 3. Customer Prerequisites & Technical Onboarding

1. **Dedicated Target Endpoint**: An accessible HTTPS/HTTP endpoint supporting JSON requests (OpenAI chat completion format or documented REST schema).
2. **Synthetic Sandbox Credentials**: The customer provides an ephemeral test API key (e.g. `DEFYRA_TEST_SECRET_ONLY`). Production master keys are **strictly forbidden**.
3. **Network Allowlisting**: Customer security team allowlists DEFYRA execution egress IP addresses if ingress firewall filters are active.

---

## 4. Rules of Engagement & Machine-Enforced Scoping

Before any probe can be dispatched:
- **Scope Agreement**: Explicit cataloging of asset URLs, authorized test definitions, allowed environments, testing time window, and emergency contact.
- **Readiness Gate**: The DEFYRA platform refuses execution if:
  - Commercial payment is not confirmed (`PAYMENT_CONFIRMED` or `WAIVED_FOR_PILOT`).
  - Rules of engagement are not signed (`AUTHORIZED`).
  - Target URL or asset ID is outside the approved allowlist.
  - Current timestamp falls outside the approved testing window.
  - Any 4-tier kill switch is triggered.

---

## 5. Finding Lifecycle & Remediation Retest Policy

```
[PROBE FAILURE] ──> [CANDIDATE FINDING] ──> [LEAD ARCHITECT REVIEW] ──> [CONFIRMED]
                                                                            │
[REPORT / SEALED] <── [RESOLVED] <── [VERIFICATION RETEST] <── [REMEDIATION IN PROGRESS]
```

- **Candidate Quality Gate**: No finding is automatically published. Every failure produces a `CANDIDATE` requiring manual review by a Lead Security Architect.
- **Actionable Remediation**: Each confirmed finding includes architectural root-cause analysis and concrete remediation guidance (e.g., rigid delimiter framing, secondary classification, capability scoping).
- **Cryptographic Retest**: Once remediated, customer triggers a verification retest. A fresh capability token and single-use nonce execute the probe. Successful retest marks the finding `RESOLVED` while preserving the historical record in the final report.

---

## 6. Point-in-Time Assurance & Security Disclaimers

- **Integrity Guarantee**: Final assessment reports and evidence records are cryptographically sealed using SHA-256 content hashes.
- **Point-in-Time Reality**: Security testing provides empirical point-in-time evidence regarding tested prompts and configurations. DEFYRA does **not** claim "100% security", "unconditional safety", or "certification of immunity".
