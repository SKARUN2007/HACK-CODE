# MakkalSaantru

> **Public Money. Public Work. Public Proof.**  
> **Subtitle**: *Citizen-Powered • AI-Assisted • Human-Verified*

---

## Overview

**MakkalSaantru** (மக்கள் சான்று) is a citizen-powered, AI-assisted, human-verified public work verification and civic resource intelligence platform. It transforms raw citizen observations—photos, audio dictation, GPS coordinates, and structured questionnaire responses—into actionable administrative intelligence while public work is actively underway.

By replacing fixed percentage-based milestones with **Evidence-Driven Contractor Progress Verification** and automated civic issue classification, MakkalSaantru enables early government intervention, transparent priority scoring, cross-department case detection, and cryptographically verified resolution proofs.

```
CONTRACTOR UPLOADS ACTUAL PROGRESS EVIDENCE
                     ↓
CITIZENS / AUTHORIZED INSPECTORS VERIFY THAT EVIDENCE
                     ↓
AI ASSISTS IN COMPARING CLAIMED WORK WITH GROUND EVIDENCE
                     ↓
HUMAN AUTHORITY MAKES THE FINAL DECISION
```

> ⚠️ **GOVERNING PRINCIPLE**:
> MakkalSaantru is **NOT a corruption detection tool** and **NOT a simple complaint submission box**. AI algorithms serve exclusively to flag anomalies, compute priority scores, and compare evidence patterns. **All administrative actions, site assignments, and stage approvals strictly require authorized human inspection officials.**

---

## Problem Statement

Public infrastructure projects in developing regions frequently face severe information asymmetry. Progress reports filed on paper or static portals rarely reflect actual ground reality. By the time a project is declared complete or funds are fully disbursed:
- Unpaved road stretches, substandard drainage tiles, or missing utility connections are buried under completed documentation.
- Rectification costs escalate significantly.
- Citizens lack transparent mechanisms to track progress evidence or corroborate claims while contractors are on site.
- Civic complaints remain isolated within single-department silos, ignoring cascading multi-domain failures (e.g., pipe leaks causing road collapses).

---

## Solution

MakkalSaantru bridges this gap by introducing **Evidence-Driven Progress Verification** and **Civic Resource Intelligence**:
1. **Contractor Progress Submissions**: Contractors upload photo evidence and specific work claims for domain-tailored project stages (*Site Preparation, Drainage, Road Base Work, Surface Work, Finishing Work*).
2. **Citizen Ground Corroboration**: Nearby citizens review contractor claims and answer simple observable ground questions.
3. **AI Evidence Comparison**: Automated visual evidence comparison and location alignment without legal accusations or facial recognition.
4. **Three-Source Evidence Model**: Authority inspectors evaluate side-by-side **Contractor Evidence** vs **Citizen Evidence** vs **AI Observations** before recording final human decisions.
5. **Deterministic Authority Routing**: Civic complaints map directly to verified municipal department directories.
6. **Inspector Route Planning**: Cases requiring field verification automatically integrate into optimal multi-stop inspection routes.
7. **Cryptographic Before → After Proof**: SHA-256 evidence hashing ensures genuine resolution proof.

---

## Key Features

- 👷 **Contractor Execution Portal**: Mobile-friendly evidence upload wizard for assigned contractors (`/contractor`).
- 📱 **Mobile-First Citizen PWA**: Fast responsive web app with 6-step guided submission wizard.
- 🌐 **Tamil & English Bilingual Support**: Native Tamil (`தமிழ்`) and English interface with instant language toggle.
- 🎙️ **Voice Guidance & Accessibility**: Browser Text-to-Speech (TTS) guidance, simple mode high-contrast UI, and speech dictation.
- 📴 **Offline-First Capabilities**: Service Worker caching, IndexedDB local queue, and background sync engine.
- 🔒 **SHA-256 Cryptographic Fingerprinting**: Instant server-side buffer hashing for evidence non-tampering proof.
- 🛡️ **Cybersecurity Hardening**: Binary magic-byte upload validation, rate limiting, JWT auth, server-side RBAC, and security event logging.
- 📊 **Authority Intelligence Dashboard**: Real-time priority queue, Three-Source Evidence Comparison modal, and human decision tools.
- 🗺️ **Civic Intelligence Heatmap**: 250m radius hotspot detection, area risk aggregation, and interactive canvas visualizer.
- 🚀 **Inspector Route Planner**: Multi-stop path generation maximizing inspection efficiency based on urgency and location.

