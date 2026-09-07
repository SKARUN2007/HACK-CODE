# Cybersecurity Threat Model & Controls Specification — MakkalSaantru

Tagline: **"Public Money. Public Work. Public Proof."**

This document outlines the threat model, security controls, cryptographic integrity design, IDOR protections, and security limitations implemented in **MakkalSaantru**.

---

## 1. Threats Considered & Mitigations Matrix

| Threat Category | Attack Vector / Description | Implemented Technical Security Control |
| :--- | :--- | :--- |
| **1. Unauthorized Access** | Attacker calls protected endpoints without valid credentials or with forged/expired tokens. | Server-side JWT authentication middleware (`authenticateToken`). Tokens are verified against `JWT_SECRET` with explicit expiry checks. Returns `HTTP 401`. |
| **2. Privilege Escalation & IDOR** | Citizen A attempts to read/modify Citizen B's private evidence, or access Inspector/Admin endpoints. | Server-side Role-Based Access Control (`requireRole(['CITIZEN'])`) and strict ownership check (`evidence.citizenId === req.user.id`). Returns `HTTP 403 Forbidden`. |
| **3. Evidence Tampering** | Attacker modifies an uploaded photo or audio file after submission to falsify proof. | **Server-Side SHA-256 Integrity Hashing**. Hashes are generated directly on uploaded file buffers on the server. Endpoint `/api/evidence/:id/reverify-integrity` re-computes stored file hash to verify non-tampering (`VALID` vs `MISMATCH`). |
| **4. Malicious Uploads & Path Traversal** | Attacker uploads executable scripts (`.sh`, `.exe`, `.php`) or uses path traversal filenames (`../../etc/passwd`). | `multer` upload middleware whitelists MIME types (`image/jpeg`, `image/png`, `image/webp`, `audio/mpeg`, `audio/wav`, `audio/webm`, `audio/ogg`, `audio/x-m4a`), enforces 15MB file limits, and renames files to safe random UUIDs (`crypto.randomUUID()`). |
| **5. API Abuse & DDoS** | Botnet floods submission or auth endpoints to disrupt service. | `express-rate-limit` rate-limiting middleware applied globally and specifically to auth/submission endpoints. Returns `HTTP 429 Too Many Requests`. |
| **6. Duplicate Submissions** | User submits the exact same photo multiple times across projects. | Server-side SHA-256 comparison (`ExactHashSimilarityService`). Flags record with `exactDuplicate: true` and labels `POSSIBLE_DUPLICATE` as a trust signal. |
| **7. Secret Exposure** | API keys, database credentials, or JWT secrets committed to version control. | Environment variable isolation via `.env` (git-ignored), `.env.example` placeholder template, zero committed secrets. |
| **8. Audit Log Tampering** | Attacker deletes or modifies audit logs to cover unauthorized activities. | **Chained Audit Logging**. Each log record includes `previousHash` and `recordHash` computed via `SHA256(userId:action:entityType:entityId:timestamp:previousHash)`. Sensitive credentials are never logged. |

---

## 2. Evidence Trust Signals & Fingerprinting

Every evidence submission generates a factual **EvidenceTrustSignals** structure:

```json
{
  "integrityRecorded": true,
  "serverTimestampRecorded": true,
  "locationStatus": "NEAR_PROJECT",
  "distanceFromProject": 84,
  "exactDuplicate": false,
  "photoProvided": true,
  "voiceProvided": true
}
```

### Cryptographic Evidence Fingerprint
- The server derives a shortened 8-character cryptographic fingerprint from the SHA-256 hash (e.g. `4d91...7ac2`).
- Exhibited to citizens and inspection officials to confirm that file contents received by the server remain identical over time.

---

## 3. QR Code Project Identification Security

- Projects are assigned a unique public verification code (e.g. `MS-ROAD-001`).
- Scanned QR codes route to `/citizen/qr-resolve?code=MS-ROAD-001`.
- **Security Rule**: The application **never trusts arbitrary external URLs** contained inside scanned QR codes. Only recognized MakkalSaantru verification codes are validated server-side (`GET /api/projects/resolve-code/:code`). Unrecognized codes return `HTTP 404: "Project verification code not recognized."`

---

## 4. Explicit Security Limitations & Non-Claims

> [!CAUTION]
> 1. **GPS Limitations**: GPS coordinates can be spoofed by client software or proxy devices. Server-side Haversine distance is used as a **location trust quality signal**, not as absolute legal proof of physical presence.
> 2. **Hashing Scope**: Server SHA-256 hashing guarantees file integrity **after receipt on the server**. It does not guarantee the truthfulness of real-world claims made within the photo or audio file.
> 3. **Duplicate Detection Scope**: The current prototype detects **exact file duplicates** via SHA-256 hash comparison. Near-duplicate perceptual image similarity (e.g. AI vision embeddings) is planned for the AI verification phase.
> 4. **Human Decision Mandatory**: Evidence trust signals serve to prioritize inspection queues. Final administrative decisions strictly rest with authorized human officials.
> 5. **Prototype Disclaimer**: The application operates on fictional demo public projects and does not connect to real government database infrastructure.
