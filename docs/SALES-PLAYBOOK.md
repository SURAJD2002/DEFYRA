# DEFYRA Solo-Founder Sales Playbook

**Operating Entity**: MARKEET TECHNOLOGIES PRIVATE LIMITED  
**Brand**: DEFYRA  
**Principle**: PROVE. PROTECT. TRUST.  
**Positioning**: AI Security Validation for the Agentic Era  

---

## 1. Core Positioning & Explanations

### 30-Second Elevator Pitch
> *"DEFYRA provides authorized, deterministic security validation for teams deploying generative AI and LLM APIs. We empirically test whether your staging endpoints are vulnerable to prompt injection, system instruction overrides, or credential leakage—providing verified remediation guidance and a cryptographically sealed point-in-time security report."*

### 2-Minute Explanation
> *"As engineering teams deploy LLMs into customer-facing products, traditional application security scanners miss AI-specific vulnerabilities like prompt hijacking and context secret leakage. DEFYRA bridges this gap with controlled, evidence-backed security assessments.*
>
> *We operate within strict Rules of Engagement: testing only authorized staging endpoints during designated windows. We don't perform destructive hacking or black-box fuzzing. Instead, we run deterministic security probes, review candidate findings with our Lead Security Architect, guide your engineers through remediation, and execute a verified retest to prove your defenses work.*
>
> *Our Founding AI Security Assessment gives you a definitive, SHA-256 sealed security report to share with enterprise customers, compliance auditors, and leadership."*

---

## 2. End-to-End Sales & Delivery Process

```
[1] INBOUND LEAD / OUTREACH
    └── Lead submits /contact form or connects via founder network.
[2] QUALIFICATION CALL (15 MIN)
    └── Confirm target architecture (REST/OpenAI format) and authorization authority.
[3] DISCOVERY & SCOPING (30 MIN)
    └── Catalog endpoint URLs, staging environment, testing schedule, and emergency contacts.
[4] PROPOSAL & MUTUAL NDA
    └── Deliver fixed-scope Founding Assessment proposal and execute standard mutual NDA.
[5] RULES OF ENGAGEMENT & AUTHORIZATION
    └── Customer signs machine-enforced RoE; founder confirms invoice payment (PAYMENT_CONFIRMED).
[6] CONTROLLED ASSESSMENT EXECUTION
    └── Execute probes via DEFYRA Python Engine; monitor live telemetry and fail-closed kill switches.
[7] FINDING REVIEW & REMEDIATION ADVISORY
    └── Review CANDIDATE findings with customer team; provide actionable architecture fixes.
[8] VERIFICATION RETEST & FINAL REPORT
    └── Run cryptographic retest on remediated target; seal final report with SHA-256 content hash.
[9] COMMERCIAL CLOSEOUT & TESTIMONIAL
    └── Deliver final delivery package and discuss ongoing quarterly validation.
```

---

## 3. Discovery Call Questions

1. **Target Architecture**: *"How is your LLM application deployed (OpenAI-compatible REST API, LangChain, custom gateway)?"*
2. **Environment**: *"Do you have a dedicated staging or pre-production endpoint with realistic system prompts that we can safely evaluate?"*
3. **Authorization Authority**: *"Are you or your team authorized to sign Rules of Engagement for security testing against this endpoint?"*
4. **Current Defenses**: *"What guardrails or input filters are currently active on this endpoint?"*
5. **Timeline**: *"When are you planning your next release or customer security audit?"*

---

## 4. Qualification Matrix

### Good First Customer (Proceed)
- Deploys an accessible HTTP/REST or OpenAI-compatible endpoint.
- Can provide staging environment access with synthetic credentials.
- Has explicit legal authority to authorize security testing.
- Values evidence-backed security reports for enterprise buyers.
- Has engineering capacity to review findings and apply remediations during the 14-day window.

### Disqualification Criteria (Reject / Defer)
- Requests testing against third-party SaaS without written authorization.
- Requests destructive database attacks or DDoS stress testing.
- Demands unapproved production testing without dual-authorization safeguards.
- Demands complex RAG vector database poisoning or autonomous multi-agent tool breakout before those adapters leave development.

---

## 5. Common Objections & Safe Answers

### Objection 1: *"Can't we just use an open-source prompt injection dataset?"*
> **Answer**: *"Open-source datasets are static benchmarks. DEFYRA tests your live, integrated endpoint—including your specific system prompts, middleware classifiers, and delimiter handling—generating evidence-backed reproduction logs and verified retest validation."*

### Objection 2: *"Will this assessment disrupt our service or corrupt our data?"*
> **Answer**: *"No. Testing is performed strictly in your staging environment using non-destructive probes. Our execution engine is protected by a 4-tier fail-closed kill switch that you or our team can engage instantly if needed."*

### Objection 3: *"Does DEFYRA certify that our AI is 100% secure?"*
> **Answer**: *"No security firm can ethically guarantee 100% security in generative AI. DEFYRA provides empirical, point-in-time validation of specific threat vectors, verified with cryptographic content hashing."*
