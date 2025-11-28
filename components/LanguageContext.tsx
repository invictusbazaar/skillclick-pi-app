"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

// --- REČNIK ---
const dictionary: any = {
  en: {
    login: "Login", register: "Register", explore: "Explore", becomeSeller: "Become a Seller",
    postService: "Post a Service", messages: "Messages", profile: "Profile", settings: "Settings",
    logout: "Log Out", search: "Search", back: "Back",
    totalRevenue: "Total Revenue", activeUsers: "Active Users", totalGigs: "Total Gigs",
    platformMgmt: "Platform Management", supportInbox: "Support Inbox",
    browseAll: "Browse All Gigs", postOfficial: "Post Official Gig", reply: "Reply", viewAllMessages: "View all messages",
    standard: "Standard", orderNow: "Order Now", contactSeller: "Contact Seller",
    aboutGig: "About This Gig", delivery: "Delivery", securePayment: "Secure Pi Payment",
    reviews: "Reviews", leaveReview: "Leave a Review", rating: "Rating",
    postReview: "Post Review", writeFeedback: "Write your feedback here...",
    chatWith: "Chat with", typeMessage: "Type a message...", send: "Send",
    online: "Online", lastSeen: "Last seen recently",
    websiteDesign: "Website Design", logoDesign: "Logo Design",
    slogan: "Find skill, pay with π.",
    popularServices: "Popular Services"
  },
  sr: {
    login: "Prijavi se", register: "Registruj se", explore: "Istraži", becomeSeller: "Postani Prodavac",
    postService: "Objavi Uslugu", messages: "Poruke", profile: "Profil", settings: "Podešavanja",
    logout: "Odjavi se", search: "Traži", back: "Nazad",
    totalRevenue: "Ukupna Zarada", activeUsers: "Aktivni Korisnici", totalGigs: "Ukupno Oglasa",
    platformMgmt: "Upravljanje Platformom", supportInbox: "Podrška Inbox",
    browseAll: "Pregledaj Sve", postOfficial: "Objavi Zvanični Oglas", reply: "Odgovori", viewAllMessages: "Vidi sve poruke",
    standard: "Standardno", orderNow: "Naruči Odmah", contactSeller: "Kontaktiraj Prodavca",
    aboutGig: "O Ovoj Usluzi", delivery: "Isporuka", securePayment: "Sigurno Pi Plaćanje",
    reviews: "Recenzije", leaveReview: "Ostavi Recenziju", rating: "Ocena",
    postReview: "Objavi", writeFeedback: "Napiši utisak...",
    chatWith: "Razgovor sa", typeMessage: "Napiši poruku...", send: "Pošalji",
    online: "Na mreži", lastSeen: "Viđen nedavno",
    websiteDesign: "Veb Dizajn", logoDesign: "Logo Dizajn",
    slogan: "Pronađite veštinu, platite π-jem.",
    popularServices: "Popularne Usluge"
  },
  zh: { login: "登录", register: "注册", orderNow: "立即订购", contactSeller: "联系卖家", messages: "消息", explore: "探索", becomeSeller: "成为卖家", slogan: "寻找技能，用 π 支付。", popularServices: "热门服务" },
  es: { login: "Acceso", register: "Registro", orderNow: "Ordenar ahora", contactSeller: "Contactar al vendedor", messages: "Mensajes", explore: "Explorar", becomeSeller: "Convertirse en vendedor", slogan: "Encuentra habilidad, paga con π.", popularServices: "Servicios Populares" },
  vi: { login: "Đăng nhập", register: "Đăng ký", orderNow: "Đặt hàng ngay", contactSeller: "Liên hệ người bán", messages: "Tin nhắn", explore: "Khám phá", becomeSeller: "Trở thành người bán", slogan: "Tìm kỹ năng, trả bằng π.", popularServices: "Dịch vụ phổ biến" },
  hi: { login: "लॉग इन", register: "पंजीकरण", orderNow: "अभी ऑर्डर करें", contactSeller: "विक्रेता से संपर्क करें", messages: "संदेश", explore: "अन्वेषण", becomeSeller: "विक्रेता बनें", slogan: "कौशल ढूंढें, π के साथ भुगतान करें।", popularServices: "लोकप्रिय सेवाएं" },
  id: { login: "Masuk", register: "Daftar", orderNow: "Pesan Sekarang", contactSeller: "Hubungi Penjual", messages: "Pesan", explore: "Jelajahi", becomeSeller: "Jadi Penjual", slogan: "Temukan keahlian, bayar dengan π.", popularServices: "Layanan Populer" },
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

// FIX: DEFAULT VREDNOST UMESTO NULL
// Ovo sprečava pucanje build-a
const defaultContextValue = {
    lang: "en",
    changeLanguage: (code: string) => {},
    t: dictionary.en,
    languagesList: languagesList
};

const LanguageContext = createContext<any>(defaultContextValue);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    // Provera da li smo u browseru pre pristupa localStorage
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem("appLang");
        if (saved) setLang(saved);
    }
  }, []);

  const changeLanguage = (code: string) => {
    setLang(code);
    if (typeof window !== 'undefined') {
        localStorage.setItem("appLang", code);
    }
  };

  // Spajanje prevoda (fallback na EN)
  const t = { ...dictionary["en"], ...dictionary[lang] };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t, languagesList }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);