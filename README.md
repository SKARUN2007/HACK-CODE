# MakkalSaantru

> **Public Money. Public Work. Public Proof.**  
> **Subtitle**: *Citizen-Powered • AI-Assisted • Human-Verified*

---

## Overview

**MakkalSaantru** (மக்கள் சான்று) is a citizen-powered, AI-assisted, human-verified public work verification and civic resource intelligence platform. It transforms raw citizen observations—photos, audio dictation, GPS coordinates, and structured questionnaire responses—into actionable administrative intelligence while public work is actively underway.

By replacing end-of-project post-mortems with active milestone verification (**25%, 50%, 75%, 100%**) and automated civic issue classification, MakkalSaantru enables early government intervention, transparent priority scoring, cross-department case detection, and cryptographically verified resolution proofs.

> ⚠️ **GOVERNING PRINCIPLE**:
> MakkalSaantru is **NOT a corruption detection tool** and **NOT a simple complaint submission box**. AI algorithms serve exclusively to flag anomalies, compute priority scores, and detect domain overlaps. **All administrative actions, site assignments, and case resolutions strictly require authorized human inspection officials.**

---

## Problem Statement

Public infrastructure projects in developing regions frequently face severe information asymmetry. Progress reports filed on paper or static portals rarely reflect actual ground reality. By the time a project is declared 100% complete or funds are fully disbursed:
- Unpaved road stretches, substandard drainage tiles, or missing utility connections are buried under completed documentation.
- Rectification costs escalate significantly.
- Citizens lack transparent mechanisms to track milestone progress or verify quality while contractors are on site.
- Civic complaints remain isolated within single-department silos, ignoring cascading multi-domain failures (e.g., pipe leaks causing road collapses).

---

## Solution

MakkalSaantru bridges this gap by introducing **Milestone Verification** and **Civic Resource Intelligence**:
1. **Intermediate Milestone Verification**: Citizens submit geotagged photo/voice evidence at 25%, 50%, 75%, and 100% milestones, catching defects early.
2. **AI-Assisted Vision & Heuristics**: Automated visual anomaly flagging without legal accusations or facial recognition.
3. **Deterministic Authority Routing**: Reports map directly to verified department directories based on issue category and geographic location.
4. **Action Priority Scoring**: System signals rank inspection queues (0–100 score) so high-impact cases get immediate field attention.
5. **Cross-Department Case Detection**: Multi-domain issues are detected automatically with dependent action plans.
6. **Cryptographic Before → After Proof**: SHA-256 evidence hashing and citizen re-verification ensure genuine resolution.

---

## Key Features

- 📱 **Mobile-First Citizen PWA**: Fast responsive web app with 6-step guided submission wizard.
- 🌐 **Tamil & English Bilingual Support**: Native Tamil (`தமிழ்`) and English interface with instant language toggle.
- 🎙️ **Voice Guidance & Accessibility**: Browser Text-to-Speech (TTS) guidance, simple mode high-contrast UI, and speech dictation.
- 📴 **Offline-First Capabilities**: Service Worker caching, IndexedDB local queue, and background sync engine.
- 🔒 **SHA-256 Cryptographic Fingerprinting**: Instant server-side buffer hashing for evidence non-tampering proof.
- 🛡️ **Cybersecurity Hardening**: Binary magic-byte upload validation, rate limiting, JWT auth, RBAC, and security event logging.
- 📊 **Authority Intelligence Dashboard**: Real-time priority queue, status counters, and case management tools for inspectors.
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

## Public Work Verification

Monitors public infrastructure projects (`ROADS`, `BRIDGES`, `WATERWORKS`, `BUILDINGS`, `STREETLIGHTS`) across intermediate milestones:
- **25% Milestone**: Foundation / Earthwork / Initial excavation.
- **50% Milestone**: Sub-base / Structural framework / Piping layout.
- **75% Milestone**: Surface asphalt / Masonry / Utility installation.
- **100% Milestone**: Final completion & site handover.

Citizens submit multi-angle photos, optional audio dictations, and structured answers to milestone-specific checklists.

---

## Resource Intelligence

MakkalSaantru transforms isolated citizen observations into structured administrative **Resource Intelligence**:

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

## AI-Assisted Verification

- **Principle**: *AI FLAGS — HUMANS DECIDE*.
- **Constrained Output**: JSON response schema restricted to `CONSISTENT`, `REVIEW`, or `POTENTIAL_MISMATCH`.
- **Signal Multiifiers**: Combines multi-citizen corroboration counts, distance calculations to target project coordinates, milestone match ratios, and image duplicate suppression.
- **Vendor Independent**: Pluggable provider architecture supporting live Google Gemini Vision API or deterministic offline fallback.

