import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../locales/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['zh-TW']) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('skymetrics_language');
      return (saved as Language) || 'zh-TW';
    }
    return 'zh-TW';
  });

  useEffect(() => {
    localStorage.setItem('skymetrics_language', language);
    // Update HTML lang attribute
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: keyof typeof translations['zh-TW']) => {
    return translations[language][key] || translations['zh-TW'][key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};