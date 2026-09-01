# Security & Threat Model — DEFYRA

## 1. Operating Security Posture
DEFYRA is itself a cybersecurity application. The security of DEFYRA is paramount:
- **Defense in Depth**: Defense at transport, gateway, session, application, and database layers.
- **Tenant Isolation**: Strict enforcement that user tokens only authorize queries within their verified organization and project memberships.
- **Scoped Authorization**: Security evaluation workers execute only within explicitly pre-authorized target scopes. Destructive testing is blocked by default.
- **Evidence Integrity**: All captured traces, network outputs, and test observations are hashed using SHA-256 upon ingestion and flagged with retention limits.

## 2. Guardrails & Kill Switches
DEFYRA features a four-tier kill-switch architecture:
1. **Global Kill Switch**: Halts all active evaluations across all tenants immediately.
2. **Organization Kill Switch**: Halts all tests belonging to an organization.
3. **Project Kill Switch**: Halts all evaluations for a specific project.
4. **Test-Run Kill Switch**: Aborts an individual running test job.

## 4. Execution Authorization & Target Allowlist (Phase 3 Engine)
1. **SecurityTestSchemaV1 Contract**: Strongly-typed, versioned test DAG contract with explicit preconditions, constraints, authorization requirements, and evidence rules.
2. **Short-Lived Execution Capability Token**: Cryptographically bound (HMAC-SHA256) single-use token encoding `orgId`, `projectId`, `assetId`, `testRunId`, `allowedTargetUrl`, `allowedTestIds`, `environment`, `nonce`, and `expiresAt` (5 min TTL).
3. **Target Allowlist & Egress Guard**:
   - Execution targets resolve strictly from cataloged DEFYRA assets within the authorized project tenant.
   - Blocks loopback (`127.0.0.0/8`, `localhost`, `::1`), RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and cloud metadata IP (`169.254.169.254`).
   - Strict Environment Policy: Testing in `production` is blocked unless `productionApproved: true` is granted with dual-key approval (`OWNER` / `SECURITY_LEAD`).

## 3. Public Forms & Lead Ingestion
- Public assessment request forms strictly disallow and advise against submitting secrets, API keys, passwords, or production credentials.
- In-memory / Redis token-bucket rate limiting prevents denial-of-service and form abuse.
- Server-side sanitization and validation using Zod ensures no script injection or malformed data enters the system.
- All lead capture interactions generate structured audit events.
