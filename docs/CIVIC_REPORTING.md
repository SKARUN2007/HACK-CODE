# MakkalSaantru — Civic Issue Reporting Module

## 1. Overview & Purpose
Ordinary citizens frequently encounter civic problems (e.g., potholes, waste accumulation, pipe leaks, broken streetlights) but lack the technical or administrative knowledge to identify:
- Which department handles the specific issue
- How to draft a formal structured complaint
- Where to direct the complaint for action

**MakkalSaantru — Report A Civic Issue** provides an AI-assisted, geotagged, zero-knowledge workflow that translates citizen photos and descriptions into structured formal complaints routed to configured authority directories.

---

## 2. Workflow Pipeline

```
  TAKE / UPLOAD PHOTO
          ↓
  CAPTURE LOCATION (GPS / Text)
          ↓
  AI-ASSISTED ISSUE DETECTION (Gemini Vision / Heuristic Fallback)
          ↓
  CLASSIFY CIVIC DOMAIN (ROAD, SANITATION, WATER, DRAINAGE, STREETLIGHT, etc.)
          ↓
  IDENTIFY LIKELY RESPONSIBLE AUTHORITY (Deterministic Directory Match)
          ↓
  CITIZEN CONFIRMS / OVERRIDES CATEGORY
          ↓
  GENERATE FORMAL COMPLAINT (Internal MS-CIV-2026-XXXXX Report ID)
          ↓
  CITIZEN REVIEWS & OUTPUTS (Copy / Print / Download Complaint PDF)
```

---

## 3. Civic Domains & Categories
The classifier categorizes observable civic issues into 9 supported domains:
- **ROAD**: Pothole, road surface damage, traffic obstruction.
- **SANITATION**: Garbage accumulation, waste overflow, unclean public space.
- **WATER_SUPPLY**: Water pipe leak, supply disruption.
- **DRAINAGE**: Blocked drain, stormwater overflow.
- **STREETLIGHT**: Broken streetlight, non-functional lamp post.
- **PUBLIC_BUILDING**: Visible structural damage, maintenance issue.
- **PUBLIC_SPACE**: Damaged park bench, public space maintenance.
- **SEWAGE**: Sewage overflow, broken manhole.
- **OTHER**: Unclassified civic issue requiring manual review.

---

## 4. AI Issue Classifier & Safety Controls
- **Vision Model**: Gemini 1.5 Vision API (called strictly server-side).
- **Prompt Injection Defense**: User descriptions are treated strictly as untrusted evidence data and sanitized against prompt injection attempts.
- **Safety Boundaries**: The classifier identifies *only observable physical issues*. It NEVER infers who caused an issue, NEVER makes accusations of corruption, and NEVER performs facial recognition or personal identification.
- **AI Fallback**: If AI vision keys are unconfigured or external API calls fail, the system transitions gracefully to heuristic keyword matching or manual category selection ("Automatic identification is unavailable. Please choose the closest category."). AI results are never fabricated.

---

## 5. Authority Directory & Routing Engine
- **Deterministic Directory**: Mappings are derived strictly from configured `AuthorityDirectory` records (e.g., Tiruchirappalli Corporation Roads Dept, Solid Waste Mgmt, TANGEDCO Street Lighting).
- **LLM Boundary**: Large Language Models DO NOT invent government departments.
- **Routing Logic**: Matches `Category + Location (Jurisdiction)` against active directory records.
- **Fallback**: Unmapped cases fall back to "General Local Body / Civic Authority" with explicit notice: `RESPONSIBLE AUTHORITY NEEDS CONFIRMATION`.

---

## 6. Formal Complaint Generation & Watermarking
- **Report Code**: Internal MakkalSaantru ID generated as `MS-CIV-2026-XXXXX`.
- **Neutral Tone**: Dynamic template uses formal, non-accusatory language in English or Tamil.
- **Evidence Integrity**: Includes server-computed SHA-256 evidence fingerprint.
- **PDF Export**: Generates printable PDF documents featuring MakkalSaantru official seals and `HACKATHON PROTOTYPE` watermark.

---

## 7. Government Submission & Disclaimers
- **Strict Integrity**: The platform DOES NOT simulate or fake government submission APIs.
- **Clear Labeling**: Reports are marked `READY_FOR_SUBMISSION` with the notice:
  > *"Direct authority submission requires an authorized government portal integration."*

---

## 8. Offline & Privacy Architecture
- **IndexedDB Queue**: Offline captures are saved locally under `pending_civic_reports` with status `CIVIC_REPORT_PENDING_SYNC`.
- **Background Sync**: Automatic synchronization resumes when internet connectivity is restored.
- **Privacy Enforcement**: PII (emails, phone numbers) is omitted from generated complaint drafts unless explicitly provided by the citizen.
