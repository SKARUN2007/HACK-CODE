# MAKKALSAANTRU — Hackathon Judge Demo Walkthrough

Tagline: **"Public Money. Public Work. Public Proof."**  
Subtitle: *Citizen-Powered • AI-Assisted • Human-Verified*

This document provides a step-by-step evaluation guide for hackathon judges to experience all key capabilities of **MakkalSaantru**.

---

## 🔑 Demo Credentials

| Role | Username / Email | Password | Primary Workspace Route | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@makkalsaantru.gov.in` | `citizen123` | `/citizen` | Verification wizard, Civic issue reporting, Offline sync |
| **Inspector** | `inspector@makkalsaantru.gov.in` | `inspector123` | `/authority` | Case management, Priority queue, Route planner, Resolution proof |
| **Administrator** | `admin@makkalsaantru.gov.in` | `admin123` | `/admin/security` | Audit trail, Authority directory, Security events |

---

## 🎯 1. Citizen Verification Wizard (Public Work Progress)

1. Open `http://localhost:5173/` and log in as **Citizen** (`citizen@makkalsaantru.gov.in` / `citizen123`).
2. Navigate to **Public Projects** (`/projects`) and select project `MS-ROAD-001` (Mount Road Resurfacing Phase 2).
3. Click **Submit Progress Verification**.
4. Step through the 6-step wizard:
   - **Step 1 (Milestone)**: Select milestone **50% (Sub-Base Completed)**.
   - **Step 2 (Evidence Upload)**: Upload ground photo & record optional audio note.
   - **Step 3 (Location)**: Capture device GPS coordinates (verifies proximity against target project location).
   - **Step 4 (Questions)**: Answer structural condition questions.
   - **Step 5 (Review)**: Inspect cryptographic SHA-256 fingerprint generated for evidence.
   - **Step 6 (Submit)**: Click submit to register verification.

---

## 📢 2. Civic Issue Reporting Module

1. Navigate to `/citizen/report` or click **Report Civic Issue**.
2. Upload a photo of a road pothole or drainage issue.
3. System runs AI Issue Identification (or heuristic fallback) and classifies the problem into one of 9 domain categories (e.g. `ROAD` / `DRAINAGE`).
4. Category + GPS automatically route report to the deterministic Authority Directory (e.g., *Greater Chennai Corporation — PWD*).
5. Generate a formal structured complaint letter with tracking code `MS-CIV-2026-XXXXX` and export printable PDF proof.

---

## ⚡ 3. Resource Intelligence & Authority Dashboard

1. Log in as **Inspector** (`inspector@makkalsaantru.gov.in` / `inspector123`).
2. Navigate to **Authority Dashboard** (`/authority`).
3. View **Priority Intelligence Queue**:
   - Cases ranked strictly by 0–100 **Action Priority Score**.
   - Notice color-coded priority badges: `CRITICAL` (80+), `HIGH` (60–79), `MEDIUM` (40–59), `LOW` (<40).
4. Review **Cross-Department Case Detection**:
   - Observe multi-domain issue links (`WATER_SUPPLY` + `ROAD`, `SEWAGE` + `DRAINAGE`).
   - View structured sequential action dependency plans.

---

## 🗺️ 4. Civic Intelligence Heatmap & Inspector Route Planner

1. Navigate to **Civic Map** (`/authority/civic-map`).
2. Explore density hotspot clusters (250m radius aggregation) and area risk indicators.
3. Navigate to **Inspector Route Planner** (`/authority/route-planner`).
4. Select high-priority target inspection sites and generate optimal multi-stop inspection routes prioritized by urgency and proximity.

---

## 📸 5. Before → After Resolution Proof

1. Open a completed corrective action item in `/authority`.
2. Upload the **After Repair Photo**.
3. Cryptographic engine computes SHA-256 digest, performs side-by-side visual comparison, and triggers citizen re-verification flow.

---

## 🛡️ 6. Cybersecurity & Admin Audit Dashboard

1. Log in as **Administrator** (`admin@makkalsaantru.gov.in` / `admin123`).
2. Navigate to `/admin/security`:
   - View real-time security events (`FAILED_LOGIN`, `ACCESS_DENIED`, `INVALID_UPLOAD`, `INTEGRITY_MISMATCH`).
   - Inspect binary magic-byte validation logs.
3. Navigate to `/admin/audit`:
   - Inspect cryptographic tamper-evident chained audit log records (`previousHash` -> `recordHash`).

---

## ⚠️ Hackathon Disclaimer

*MakkalSaantru is a hackathon prototype created for ANVESHAN '26 and is not an official Government of India or Tamil Nadu Government service.*
