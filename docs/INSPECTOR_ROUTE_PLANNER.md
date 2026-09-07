# Inspector Route Planner — MakkalSaantru Module

## Executive Overview & Purpose

The **Inspector Route Planner** (`/authority/inspection-routes`) is a decision-support module designed to help government inspection authorities group multiple nearby civic cases into efficient field inspection batches.

Instead of inspectors visiting cases randomly, the pipeline operates as follows:

```
Priority Engine
       ↓
Cases Needing Inspection
       ↓
Geographic Grouping (Haversine 250m-5km)
       ↓
Inspector Route Planner
       ↓
Suggested Inspection Batch
       ↓
Inspector Reviews / Adjusts
       ↓
Field Inspection
       ↓
Evidence + Human Verification
```

### Core Principle
- **Decision Support Wording**: The system provides **SUGGESTED INSPECTION ROUTES** and **approximate geographic distances** (Haversine). It never claims automated government dispatch or turn-by-turn road driving distance guarantees without routing data.
- **Privacy & Safety**: Live GPS tracking of inspectors is never forced. Starting locations default to configured municipal offices or user-selected map coordinates.
- **Explainable Decision Model**: Candidate ranking combines **Priority Level & Score (45%)**, **Proximity to Starting Location (35%)**, and **Unresolved Case Age (20%)**.

---

## Architecture & Workflow

### 1. Route Eligibility
Only cases requiring field verification are included:
- `REPORTED`
- `UNDER_REVIEW`
- `ACTION_IN_PROGRESS`
- `AWAITING_AFTER_EVIDENCE`
- `AWAITING_REVERIFICATION`
- `REOPENED`

Resolved, draft, and closed cases (`RESOLVED`, `DRAFT`, `CLOSED`) are strictly excluded.

### 2. Decision Score Formula
Each candidate case is ranked using a transparent composite formula:

$$\text{DecisionScore} = 0.45 \times P + 0.35 \times \left(1 - \frac{D}{D_{\max}}\right) \times 100 + 0.20 \times \min(100, A \times 15)$$

Where:
- $P$: Priority Weight ($100$ for `URGENT_REVIEW`, $75$ for `HIGH`, $40$ for `MEDIUM`, $15$ for `LOW`).
- $D$: Haversine distance in km from starting point to case coordinates.
- $D_{\max}$: Maximum search radius (configurable e.g. 5 km).
- $A$: Unresolved report age in days.

### 3. Route Optimization Algorithm
1. **Filter**: Fetch eligible cases matching priority, category, age, and area filters.
2. **Rank**: Score candidates and pick top $N$ cases up to `maxCases` (default 8).
3. **Nearest-Neighbor**: Construct an initial sequence starting from origin.
4. **2-Opt Local Search**: Iteratively uncross intersecting straight-line legs to minimize total geographic span.
5. **Rationale Generation**: Compute plain-English explanation (*"Why This Route?"*).

---

## Security & RBAC Enforcement

1. **Role-Based Access Control**:
   - `CITIZEN`: Forbidden (403). Cannot access route planner, assigned routes, or inspector controls.
   - `INSPECTOR`: View assigned routes (`/authority/my-routes`), update stop findings, upload Before → After evidence, skip stops with valid reasons.
   - `ADMIN`: Generate routes, assign routes to inspectors, view history, recalculate routes.

2. **Object-Level Authorization (IDOR Protection)**:
   - Inspector A cannot view, start, complete, or skip stops on Inspector B's assigned route unless they hold `ADMIN` role.

3. **Audit Logging**:
   - Every major route action triggers an immutable audit log entry:
     - `INSPECTION_ROUTE_GENERATED`
     - `INSPECTION_ROUTE_ASSIGNED`
     - `INSPECTION_ROUTE_STARTED`
     - `INSPECTION_STOP_COMPLETED`
     - `INSPECTION_STOP_SKIPPED`
     - `INSPECTION_ROUTE_RECALCULATED`
     - `INSPECTION_ROUTE_COMPLETED`

---

## Step-by-Step Judge Presentation Scenario

1. **Authority Command Center**: Navigate to `/authority` or `/authority/civic-map`.
2. **Select Hotspot Cluster**: Observe high-priority unresolved cases concentrated in Trichy Commercial Hub (Chatram / Main Guard Gate area).
3. **Open Route Planner**: Click **Route Planner** or **"Plan Inspection Route"**.
4. **Generate Batch**: Set Starting Location = `Trichy Municipal Authority Office`, Max Cases = `8`, Max Radius = `5 km`. Click **GENERATE SUGGESTED ROUTE**.
5. **Inspect Output**:
   - Numbered map markers `① → ② → ③ → ④...` connected by sequence lines.
   - Top Summary Counters: `Cases Needing Inspection: 23`, `High Priority: 8`, `Unassigned: 15`, `Suggested Batches: 4`.
   - Rationale: *"Why This Route? This suggested route groups 8 geographically close cases..."*
6. **Assign to Inspector**: Click **ASSIGN ROUTE TO INSPECTOR**, select `AE S. Sundaram (Trichy Roads)`, and confirm.
7. **Inspector View**: Log in as inspector or open `/authority/my-routes`.
8. **Start & Verify**: Click **START INSPECTION ROUTE**, open Stop 1, click **OPEN IN MAPS**, inspect citizen evidence, submit verdict `✓ Inspection Completed`, or upload After evidence photo.
