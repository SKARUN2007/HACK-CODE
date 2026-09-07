# Evidence-Driven Contractor Progress Verification System

> **"Public Money. Public Work. Public Proof."**  
> Subtitle: *Citizen-Powered • AI-Assisted • Human-Verified*

---

## 1. Executive Summary & Paradigm Shift

In response to hackathon evaluation feedback, **MakkalSaantru** transitioned from an arbitrary percentage-first milestone model (25%, 50%, 75%, 100%) to an **Evidence-Driven Contractor & Public Verification Model**.

### Old Model (Fixed Percentages)
- Relied on static percentage progress bars (25%, 50%, 75%, 100%).
- Implied exact numerical completion without concrete physical work definitions.

### New Model (Evidence-Driven Project Stages)
```
CONTRACTOR UPLOADS ACTUAL PROGRESS EVIDENCE
                     ↓
CITIZENS / AUTHORIZED INSPECTORS VERIFY THAT EVIDENCE
                     ↓
AI ASSISTS IN COMPARING CLAIMED WORK WITH GROUND EVIDENCE
                     ↓
HUMAN AUTHORITY MAKES THE FINAL DECISION
```

---

## 2. Core Workflow Architecture

### Step 1: Contractor Progress Submission (`/contractor`)
- Contractors access assigned public infrastructure projects via the Contractor Execution Portal.
- Select specific configurable project stage (e.g. *Site Preparation, Drainage Preparation, Road Base Work, Surface Work, Finishing Work, Final Inspection*).
- Submit progress title, detailed description, specific work claim, ground evidence photo, and optional GPS location.
- **Server SHA-256 Fingerprint**: Server derives a cryptographic hash from raw image bytes and submission metadata upon receipt.

### Step 2: Public / Citizen Ground Verification (`/citizen/projects/:id`)
- Citizens view the latest contractor progress claim and uploaded evidence photo.
- Clicking **VERIFY THIS WORK** launches a simple observable ground verification wizard:
  1. *Can you currently observe this work happening at this location?* (`YES` / `NO` / `NOT SURE`)
  2. *Does the visible work appear generally consistent with the contractor's submitted evidence?* (`YES` / `NO` / `NOT SURE`)
  3. *Provide optional current ground photo and audio notes.*
- Citizens verify factual observations only without certifying technical engineering standards.

### Step 3: AI Evidence Comparison (`ProgressEvidenceComparisonService`)
- The AI engine compares the contractor's progress claim + photos with multi-citizen ground corroborations and location signals.
- Constrained output schema:
  - `CONSISTENT`: High alignment between contractor claim and citizen observations.
  - `REVIEW`: Mixed or inconclusive community observations.
  - `POTENTIAL_MISMATCH`: Observable discrepancy between contractor evidence and citizen ground observations.
  - `INSUFFICIENT_EVIDENCE`: Awaiting community corroboration.
- **Safety Policy**: Strictly non-accusatory terminology (no claims of "FRAUD" or "LIAR").

### Step 4: Three-Source Evidence Comparison & Human Authority Decision
- Authority Inspectors view a side-by-side comparison modal in `/authority`:
  - **CONTRACTOR EVIDENCE**: Submitted claim, timestamp, version, photo, SHA-256 fingerprint.
  - **CITIZEN GROUND EVIDENCE**: Corroboration counts, consistency ratio, citizen photos & notes.
  - **AI COMPARISON**: Confidence score %, visual observations list, recommended administrative action.
- Inspector Decision Choices:
  - `VERIFY PROGRESS`: Formally approves the stage update.
  - `NEEDS MORE EVIDENCE`: Requests contractor to upload Version 2 without overwriting Version 1.
  - `FIELD INSPECTION REQUIRED`: Automatically integrates the case into the **Inspector Route Planner**.
  - `PROGRESS NOT CONFIRMED`: Rejects the progress update.

---

## 3. Security & Server RBAC Controls

1. **Self-Verification Prevention**: Server-side RBAC explicitly blocks contractors from verifying, approving, or modifying their own progress submissions (`submission.contractorId === req.user.id`).
2. **Binary Upload Defense**: Uploaded photos are inspected for magic bytes (`FF D8 FF` JPEG, `89 50 4E 47` PNG, `52 49 46 46` WEBP) before saving to disk.
3. **Audit Trail**: Every submission, verification, and human decision is logged into the tamper-evident audit log (`previousHash` -> `recordHash`).
4. **Version Control**: If an inspector requests more evidence, the contractor creates Version 2, keeping Version 1 preserved in audit history.

---

## 4. Demo Evaluation Guide

1. Log in as **Contractor** (`contractor@makkalsaantru.gov.in` / `contractor123`) -> Go to `/contractor` -> Upload progress evidence for Stage 2 ("Road Base Work").
2. Log in as **Citizen** (`citizen@makkalsaantru.gov.in` / `citizen123`) -> Go to `/citizen/projects/proj-demo-1` -> Click **VERIFY THIS WORK** -> Submit ground observations.
3. Log in as **Inspector** (`inspector@makkalsaantru.gov.in` / `inspector123`) -> Go to `/authority` -> Open **Contractor Progress Verification** tab -> Review side-by-side **Three-Source Evidence Comparison** -> Record human authority decision.
