# MakkalSaantru Database Schema Reference

## 📊 Overview

MakkalSaantru uses **Prisma ORM** with **PostgreSQL** (and in-memory API fallbacks). The schema supports public works registration, milestone tracking, geotagged evidence records, trust signals, AI verification results, human inspection decisions, corrective actions, SHA-256 audit log chains, and security audit logs.

---

## 🗄️ Model Definitions

### 1. `User`
Stores system accounts for Citizens, Inspectors, and Administrators.
- `id` (String, PK)
- `name` (String)
- `email` (String, Unique)
- `passwordHash` (String) — *bcrypt hash, never returned via API*
- `role` (Enum: `CITIZEN` | `INSPECTOR` | `ADMIN`)
- `createdAt` / `updatedAt` (DateTime)

---

### 2. `Project`
Stores public infrastructure project metadata.
- `id` (String, PK)
- `verificationCode` (String, Unique) — *e.g., MS-ROAD-001 for QR generation*
- `title` (String)
- `description` (String)
- `category` (Enum: `ROAD` | `WATER` | `STREETLIGHT` | `SANITATION` | `PUBLIC_BUILDING`)
- `location` (String)
- `latitude` / `longitude` (Float)
- `budget` (Float)
- `reportedProgress` (Float) — *25%, 50%, 75%, 100%*
- `status` (Enum: `PLANNING` | `IN_PROGRESS` | `COMPLETED` | `SUSPENDED`)
- `createdAt` / `updatedAt` (DateTime)

---

### 3. `Milestone`
Tracks project target milestones.
- `id` (String, PK)
- `projectId` (String, FK → `Project`)
- `percentage` (Float) — *25, 50, 75, 100*
- `status` (Enum: `NOT_STARTED` | `IN_PROGRESS` | `REACHED` | `VERIFIED`)
- `reachedAt` / `verifiedAt` (DateTime, Optional)

---

### 4. `Evidence`
Ground proof submitted by citizens.
- `id` (String, PK)
- `projectId` (String, FK → `Project`)
- `userId` (String, FK → `User`)
- `photoUrl` / `voiceUrl` (String, Optional)
- `visibleWork` / `milestoneMatch` / `usableMaintained` (Enum: `YES` | `NO` | `UNSURE`)
- `notes` (String, Optional)
- `latitude` / `longitude` (Float, Optional)
- `locationProvided` (Boolean)
- `clientCapturedAt` / `serverReceivedAt` (DateTime)
- `evidenceHash` (String) — *SHA-256 digest calculated server-side*
- `status` (Enum: `PENDING` | `VALIDATED` | `REJECTED`)

---

### 5. `EvidenceTrustSignals`
Calculated trust signals for an evidence item.
- `id` (String, PK)
- `evidenceId` (String, FK → `Evidence`, Unique)
- `locationStatus` (Enum: `NEAR_PROJECT` | `LOCATION_REVIEW` | `LOCATION_MISMATCH` | `LOCATION_NOT_PROVIDED`)
- `distanceFromProject` (Float, Optional)
- `exactDuplicate` (Boolean)
- `duplicateCount` (Int)
- `integrityStatus` (Enum: `VALID` | `MISMATCH` | `FILE_UNAVAILABLE`)

---

### 6. `Verification`
AI-assisted evidence pattern analysis record.
- `id` (String, PK)
- `projectId` (String, FK → `Project`)
- `analysisVersion` (String)
- `provider` (String) — *e.g., VENDOR-MOCK or GEMINI*
- `analysisTimestamp` (DateTime)
- `priorityScore` (Float) — *0 to 100*
- `confidenceScore` (Float) — *0 to 100*
- `result` (Enum: `CONSISTENT` | `REVIEW` | `POTENTIAL_MISMATCH`)
- `humanStatus` (Enum: `AI_PENDING` | `AI_ANALYZED` | `HUMAN_REVIEW_PENDING` | `HUMAN_CONFIRMED` | `HUMAN_REJECTED` | `RESOLVED`)
- `whyFlagged` (String[])
- `recommendation` (String)

---

### 7. `Case`
Authority inspection case file.
- `id` (String, PK)
- `projectId` (String, FK → `Project`, Unique)
- `verificationId` (String, FK → `Verification`, Optional)
- `assignedInspectorId` (String, FK → `User`, Optional)
- `priorityScore` (Float)
- `severity` (Enum: `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`)
- `status` (Enum: `OPEN` | `UNDER_HUMAN_REVIEW` | `ISSUE_CONFIRMED` | `NO_ISSUE_FOUND` | `RESOLVED`)
- `inspectionNotes` (String, Optional)
- `decidedAt` (DateTime, Optional)

---

### 8. `CorrectiveAction`
Department corrective action order.
- `id` (String, PK)
- `caseId` (String, FK → `Case`)
- `description` (String)
- `department` (String)
- `targetDate` (DateTime, Optional)
- `status` (Enum: `ACTION_REQUIRED` | `IN_PROGRESS` | `COMPLETED` | `CLOSED`)
- `reverificationRequested` (Boolean)
- `createdAt` / `updatedAt` (DateTime)

---

### 9. `AuditLog`
Cryptographically chained audit trail.
- `id` (String, PK)
- `action` (String) — *e.g., HUMAN_DECISION_RECORDED*
- `actorId` / `actorRole` (String)
- `entityType` / `entityId` (String)
- `details` (String)
- `previousHash` / `currentHash` (String) — *SHA-256 chain*
- `timestamp` (DateTime)

---

### 10. `SecurityEvent`
Real-time security event log.
- `id` (String, PK)
- `type` (Enum: `FAILED_LOGIN` | `LOGIN_RATE_LIMITED` | `ACCESS_DENIED` | `INVALID_TOKEN` | `INVALID_UPLOAD` | `INTEGRITY_MISMATCH` | `SUSPICIOUS_DUPLICATE_PATTERN` | `MALFORMED_INPUT`)
- `severity` (Enum: `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`)
- `userId` (String, Optional)
- `endpoint` (String)
- `description` (String)
- `createdAt` (DateTime)