---

## Civic Issue Reporting

Citizens can report arbitrary ground issues (`ROAD`, `SANITATION`, `WATER_SUPPLY`, `DRAINAGE`, `STREETLIGHT`, `PUBLIC_BUILDING`, `PUBLIC_SPACE`, `SEWAGE`, `OTHER`) via a 6-step mobile wizard (`/citizen/report`):
1. **Photo Upload**: Capture or upload ground issue image.
2. **Geotagged Location**: Auto-detect device location or pin on map.
3. **AI Classification**: Automated category detection with heuristic fallback.
4. **Authority Routing**: Deterministic mapping to responsible municipal directory.
5. **Formal Complaint Generation**: Formats neutral complaint document with tracking code (`MS-CIV-2026-XXXXX`).
6. **PDF Download & Export**: Generates printable complaint proof with cryptographic fingerprints.

---

## Public Work Verification Model

Monitors public infrastructure projects (`ROADS`, `BRIDGES`, `WATERWORKS`, `BUILDINGS`, `STREETLIGHTS`) across configurable project stages rather than rigid percentages:
- **Road Construction**: *Site Preparation → Drainage Preparation → Road Base Work → Surface Work → Finishing Work → Final Inspection*.
- **Public Buildings**: *Site Preparation → Foundation Work → Structural Framework → Roofing → Electrical/Plumbing → Finishing → Final Inspection*.
- **Water Infrastructure**: *Route Survey → Excavation & Piping → Foundation → Equipment Installation → Testing → Handover*.

---

## Resource Intelligence

MakkalSaantru transforms isolated observations into structured administrative **Resource Intelligence**:

```
Issue Classification
         ↓
Authority Mapping
         ↓
Community / Evidence Signals
         ↓
Priority Intelligence
         ↓
Civic Heatmap
         ↓
Cross-Domain Detection
         ↓
Inspection Planning
         ↓
Human Action
         ↓
Before/After Verification
```

---

## Cybersecurity

Implemented security controls:
- **Password Security**: Hashed using `bcrypt` (work factor 10). Omitted from all JSON responses.
- **JWT Authentication**: Signed via HMAC SHA-256 with `JWT_SECRET` and 24-hour expiration.
- **Role-Based Access Control (RBAC)**: Middleware permissions enforced (`CITIZEN`, `INSPECTOR`, `ADMIN`, `CONTRACTOR`).
- **Self-Verification Prevention**: Server-side RBAC explicitly blocks contractors from verifying or approving their own submissions.
- **Binary Magic-Byte Upload Defense**: Inspects file header signatures (`FF D8 FF` JPEG, `89 50 4E 47` PNG, `52 49 46 46` WEBP/WAV) to block executable scripts.
- **SHA-256 Evidence Integrity**: Server buffer hashing for tamper proofing.
- **API Rate Limiting**: Global (100 req/15min) and Auth (5 req/15min) rate limiters.
- **Security Audit Logger**: Active logging of security events (`FAILED_LOGIN`, `ACCESS_DENIED`, `INVALID_UPLOAD`).
- **Tamper-Evident Chained Audit Log**: Cryptographic hash chaining (`previousHash` -> `recordHash`).

---

## Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas API, Web Speech API.
- **Backend**: Node.js, Express, TypeScript, Multer, Helmet, Express Rate Limit, Zod.
- **Database & ORM**: PostgreSQL, Prisma ORM + In-Memory API fallback.
- **Testing**: Jest, Supertest.
- **Security**: bcrypt, jsonwebtoken, crypto (SHA-256), magic-byte validator.

---

## Project Structure

