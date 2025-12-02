"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('en');

  // Rečnik za sve jezike
  const translations: Record<string, Record<string, string>> = {
    en: {
      heroTitle: "Find the perfect freelance services for your business",
      heroSubtitle: "Work with talented people at the most affordable price.",
      searchPlaceholder: "What service are you looking for?",
      popularTag: "Popular:",
      adsTitle: "Popular Services",
      viewAll: "View All"
    },
    sr: {
      heroTitle: "Pronađi savršene usluge za svoj biznis",
      heroSubtitle: "Sarađuj sa talentovanim ljudima po najboljim cenama.",
      searchPlaceholder: "Koju uslugu tražiš?",
      popularTag: "Popularno:",
      adsTitle: "Popularne Usluge",
      viewAll: "Pogledaj sve"
    },
    hi: { // Hindu
      heroTitle: "Apne vyavasaya ke liye behtarin freelance sevayein khojein",
      heroSubtitle: "Sabse kifayati daamo par pratibhashali logon ke saath kaam karein.",
      searchPlaceholder: "Aap kis seva ki talash kar rahe hain?",
      popularTag: "Lokpriya:",
      adsTitle: "Lokpriya Sevayein",
      viewAll: "Sabhi Dekhein"
    },
    zh: { // Kineski (Simplified)
      heroTitle: "为您的业务寻找完美的自由职业服务",
      heroSubtitle: "以最实惠的价格与才华横溢的人才合作。",
      searchPlaceholder: "您在寻找什么服务？",
      popularTag: "热门:",
      adsTitle: "热门服务",
      viewAll: "查看全部"
    },
    tw: { // Tajvanski (Traditional)
      heroTitle: "為您的業務尋找完美的自由職業服務",
      heroSubtitle: "以最實惠的價格與才華橫溢的人才合作。",
      searchPlaceholder: "您在尋找什麼服務？",
      popularTag: "熱門:",
      adsTitle: "熱門服務",
      viewAll: "查看全部"
    },
    id: { // Indonežanski
      heroTitle: "Temukan layanan freelance yang sempurna untuk bisnis Anda",
      heroSubtitle: "Bekerja dengan orang-orang berbakat dengan harga paling terjangkau.",
      searchPlaceholder: "Layanan apa yang Anda cari?",
      popularTag: "Populer:",
      adsTitle: "Layanan Populer",
      viewAll: "Lihat Semua"
    }
  };

  const t = (key: string) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return { language: 'en', setLanguage: () => {}, t: (key: string) => key };
  }
  return context;
};