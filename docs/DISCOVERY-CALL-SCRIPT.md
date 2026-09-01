# DEFYRA Discovery Call Script & Qualification Framework

**Operating Entity**: MARKEET TECHNOLOGIES PRIVATE LIMITED  
**Brand**: DEFYRA  
**Principle**: PROVE. PROTECT. TRUST.  
**Duration**: 20 Minutes  

---

## 1. Agenda & Time Breakdown

```
[00:00 - 05:00] Understand Company, Product & AI Use Case
[05:00 - 10:00] Understand Technical Architecture & Protocols
[10:00 - 15:00] Understand Security Concerns & Compliance Objectives
[15:00 - 20:00] Staging Environment Verification & Scoping Next Steps
```

---

## 2. Minute-by-Minute Flow & Questions

### Part 1: Product Context (5 min)
- *"Can you give me a brief overview of {{AI_Product_Name}} and how your users interact with the LLM?"*
- *"Is the AI customer-facing, internal, or part of an automated backend pipeline?"*
- *"What model providers are you utilizing behind the scenes (OpenAI, Anthropic, self-hosted)?"*

### Part 2: Technical Architecture (5 min)
- *"How is the application exposed? Is it an OpenAI-compatible REST endpoint (`/v1/chat/completions`) or a custom REST API?"*
- *"How do you handle authentication (Bearer token, custom header, mTLS)?"*
- *"Are there complex tool executions or vector databases currently wired in, or is it a direct prompt/completion flow?"*
  *(Note: If customer strictly demands deep RAG or multi-agent autonomous tool breakouts, clarify that those dedicated adapters are in development, and the Founding Assessment focuses on the REST endpoint prompt/data layer).*

### Part 3: Security & Compliance Objectives (5 min)
- *"What are your team's primary security concerns regarding this deployment (e.g. system prompt theft, delimiter escaping, credential reflection)?"*
- *"Are you preparing for an enterprise customer security review or SOC 2 audit where an independent validation report would be valuable?"*
- *"What input filtering or guardrails are currently deployed in front of the model?"*

### Part 4: Staging Access & Authorization (5 min)
- *"Do you have a dedicated staging or pre-production endpoint with realistic system prompts that we can safely evaluate?"*
- *"Who on your team has the legal authority to sign the Rules of Engagement and scope agreement?"*
- *"What timeline or release date are you working towards?"*

---

## 3. Qualification Scoring & Decision Gate

| Criteria | Qualified (Score +1) | Disqualified / Deferred (Score 0) |
|---|---|---|
| **Target Protocol** | OpenAI-compatible / REST endpoint | Custom non-HTTP binary protocols |
| **Environment** | Dedicated Staging / Pre-Production | Live production without dual approval |
| **Authorization** | Explicit legal authority to test | 3rd party SaaS without ownership |
| **Test Scope** | Prompt injection, boundary leakage, data reflection | Demands DoS, infrastructure destruction |
| **Timeline** | Active project ready within 2–4 weeks | Vague future interest (> 6 months) |

**Decision**:
- **Score $\ge$ 4**: **QUALIFIED** $\rightarrow$ Send Mutual NDA & Proposal with [`docs/CUSTOMER-ONBOARDING-CHECKLIST.md`](file:///Users/surajkumar/Desktop/DEFYRA/docs/CUSTOMER-ONBOARDING-CHECKLIST.md).
- **Score < 4**: **DEFER / REJECT** $\rightarrow$ Explain technical/legal boundaries gracefully.
