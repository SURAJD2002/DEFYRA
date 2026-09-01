# Security & Threat Model — DEFYRA

## 1. Operating Security Posture
DEFYRA is itself a cybersecurity application. The security of DEFYRA is paramount:
- **Defense in Depth**: Defense at transport, gateway, session, application, and database layers.
- **Tenant Isolation**: Strict enforcement that user tokens only authorize queries within their verified organization and project memberships.
- **Scoped Authorization**: Security evaluation workers execute only within explicitly pre-authorized target scopes. Destructive testing is blocked by default.
- **Evidence Integrity**: All captured traces, network outputs, and test observations are hashed using SHA-256 upon ingestion and flagged with retention limits.

## 2. 4-Tier Fail-Closed Kill-Switch Architecture
DEFYRA enforces a strict fail-closed four-tier kill-switch architecture:
1. **Global Kill Switch**: Halts all active evaluations across all tenants immediately (authorized by `OWNER` only).
2. **Organization Kill Switch**: Halts all tests belonging to a specific organization (authorized by `OWNER` or `ADMIN`).
3. **Project Kill Switch**: Halts all evaluations for a specific project (authorized by `OWNER`, `ADMIN`, or `SECURITY_LEAD`).
4. **Test-Run Kill Switch**: Aborts an individual running test job (authorized by `OWNER`, `ADMIN`, or `SECURITY_LEAD`).

**Enforcement Checkpoints**:
Kill switches are evaluated:
- Before test dispatch
- Immediately before worker execution
- Between every probe stage
- Before any retry attempt
- Before initiating any external HTTP/API socket connection.

**Fail-Closed Rule**: If the kill-switch state cannot be verified (e.g. state store unreachable), the system immediately blocks execution (`UNAVAILABLE`).

## 3. Network Egress Security & Anti-SSRF Guardrails
The security engine executes outbound probes only against explicitly authorized targets originating from cataloged DEFYRA assets:
1. **URL Canonicalization**: Rejects userinfo in URLs (`user:pass@host`), trailing dot tricks, and non-standard schemes.
2. **Prohibited IP Ranges**:
   - Loopback: `127.0.0.0/8`, `::1/128`
   - Link-Local & Cloud Metadata: `169.254.0.0/16` (including `169.254.169.254`), `fe80::/10`
   - Private RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
   - IPv6 Unique Local: `fc00::/7`
   - Non-standard numeric encodings: decimal integer IPs (`2130706433`), octal (`0177.0.0.1`), hex (`0x7f000001`), and IPv4-mapped IPv6 (`::ffff:127.0.0.1`).
3. **DNS Rebinding Protection**: Resolves DNS records prior to socket connection and validates *every* resolved A/AAAA record against prohibited subnets.
4. **Step-by-Step Redirect Validation**: Re-validates canonical target and resolved DNS on every 3xx redirect hop (enforces `maxRedirects = 3`).

## 4. Execution Authorization & Genuine Two-Person Production Dual-Approval Gate
1. **SecurityTestSchemaV1 Contract**: Strongly-typed, versioned test DAG contract with explicit preconditions, constraints, authorization requirements, and evidence rules.
2. **Short-Lived Execution Capability Token**: Cryptographically bound (HMAC-SHA256) single-use token encoding `orgId`, `projectId`, `assetId`, `testRunId`, `allowedTargetUrl`, `allowedTestIds`, `environment`, `nonce`, and `expiresAt` (5 min TTL).
3. **Production Dual-Approval Gate**: Testing against `production` assets requires genuine two-person approval (`approvedByOwnerId` + `approvedBySecurityLeadId` as distinct individuals) accompanied by a cryptographic `writtenScopeAgreementHash`.

## 5. Public Forms & Lead Ingestion
- Public assessment request forms strictly disallow and advise against submitting secrets, API keys, passwords, or production credentials.
- In-memory / Redis token-bucket rate limiting prevents denial-of-service and form abuse.
- Server-side sanitization and validation using Zod ensures no script injection or malformed data enters the system.
- All lead capture interactions generate structured audit events.

