# MakkalSaantru API Documentation (v1)

## 📡 Overview & Protocol

The **MakkalSaantru REST API** handles user authentication, citizen evidence submission, offline report synchronization, AI-assisted verification analysis, authority decision workflows, and system audit logging.

- **Base URL**: `http://localhost:5005/api`
- **Prototype Semver**: `v1.0.0`
- **Authentication Header**: `Authorization: Bearer <JWT_TOKEN>`
- **Content-Type**: `application/json` (or `multipart/form-data` for file uploads)

---

## 🔐 Authentication & Roles

| Role Name | Scope & Authority |
|---|---|
| `CITIZEN` | Public project discovery, geotagged evidence submission, private submission tracking. |
| `INSPECTOR` | Assigned cases, AI verification triggering, human site audit decisions, corrective action creation. |
| `ADMIN` | Full administrative oversight, project/inspector assignment, audit log inspection, security event monitoring (`/admin/security`). |

---

## 📋 Endpoint Summary Registry

| Method | Endpoint | Auth | Role | Rate Limit Group | Description |
|---|---|---|---|---|---|
| `GET` | `/api/health` | No | Public | General (100/15m) | System health & status check |
| `GET` | `/api/system/info` | No | Public | General (100/15m) | System metadata & operational status |
| `POST` | `/api/auth/register` | No | Public | Auth (10/15m) | Register a new user account |
| `POST` | `/api/auth/login` | No | Public | Auth (10/15m) | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Yes | Any | General (100/15m) | Fetch active logged-in user profile |
| `GET` | `/api/projects` | No | Public | General (100/15m) | List all public projects with filters |
| `GET` | `/api/projects/:id` | No | Public | General (100/15m) | Get detailed project info & milestones |
| `GET` | `/api/projects/code/:code` | No | Public | General (100/15m) | Resolve project by QR verification code |
| `POST` | `/api/projects/:id/evidence` | Yes | CITIZEN | Upload (10/1h) | Submit ground photo/voice evidence |
| `GET` | `/api/evidence/my` | Yes | CITIZEN | General (100/15m) | Fetch logged citizen's submissions |
| `POST` | `/api/evidence/sync` | Yes | CITIZEN | Upload (10/1h) | Batch sync offline pending evidence |
| `POST` | `/api/evidence/:id/verify-integrity` | Yes | CITIZEN/INSPECTOR | General (100/15m) | On-demand SHA-256 integrity check |
| `POST` | `/api/verifications/project/:id/analyze` | Yes | INSPECTOR/ADMIN | AI (20/15m) | Run AI evidence verification analysis |
| `GET` | `/api/verifications/project/:id` | Yes | INSPECTOR/ADMIN | General (100/15m) | Get AI verification record for project |
| `GET` | `/api/authority/dashboard` | Yes | INSPECTOR/ADMIN | General (100/15m) | Authority intelligence summary & queue |
| `GET` | `/api/authority/projects/:id` | Yes | INSPECTOR/ADMIN | General (100/15m) | Detailed project intelligence workspace |
| `POST` | `/api/authority/cases/:id/decision` | Yes | INSPECTOR/ADMIN | General (100/15m) | Record human inspection decision |
| `POST` | `/api/authority/cases/:id/action` | Yes | INSPECTOR/ADMIN | General (100/15m) | Create department corrective action |
| `GET` | `/api/admin/audit` | Yes | ADMIN | General (100/15m) | View SHA-256 chained audit logs |
| `GET` | `/api/admin/security/events` | Yes | ADMIN | General (100/15m) | Real-time security event feed |
| `GET` | `/api/admin/security/status` | Yes | ADMIN | General (100/15m) | Active security control statuses |

---

## 💻 Sample Requests & Responses

### 1. Submit Geotagged Evidence (`POST /api/projects/:id/evidence`)

**Headers**:
```http
Authorization: Bearer <CITIZEN_JWT_TOKEN>
Content-Type: multipart/form-data
```

**Body (form-data)**:
- `photo`: `(binary image/jpeg)`
- `latitude`: `13.0512`
- `longitude`: `79.9741`
- `locationProvided`: `true`
- `visibleWork`: `"NO"`
- `milestoneMatch`: `"NO"`
- `notes`: `"Ground road unpaved at 75% reported milestone."`

**Response (`201 Created`)**:
```json
{
  "message": "Evidence submitted successfully",
  "evidenceId": "ev-1725700000000-841",
  "evidenceHash": "4d91a9b2c3d4e5f67a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",
  "trustSignals": {
    "locationStatus": "NEAR_PROJECT",
    "distanceFromProjectMeters": 45,
    "exactDuplicate": false
  }
}
```

---

### 2. Trigger AI Verification Analysis (`POST /api/verifications/project/:id/analyze`)

**Headers**:
```http
Authorization: Bearer <INSPECTOR_JWT_TOKEN>
Content-Type: application/json
```

**Response (`200 OK`)**:
```json
{
  "message": "AI verification analysis complete",
  "verification": {
    "id": "ver-1725700050000",
    "projectId": "proj-demo-1",
    "analysisVersion": "1.0.0-VENDOR-MOCK",
    "priorityScore": 78,
    "confidenceScore": 82,
    "result": "POTENTIAL_MISMATCH",
    "humanStatus": "HUMAN_REVIEW_PENDING",
    "whyFlagged": [
      "Multiple independent citizen observations recorded",
      "Ground evidence differs from reported milestone progress",
      "Evidence captured near registered project location",
      "Cryptographic SHA-256 evidence integrity checks passed"
    ],
    "recommendation": "PRIORITIZE HUMAN INSPECTION — Dispatch physical inspection team before disbursing 75% milestone funds."
  }
}
```

---

## ⚠️ Standard Error Codes

| HTTP Status | Error String | Cause / Action |
|---|---|---|
| `400 Bad Request` | `"Invalid request body"` | Zod validation error or unsupported file magic bytes. |
| `401 Unauthorized` | `"No token provided"` | Missing or invalid Bearer token. |
| `403 Forbidden` | `"Access denied"` | Role mismatch or IDOR violation. |
| `404 Not Found` | `"Project not found"` | Resource does not exist. |
| `429 Too Many Requests` | `"Too many requests"` | Exceeded endpoint rate limit threshold. |
| `500 Internal Error` | `"Internal server error"` | Generic safe server error (stack trace withheld). |
