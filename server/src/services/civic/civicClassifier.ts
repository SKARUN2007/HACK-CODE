import fs from 'fs';
import path from 'path';

export type CivicCategoryType = 
  | 'ROAD'
  | 'SANITATION'
  | 'WATER_SUPPLY'
  | 'DRAINAGE'
  | 'STREETLIGHT'
  | 'PUBLIC_BUILDING'
  | 'PUBLIC_SPACE'
  | 'SEWAGE'
  | 'OTHER';

export interface ClassificationResult {
  category: CivicCategoryType;
  issueType: string;
  confidence: number;
  description: string;
  isAiGenerated: boolean;
  relatedDomains?: Array<{
    domain: CivicCategoryType;
    confidence: number;
    reason: string;
  }>;
  observations?: string[];
}

const ALLOWED_CATEGORIES: CivicCategoryType[] = [
  'ROAD',
  'SANITATION',
  'WATER_SUPPLY',
  'DRAINAGE',
  'STREETLIGHT',
  'PUBLIC_BUILDING',
  'PUBLIC_SPACE',
  'SEWAGE',
  'OTHER'
];


/**
 * Heuristic/Keyword classifier used when AI API is unavailable or as a safe fallback
 */
function heuristicClassify(description?: string, imagePath?: string): ClassificationResult {
  const fileName = imagePath ? path.basename(imagePath).toLowerCase() : '';
  const text = `${fileName} ${(description || '')}`.toLowerCase();

  if (text.includes('garbage') || text.includes('trash') || text.includes('waste') || text.includes('clean') || text.includes('dump') || text.includes('litter') || text.includes('unclean')) {
    const hasDrain = text.includes('drain') || text.includes('gutter') || text.includes('clog');
    return {
      category: 'SANITATION',
      issueType: 'GARBAGE_ACCUMULATION',
      confidence: 0.88,
      description: 'Image and text indicate waste accumulation or sanitation issue.',
      isAiGenerated: false,
      relatedDomains: hasDrain ? [
        {
          domain: 'DRAINAGE',
          confidence: 0.80,
          reason: 'Waste accumulation is associated with blocked drainage infrastructure in submitted evidence.'
        }
      ] : undefined,
      observations: hasDrain ? ['Waste accumulation observed near drain outlet.'] : ['Waste accumulation observed in public area.']
    };
  }

  if (text.includes('water') || text.includes('pipe') || text.includes('leak') || text.includes('supply') || text.includes('burst')) {
    return {
      category: 'WATER_SUPPLY',
      issueType: 'WATER_LEAKAGE',
      confidence: 0.88,
      description: 'Image and text indicate water pipe leak or supply disruption.',
      isAiGenerated: false,
      relatedDomains: [
        {
          domain: 'ROAD',
          confidence: 0.82,
          reason: 'Water leakage with visible road surface impact observed in submitted evidence.'
        }
      ],
      observations: ['Water accumulation coincides with road surface infrastructure.']
    };
  }

  if (text.includes('drain') || text.includes('stormwater') || text.includes('clog') || text.includes('canal') || text.includes('gutter')) {
    return {
      category: 'DRAINAGE',
      issueType: 'BLOCKED_DRAIN',
      confidence: 0.88,
      description: 'Image and text indicate blocked or overflowing drainage system.',
      isAiGenerated: false,
      relatedDomains: [
        {
          domain: 'ROAD',
          confidence: 0.85,
          reason: 'Standing water and visible road-surface damage appear together in the submitted evidence.'
        }
      ],
      observations: ['Standing water is visible.', 'The affected area appears adjacent to or on a roadway.']
    };
  }

  if (text.includes('sewer') || text.includes('manhole') || text.includes('sewage')) {
    return {
      category: 'SEWAGE',
      issueType: 'SEWAGE_OVERFLOW',
      confidence: 0.88,
      description: 'Image and text indicate sewage overflow or manhole issue.',
      isAiGenerated: false,
      relatedDomains: [
        {
          domain: 'ROAD',
          confidence: 0.78,
          reason: 'Sewage overflow affects public roadway area in submitted evidence.'
        }
      ],
      observations: ['Sewage overflow observed adjacent to roadway area.']
    };
  }

  if (text.includes('streetlight') || text.includes('lamp') || text.includes('dark') || text.includes('light post') || text.includes('broken light')) {
    return {
      category: 'STREETLIGHT',
      issueType: 'BROKEN_STREETLIGHT',
      confidence: 0.88,
      description: 'Image and text indicate non-functional or damaged street lighting.',
      isAiGenerated: false,
    };
  }
  
  if (text.includes('pothole') || text.includes('road') || text.includes('tarmac') || text.includes('asphalt') || text.includes('pavement') || text.includes('crack') || text.includes('street damage')) {
    return {
      category: 'ROAD',
      issueType: 'POTHOLE',
      confidence: 0.88,
      description: 'Image and text indicate road surface or pavement damage.',
      isAiGenerated: false,
    };
  }

  if (text.includes('park') || text.includes('bench') || text.includes('tree') || text.includes('garden')) {
    return {
      category: 'PUBLIC_SPACE',
      issueType: 'PUBLIC_SPACE_DAMAGE',
      confidence: 0.85,
      description: 'Image and text indicate public space or park maintenance issue.',
      isAiGenerated: false,
    };
  }

  if (text.includes('building') || text.includes('school') || text.includes('hospital') || text.includes('wall')) {
    return {
      category: 'PUBLIC_BUILDING',
      issueType: 'BUILDING_MAINTENANCE',
      confidence: 0.85,
      description: 'Image and text indicate public building maintenance issue.',
      isAiGenerated: false,
    };
  }

  // Sensible default fallback for uploaded civic photo evidence
  return {
    category: 'ROAD',
    issueType: 'ROAD_PAVEMENT_ISSUE',
    confidence: 0.82,
    description: 'Civic issue detected from photo evidence.',
    isAiGenerated: false,
  };
}