```text
MAKKALSAANTRU/
├── client/                     # React 18 + Vite Frontend Application
│   ├── public/                 # PWA Web Manifest, Icons & Static Assets
│   └── src/
│       ├── components/         # UI Components, Heatmap Canvas & Priority Cards
│       ├── context/            # Auth & Language (English/Tamil) Contexts
│       ├── pages/              # Contractor, Citizen, Authority & Admin Pages
│       ├── services/           # API Client, IndexedDB & Sync Engine
│       └── utils/              # Exif, PDF Generator & Crypto Helpers
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── prisma/                 # Prisma Schema & Demo Seeder
│   └── src/
│       ├── __tests__/          # Automated Test Suite (13 suites, 94 tests)
│       ├── middleware/         # Auth, RBAC, Rate Limiter & Magic Byte Validator
│       ├── routes/             # REST API Endpoints (Contractor, Civic, Authority, Projects)
│       ├── services/           # AI, Progress Comparison, Priority Engine, Heatmap & Route Planner
│       └── utils/              # Crypto, Geo & Security Logger
├── docs/                       # Architectural & Security Documentation
├── scripts/                    # Secret Scanner (`scanSecrets.js`)
├── package.json                # Monorepo Scripts
├── .env.example                # Environment Variable Template
└── README.md                   # Project Documentation
```

---

## Demo Credentials & Workspace Accounts

The repository includes pre-populated fictional demo datasets for evaluation:

| Role | Username / Email | Password | Primary Workspace Route | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **CONTRACTOR** | `contractor@makkalsaantru.gov.in` | `contractor123` | `/contractor` | Upload work stage progress evidence & respond to audit requests |
| **CITIZEN** | `citizen@makkalsaantru.gov.in` | `citizen123` | `/citizen` | Verify contractor claims, Civic issue reporting, Offline sync |
| **INSPECTOR** | `inspector@makkalsaantru.gov.in` | `inspector123` | `/authority` | Three-Source Evidence Comparison, Priority queue, Route planner |
| **ADMINISTRATOR** | `admin@makkalsaantru.gov.in` | `admin123` | `/admin/security` | Audit trail, Authority directory, Security events |

---

## API Documentation

Detailed endpoint specifications are documented in [`docs/API.md`](docs/API.md) and [`docs/CONTRACTOR_PROGRESS_VERIFICATION.md`](docs/CONTRACTOR_PROGRESS_VERIFICATION.md).

Key REST Routes:
- `POST /api/auth/login`: Authenticate user & issue JWT.
- `GET /api/contractor/assigned-projects`: Fetch assigned projects for contractor.
- `POST /api/contractor/submissions`: Upload progress evidence for project stage.
- `POST /api/contractor/submissions/:id/verify`: Citizen ground verification of contractor claim.
- `POST /api/contractor/submissions/:id/decision`: Record human administrative decision (`VERIFY_PROGRESS`, `NEEDS_MORE_EVIDENCE`, `FIELD_INSPECTION_REQUIRED`, `PROGRESS_NOT_CONFIRMED`).
- `GET /api/authority/dashboard`: Retrieve authority triage dashboard.
- `GET /api/admin/security/events`: Retrieve live security audit events.

---

## Testing

Run the automated test suite across all 13 test suites:

```bash
npm test
```

Test Results:
- **Test Suites**: 13 passed, 13 total
- **Tests**: 94 passed, 94 total

---

## Known Limitations

- **Hackathon Prototype**: Built for demonstration purposes with fictional demo datasets.
- **GPS Signal Spoofing**: Client GPS coordinates are trust signals and can potentially be spoofed by client software.
- **SHA-256 Integrity Scope**: Proves evidence was not altered after server receipt; does not independently prove real-world visual truthfulness.
- **AI Decision Support**: AI outputs are advisory. All final administrative actions require human inspector review.
- **Heatmap Representation**: Heatmap clusters represent report submission density, not confirmed physical danger.
- **Inspector Routes**: Generated routes serve as decision support tools for field officers.

---

## Team

**Team Hack & Code**
- **S K Arun Amuthan** — Team Lead
- **D Balaji** — Team Member
- **P Ashwin** — Team Member

*SRM TRP Engineering College*

---

## Disclaimer

**MakkalSaantru is a hackathon prototype and is not an official Government of India or Tamil Nadu Government service.**
