import React, { createContext, useContext, useState, useEffect } from 'react';
import { languageService, SUPPORTED_LANGUAGES, SupportedLanguage } from '../services/languageService';
import { translate } from '../services/translations';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
  supportedLanguages: SupportedLanguage[];
  currentLanguageObj: SupportedLanguage;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => languageService.getCurrentLanguage());

  useEffect(() => {
    // Initialize service on mount (clears unwanted rogue cookies and syncs with stored selection)
    languageService.init();

    // Listen for external or internal language change events
    const handleLangChange = (e: any) => {
      if (e.detail?.language) {
        setLanguageState(e.detail.language);
      }
    };

    window.addEventListener('floodguard:languageChanged', handleLangChange);
    return () => {
      window.removeEventListener('floodguard:languageChanged', handleLangChange);
    };
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    languageService.setLanguage(lang);
  };

  const t = (key: string, fallback?: string): string => {
    return translate(key, language, fallback);
  };

  const currentLanguageObj = 
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
        currentLanguageObj,
      }}
    >
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
