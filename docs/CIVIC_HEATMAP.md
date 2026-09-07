# MakkalSaantru — Civic Intelligence Heatmap Specification

## Overview & Purpose

The **Civic Intelligence Heatmap** (`/authority/civic-map`) provides a geospatial intelligence map for public authorities, municipal engineers, and department heads. By transforming individual geotagged citizen reports into spatial density patterns, the map helps authorities identify report concentrations, detect recurring hotspots, track category volume trends, and allocate limited inspection and repair crews efficiently.

> [!IMPORTANT]
> **Governing Principles**:
> 1. **Neutral Terminology**: Title is strictly **CIVIC ISSUE HEATMAP** or **CIVIC INTELLIGENCE MAP**. Terms like *"Corruption Map"*, *"Crime Map"*, or *"Danger Map"* are strictly prohibited.
> 2. **Report Concentration**: Heatmap intensity represents **report concentration and citizen corroboration density**, not confirmed legal severity or verified official damage.
> 3. **Privacy by Design**: Map payloads strip all citizen personally identifiable information (name, email, phone, account ID).
> 4. **RBAC Protection**: Only authorized authority roles (`AUTHORITY`, `INSPECTOR`, `ADMIN`) can access `/authority/civic-map` endpoints. Citizen requests return HTTP 403.
> 5. **Open Source & Paid-API Free**: Uses Leaflet + OpenStreetMap tile layers with 0 paid API key dependencies.

---

## 1. Display Modes & Layer Options

| Display Mode | Rendering Layer | Primary Operational Purpose |
| :--- | :--- | :--- |
| **HEATMAP INTENSITY** | Canvas Heatmap Radius & Density Gradient | Visualizes overall report concentration density |
| **MARKER CLUSTERS** | Grouped Cluster Markers with Count Badges | Aggregates close reports (e.g. 18 cases) into expandable clusters |
| **INDIVIDUAL PINS** | Color-coded Priority Pins (Red, Orange, Yellow, Green) | Pinpoint precise report coordinates & status |
| **AREA OVERLAYS** | Locality / Ward Boundary Circles | Summarizes area-level statistics (`Demo Ward 12`) |
| **ACCESSIBLE TABLE VIEW** | Structured Data Table | Screen-reader accessible alternative table format |

---

## 2. Hotspot Detection Algorithm (`HotspotDetectionService`)

Hotspots are detected deterministically using geospatial radius clustering (default `250m` radius):

### Attention Level Thresholds

| Attention Level | Badge Color | System Trigger Criteria |
| :--- | :--- | :--- |
| `HIGH_ATTENTION` | 🔴 Red Badge | High Priority Unresolved Cases $\ge 5$ OR Total Open Cases $\ge 10$ |
| `HIGH_ACTIVITY` | 🟠 Orange Badge | Total Open Cases $\ge 6$ |
| `MODERATE_ACTIVITY` | 🟡 Yellow Badge | Total Open Cases $\ge 3$ |
| `LOW_ACTIVITY` | 🟢 Green Badge | Total Open Cases $< 3$ |

### Explainable Reasons
Every hotspot generates transparent, human-readable system reasons:
- `+ 18 civic reports concentrated within 250m local radius`
- `+ 12 independent citizen reporters corroborated issues`
- `+ 6 high-priority unresolved cases require attention`
- `+ Unaddressed reports span 8 days in this locality`
- `+ Dominant civic demand category: ROAD`

---

## 3. Area Intelligence & Recurring Location Signals

### Area Aggregation
Groups reports by ward/locality (`Demo Ward 12 - Trichy Central`) to compute:
- **Total Reports** & **Open Cases**
- **High Priority Cases**
- **Resolved Cases** & **Reopened Cases**
- **Average Resolution Time (Days)**
- **Most Common Category** & **Oldest Open Case Age**

### Recurring Location Signal
Identifies coordinates where similar category complaints repeatedly occur across multiple months (e.g. May 2026, July 2026, September 2026).
- **Insight Label**: `RECURRING ISSUE LOCATION`
- **Notice**: *"Repeated reports of DRAINAGE issues have been observed near this location across multiple months."*

---

## 4. Backend Endpoints & Security

- `GET /api/authority/civic-map`: Returns slim, privacy-scrubbed report objects.
- `GET /api/authority/civic-map/hotspots`: Returns 250m radius hotspots list.
- `GET /api/authority/civic-map/areas`: Returns area intelligence metrics.
- `GET /api/authority/civic-map/stats`: Returns category volume change % trends (`+18% REPORT VOLUME CHANGE`) and Resource Intelligence cards.

**RBAC Authorization**: Enforces `authenticateToken` + `requireRole(['INSPECTOR', 'ADMIN'])`. Citizens get HTTP 403 `ACCESS_DENIED`.

---

## 5. Judge Demonstration Steps

1. Navigate to Authority Dashboard (`/authority`).
2. Click **Civic Intelligence Map** in navbar or top header button.
3. Page loads at `/authority/civic-map` showing OpenStreetMap tiles centered on Trichy demo clusters.
4. Select `HEATMAP` mode to view report intensity gradient over Trichy Central Bus Stand.
5. Click `ROAD` category filter chip: Map, hotspots, and area stats dynamically update.
6. Click **Trichy Central Bus Stand Hotspot**: View `HIGH ATTENTION` badge, 18 reports, 12 independent citizens, 6 high-priority cases, oldest open case: 8 days.
7. Click **VIEW AREA INTELLIGENCE**: Inspect `Demo Ward 12` metrics.
8. Click on an individual map marker pin popup $\rightarrow$ Click `[VIEW CASE DETAILS]`: Opens case details page with Before/After resolution proof.
