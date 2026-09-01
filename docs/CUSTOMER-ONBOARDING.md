# DEFYRA Customer Target Onboarding Guide

---

## 1. Supported Target Adapter Types

| Adapter Type | Primary Use Case | Target Configuration |
|---|---|---|
| `REST_ENDPOINT` | OpenAI-compatible APIs, custom LLM proxies, conversational chat endpoints | `endpointUrl`, `authHeaderName`, `secretReferenceId` |
| `RAG_ENDPOINT` | Knowledge base search endpoints, vector database retrieval APIs | `endpointUrl`, `authHeaderName`, `secretReferenceId` |
| `AGENT_TOOL` | Tool-using AI agents, autonomous tool brokers, function-calling gateways | `endpointUrl`, `authHeaderName`, `secretReferenceId` |

---

## 2. Customer Secret Handling & Protection

- **Zero Plaintext Persistence**: Customer API keys and bearer credentials are never persisted into database models, server logs, or telemetry records.
- **Reference-Based Injection**: Targets are onboarded with a synthetic secret reference UUID (`sec_ref_xxx`).
- **Runtime Secret Injection**: Credentials are only resolved in-memory during active probe dispatch.
- **Automatic Evidence Redaction**: Outgoing and incoming traces are filtered through `SecretProvider.sanitize()`, masking customer secrets as `[REDACTED_CUSTOMER_SECRET]` and canary tokens as `[REDACTED_CANARY_SECRET]`.
