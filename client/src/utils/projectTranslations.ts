import { SupportedLanguage } from '../services/i18n';
import { Project } from '../types';

export function getCategoryLabel(category: string, lang: SupportedLanguage): string {
  if (lang !== 'TA') {
    return category.replace('_', ' ');
  }

  switch (category.toUpperCase()) {
    case 'ROAD':
      return 'சாலைப் பணி';
    case 'WATER':
      return 'குடிநீர் திட்டம்';
    case 'STREETLIGHT':
      return 'தெருவிளக்கு';
    case 'SANITATION':
      return 'சுகாதாரம்';
    case 'PUBLIC_BUILDING':
      return 'பொதுக் கட்டிடம்';
    default:
      return category;
  }
}

export function getReportedStatusLabel(progress: number, lang: SupportedLanguage): string {
  if (lang === 'TA') {
    return `${progress}% அறிவிக்கப்பட்டது`;
  }
  return `${progress}% Reported`;
}

export function getTranslatedProject<T extends Project>(project: T, lang: SupportedLanguage): T {
  if (!project) return project;

  // Clean English Title (removing (DEMO) clutter in EN view as well)
  const cleanEnTitle = project.title ? project.title.replace(/\s*\(DEMO\)/gi, '') : '';

  if (lang !== 'TA') {
    return {
      ...project,
      title: cleanEnTitle,
    };
  }

  // Tamil Translations Lookup by Project ID or Title pattern
  let titleTa = cleanEnTitle;
  let locationTa = project.location;
  let descriptionTa = project.description;

  if (project.id === 'proj-demo-1' || cleanEnTitle.toLowerCase().includes('village road')) {
    titleTa = 'கிராமச் சாலை மேம்பாட்டுத் திட்டம்';
    locationTa = 'திருமழிசை பஞ்சாயத்து, திருவள்ளூர் மாவட்டம், தமிழ்நாடு';
    descriptionTa = '4.2 கி.மீ கிராம இணைப்புச் சாலையில் தார்ச்சாலை மற்றும் மழைநீர் வடிகால் பக்கச்சுவர் அமைக்கும் பணி.';
  } else if (project.id === 'proj-demo-2' || cleanEnTitle.toLowerCase().includes('drinking water')) {
    titleTa = 'சமுதாயக் குடிநீர் சுத்திகரிப்புத் திட்டம்';
    locationTa = 'பென்னாகரம் கிராமம், தருமபுரி மாவட்டம், தமிழ்நாடு';
    descriptionTa = 'மேல்நிலை நீர்த்தேக்கத் தொட்டி, RO சுழல்முறை நீர் சுத்திகரிப்பு ஆலை மற்றும் குடிநீர் குழாய் பதிக்கும் பணி.';
  } else if (project.id === 'proj-demo-3' || cleanEnTitle.toLowerCase().includes('streetlight')) {
    titleTa = 'தானியங்கி தெருவிளக்கு அமைக்கும் திட்டம்';
    locationTa = 'வார்டு 12, திண்டுக்கல் நகராட்சி, தமிழ்நாடு';
    descriptionTa = 'முக்கியச் சாலைப் பகுதியில் 120 தானியங்கி சோலார் எல்.இ.டி தெருவிளக்குகள் அமைக்கும் பணி.';
  } else if (project.id === 'proj-demo-4' || cleanEnTitle.toLowerCase().includes('sanitation')) {
    titleTa = 'சமுதாயச் சுகாதார வளாகத் திட்டம்';
    locationTa = 'சிறுமுகை பேரூர், கோயம்புத்தூர் மாவட்டம், தமிழ்நாடு';
    descriptionTa = 'தொடர் நீர் வசதி மற்றும் உயிர்-செரிமான தொட்டியுடன் கூடிய 8 நவீன சுகாதார வளாகக் கட்டுமானம்.';
  } else if (project.id === 'proj-demo-5' || cleanEnTitle.toLowerCase().includes('school')) {
    titleTa = 'அரசுப் பள்ளி கட்டடப் புனரமைப்புத் திட்டம்';
    locationTa = 'ஒரத்தநாடு வட்டம், தஞ்சாவூர் மாவட்டம், தமிழ்நாடு';
    descriptionTa = 'பள்ளி மேற்கூரை நீர்க்கசிவுத் தடுப்பு, கணினி வகுப்பறை மின் இணைப்பு மற்றும் ஆய்வகச் சீரமைப்புப் பணி.';
  }

  return {
    ...project,
    title: titleTa,
    location: locationTa,
    description: descriptionTa,
  };
}
