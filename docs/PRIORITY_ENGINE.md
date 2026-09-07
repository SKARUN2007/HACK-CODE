# MakkalSaantru — Urgency / Priority Engine Specification

## Overview & Purpose

The **Urgency / Priority Engine** prioritizes civic reports for public authorities, municipal inspectors, and repair crews. Authorities often face hundreds of civic complaints daily; the Priority Engine synthesizes validated operational system signals to rank cases in an explainable **Action Priority Score** (0–100).

> [!IMPORTANT]
> **Neutrality Principle**: The system **prioritizes cases for operational review attention**. It **never** labels a report as "Dangerous", "Illegal", "Corrupt", or "Criminal".
> The metric is strictly titled **ACTION PRIORITY SCORE** or **CIVIC RESPONSE PRIORITY**.

---

## 1. Action Priority Score Calculation Algorithm (0–100)

The score is calculated deterministically from six system signal factors:

$$\text{Action Priority Score} = \min\left(100, \sum_{i=1}^{6} \text{Signal}_i\right)$$

### Signal Weights & Rules

| Signal Factor | Evaluation Metric | Score Weight | Explanation Reason |
| :--- | :--- | :--- | :--- |
| **1. Independent Reports** | Duplicate complaints from distinct citizen accounts within 300m radius | Max **35 pts** | `+ N independent citizen reports from nearby area` |
| **2. Community Confirmations** | Upvotes / confirmations by local residents | Max **20 pts** (3.5 pts/confirmation) | `+ N community confirmations verified` |
| **3. Duration Unaddressed** | Days elapsed since initial report submission | Max **20 pts** (3.5 pts/day) | `+ Issue unresolved for N days` |
| **4. Category Operational Weight** | Criticality of infrastructure category (`SEWAGE`, `WATER_SUPPLY`, `ROAD`, `DRAINAGE`) | Max **18 pts** | `+ Operational priority weight for category` |
| **5. Location Criticality** | Proximity to transit hubs, hospitals, schools, or arterial roads | Max **10 pts** | `+ Proximity to public facility or transit corridor` |
| **6. Evidence Completeness** | Presence of geotagged photo, EXIF metadata, description/voice | Max **7 pts** | `+ High evidence completeness (Photo + GPS)` |

---

## 2. Priority Level Thresholds

| Action Priority Score | Priority Level | Badge Styling | Target SLA |
| :--- | :--- | :--- | :--- |
| **80 – 100** | `URGENT_REVIEW` | 🔴 Red Badge | Inspection within 12 Hours |
| **55 – 79** | `HIGH` | 🟠 Orange Badge | Inspection within 24 Hours |
| **30 – 54** | `MEDIUM` | 🟡 Yellow Badge | Inspection within 48 Hours |
| **0 – 29** | `LOW` | 🟢 Green Badge | Scheduled Operational Queue |

---

## 3. Separate Evidence Confidence Score (0–100%)

To prevent low-quality or tampered reports from gaming the priority queue, the system computes a separate **Evidence Confidence Score**:

- **Baseline Confidence**: 70%
- **Geotagged Photo**: +15%
- **GPS Coordinates**: +10%
- **Voice / Text Detail**: +5%
- **EXIF Tamper Penalty**: -40% (if metadata anomalies detected)

---

## 4. Manual Authority Override & Audit Logging

Authority officials can override the system score with mandatory audit logging:

1. **Reason Mandatory**: Officials must input an explicit justification note (e.g., *"Main hospital access road blocked during heavy monsoon"*).
2. **Audit Logging**: Every override records `previousScore`, `newScore`, `overrideByUserId`, `timestamp`, and `overrideReason`.
3. **Immutability**: Overridden cases display `[MANUAL OVERRIDE BY AUTHORITY]` on the dashboard.

---

## 5. API Endpoints

- `GET /api/civic-reports/authority/priority-queue`: Retrieves sorted priority queue with filter parameters (`category`, `level`, `district`).
- `POST /api/civic-reports/:id/priority-override`: Sets manual priority level and score with audit logging.
- `GET /api/civic-reports/authority/metrics`: Returns statewide Resource Intelligence metrics.
