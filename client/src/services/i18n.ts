import en from '../locales/en.json';
import ta from '../locales/ta.json';

export type SupportedLanguage = 'EN' | 'TA';

const dictionaries = {
  EN: en,
  TA: ta,
};

export function getTranslation(lang: SupportedLanguage, key: keyof typeof en): string {
  const dict = dictionaries[lang] || dictionaries.EN;
  return (dict as any)[key] || (en as any)[key] || key;
}
