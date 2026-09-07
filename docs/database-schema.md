# Database Schema Specification — MakkalSaantru

MakkalSaantru uses **PostgreSQL** configured via **Prisma ORM**.

## Entities Overview

### 1. User (`users`)
- `id`: UUID Primary Key
- `name`: Full Name
- `email`: Unique Email Address
- `passwordHash`: bcrypt hashed string (salt factor 10)
- `role`: Enum (`CITIZEN`, `INSPECTOR`, `ADMIN`)

### 2. Project (`projects`)
- `id`: UUID Primary Key
- `title`: Public work title
- `description`: Project scope
- `category`: `ROAD`, `WATER`, `STREETLIGHT`, `SANITATION`, `PUBLIC_BUILDING`
- `location`: Human-readable location description
- `latitude` / `longitude`: Geolocation coordinates
- `budget`: Allocated budget in INR
- `reportedProgress`: Percentage progress reported by contractor (0 - 100%)
- `status`: Enum (`PLANNING`, `IN_PROGRESS`, `COMPLETED`, `SUSPENDED`)

### 3. Milestone (`milestones`)
- `id`: UUID Primary Key
- `projectId`: Foreign Key -> Project.id
- `percentage`: Progress milestone target (25.0, 50.0, 75.0, 100.0)
- `status`: Enum (`NOT_STARTED`, `IN_PROGRESS`, `REACHED`, `VERIFIED`)
- `reachedAt`: Nullable Timestamp

### 4. Evidence (`evidences`)
- `id`: UUID Primary Key
- `projectId`: Foreign Key -> Project.id
- `citizenId`: Foreign Key -> User.id
- `milestoneId`: Foreign Key -> Milestone.id (Optional)
- `photoUrl`: URL path to stored photo
- `voiceUrl`: URL path to audio observation
- `latitude` / `longitude`: Geotag coordinates at capture time (Nullable)
- `locationProvided`: Boolean (@default(true))
- `capturedAt`: Server recorded timestamp
- `evidenceHash`: Server-calculated SHA-256 cryptographic hash
- `status`: Enum (`SUBMITTED`, `PROCESSING`, `ANALYZED`, `NEEDS_REVIEW`, `VERIFIED`)
- `visibleWork`: String ('YES' | 'NO' | 'UNSURE')
- `milestoneMatch`: String ('YES' | 'NO' | 'UNSURE')
- `usableMaintained`: String ('YES' | 'NO' | 'UNSURE')
- `notes`: Optional short comment

### 5. Verification (`verifications`)
- `id`: UUID Primary Key
- `projectId`: Foreign Key -> Project.id
- `evidenceId`: Foreign Key -> Evidence.id
- `riskScore`: Computed score between 0.0 and 1.0
- `confidenceScore`: Confidence level between 0.0 and 1.0
- `result`: Strict Enum (`CONSISTENT`, `REVIEW`, `POTENTIAL_MISMATCH`)
- `explanation`: Plain language evidence pattern explanation
- `humanStatus`: Enum (`PENDING`, `APPROVED`, `ACTION_TAKEN`, `DISMISSED`)
- `inspectorId`: Foreign Key -> User.id (Optional)

### 6. AuditLog (`audit_logs`)
- `id`: UUID Primary Key
- `userId`: Foreign Key -> User.id
- `action`: Event action code (e.g. `EVIDENCE_SUBMITTED`)
- `entityType`: Target entity name
- `entityId`: Target record ID
- `details`: JSON/text details (includes SHA-256 reference)
- `timestamp`: Event timestamp
