# System Architecture — MakkalSaantru

Tagline: **"Public Money. Public Work. Public Proof."**

## Overview
MakkalSaantru is a citizen-powered, AI-assisted public-work verification platform designed to identify potential mismatches between officially reported public infrastructure milestones and ground truth evidence.

### Fundamental Principle
MakkalSaantru is **NOT a corruption detection system** and **NOT a complaint portal**.
AI services analyze evidence patterns, consistency metrics, and risk indicators. **Final decisions strictly remain with authorized human officials.**

---

## Technical Stack Architecture

```
[ Citizen PWA Client ]      [ Inspector Dashboard ]      [ Admin Portal ]
  - Accessibility Mode        - Verification Queue         - System Audit
  - MediaRecorder Audio API   - Risk Scoring               - User RBAC
  - Geolocation API           - Human Actions              - Project Reg
          │                            │                       │
          └────────────────────────────┼───────────────────────┘
                                       │ (REST API / Multipart / JWT)
                                       ▼
                       ┌──────────────────────────────┐
                       │  Node.js / Express Backend   │
                       │  - Helmet (Security Headers) │
                       │  - Multer Secure Uploads     │
                       │  - Server-Side SHA-256 Hash  │
                       │  - JWT & RBAC Middleware     │
                       └───────────────┬──────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
  ┌───────────────────────────┐                 ┌───────────────────────────┐
  │  Modular AI Interface     │                 │   PostgreSQL + Prisma     │
  │  - MockVerificationServ.  │                 │   - User, Project, Milestone  │
  │  - Live AI API (Swappable)│                 │   - Evidence, Verification    │
  └───────────────────────────┘                 │   - AuditLog              │
                                                └───────────────────────────┘
```

---

## Phase 2 Citizen Workflow

1. **Project Discovery**: Citizens view nearby public projects filtered by category (`ROAD`, `WATER`, `STREETLIGHT`, `SANITATION`, `PUBLIC_BUILDING`).
2. **Project Profile**: Inspection of project description, budget, reported progress, and milestone progression (`25% → 50% → 75% → 100%`).
3. **High-Accessibility Interface**: "Simple Mode" toggle, high contrast buttons, Tamil/English language UI toggle.
4. **Photo Evidence Upload**: Image capture / upload with client preview.
5. **Voice Observation**: In-browser audio recording via `MediaRecorder` API with playback/retry.
6. **Field Site Q&A**: Non-accusatory simple `YES` / `NO` / `UNSURE` cards.
7. **Geotag & Timestamp**: GPS coordinates (`navigator.geolocation`) or `LOCATION_NOT_PROVIDED` fallback, automatic server timestamping.
8. **Server-Side SHA-256 Integrity**: Server computes cryptographic SHA-256 hash of file buffers and returns status `INTEGRITY_RECORDED`.
9. **Private Submission Tracking**: Citizens view personal private submission history under `/citizen/submissions`.
