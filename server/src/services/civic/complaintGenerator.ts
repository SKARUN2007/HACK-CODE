import { CivicCategoryType } from './civicClassifier';
import { AuthorityRecord } from './authorityRouter';

export interface ComplaintData {
  reportCode: string;
  category: CivicCategoryType;
  issueType: string;
  locationText: string;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  authority: AuthorityRecord;
  evidenceHash?: string | null;
  createdAt: Date;
  language?: 'en' | 'ta';
}

/**
 * Generates internal MakkalSaantru Report ID: MS-CIV-2026-XXXXX
 */
export function generateReportCode(counter: number = Math.floor(1000 + Math.random() * 9000)): string {
  const year = new Date().getFullYear();
  const pad = String(counter).padStart(5, '0');
  return `MS-CIV-${year}-${pad}`;
}

/**
 * ComplaintGeneratorService
 * Generates neutral, formal complaints in English or Tamil.
 * Does NOT include legal accusations or corruption claims.
 */
export function generateFormalComplaint(data: ComplaintData): string {
  const lang = data.language || 'en';
  const formattedDate = new Date(data.createdAt).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const locationDisplay = data.locationText || (data.latitude && data.longitude ? `GPS (${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)})` : 'Location Not Specified');

  const categoryMapTA: Record<string, string> = {
    ROAD: 'சாலைப் பராமரிப்பு',
    SANITATION: 'சுகாதாரம் மற்றும் கழிவு மேலாண்மை',
    WATER_SUPPLY: 'குடிநீர் விநியோகம்',
    DRAINAGE: 'வடிகால் மற்றும் சாக்கடை',
    STREETLIGHT: 'தெருவிளக்கு பராமரிப்பு',
    PUBLIC_BUILDING: 'பொதுக் கட்டிடம்',
    PUBLIC_SPACE: 'பொது இடம்',
    SEWAGE: 'கழிவுநீர் சுத்திகரிப்பு',
    OTHER: 'பொதுக் குடிமைப் பிரச்சினை',
  };

  const categoryDisplay = lang === 'ta' ? (categoryMapTA[data.category] || data.category) : data.category;

  if (lang === 'ta') {
    return `தேதி: ${formattedDate}
அறிக்கை ஐடி: ${data.reportCode} (MAKKALSAANTRU REPORT ID)

பெறுநர்:
${data.authority.name}
${data.authority.jurisdiction}, ${data.authority.state}

பொருள்: ${locationDisplay} பகுதியில் ${categoryDisplay} தொடர்பான குடிமைப் பிரச்சினையை ஆய்வு செய்யக் கோரிக்கை

மதிப்பிற்குரிய அய்யா / அம்மா,

${locationDisplay} அமைவிடத்தில் கவனிக்கப்பட்ட ${categoryDisplay} சார்ந்த குடிமைப் பிரச்சினை குறித்து இந்த அறிக்கையின் மூலம் தங்களின் கவனத்திற்குக் கொண்டுவருகிறேன்.

பிரச்சினையின் விவரங்கள்:
• அறிக்கை எண்: ${data.reportCode}
• பிரிவு: ${categoryDisplay} (${data.category})
• பிரச்சினையின் வகை: ${data.issueType}
• இடம்: ${locationDisplay}
• சமர்ப்பிக்கப்பட்ட தேதி: ${formattedDate}
${data.description ? `• குடிமக்களின் கவனிப்பு: ${data.description}` : ''}

சம்பந்தப்பட்ட அதிகாரி குறிப்பிடப்பட்டுள்ள இடத்தை நேரில் ஆய்வு செய்து, தேவையான தகுந்த நடவடிக்கைகளை எடுக்குமாறு தாழ்மையுடன் கேட்டுக்கொள்கிறேன்.

இதனுடன் சான்றாகப் புகைப்படம் / சான்று கைரேகை (${data.evidenceHash ? data.evidenceHash.substring(0, 16) + '...' : 'பதிவுசெய்யப்பட்டது'}) இணைக்கப்பட்டுள்ளது.

நன்றி.

இங்ஙனம்,
மக்கள்சான்று குடிமக்கள் சேவை போர்ட்டல் வழியே பெறப்பட்டது.
(குறிப்பு: இது ஒரு ஹேக்கத்தான் மாதிரி தயாரிப்பு அறிக்கை. அதிகாரப்பூர்வ அரசமட்டச் சமர்ப்பிப்புக்கு அதிகாரப்பூர்வ போர்ட்டல் இணைப்பு தேவை.)`;
  }

  // Default English Formal Complaint
  return `Date: ${formattedDate}
MAKKALSAANTRU REPORT ID: ${data.reportCode}

To:
${data.authority.name}
${data.authority.jurisdiction}, ${data.authority.state}

Subject: Request for Inspection of ${data.category} Issue at ${locationDisplay}

Respected Sir/Madam,

I would like to report a ${data.category.toLowerCase().replace(/_/g, ' ')}-related civic issue observed at ${locationDisplay}.

Issue Summary:
• MakkalSaantru Report ID: ${data.reportCode}
• Issue Category: ${data.category}
• Issue Type: ${data.issueType}
• Location: ${locationDisplay}
• Date Reported: ${formattedDate}
${data.description ? `• Citizen Observation: ${data.description}` : ''}

I kindly request the concerned authority to inspect the reported location and take appropriate action where required.

Supporting photographic evidence reference (${data.evidenceHash ? data.evidenceHash.substring(0, 16) + '...' : 'Recorded'}) has been attached to this report.

Thank you.

Generated via MakkalSaantru Citizen Platform.
(Note: This is a hackathon prototype report. Direct authority submission requires an authorized integration.)`;
}
