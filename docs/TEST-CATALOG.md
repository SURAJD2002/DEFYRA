# DEFYRA AI Security Test Catalog (Phase 5)

**Operating Entity**: MARKEET TECHNOLOGIES PRIVATE LIMITED  
**Brand**: DEFYRA  
**Positioning**: AI Security Validation for the Agentic Era  
**Principle**: PROVE. PROTECT. TRUST.  

---

## Active Test Definitions & Handlers

| Test ID | Name | Category | Target Types | Severity | DAG Stages | Finding Risk Score |
|---|---|---|---|---|---|---|
| `DEF-INJ-001` | Direct System Prompt Override | Prompt Injection | `AGENT`, `MODEL` | HIGH | 1 | 7.8 / 10 |
| `DEF-INJ-002` | Indirect Prompt Injection via Web Retrieval | Indirect Prompt Injection | `RAG`, `AGENT` | CRITICAL | 1 | 9.0 / 10 |
| `DEF-AGC-001` | Autonomous Unconstrained File System Access | Excessive Agency | `AGENT`, `TOOL` | CRITICAL | 1 | 9.5 / 10 |
| `DEF-AUT-001` | Tool Permission Boundary Bypass | Authorization | `AGENT`, `TOOL`, `PERMISSION` | CRITICAL | 1 | 9.2 / 10 |
| `DEF-AUT-002` | Cross-Tenant Asset Access via Tool Parameter Manipulation | Authorization | `AGENT`, `TOOL`, `API` | CRITICAL | 1 | 9.4 / 10 |
| `DEF-RAG-001` | RAG Context Poisoning via Unchecked Vector Insertion | RAG | `AGENT`, `RAG`, `DATA_SOURCE` | HIGH | 1 | 7.9 / 10 |
| `DEF-RAG-002` | ACL Filtering Bypass in Semantic Retrieval | RAG | `AGENT`, `RAG`, `DATA_SOURCE` | CRITICAL | 1 | 9.3 / 10 |
| `DEF-MEM-001` | Adversarial Long-Term Memory Injection | Memory | `AGENT`, `MEMORY` | HIGH | 1 | 7.6 / 10 |
| `DEF-DAT-003` | Credential & Secret Leakage in Context | Sensitive Data Exposure | `AGENT`, `MODEL`, `TOOL` | CRITICAL | 1 | 9.6 / 10 |
| `DEF-IDN-001` | Agent Identity Impersonation | Identity | `AGENT`, `IDENTITY` | HIGH | 1 | 7.7 / 10 |
| `DEF-MCP-001` | MCP Protocol Server Privilege Escalation | MCP | `AGENT`, `MCP_SERVER`, `TOOL` | CRITICAL | 1 | 9.7 / 10 |
| `DEF-CHN-001` | Multi-Stage Agentic Attack Chain | Agentic Attack Chains | `AGENT`, `RAG`, `TOOL` | CRITICAL | 4 | 9.9 / 10 |

---

## Safety & Non-Destructive Testing Principles
- All tests execute against synthetic sandbox endpoints or explicitly authorized client URLs.
- Sensitive canary credentials (e.g. `DEFYRA_CANARY_TOKEN_001`) are masked as `[REDACTED_CANARY_SECRET]` before persistence into evidence records.
- 4-Tier Kill Switch checkpoints are evaluated before every DAG stage.
