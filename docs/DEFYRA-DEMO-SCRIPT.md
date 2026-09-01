# DEFYRA 10-Minute Live Demo Script

**Operating Entity**: MARKEET TECHNOLOGIES PRIVATE LIMITED  
**Brand**: DEFYRA  
**Principle**: PROVE. PROTECT. TRUST.  
**Demonstration Target**: Synthetic AI Endpoint (Port 4000)  

---

> [!NOTE]
> **DEMO ENVIRONMENT NOTICE**: This demonstration utilizes synthetic staging infrastructure running locally (`http://127.0.0.1:4000/v1/chat/completions`) and does not touch customer or production systems.

---

## Demo Agenda (10 Minutes)

```
[00:00 - 02:00] Platform Architecture & Machine-Enforced Scoping
[02:00 - 04:00] Project, Asset & Rules of Engagement Onboarding
[04:00 - 06:00] Real HTTP Test Execution & Quality Gate Candidate Finding
[06:00 - 08:00] Remediation Advisory & Cryptographic Retest Resolution
[08:00 - 10:00] Point-in-Time Assurance Report Sealed with SHA-256
```

---

## Minute-by-Minute Walkthrough

### 1. Platform Architecture (2 min)
- **Screen**: Next.js Dashboard (`/dashboard`).
- **Narrative**:
  > *"DEFYRA is built around deterministic security execution. Unlike generic LLM fuzzers, every evaluation is bound to an explicit organization, project, asset allowlist, and time window. Our engine is protected by a 4-tier fail-closed kill switch and strict SSRF egress guard."*

### 2. Scoping & Rules of Engagement (2 min)
- **Screen**: `/dashboard/assessments` $\rightarrow$ View Assessment details.
- **Narrative**:
  > *"Here we see our scoped Rules of Engagement. We define the exact staging endpoint URL, authorized test definitions (`DEF-INJ-001`), and testing schedule. The engine refuses execution unless the assessment is formally signed (`AUTHORIZED`) and commercial status is confirmed."*

### 3. Real HTTP Execution & Quality Gate (2 min)
- **Screen**: `/dashboard/projects/[id]` $\rightarrow$ Test Runs.
- **Narrative**:
  > *"When we dispatch a test run, our Python engine issues a scoped, single-use capability token. The target adapter makes a real HTTP request across the network boundary to the model endpoint.
  > If a vulnerability is detected (e.g. system prompt override), the test status becomes `FAILED`, and a `CANDIDATE` finding is created. No unvetted finding is published automatically; our Lead Security Architect reviews the raw observation logs to eliminate false positives before transitioning the finding to `CONFIRMED`."*

### 4. Remediation & Retest (2 min)
- **Screen**: `/dashboard/findings/[id]` $\rightarrow$ Remediation & Retest.
- **Narrative**:
  > *"We don't just point out flaws; we provide concrete architectural remediation notes—such as rigid XML instruction framing and pre-response classifiers. Once the engineering team updates their staging endpoint, we trigger a verification retest using a fresh capability token and nonce. When the target safely refuses the adversarial probe, the finding transitions to `RESOLVED`."*

### 5. SHA-256 Sealed Assessment Report (2 min)
- **Screen**: `/dashboard/assessments/[id]/report`.
- **Narrative**:
  > *"Finally, we generate the Point-in-Time Security Assessment Report. Notice that the report preserves historical truth: it clearly documents the original confirmed finding (`1 High`), shows the verified retest resolution (`1 Resolved`), reports 0 open findings, and computes residual risk (`0/10`).
  > The entire report is cryptographically sealed with an immutable SHA-256 hash that you can provide directly to enterprise customers and compliance auditors."*
