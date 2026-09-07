# MakkalSaantru API Security Specification

## 🛡️ Overview

MakkalSaantru enforces enterprise-grade security controls across authentication, authorization, request validation, rate limiting, and evidence integrity verification. This document provides a comprehensive summary of all implemented security controls, error handling conventions, file upload constraints, and the endpoint security registry.

---

## 🔑 1. Authentication & Session Security

- **JWT Architecture**: JSON Web Tokens signed with HMAC SHA-256 (`HS256`) using an environment-managed secret (`JWT_SECRET`).
- **Token Expiry**: Default 24-hour access token lifecycle (`expiresIn: '24h'`).
- **Password Hashing**: Passwords stored exclusively as `bcrypt` salted hashes (work factor 10). Plaintext passwords are never stored or returned in API responses.
- **Password Enforcement**: Minimum 8 characters, requiring at least one letter and one numeric digit.
- **Failed Login Protection**: Consecutive failed authentication attempts trigger temporary IP/user cooldowns and generate `LOGIN_RATE_LIMITED` security audit events.

---

## 👥 2. Authorization & RBAC

Role-Based Access Control is enforced server-side using centralized Express middleware:

1. `authenticateToken`: Validates Bearer tokens and attaches the authenticated user object (`id`, `email`, `role`) to the request context.
2. `requireRole(...allowedRoles)`: Rejects requests with HTTP 403 Forbidden if the user's role does not match requirements.

### Role Matrix

| Role | Permitted Actions |
|---|---|
| **CITIZEN** | Submit evidence, view nearby projects, track own submissions, view audit integrity logs. |
| **INSPECTOR** | Access assigned cases, request AI verification analysis, record human physical inspection decisions, mark corrective actions. |
| **ADMIN** | Manage projects, assign inspectors, view central audit log, monitor live security events and control status dashboard (`/admin/security`). |

---

## 🛡️ 3. Object-Level Authorization (Anti-IDOR)

- Citizens can **ONLY** retrieve or modify evidence submitted by their own `userId`. Accessing another citizen's evidence yields HTTP 403 Access Denied.
- Inspectors can only review cases assigned to their jurisdiction or explicit inspector ID.
- Evidence records cannot be deleted or mutated post-submission by citizens.

---

## 🚦 4. API Rate Limiting

Standard rate limiting is configured via `express-rate-limit`:

| Rate Limit Category | Limit Threshold | Window | HTTP Action on Exceed |
|---|---|---|---|
| **Authentication (`/api/auth/*`)** | 10 requests | 15 minutes | HTTP 429 + `LOGIN_RATE_LIMITED` |
| **Evidence Upload (`/api/projects/:id/evidence`)** | 10 requests | 1 hour | HTTP 429 + `RATE_LIMIT_TRIGGERED` |
| **AI Analysis (`/api/verifications/*`)** | 20 requests | 15 minutes | HTTP 429 + `RATE_LIMIT_TRIGGERED` |
| **General API (`/api/*`)** | 100 requests | 15 minutes | HTTP 429 Too Many Requests |

---

## 📁 5. File Upload Security & Binary Validation

- **Allowed Formats**: `JPEG`, `PNG`, `WEBP`, `WAV`, `MP3`, `OGG`, `M4A`.
- **Max File Size**: 10MB per upload.
- **Binary Signature (Magic Bytes) Verification**: Validates file header byte sequences before processing to reject renamed executable scripts (e.g. `.php`, `.sh`, `.exe`, `.html`).
  - JPEG: `FF D8 FF`
  - PNG: `89 50 4E 47`
  - WEBP: `52 49 46 46 ... WEBP`
  - WAV: `52 49 46 46 ... WAVE`
- **Randomized Filenames**: Files are saved on disk with UUID-v4 filenames to prevent directory traversal and path manipulation attacks.

---

## 🤖 6. AI Prompt & Input Isolation

- **Prompt Injection Defense**: Citizen feedback text is untrusted. Inputs are sanitized and wrapped within structured XML delimiters (`<citizen_input>...`) before passing to Gemini / deterministic rules.
- **Structured Schema Output**: AI outputs are strictly constrained to JSON schemas (`CONSISTENT`, `REVIEW`, `POTENTIAL_MISMATCH`).
- **Key Isolation**: AI API keys (`AI_API_KEY`) are kept exclusively server-side and never returned in API payloads.

---

## 🔐 7. Secure Headers & CORS

- **Helmet**: Enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and Content Security Policies.
- **CORS**: Configured with explicit `CLIENT_ORIGIN` (default `http://localhost:5173`). Wildcard `*` CORS with credentials is strictly prohibited.

---

## 📋 8. Complete API Endpoint Security Summary

| Method | Endpoint | Allowed Role | Description | Auth Req? | Rate Limit Category |
|---|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account | No | Auth (10/15m) |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT | No | Auth (10/15m) |
| `GET` | `/api/projects` | Public / Citizen | List active public projects | No | General (100/15m) |
| `GET` | `/api/projects/:id` | Public / Citizen | Get project details & QR code | No | General (100/15m) |
| `POST` | `/api/projects/:id/evidence` | Citizen | Submit photo/voice evidence | Yes | Upload (10/1h) |
| `GET` | `/api/evidence/my` | Citizen | View logged user's evidence | Yes | General (100/15m) |
| `POST` | `/api/evidence/:id/verify-integrity` | Citizen / Inspector | Server SHA-256 integrity check | Yes | General (100/15m) |
| `GET` | `/api/verifications/project/:id/analyze` | Inspector / Admin | Trigger AI evidence verification | Yes | AI (20/15m) |
| `GET` | `/api/authority/cases` | Inspector / Admin | View cases needing human review | Yes | General (100/15m) |
| `POST` | `/api/authority/cases/:id/decision` | Inspector / Admin | Record human inspection decision | Yes | General (100/15m) |
| `GET` | `/api/admin/audit` | Admin | View SHA-256 audit log trail | Yes | General (100/15m) |
| `GET` | `/api/admin/security/events` | Admin | Security event monitoring feed | Yes | General (100/15m) |
| `GET` | `/api/admin/security/status` | Admin | Active security controls status | Yes | General (100/15m) |
