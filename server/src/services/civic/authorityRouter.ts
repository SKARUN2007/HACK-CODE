import { CivicCategoryType } from './civicClassifier';

export interface AuthorityRecord {
  id: string;
  name: string;
  type: 'MUNICIPAL_CORPORATION' | 'PUBLIC_WORKS_DEPT' | 'WATER_BOARD' | 'ELECTRICITY_BOARD' | 'PANCHAYAT' | 'GENERAL_BODY';
  jurisdiction: string;
  city?: string;
  state: string;
  supportedCategories: CivicCategoryType[];
  submissionUrl?: string;
  contactMethod?: string;
  isDemo: boolean;
}

export interface RoutingResult {
  authority: AuthorityRecord;
  routingConfidence: number;
  explanation: string;
  isExactMatch: boolean;
}

// Configured Demo Authority Directory
export const DEMO_AUTHORITY_DIRECTORY: AuthorityRecord[] = [
  {
    id: 'auth-trichy-road-01',
    name: 'Tiruchirappalli Corporation — Engineering & Roads Department (DEMO)',
    type: 'PUBLIC_WORKS_DEPT',
    jurisdiction: 'Tiruchirappalli City Corporation',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    supportedCategories: ['ROAD', 'PUBLIC_BUILDING', 'PUBLIC_SPACE'],
    contactMethod: 'Phone: 0431-2415329 | Email: roads@trichymunicipal.gov.tn',
    submissionUrl: 'https://tnurbanepay.tn.gov.tn/',
    isDemo: true,
  },
  {
    id: 'auth-trichy-sanitation-02',
    name: 'Tiruchirappalli Corporation — Solid Waste Management & Sanitation (DEMO)',
    type: 'MUNICIPAL_CORPORATION',
    jurisdiction: 'Tiruchirappalli City Corporation',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    supportedCategories: ['SANITATION', 'SEWAGE'],
    contactMethod: 'Phone: 0431-2415330 | Email: sanitation@trichymunicipal.gov.tn',
    submissionUrl: 'https://tnurbanepay.tn.gov.tn/',
    isDemo: true,
  },
  {
    id: 'auth-trichy-water-03',
    name: 'TWAD / Trichy Corporation — Water Supply & Drainage Division (DEMO)',
    type: 'WATER_BOARD',
    jurisdiction: 'Tiruchirappalli Urban Region',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    supportedCategories: ['WATER_SUPPLY', 'DRAINAGE'],
    contactMethod: 'Phone: 0431-2415331 | Email: water@trichymunicipal.gov.tn',
    submissionUrl: 'https://tnurbanepay.tn.gov.tn/',
    isDemo: true,
  },
  {
    id: 'auth-trichy-electrical-04',
    name: 'TANGEDCO / Trichy Corporation — Street Lighting Division (DEMO)',
    type: 'ELECTRICITY_BOARD',
    jurisdiction: 'Tiruchirappalli City Corporation',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    supportedCategories: ['STREETLIGHT'],
    contactMethod: 'Toll Free: 1912 | Email: lighting@trichymunicipal.gov.tn',
    submissionUrl: 'https://tangedco.gov.tn/',
    isDemo: true,
  },
  {
    id: 'auth-thiruvallur-road-05',
    name: 'Thiruvallur District — Highways & Rural Engineering Wing (DEMO)',
    type: 'PUBLIC_WORKS_DEPT',
    jurisdiction: 'Thiruvallur District',
    city: 'Thiruvallur',
    state: 'Tamil Nadu',
    supportedCategories: ['ROAD', 'DRAINAGE'],
    contactMethod: 'Phone: 044-27660200 | Email: pwd@thiruvallur.tn.gov.tn',
    submissionUrl: 'https://thiruvallur.nic.in/',
    isDemo: true,
  },
  {
    id: 'auth-chennai-sanitation-06',
    name: 'Greater Chennai Corporation — Waste Management Dept (DEMO)',
    type: 'MUNICIPAL_CORPORATION',
    jurisdiction: 'Greater Chennai Corporation',
    city: 'Chennai',
    state: 'Tamil Nadu',
    supportedCategories: ['SANITATION', 'SEWAGE', 'PUBLIC_SPACE'],
    contactMethod: 'Helpline: 1913 | Email: solidwaste@chennaicorporation.gov.tn',
    submissionUrl: 'https://chennaicorporation.gov.tn/',
    isDemo: true,
  },
];

export const FALLBACK_GENERAL_AUTHORITY: AuthorityRecord = {
  id: 'auth-general-fallback',
  name: 'General Local Body / Civic Authority (DEMO)',
  type: 'GENERAL_BODY',
  jurisdiction: 'Local Administrative Zone',
  state: 'Tamil Nadu',
  supportedCategories: ['ROAD', 'SANITATION', 'WATER_SUPPLY', 'DRAINAGE', 'STREETLIGHT', 'PUBLIC_BUILDING', 'PUBLIC_SPACE', 'SEWAGE', 'OTHER'],
  contactMethod: 'General Civic Administration Helpline',
  isDemo: true,
};

/**
 * Deterministic Authority Routing Engine.
 * Matches issue category + location string to configured directory records.
 * LLM NEVER invents government departments.
 */
export function routeAuthority(params: {
  category: CivicCategoryType;
  locationText?: string;
  customDirectory?: AuthorityRecord[];
}): RoutingResult {
  const directory = params.customDirectory || DEMO_AUTHORITY_DIRECTORY;
  const locLower = (params.locationText || '').toLowerCase();

  // 1. Try to find exact match by city/locality AND category
  const exactMatch = directory.find((auth) => {
    const supportsCat = auth.supportedCategories.includes(params.category);
    const cityMatch = auth.city && locLower.includes(auth.city.toLowerCase());
    const jurisMatch = locLower.includes(auth.jurisdiction.toLowerCase());
    return supportsCat && (cityMatch || jurisMatch);
  });

  if (exactMatch) {
    return {
      authority: exactMatch,
      routingConfidence: 0.95,
      explanation: `Matched ${exactMatch.name} based on verified jurisdiction (${exactMatch.jurisdiction}) and domain (${params.category}).`,
      isExactMatch: true,
    };
  }

  // 2. If location mismatch, find category match in default directory
  const categoryMatch = directory.find((auth) => auth.supportedCategories.includes(params.category));

  if (categoryMatch) {
    return {
      authority: categoryMatch,
      routingConfidence: 0.80,
      explanation: `Mapped to ${categoryMatch.name} based on issue domain (${params.category}). Local jurisdiction confirmation recommended.`,
      isExactMatch: false,
    };
  }

  // 3. Fallback when authority cannot be confirmed
  return {
    authority: FALLBACK_GENERAL_AUTHORITY,
    routingConfidence: 0.50,
    explanation: 'RESPONSIBLE AUTHORITY NEEDS CONFIRMATION. Routing to general civic local body.',
    isExactMatch: false,
  };
}
