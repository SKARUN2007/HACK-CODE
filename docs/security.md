# MAKKALSAANTRU — Cybersecurity Architecture & Controls

Tagline: **"Public Money. Public Work. Public Proof."**

This document details the cybersecurity controls, cryptographic verification, security event logging, role-based access controls, file validation, and security non-claims of **MakkalSaantru**.

---

## 1. Core Security Controls

| Security Control | Implementation Detail | Target Threats Mitigated |
| :--- | :--- | :--- |
| **Password Security** | Passwords hashed with `bcrypt` (salt factor 10). Password policy enforced on server (`min length 8`, `1 letter`, `1 number`). Password hashes omitted from API JSON responses. | Credential dumping, rainbow table attacks, dictionary attacks. |
| **JWT Authentication** | Signed via HMAC SHA-256 with `JWT_SECRET`. Tokens expire in 24 hours. Validated on protected API endpoints (`authenticateToken`). | Unauthorized API access, identity spoofing. |
| **Role-Based Access Control (RBAC)** | Strict server middleware checks (`requireRole(['CITIZEN'])`, `requireRole(['INSPECTOR', 'ADMIN'])`). | Privilege escalation, IDOR attacks. |
| **Binary Magic-Byte Upload Defense** | File validation middleware inspects raw buffer magic bytes (`FF D8 FF` JPEG, `89 50 4E 47` PNG, `52 49 46 46` WEBP/WAV) rather than trusting client file extensions. | Executable upload attacks (`.sh`, `.php`, `.exe` disguised as image). |
| **SHA-256 Evidence Integrity** | Server computes SHA-256 hash immediately upon file receipt and stores digest in DB. Reverification endpoint re-hashes stored file to confirm non-tampering. | File modification after receipt, evidence tampering. |
| **Chained Audit Logging** | Audit log entries store cryptographic `recordHash` derived from `previousHash` + entry details. | Audit log deletion or manipulation. |
| **API Rate Limiting** | Global rate limiter (100 req/15min) and authentication rate limiter (5 req/15min) using `express-rate-limit`. | Denial of service, brute force attacks. |
| **Security Headers & Input Sanitization** | `helmet` middleware for HTTP security headers; `zod` schema validation for incoming JSON payloads. | Cross-Site Scripting (XSS), parameter injection. |

---

## 2. Evidence Trust Signals

The server attaches factual **Evidence Trust Signals** to every submission:
- `integrityRecorded`: SHA-256 computed on receipt.
- `locationStatus`: Verified against project coordinates via Haversine distance algorithm (`NEAR_PROJECT`, `FAR_PROJECT`).
- `exactDuplicate`: Verified against stored evidence SHA-256 hashes.

---

## 3. Explicit Security Limitations

1. **Client GPS Signal**: GPS coordinates can be spoofed on client devices. Haversine distance is treated as a quality signal, not absolute physical proof.
2. **Post-Receipt Integrity**: SHA-256 hashing guarantees content integrity after receipt on the server; it does not prove the authenticity of the real-world event depicted in the media.
3. **AI Guidance Only**: AI outputs are decision-support signals. Final administrative decisions strictly rest with authorized human officials.
4. **Hackathon Prototype**: Operates on fictional demo datasets and does not connect to real government services.
