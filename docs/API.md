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
- **Request Body**: Contact & scoping details.

### 3. Authentication
- `POST /api/v1/auth/signup`: Create user + tenant organization (Creator becomes OWNER).
- `POST /api/v1/auth/login`: Rate-limited login issuing HttpOnly SameSite=Lax signed session cookie.
- `POST /api/v1/auth/logout`: Clears session and revokes cookie.
- `GET /api/v1/me`: Returns authenticated user profile, active organization, and RBAC role.

### 4. Organizations & Memberships
- `GET /api/v1/organizations`: List organizations for authenticated user.
- `POST /api/v1/organizations`: Create organization.
- `GET /api/v1/organizations/:id`: Get organization details (requires membership).
- `PATCH /api/v1/organizations/:id`: Update organization name (requires OWNER/ADMIN).
- `GET /api/v1/organizations/:id/members`: List organization members.
- `POST /api/v1/organizations/:id/members`: Add/invite member with role.

### 5. Projects
- `GET /api/v1/projects`: List projects in active organization.
- `POST /api/v1/projects`: Create project with environment scoping (requires `project:create`).
- `GET /api/v1/projects/:id`: Get project details with asset stats.
- `PATCH /api/v1/projects/:id`: Update project details.
- `DELETE /api/v1/projects/:id`: Archive project.

### 6. Assets & Relationships
- `GET /api/v1/projects/:id/assets`: List assets in project.
- `POST /api/v1/projects/:id/assets`: Register asset in project.
- `GET /api/v1/assets/:id`: Get asset with incoming/outgoing relationships.
- `PATCH /api/v1/assets/:id`: Update asset metadata/environment/status.
- `DELETE /api/v1/assets/:id`: Archive asset.