---

## Priority Engine

Calculates a dynamic **0–100 Action Priority Score** for authority triage using system parameters:
- `Report Volume`: Number of distinct submissions for the same issue/project.
- `Citizen Confirmations`: Upvotes and secondary corroborations.
- `Category Weight`: High-impact domains (e.g., sewage/water contamination weighted higher than streetlights).
- `Age Decay / Escalation`: Automatic score increase over time for unaddressed reports.
- `Inspector Manual Override`: Allows authorized inspectors to adjust priority with audited justification.

---

## Civic Heatmap

The **Civic Intelligence Heatmap** (`/authority/civic-map`) aggregates report locations into visual spatial intelligence:
- **Spatial Hotspot Clustering**: Identifies report concentrations within a 250-meter radius.
- **Risk Severity Levels**: Color-coded canvas nodes (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- **Recurring Location Flags**: Highlights chronic problem spots requiring structural intervention.

---

## Inspector Route Planner

The **Inspector Route Planner** (`/authority/route-planner`) assists field officers in organizing daily verification visits:
- Calculates optimal multi-stop inspection paths based on urgency score and spatial proximity.
- Interactive route list with navigation coordinates and status tracking.
- Filterable by department, urgency threshold, and assigned district.

---

## Cross-Department Case Detection

Detects complex multi-domain infrastructure failures from a single citizen report:
- **Detected Domain Pairs**: `WATER_SUPPLY` + `ROAD` (pipe leak under asphalt), `DRAINAGE` + `ROAD` (overflow damaging pavement), `SEWAGE` + `DRAINAGE` (sewage cross-contamination).
- **Sequential Action Dependency**: Generates step-by-step coordinated action plans (e.g. *Step 1: Metro Water repairs pipe -> Step 2: Highways Dept resurfaces road*).
- **Non-Accusatory Policy**: Focuses on resource coordination rather than inter-agency blame.

---

## Before → After Resolution Proof

Ensures verified completion of corrective action orders:
1. Inspector uploads **After-Repair Photo** upon work completion.
2. System computes SHA-256 hash of the resolution media.
3. Performs side-by-side visual status comparison (`Before` vs `After`).
4. Triggers secondary citizen re-verification workflow before marking case `RESOLVED`.

---

## Cybersecurity

Implemented security controls:
- **Password Security**: Hashed using `bcrypt` (work factor 10). Omitted from all JSON responses.
- **JWT Authentication**: Signed via HMAC SHA-256 with `JWT_SECRET` and 24-hour expiration.
- **Role-Based Access Control (RBAC)**: Middleware permissions enforced (`CITIZEN`, `INSPECTOR`, `ADMIN`).
- **Binary Magic-Byte Upload Defense**: Inspects file header signatures (`FF D8 FF` JPEG, `89 50 4E 47` PNG, `52 49 46 46` WEBP/WAV) to block executable scripts.
- **SHA-256 Evidence Integrity**: Server buffer hashing for tamper proofing.
- **API Rate Limiting**: Global (100 req/15min) and Auth (5 req/15min) rate limiters.
- **Security Audit Logger**: Active logging of security events (`FAILED_LOGIN`, `ACCESS_DENIED`, `INVALID_UPLOAD`).
- **Tamper-Evident Chained Audit Log**: Cryptographic hash chaining (`previousHash` -> `recordHash`).

---

## Architecture

```mermaid
flowchart TD
    Citizen[Citizen PWA / Web Client] -->|Submit Geotagged Evidence| API[Express API Backend / Node.js]
    Citizen -->|Offline Local Storage| IDB[(IndexedDB Storage)]
    IDB -->|Network Reconnected / Sync Now| API
    
    API --> Auth[JWT & RBAC Middleware]
    Auth --> RateLimit[Rate Limiter & Input Validation]
    RateLimit --> UploadCheck[File Validator & Magic Byte Check]
    
    UploadCheck -->|SHA-256 Hashing| EvService[Evidence Trust Engine]
    EvService -->|Store Records| DB[(PostgreSQL / Prisma ORM)]
    
    EvService --> AIEngine[Modular AI Verification Engine]
    AIEngine -->|Priority Score & Risk Flags| AuthDash[Authority Intelligence Dashboard]
    
    AuthDash --> Inspector[Human Inspector Review]
    Inspector -->|Confirm Issue / No Issue| CaseEngine[Human Decision State Machine]
    CaseEngine -->|Assign Department| CorrectiveAction[Corrective Action Order]
    
    API -->|Cryptographic Chaining| AuditLog[Tamper-Evident Audit Trail]
```

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
│       ├── pages/              # Citizen, Authority & Admin Pages
│       ├── services/           # API Client, IndexedDB & Sync Engine
│       └── utils/              # Exif, PDF Generator & Crypto Helpers
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── prisma/                 # Prisma Schema & Demo Seeder
│   └── src/
│       ├── __tests__/          # Automated Test Suite (12 suites, 89 tests)
│       ├── middleware/         # Auth, RBAC, Rate Limiter & Magic Byte Validator
│       ├── routes/             # REST API Endpoints
│       ├── services/           # AI, Priority Engine, Heatmap & Route Planner
│       └── utils/              # Crypto, Geo & Security Logger
├── docs/                       # Architectural & Security Documentation
├── scripts/                    # Secret Scanner (`scanSecrets.js`)
├── package.json                # Monorepo Scripts
├── .env.example                # Environment Variable Template
└── README.md                   # Project Documentation
```

---

## Installation

```bash
# 1. Clone repository
git clone <MY_GITHUB_REPOSITORY_URL>
cd ANVESHAN'26

# 2. Install dependencies across client and server
npm run install:all
```

---

## Environment Configuration

Copy `.env.example` to `server/.env`:

```bash
cp .env.example server/.env
```

Verify variables in `server/.env`:
```env
PORT=5005
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/makkalsaantru?schema=public"
JWT_SECRET="your_jwt_secret_key_here"
CLIENT_ORIGIN="http://localhost:5173"
AI_PROVIDER="mock"
```

---

## Database Setup

```bash
# Generate Prisma Client & Run Migrations (if PostgreSQL is active)
cd server
npx prisma generate
npx prisma db push

# Seed demo dataset
npm run seed:demo
```

---

## Running the Application

```bash
# Run both Backend (Port 5005) and Frontend (Port 5173) in dev mode
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev:client
```

---

## Demo Data

The repository includes pre-populated fictional demo datasets for evaluation:

| Role | Username / Email | Password | Target Page |
| :--- | :--- | :--- | :--- |
| **CITIZEN** | `citizen@makkalsaantru.gov.in` | `citizen123` | `/citizen` |
| **INSPECTOR** | `inspector@makkalsaantru.gov.in` | `inspector123` | `/authority` |
| **ADMINISTRATOR** | `admin@makkalsaantru.gov.in` | `admin123` | `/admin/security` |

---

## API Documentation

Detailed endpoint specifications are documented in [`docs/API.md`](docs/API.md).

Key REST Routes:
- `POST /api/auth/login`: Authenticate user & issue JWT.
- `GET /api/projects`: List public infrastructure projects.
- `POST /api/projects/:id/evidence`: Submit geotagged progress verification evidence.
- `POST /api/civic-reports`: Submit citizen civic issue report.
- `GET /api/authority/dashboard`: Retrieve authority triage dashboard.
- `POST /api/authority/cases/:id/decision`: Record human inspection decision.
- `GET /api/admin/security/events`: Retrieve live security audit events.

---

## Testing

Run the automated test suite across all 12 test suites:

```bash
npm test
```

Test Results:
- **Test Suites**: 12 passed, 12 total
- **Tests**: 89 passed, 89 total

---

## Security

Run the secret scanning script before committing code:

```bash
npm run scan:secrets
```

See [`docs/SECURITY.md`](docs/SECURITY.md) and [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md) for full threat modeling and security specifications.

---

## Known Limitations

- **Hackathon Prototype**: Built for demonstration purposes with fictional demo datasets.
- **GPS Signal Spoofing**: Client GPS coordinates are trust signals and can potentially be spoofed by client software.
- **SHA-256 Integrity Scope**: Proves evidence was not altered after server receipt; does not independently prove real-world visual truthfulness.
- **AI Decision Support**: AI outputs are advisory. All final administrative actions require human inspector review.
- **Heatmap Representation**: Heatmap clusters represent report submission density, not confirmed physical danger.
- **Inspector Routes**: Generated routes serve as decision support tools for field officers.

---

## Future Scope

- Direct API integration with municipal GIS and government e-Governance portals.
- Additional language support (Hindi, Telugu, Kannada, Malayalam).
- Automated perceptual image similarity (AI vision embeddings) for near-duplicate image detection.
- IVR and SMS gateway integration for feature phones.

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
