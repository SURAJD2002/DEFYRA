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

## 3. Public Forms & Lead Ingestion
- Public assessment request forms strictly disallow and advise against submitting secrets, API keys, passwords, or production credentials.
- In-memory / Redis token-bucket rate limiting prevents denial-of-service and form abuse.
- Server-side sanitization and validation using Zod ensures no script injection or malformed data enters the system.
- All lead capture interactions generate structured audit events.
