# Architecture Blueprint — DEFYRA Web Platform

**Brand**: DEFYRA  
**Operating Entity**: MARKEET TECHNOLOGIES PRIVATE LIMITED  
**Principle**: PROVE. PROTECT. TRUST.  
**Positioning**: AI Security Validation for the Agentic Era  
**Core Promise**: Prove What AI Can Do.  

---

## 1. System Overview & Boundaries

DEFYRA is purpose-built to validate the complete agentic attack path:
```
Untrusted Input
      ↓
  AI / Agent
      ↓
Context / RAG
      ↓
   Memory
      ↓
   Tools
      ↓
  Identity
      ↓
Permissions
      ↓
    APIs
      ↓
Business Systems
      ↓
Business Impact
```

The system is designed as a **modular monorepo** to maximize maintainability, security, and developer velocity for a solo founder while remaining seamlessly extensible to distributed background workers.

```
defyra/
├── apps/
│   ├── web/                    # Next.js 14/15 App Router Frontend & Secure API Gateway
│   └── api/                    # (Future) Dedicated Internal API Service
├── services/
│   └── security-engine/        # (Future/Mocked) Python Sandboxed Execution Engine
├── packages/
│   ├── ui/                     # Design system primitives & tokens
│   ├── types/                  # Domain contracts (Assets, Tests, Findings, Evidence)
│   ├── config/                 # Shared configs (ESLint, TS, Tailwind)
│   └── validation/             # Zod validation schemas
├── database/
│   ├── migrations/             # Idempotent PostgreSQL DDL migrations
│   └── seeds/                  # Seed catalogs (20 core AI security tests)
├── docs/                       # Architectural & operational specs
├── docker-compose.yml          # Local development orchestration
├── .env.example                # Canonical environment template
└── README.md
```

---

## 2. Multi-Tenancy & Authorization Model

Every persistent object in DEFYRA strictly inherits tenant isolation:
```
Organization
    ├── Memberships (Owner, Admin, Security Lead, Analyst, Viewer)
    └── Projects
          ├── Asset Inventory (Applications, Agents, Models, RAG, Memory, Tools, APIs, Identity, MCP)
          ├── Test Runs (Scoped & Authorized target executions)
          ├── Observations & Evidence (SHA-256 integrity chained)
          ├── Findings (Risk Model v0.1 scored)
          ├── Remediations & Retests
          └── Reports (Point-in-time assurance)
```

### Safety & Access Rules:
1. **Server-Side Enforcement**: No client-supplied tenant ID is trusted. All operations derive tenancy from authenticated session context and membership tables.
2. **Pre-Execution Guardrails**:
   - Explicit scope authorization check.
   - Kill-switch state verification (Global, Organization, Project, Test-Run).
   - Target allowlist & environment boundary validation (Production requires dual-confirmation).
3. **Evidence Integrity**: Evidence payloads are immutable and stored with SHA-256 cryptographic hashes and access audit trails.
