import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage, getTranslation } from '../services/i18n';
import en from '../locales/en.json';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('makkalsaantru_lang');
    return (saved === 'TA' || saved === 'EN') ? saved : 'TA'; // Default TA for Tamil Nadu portal
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('makkalsaantru_lang', lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'EN' ? 'TA' : 'EN';
    setLanguage(nextLang);
  };

  const t = (key: keyof typeof en): string => {
    return getTranslation(language, key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
