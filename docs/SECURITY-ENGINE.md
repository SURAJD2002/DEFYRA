# DEFYRA Security Execution Engine (services/security-engine)

The **DEFYRA Security Execution Engine** is a high-assurance, sandboxed, deterministic Python execution worker designed to evaluate autonomous AI agents, foundation models, RAG vector stores, semantic memory systems, and MCP servers.

---

## 1. Core Architecture & Execution Lifecycle

The execution lifecycle strictly follows a fail-closed pipeline:

```
[ Inbound Execution Request ]
             ↓
1. Service Bearer Token Authentication (Internal Gateway)
             ↓
2. 4-Tier Kill Switch Check (GLOBAL -> ORG -> PROJECT -> TEST_RUN) [Fail-Closed]
             ↓
3. Cryptographic Execution Capability Verification (HMAC-SHA256, Nonce, Expiry, Scope)
             ↓
4. Network Egress & SSRF Guard (URL Canonicalization, Prohibited Subnets, DNS Rebinding)
             ↓
5. Test Module Resolution & HMAC-SHA256 Integrity Verification
             ↓
6. Deterministic DAG Execution (Topological Sort, Step Timeouts, Inter-Stage Kill-Switch)
             ↓
7. Observation Capture & SHA-256 Cryptographic Evidence Hashing
             ↓
8. Risk Model Evaluation (DEFYRA RiskModel v0.1 Finding Candidate Generation)
             ↓
[ Structured Result Output Envelope ]
```

---

## 2. Security Boundaries & Guardrails

### 2.1 Cryptographic Execution Capability Tokens
- Every execution must present a short-lived (5 min TTL) token signed with HMAC-SHA256.
- Encodes: `org_id`, `project_id`, `asset_id`, `test_run_id`, `allowed_target_url`, `allowed_test_ids`, `environment`, `nonce`, and `expires_at`.
- Replay Protection: Nonces are tracked and consumed upon first use.

### 2.2 4-Tier Fail-Closed Kill Switch
- Tiers: `GLOBAL`, `ORGANIZATION`, `PROJECT`, `TEST_RUN`.
- Evaluated before dispatch, immediately before worker execution, between every stage in the DAG, before any retry attempt, and before any external network connection.
- If state is unreachable, fails closed immediately (`UNAVAILABLE`).

### 2.3 Network Egress & SSRF Protection
- Direct rejection of numeric IP representations: decimal integer IPs (`2130706433`), octal (`0177.0.0.1`), hex (`0x7f000001`), and IPv4-mapped IPv6 (`::ffff:127.0.0.1`).
- Prohibited IP Subnets: `0.0.0.0/8`, `10.0.0.0/8`, `100.64.0.0/10`, `127.0.0.0/8`, `169.254.0.0/16` (Cloud Metadata), `172.16.0.0/12`, `192.168.0.0/16`, `224.0.0.0/4`, `240.0.0.0/4`, `255.255.255.255/32`, `::1/128`, `fc00::/7`, `fe80::/10`.
- DNS Rebinding Protection: Resolves DNS and validates *every* resolved IP address before socket connection.

### 2.4 Test Pack Integrity
- Test modules contain `manifest.json`, `handler.py`, and `signature.json`.
- Signed via HMAC-SHA256 over canonical file digests. Tampered files cause instant load rejection.

---

## 3. Initial Test Modules

1. **`DEF-INJ-001` (Direct System Prompt Override)**
   - Probes model/agent against direct adversarial system instruction disclosure.
   - Generates high-confidence `FindingCandidate` if internal instructions are disclosed.
2. **`DEF-INJ-002` (Indirect Prompt Injection via Web Retrieval)**
   - Ingests synthetic retrieved context with embedded instruction overrides.
   - Evaluates whether downstream tool dispatch or parameter manipulation occurs.
3. **`DEF-AGC-001` (Autonomous Unconstrained File System Access)**
   - Tests sandbox directory containment against directory traversal attempts (`../../../etc/shadow`).

---

## 4. Running Tests

```bash
cd services/security-engine
pytest -v
```