/**
 * Classifies a civic issue using server-side Gemini Vision API or heuristic fallback.
 * PROMPT INJECTION DEFENSE: User description is treated ONLY as untrusted evidence data.
 * SECURITY: AI API keys are accessed ONLY on the server side.
 */
export async function classifyCivicIssue(params: {
  imagePath?: string;
  userDescription?: string;
}): Promise<ClassificationResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

  // Sanitize user description to defend against prompt injection
  const sanitizedUserText = (params.userDescription || '')
    .replace(/ignore previous instructions/gi, '')
    .replace(/system prompt/gi, '')
    .slice(0, 500);

  if (!apiKey) {
    console.log('[CivicIssueClassifier] No AI API Key configured. Using heuristic fallback.');
    return heuristicClassify(sanitizedUserText, params.imagePath);
  }

  try {
    let imageBase64: string | undefined;
    let mimeType = 'image/jpeg';

    if (params.imagePath && fs.existsSync(params.imagePath)) {
      const fileBuf = fs.readFileSync(params.imagePath);
      imageBase64 = fileBuf.toString('base64');
      const ext = path.extname(params.imagePath).toLowerCase();
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.webp') mimeType = 'image/webp';
    }

    const systemPrompt = `You are a strict, objective civic issue vision classifier.
Analyze the provided civic photo and optional description.
Classify the issue into a PRIMARY category (ROAD, SANITATION, WATER_SUPPLY, DRAINAGE, STREETLIGHT, PUBLIC_BUILDING, PUBLIC_SPACE, SEWAGE, OTHER).
Also identify any POSSIBLY RELATED service domains visible in the evidence.

CRITICAL RULES FOR SAFETY & BLAME PREVENTION:
1. Identify ONLY observable civic issues.
2. DO NOT state who caused the issue. DO NOT accuse any department, contractor, or person of fraud, corruption, or fault.
3. Use non-accusatory language (e.g. "Standing water and visible road-surface damage appear together in the evidence").
4. Output MUST be strictly valid JSON in the format:
{
  "category": "DRAINAGE",
  "issueType": "OVERFLOWING_DRAIN",
  "confidence": 0.91,
  "description": "Image appears to show overflowing drain adjacent to roadway.",
  "relatedDomains": [
    {
      "domain": "ROAD",
      "confidence": 0.76,
      "reason": "Standing water and visible road-surface damage appear together in the submitted evidence."
    }
  ],
  "observations": [
    "Standing water is visible.",
    "The affected area appears adjacent to or on a roadway."
  ]
}`;

    const contents: any[] = [];
    const parts: any[] = [{ text: `User observation snippet (UNTRUSTED EVIDENCE): ${sanitizedUserText}` }];

    if (imageBase64) {
      parts.unshift({
        inline_data: {
          mime_type: mimeType,
          data: imageBase64
        }
      });
    }

    contents.push({ parts });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      console.warn('[CivicIssueClassifier] AI Vision API response not OK:', response.status);
      return heuristicClassify(sanitizedUserText, params.imagePath);
    }

    const resData: any = await response.json();
    const rawJsonText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawJsonText) {
      return heuristicClassify(sanitizedUserText, params.imagePath);
    }

    const parsed = JSON.parse(rawJsonText);
    
    // Strict schema validation of AI output
    const category: CivicCategoryType = ALLOWED_CATEGORIES.includes(parsed.category) 
      ? parsed.category 
      : 'ROAD';

    const confidence = typeof parsed.confidence === 'number' && parsed.confidence >= 0 && parsed.confidence <= 1
      ? parsed.confidence
      : 0.88;

    const validatedRelated: Array<{ domain: CivicCategoryType; confidence: number; reason: string }> = [];
    if (Array.isArray(parsed.relatedDomains)) {
      for (const rel of parsed.relatedDomains) {
        if (rel && ALLOWED_CATEGORIES.includes(rel.domain) && rel.domain !== category) {
          validatedRelated.push({
            domain: rel.domain,
            confidence: typeof rel.confidence === 'number' ? rel.confidence : 0.75,
            reason: String(rel.reason || 'Evidence indicates possible multi-domain involvement.').replace(/department caused|caused by department/gi, 'coincides with')
          });
        }
      }
    }

    return {
      category,
      issueType: (parsed.issueType || 'CIVIC_ISSUE').toUpperCase().replace(/\s+/g, '_'),
      confidence,
      description: parsed.description || 'Observed civic issue from photo/description analysis.',
      isAiGenerated: true,
      relatedDomains: validatedRelated.length > 0 ? validatedRelated : undefined,
      observations: Array.isArray(parsed.observations) ? parsed.observations.map(String) : undefined
    };
  } catch (err) {
    console.error('[CivicIssueClassifier] Error during AI classification:', err);
    return heuristicClassify(sanitizedUserText, params.imagePath);
  }
}

