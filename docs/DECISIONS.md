# Architecture Decision Records (ADR) — DEFYRA

## ADR-001: Monorepo Architecture with Next.js App Router for Web & API
- **Status**: Accepted
- **Context**: DEFYRA is initially operated by MARKEET TECHNOLOGIES PRIVATE LIMITED under a solo-founder model. We need speed, maintainability, low infra cost, and strict type safety across both frontend and API contracts.
- **Decision**: Use a single modular workspace with Next.js (App Router, TypeScript) for the web application and initial v1 API routes, with dedicated directories for shared domain types, validation schemas, database migrations, and future Python evaluation workers.
- **Consequences**: Avoids multi-repo operational overhead and microservice sprawl while keeping clean separation of concerns.

## ADR-002: Dark Enterprise Cybersecurity Aesthetic
- **Status**: Accepted
- **Context**: DEFYRA is an enterprise AI security & cyber defense product. Generic cyberpunk/matrix clichés, neon gaming themes, or bland white SaaS templates erode enterprise trust.
- **Decision**: Adopt a bespoke, dark, high-contrast, technical palette:
  - Deep canvas (`#030712`, `#0B1222`)
  - Crisp slate structural borders (`#1E293B`)
  - Cyan & Electric Blue telemetry accents (`#38BDF8`, `#2563EB`)
  - Violet accents (`#818CF8`)
  - WCAG 2.2 AA compliant contrast and accessible focus states.
- **Consequences**: Conveys rigorous engineering, clarity, and authority.

## ADR-003: Server-Side Authorization Boundary & Security Engine Isolation
- **Status**: Accepted
- **Context**: Security testing tools must never execute unauthorized attacks or decide authorization boundaries independently.
- **Decision**: All scope verification, target allowlisting, kill-switch checks, tenant isolation, and RBAC are strictly evaluated on the server before dispatching jobs to execution workers. Sandboxed workers receive only pre-authorized targets and constraints.
- **Consequences**: Guarantees non-repudiation, prevents out-of-scope executions, and maintains complete auditability.

## ADR-004: Versioned Risk Model (v0.1) & Cryptographic Evidence Integrity
- **Status**: Accepted
- **Context**: Universal "AI Security Scores" are scientifically misleading without transparent risk factors. Evidence must also be tamper-evident.
- **Decision**: Use an explicit `RiskModel v0.1` taking into account impact, likelihood, exploitability, privilege, data sensitivity, autonomy, blast radius, and business criticality. Store the risk model version alongside every finding. Evidence is hashed with SHA-256 upon collection.
- **Consequences**: Transparent scoring methodology, auditable evidence chain, and zero false claims of universal certification.

## ADR-005: Multi-Tenant Schema with Organization & Project Scoping
- **Status**: Accepted
- **Context**: Prevent IDOR, horizontal privilege escalation, and cross-tenant leakage.
- **Decision**: PostgreSQL schema where all operational entities (assets, test runs, findings, evidence, reports) strictly cascade from an `organization_id` and `project_id`.
- **Consequences**: Strict database foreign keys, tenant query scoping, and clear audit boundaries.

## ADR-006: 4-Tier Fail-Closed Kill Switch Hierarchy
- **Status**: Accepted
- **Context**: AI security evaluation probes interact with autonomous agent and tool runtimes. Emergency abort must be instantaneous, reliable, and fail-closed.
- **Decision**: Enforce a 4-tier hierarchy (`GLOBAL` -> `ORGANIZATION` -> `PROJECT` -> `TEST_RUN`) evaluated at 5 checkpoints (before dispatch, immediately before execution, between probe stages, before retry, and before network egress). If kill switch state cannot be determined or store is unreachable, the system fails closed and blocks execution.
- **Consequences**: Zero chance of runaway test execution across any tenant boundary.

## ADR-007: Multi-Layer Network Egress, DNS Rebinding Defense & Production Dual-Approval Gate
- **Status**: Accepted
- **Context**: DEFYRA must never become an arbitrary SSRF or attack proxy against internal infrastructure or cloud metadata. Production assets must not be tested without elevated two-person approval.
- **Decision**:
  1. **URL Canonicalization & Strict Prohibited Subnets**: Detects and rejects numeric IPv4 representations (decimal, octal, hex), IPv4-mapped IPv6 (`::ffff:x.x.x.x`), IPv6 loopback/link-local/unique-local, private RFC 1918 ranges, CGNAT, cloud metadata (`169.254.169.254`), and userinfo in URLs.
  2. **DNS Rebinding Defense**: Every resolved A/AAAA record is checked prior to socket connection.
  3. **Step-by-Step Redirect Validation**: Re-evaluates target canonicalization and DNS resolution on every 3xx redirect hop (max 3).
  4. **Genuine Two-Person Production Dual-Approval**: Production testing requires distinct `approvedByOwnerId` + `approvedBySecurityLeadId` with written scope agreement hash.
- **Consequences**: Immune to SSRF bypasses, time-of-check-to-time-of-use DNS rebinding, and single-party production testing accidents.
