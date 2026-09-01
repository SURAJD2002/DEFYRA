# DEFYRA Founding AI Security Assessment — Commercial Offer

**Operating Entity**: MARKEET TECHNOLOGIES PRIVATE LIMITED  
**Brand**: DEFYRA  
**Principle**: PROVE. PROTECT. TRUST.  
**Positioning**: AI Security Validation for the Agentic Era  

---

## 1. Executive Summary

The **DEFYRA Founding AI Security Assessment** is a scoped, point-in-time security validation service specifically designed for engineering teams deploying generative AI models, agentic workflows, and LLM-backed APIs.

It provides empirical, evidence-backed evaluation of instruction boundary integrity, prompt injection resistance, and confidential credential protection.

---

## 2. Target Customer & Ideal Profile

- **Ideal Customer**: B2B SaaS, FinTech, or AI-first companies deploying an OpenAI-compatible REST endpoint, custom LLM wrapper, or conversational assistant.
- **Technical Persona**: VP of Engineering, Head of AI/ML, Lead Security Engineer, or Technical Founder.
- **Prerequisites**: Customer owns or operates the target system and possesses the legal authority to authorize testing.

---

## 3. Assessment Scope & Technical Boundaries

| Attribute | Specification |
|---|---|
| **Target Architecture** | OpenAI-compatible REST endpoint (`/v1/chat/completions`) or documented HTTP REST schema |
| **Environment** | **Staging / Pre-Production** (Production strictly requires written dual-authorization) |
| **Asset Limit** | 1 to 3 cataloged target endpoints |
| **Duration** | 3 to 5 business days |
| **Testing Window** | Coordinated testing schedule with explicit start and end timestamps |

---

## 4. Supported Security Test Suite

The Founding Assessment executes only tests that are genuinely supported by DEFYRA's deterministic Python execution engine:

1. **Direct System Prompt Override (`DEF-INJ-001`)**: Empirical testing of system prompt leakage, delimiter escaping, and instruction hijacking.
2. **Context Secret & Token Disclosure (`DEF-DAT-003`)**: Verification that canary tokens and context secrets are not reflected to unauthorized callers.
3. **Agent Identity & Policy Constraint Validation (`DEF-IDN-001`)**: Evaluation of persona adherence and refusal boundaries under adversarial input.

*Note: Vector database poisoning (RAG) and tool authorization bypass (Agent Tools) are available as roadmapped modules once dedicated target adapters exit development.*

---

## 5. Deliverables & Customer Value

1. **Executive Summary**: High-level posture assessment with initial vs. residual risk scoring.
2. **Technical Security Assessment Report**: Comprehensive finding breakdowns with technical descriptions, impact analysis, and reproduction logs.
3. **Point-in-Time Evidence Vault**: SHA-256 hashed evidence references verifying test inputs and model responses.
4. **Remediation Advisory**: Concrete architectural guidance (e.g. rigid XML delimiter framing, pre-response classification filters).
5. **Verification Retest Cycle (1 Included)**: Re-execution of failed tests after customer applies remediations to confirm resolution.
6. **Final Cryptographically Sealed Report**: Point-in-time PDF/JSON report containing historical finding records and verified retest results.

---

## 6. Explicit Exclusions (Out of Scope)

- **No Denial of Service (DoS)** or rate-limiting stress testing.
- **No Uncataloged Third-Party Targets**: Only endpoints explicitly listed in the Rules of Engagement are evaluated.
- **No Destructive Operations**: No live database manipulation or irreversible payload execution.
- **No Autonomous Exploitation**: Testing is strictly deterministic and bound to pre-authorized DAG workflows.

---

## 7. Commercial Terms & Pricing Placeholder

- **Service Fee**: `[PRICING PLACEHOLDER — e.g., $3,500 – $6,000 USD / Assessment]` *(Subject to founder confirmation based on scope)*
- **Payment Terms**: `[PAYMENT TERMS PLACEHOLDER — e.g., 50% upon RoE execution, 50% upon final report delivery / 100% upfront for pilot cohort]`
- **Retest Window**: Customer has 14 calendar days from initial report delivery to deploy remediations and request the included verification retest.

---

## 8. Limitations & Legal Disclaimer

- **Point-in-Time Assurance**: This assessment evaluates model responses against specific adversarial probes during the agreed testing window. It does not constitute a guarantee of complete invulnerability.
- **No Legal Certification**: DEFYRA provides empirical technical validation, not legal compliance certification or regulatory sign-off.
