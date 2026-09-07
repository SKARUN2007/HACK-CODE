# MakkalSaantru — Cross-Department Case Detection Architecture & Technical Guide

## 1. Problem Statement
Some civic issues naturally span multiple service domains. For example:
- A leaking water pipe (`WATER_SUPPLY`) saturates asphalt and damages the roadway (`ROAD`).
- An overflowing storm drain (`DRAINAGE`) floods a street surface (`ROAD`).
- Overflowing sewage (`SEWAGE`) pollutes an adjacent roadway area (`ROAD`).
- Overflowing litter/trash (`SANITATION`) clogs an adjacent storm drain (`DRAINAGE`).

Forcing citizens to understand complex government department hierarchies or file multiple separate complaints leads to fragmented handling, duplicate site visits, and repairing road surfaces before underlying drainage/pipe issues are addressed.

---

## 2. Core Principles & Safety Rules

### 2.1 One Report Principle
- **Citizen reports ONCE** with photo, voice, description, and location.
- **The system helps identify candidate service domains.**
- **Authorized human inspectors/supervisors confirm final domain routing.**

### 2.2 Strict Non-Accusatory Safety Policy
- System output, AI vision prompts, and UI copy **NEVER blame departments or state causation**.
- **Prohibited**: *"Department X caused this damage."* or *"Failure by Water Board damaged PWD road."*
- **Allowed Terms**:
  - `PRIMARY DOMAIN` (e.g. `DRAINAGE`)
  - `POSSIBLY RELATED DOMAIN` (e.g. `ROAD`)
  - `COORDINATED REVIEW SUGGESTED`
- **Explainable Rationale Example**:
  > *"Standing water and visible road-surface damage appear together in the submitted evidence."*

---

## 3. Architecture & Data Model

### 3.1 Database Schema (`server/prisma/schema.prisma`)
- `DomainRelationship`: Stores configurable relationship rules (`primaryDomain`, `relatedDomain`, `relationshipType`, `description`, `enabled`, `minimumConfidence`).
- `CaseDomainAssignment`: Normalizes candidate and confirmed service domains attached to a single `CivicReport` (`reportId`, `domain`, `relationshipRole: PRIMARY | RELATED`, `confidence`, `reason`, `status: SUGGESTED | CONFIRMED | REJECTED`, `confirmedBy`, `confirmedAt`, `rejectionReason`, `authorityId`).
- `CaseDomainTask`: Specific domain-focused action tasks with sequential dependencies (`reportId`, `domainAssignmentId`, `domain`, `title`, `action`, `status: PENDING | IN_PROGRESS | COMPLETED | SKIPPED`, `sequence`, `dependsOnTaskId`, `assignedAuthorityId`, `assignedInspector`, `completedAt`).

---

## 4. Hybrid Detection Engine (`CrossDomainDetectionService.ts`)

`CrossDomainDetectionService` uses a hybrid four-stage approach:
1. **Deterministic Configured Rules**: Pre-configured domain co-occurrence pairs (`WATER_SUPPLY` + `ROAD`, `DRAINAGE` + `ROAD`, `SEWAGE` + `ROAD`, `SANITATION` + `DRAINAGE`, `STREETLIGHT` + `ROAD`, `PUBLIC_BUILDING` + `WATER_SUPPLY`).
2. **Structured AI & Context Analysis**: `CivicIssueClassifier` outputs `relatedDomains` and `observations` with server-side schema validation and blame-prevention sanitization.
3. **Citizen Confirmation**: Citizens confirm or adjust candidate categories during report submission without having to pick government department names.
4. **Human Authority Confirmation**: Authorized field inspectors or supervisors click `CONFIRM RELATED DOMAIN` or `REJECT RELATED DOMAIN` (or add permitted domains) with mandatory justification.

---

## 5. Sequential Action Plan & Dependency Lock

To prevent repairing a road before fixing an underlying drainage/water pipe issue, `CaseDomainTask` enforces sequential task ordering (`dependsOnTaskId`):
1. **Task 1 (Primary)**: `Drainage Review & Clearance` (`IN_PROGRESS`)
2. **Task 2 (Related)**: `Road Surface Reassessment & Patching` (`PENDING` — Dependency locked until Task 1 completes)
3. **Resolution Verification**: Reverification triggered when all confirmed tasks finish.

---

## 6. Case Resolution Rules & Partial Resolution

- **PARTIALLY ADDRESSED**: Displayed when one confirmed domain task is completed while another dependent domain task remains pending or in progress.
- **RESOLVED**: Case only transitions to `RESOLVED` when **ALL** required confirmed domain tasks are finished AND evidence verification standards are satisfied.

---

## 7. Integrations

- **Action Priority Engine**: Adds explainable +10 points bonus signal (`+ Coordinated review across two service domains`).
- **Civic Heatmap**: Filter by `CROSS-DOMAIN CASES` displaying 🧩 markers and coordinated case details.
- **Inspector Route Planner**: Displays multi-domain task breakdowns inside inspection stop cards.
- **Before → After Resolution Proof**: Tracks sequential before and after evidence per domain task.

---

## 8. Role-Based Access Control (RBAC) & Audit Logs

| User Role | Citizen Confirmation | Human Confirmation / Rejection | Task Status Updates | Authority Mapping |
| :--- | :---: | :---: | :---: | :---: |
| **Citizen** | ✅ (At Submission) | ❌ | ❌ | ❌ |
| **Inspector** | ❌ | ✅ | ✅ | ❌ |
| **Admin / Supervisor** | ❌ | ✅ | ✅ | ✅ |

### Audit Events Logged
- `CROSS_DOMAIN_DETECTED`
- `RELATED_DOMAIN_SUGGESTED`
- `RELATED_DOMAIN_CONFIRMED`
- `RELATED_DOMAIN_REJECTED`
- `RELATED_DOMAIN_MANUALLY_ADDED`
- `COORDINATED_CASE_CREATED`
- `DOMAIN_TASK_ASSIGNED`
- `DOMAIN_TASK_COMPLETED`
- `PARTIAL_RESOLUTION_RECORDED`
- `COORDINATED_CASE_RESOLVED`

---

## 9. 45-Second Judge Demo Sequence

1. **Upload Evidence**: Citizen uploads photo of overflowing drain affecting a roadway.
2. **AI & Hybrid Detection**: System identifies `PRIMARY: DRAINAGE` and suggests `POSSIBLY RELATED: ROAD` with non-accusatory rationale.
3. **Citizen Confirmation**: Citizen clicks `YES, THIS LOOKS CORRECT` (reports once).
4. **Authority Coordinated Workspace**: Executive Engineer opens case `MS-CIV-2026-142` and reviews `CROSS-DEPARTMENT INTELLIGENCE`.
5. **Human Confirmation**: Inspector confirms both domains and views `COORDINATED ACTION PLAN` (Drainage Clearance -> Road Reassessment).
6. **Partial -> Full Resolution**: Task 1 finishes -> status shows `PARTIALLY ADDRESSED`. Task 2 finishes with After Evidence -> status moves to `RESOLVED`.
7. **Closing Statement**: *"One citizen report becomes one coordinated case instead of fragmented complaints."*
