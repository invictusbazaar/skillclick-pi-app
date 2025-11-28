"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

// --- TVOJ REČNIK ---
const dictionary: any = {
  en: {
    login: "Login", register: "Register", explore: "Explore", becomeSeller: "Become a Seller",
    postService: "Post a Service", messages: "Messages", profile: "Profile", settings: "Settings",
    logout: "Log Out", totalRevenue: "Total Revenue", activeUsers: "Active Users", totalGigs: "Total Gigs",
    platformMgmt: "Platform Management", supportInbox: "Support Inbox", browseAll: "Browse All Gigs",
    postOfficial: "Post Official Gig", reply: "Reply", viewAllMessages: "View all messages",
    orderNow: "Order Now", contactSeller: "Contact Seller", standard: "Standard",
    aboutGig: "About This Gig", reviews: "Reviews", leaveReview: "Leave a Review",
    rating: "Rating", postReview: "Post Review", writeFeedback: "Write your feedback here...",
    back: "Back to Marketplace", search: "Search",
    slogan: "Find skill, pay with π.", popular: "Popular:",
    
    // Kategorije
    cat_design: "Graphics & Design", cat_marketing: "Digital Marketing", cat_writing: "Writing & Translation",
    cat_video: "Video & Animation", cat_tech: "Programming & Tech", cat_business: "Business", cat_lifestyle: "Lifestyle",
    
    // Tagovi
    tag_web: "Website Design", tag_pi: "Pi Network", tag_logo: "Logo Design"
  },
  // ... (Srpski, Kineski, Španski... zadrži one koje imaš ili dodaj) ...
  sr: {
    // ... kopiraj sve srpske prevode od ranije ...
    cat_design: "Grafika i Dizajn", cat_marketing: "Digitalni Marketing", cat_writing: "Pisanje i Prevođenje",
    cat_video: "Video i Animacija", cat_tech: "Programiranje i Tehnologija", cat_business: "Biznis", cat_lifestyle: "Životni Stil",
    tag_web: "Veb Dizajn", tag_pi: "Pi Mreža", tag_logo: "Logo Dizajn",
    // ... ostalo ...
  },
  zh: {
    // ... Kineski ...
    cat_design: "图形与设计", cat_marketing: "数字营销", cat_writing: "写作与翻译",
    cat_video: "视频与动画", cat_tech: "编程与技术", cat_business: "商业", cat_lifestyle: "生活方式",
    tag_web: "网站设计", tag_pi: "Pi 网络", tag_logo: "标志设计",
    back: "返回", slogan: "寻找技能，用 π 支付。", popular: "热门:", search: "搜索",
    // ... ostalo ...
  }
};

export const languagesList = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "sr", name: "Srpski", flag: "🇷🇸" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "id", name: "Indonesian", flag: "🇮🇩" },
];

const LanguageContext = createContext<any>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default je EN, ali ćemo probati da učitamo sačuvan
  const [lang, setLang] = useState("en");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ovo se pokreće SAMO JEDNOM kad se sajt učita
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("appLang");
      if (saved && dictionary[saved]) {
          setLang(saved);
      }
      setIsLoaded(true);
    }
  }, []);

  const changeLanguage = (code: string) => {
    setLang(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem("appLang", code); // Čuvamo zauvek
    }
  };

  const t = dictionary[lang] || dictionary["en"];

  // Dok ne učitamo jezik iz memorije, ne prikazuj ništa da ne bi "blinkalo"
  if (!isLoaded) return null; 

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t, languagesList }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);