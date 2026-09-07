# MAKKALSAANTRU — Hackathon Judge Demo Walkthrough

Tagline: **"Public Money. Public Work. Public Proof."**  
Subtitle: *Citizen-Powered • AI-Assisted • Human-Verified*

This document provides a step-by-step evaluation guide for hackathon judges to experience all key capabilities of **MakkalSaantru**.

---

## 🔑 Demo Credentials

| Role | Username / Email | Password | Primary Workspace Route | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Contractor** | `contractor@makkalsaantru.gov.in` | `contractor123` | `/contractor` | Upload work stage progress evidence & respond to audit requests |
| **Citizen** | `citizen@makkalsaantru.gov.in` | `citizen123` | `/citizen` | Verify contractor claims, Civic issue reporting, Offline sync |
| **Inspector** | `inspector@makkalsaantru.gov.in` | `inspector123` | `/authority` | Three-Source Evidence Comparison, Priority queue, Route planner |
| **Administrator** | `admin@makkalsaantru.gov.in` | `admin123` | `/admin/security` | Audit trail, Authority directory, Security events |

---

## 🎯 1. Evidence-Driven Public Work Verification (Judge Primary Demo Flow)

```
CONTRACTOR UPLOADS ACTUAL PROGRESS EVIDENCE
                     ↓
CITIZENS / AUTHORIZED INSPECTORS VERIFY THAT EVIDENCE
                     ↓
AI ASSISTS IN COMPARING CLAIMED WORK WITH GROUND EVIDENCE
                     ↓
HUMAN AUTHORITY MAKES THE FINAL DECISION
```

### Step-by-Step Judge Walkthrough:

1. **Log in as Contractor**:
   - Navigate to `http://localhost:5173/login` and select **Official Contractor** (`contractor@makkalsaantru.gov.in` / `contractor123`).
   - Open assigned project **Village Road Improvement**.
   - Click **UPLOAD PROGRESS EVIDENCE**.
   - Select Stage 2: **Road Base Work**.
   - Enter Title: *"Road base layer completed for 500 metres"*.
   - Upload ground photo & click **SUBMIT EVIDENCE FOR VERIFICATION**.
   - Server returns SHA-256 evidence fingerprint.

2. **Log in as Citizen**:
   - Log in as **Citizen** (`citizen@makkalsaantru.gov.in` / `citizen123`).
   - Open **Village Road Improvement** (`/citizen/projects/proj-demo-1`).
   - Observe the **Contractor Progress Evidence Card** showing the contractor's claimed work and photo.
   - Click **VERIFY THIS WORK**.
   - Answer observable ground questions:
     1. *Can you observe this work at the reported location?* (**YES**)
     2. *Does visible work appear consistent with contractor evidence?* (**YES**)
     3. *Provide optional current photo and notes.*
   - Click **SUBMIT EVIDENCE**.

3. **Log in as Inspector & Review Evidence**:
   - Log in as **Inspector** (`inspector@makkalsaantru.gov.in` / `inspector123`).
   - Navigate to **Authority Dashboard** (`/authority`).
   - Open tab **CONTRACTOR PROGRESS VERIFICATION**.
   - Click **Review Evidence & Decide** to open the **Three-Source Evidence Comparison Modal**.
   - Observe side-by-side synthesis:
     - **Column 1 (CONTRACTOR EVIDENCE)**: Submitted claim, photo, timestamp, version, SHA-256 hash.
     - **Column 2 (CITIZEN GROUND EVIDENCE)**: 4 independent citizen observations, 75% consistency ratio, citizen photos.
     - **Column 3 (AI-ASSISTED COMPARISON)**: 81% Confidence, visual observations list, recommended action.
   - Record Human Authority Decision:
     - Click **✓ VERIFY PROGRESS** (to approve stage), or
     - Click **📍 FIELD INSPECTION REQUIRED** (automatically routes case to **Inspector Route Planner**).

---

## 📢 2. Civic Issue Reporting Module

1. Navigate to `/citizen/report` or click **Report Civic Issue**.
2. Upload a photo of a road pothole or drainage issue.
3. System runs AI Issue Identification (or heuristic fallback) and classifies the problem into one of 9 domain categories (`ROAD`, `DRAINAGE`, etc.).
4. Category + GPS automatically route report to the deterministic Authority Directory (*Greater Chennai Corporation — PWD*).
5. Generate formal structured complaint letter with tracking code `MS-CIV-2026-XXXXX` and export printable PDF proof.

---

## 🗺️ 3. Civic Intelligence Heatmap & Inspector Route Planner

1. Navigate to **Civic Map** (`/authority/civic-map`).
2. Explore density hotspot clusters (250m radius aggregation) and area risk indicators.
3. Navigate to **Inspector Route Planner** (`/authority/route-planner`).
4. Select high-priority target inspection sites (including cases marked `FIELD_INSPECTION_REQUIRED`) and generate optimal multi-stop inspection routes prioritized by urgency and proximity.

---

## 📸 4. Before → After Resolution Proof

1. Open a completed corrective action item in `/authority`.
2. Upload the **After Repair Photo**.
3. Cryptographic engine computes SHA-256 digest, performs side-by-side visual comparison, and triggers citizen re-verification flow.

---

## 🛡️ 5. Cybersecurity & Admin Audit Dashboard

1. Log in as **Administrator** (`admin@makkalsaantru.gov.in` / `admin123`).
2. Navigate to `/admin/security`:
   - View real-time security events (`FAILED_LOGIN`, `ACCESS_DENIED`, `INVALID_UPLOAD`, `INTEGRITY_MISMATCH`).
   - Inspect binary magic-byte validation logs.
3. Navigate to `/admin/audit`:
   - Inspect cryptographic tamper-evident chained audit log records (`previousHash` -> `recordHash`).

---

## ⚠️ Hackathon Disclaimer

*MakkalSaantru is a hackathon prototype created for ANVESHAN '26 and is not an official Government of India or Tamil Nadu Government service.*
