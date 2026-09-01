# DEFYRA Customer Onboarding Checklist & Technical Scope

**Operating Entity**: MARKEET TECHNOLOGIES PRIVATE LIMITED  
**Brand**: DEFYRA  
**Principle**: PROVE. PROTECT. TRUST.  

---

> [!IMPORTANT]
> **LEGAL AUTHORIZATION NOTICE**: The customer must have full legal ownership or explicit written authorization to commission security testing against the target systems. DEFYRA strictly refuses unauthorized testing.

---

## 1. Customer & Organizational Information

- [ ] **Legal Company Name**: __________________________________________________
- [ ] **Primary Technical Contact**:
  - Name: __________________________________________________
  - Role / Title: ___________________________________________
  - Email: __________________________________________________
  - Phone / Signal: _________________________________________
- [ ] **Security Lead / Authorization Signatory**:
  - Name: __________________________________________________
  - Email: __________________________________________________
- [ ] **Emergency Contact (24/7 during testing window)**:
  - Name: __________________________________________________
  - Direct Phone: ___________________________________________

---

## 2. Target Technical Specifications

- [ ] **AI Application / System Name**: _______________________________________
- [ ] **Target Endpoint URL**: `https://____________________________________`
- [ ] **Environment**:
  - [ ] Staging / Pre-Production *(Standard / Recommended)*
  - [ ] Development
  - [ ] Production *(Strict dual-approval RoE required)*
- [ ] **Protocol Schema**:
  - [ ] OpenAI-Compatible (`POST /v1/chat/completions`)
  - [ ] Custom REST Endpoint *(Documentation / OpenAPI schema attached)*
- [ ] **Authentication Mechanism**:
  - [ ] Ephemeral Bearer Token (e.g. `DEFYRA_TEST_SECRET_ONLY`)
  - [ ] Custom Header (Header Name: `________________________`)
  - [ ] IP Allowlisting only (No auth token required)

> [!CAUTION]
> **NEVER SHARE PRODUCTION CREDENTIALS**. Provide only a dedicated, ephemeral test API key with strictly scoped permissions.

---

## 3. Scope & Rules of Engagement Parameters

- [ ] **Authorized Target Asset URL(s)**:
  1. `__________________________________________________________`
  2. `__________________________________________________________`
  3. `__________________________________________________________`
- [ ] **Authorized Testing Time Window**:
  - Start Date & Time (UTC): `YYYY-MM-DD HH:MM UTC`
  - End Date & Time (UTC):   `YYYY-MM-DD HH:MM UTC`
- [ ] **Authorized Test Definitions**:
  - [x] `DEF-INJ-001`: Direct System Prompt Override Validation
  - [x] `DEF-DAT-003`: Canary Context Secret Disclosure Validation
  - [x] `DEF-IDN-001`: Agent Identity & Policy Constraint Validation
- [ ] **Explicitly Prohibited / Out-of-Scope Systems**:
  - Listed 3rd-party services: _______________________________
  - Backend databases / vector storage: ______________________
- [ ] **Kill Switch Escalation Authority**:
  - Authorized to halt testing: [ ] DEFYRA Security Lead  [ ] Customer Technical Contact

---

## 4. Authorization & Sign-Off Gate

By signing below, Customer confirms they possess the requisite legal authority to authorize DEFYRA to conduct the scoped security assessment described above.

- **Authorized Signatory Name**: _____________________________________________
- **Title / Role**: _________________________________________________________
- **Date**: _________________________________________________________________
- **Signature**: ____________________________________________________________
