# API Reference — DEFYRA v1

Base URL: `/api/v1`

All responses follow standard structured envelopes:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "requestId": "req_01hz8...",
    "timestamp": "2026-09-01T08:00:00.000Z"
  }
}
```

Error format:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | RATE_LIMITED | INTERNAL_ERROR",
    "message": "Human-readable description",
    "details": []
  },
  "meta": {
    "requestId": "req_01hz8...",
    "timestamp": "2026-09-01T08:00:00.000Z"
  }
}
```

---

## Endpoints

### 1. Health Check
`GET /api/v1/health`
- **Response**: System status, version, timestamp.

### 2. Assessment Request / Contact
`POST /api/v1/contact`
- **Rate Limit**: 5 requests per 10 minutes per IP.
- **Request Body**:
  ```json
  {
    "name": "Alex Mercer",
    "workEmail": "alex.mercer@enterprise.ai",
    "company": "Cognitive Ops Inc",
    "role": "Chief Information Security Officer",
    "companySize": "250-1000",
    "aiSystemType": "Autonomous Agentic Workflows with Tool Calling",
    "scopeDescription": "Evaluating RAG data leak and agent identity impersonation risks.",
    "message": "We would like to schedule an AI Security Assessment for our upcoming Q4 agent release.",
    "noCredentialsAcknowledged": true
  }
  ```
- **Response**: Status `201 Created` with inquiry confirmation ID and audit reference.
