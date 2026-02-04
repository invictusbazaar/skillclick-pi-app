"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { useLanguage } from './LanguageContext';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, LogOut, User, ArrowLeft, PlusCircle, ShieldCheck, Home } from 'lucide-react';

const languagesList = [
  { code: 'sr', label: '🇷🇸 SR', name: 'Srpski' },
  { code: 'en', label: '🇬🇧 EN', name: 'English' },
  { code: 'zh', label: '🇨🇳 ZH', name: '中文' },
  { code: 'hi', label: '🇮🇳 HI', name: 'Hindi' },
  { code: 'th', label: '🇹🇭 TH', name: 'ไทย' },
  { code: 'vi', label: '🇻🇳 VI', name: 'Tiếng Việt' },
];

export default function Header({ sessionKeyProp }: { sessionKeyProp?: string | null }) {
  const { t, changeLanguage, lang } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Korisnički podaci
  const [username, setUsername] = useState<string>("Korisnik");
  const [email, setEmail] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const pathname = usePathname();
  const router = useRouter();     
  const isHome = pathname === '/'; 

  const currentLang = languagesList.find(l => l.code === lang) || languagesList[1];

  // --- PREVODI ZA PROFIL (Da ne moraš da menjaš dictionary fajlove sad) ---
  const labels: any = {
    profile: { sr: 'Moj Profil', en: 'My Profile', zh: '我的个人资料', hi: 'meri profile', th: 'โปรไฟล์ของฉัน', vi: 'Hồ sơ của tôi' },
    admin: { sr: 'Admin Panel', en: 'Admin Panel', zh: '管理面板', hi: 'Admin Panel', th: 'แผงผู้ดูแล', vi: 'Bảng quản trị' },
    logout: { sr: 'Odjavi se', en: 'Log Out', zh: '登出', hi: 'Log Out', th: 'ออกจากระบบ', vi: 'Đăng xuất' },
    hello: { sr: 'Zdravo', en: 'Hello', zh: '你好', hi: 'Namaste', th: 'สวัสดี', vi: 'Xin chào' }
  };

  // Helper funkcija za prevod
  const txt = (key: string) => labels[key][lang] || labels[key]['en'];

  // --- DETEKCIJA KORISNIKA ---
  useEffect(() => {
    const checkUser = () => {
        // 1. Provera Pi Auth (JSON objekat)
        const storedUser = localStorage.getItem('user'); 
        // 2. Provera Standard Auth (Stringovi)
        const storedName = localStorage.getItem('user_name');
        const storedEmail = localStorage.getItem('user_email');
        
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed.username) {
                    setUsername(parsed.username);
                    if(parsed.email) setEmail(parsed.email);
                    setIsLoggedIn(true);
                    return;
                }
            } catch(e) {}
        } 
        
        if (storedName) {
            setUsername(storedName);
            if (storedEmail) setEmail(storedEmail);
            setIsLoggedIn(true);
        }
    };

    checkUser();
    // Osluškujemo promene (ako se uloguješ u drugom tabu)
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, [sessionKeyProp]);

  const handleLogout = () => {
    localStorage.removeItem('sessionKey');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user'); 
    window.location.href = '/'; 
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm transition-all">
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between relative">
        
        {/* LEVO: Logo i Back */}
        <div className="flex items-center gap-2 md:gap-4 z-50">
          {!isHome && (
            <button onClick={() => router.back()} className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-purple-100 text-gray-600 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="relative w-36 h-10 md:w-48 md:h-12">
               <Image src="/skillclick_logo.png" alt="SkillClick" fill className="object-contain object-left" priority />
          </Link>
        </div>

        {/* DESNO: Kontrole */}
        <div className="flex items-center gap-2 md:gap-4 z-[60]">
          
          {/* Jezik */}
          <div className="relative">
            <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-gray-100 border border-gray-200 bg-gray-50">
              <span className="text-lg leading-none">{currentLang.label.split(' ')[0]}</span>
              <span className="hidden md:block text-xs font-bold text-gray-600">{currentLang.code.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            {isLangOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setIsLangOpen(false)} />
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden">
                  {languagesList.map((l: any) => (
                    <button key={l.code} onClick={() => { changeLanguage(l.code); setIsLangOpen(false); }} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-purple-50 ${lang === l.code ? 'font-bold text-purple-700 bg-purple-50' : 'text-gray-700'}`}>
                      <span>{l.label.split(' ')[0]}</span> {l.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* DESKTOP Meni (PC) */}
          <div className="hidden md:flex items-center gap-3">
             {!isLoggedIn ? (
                <Link href="/login"><button className="text-sm font-bold text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-full transition">{t('login')}</button></Link>
             ) : (
                <div className="relative">
                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold border border-purple-200 hover:shadow-md transition">
                        {username.charAt(0).toUpperCase()}
                    </button>
                    {isUserMenuOpen && (
                        <>
                            <div className="fixed inset-0" onClick={() => setIsUserMenuOpen(false)} />
                            <div className="absolute right-0 top-12 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                    <p className="text-xs text-gray-500">{txt('hello')},</p>
                                    <p className="text-sm font-bold text-gray-900">{username}</p>
                                </div>
                                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2"><User className="w-4 h-4"/> {txt('profile')}</Link>
                                {(username === 'Ilija1969' || username === 'admin') && (
                                    <Link href="/admin" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> {txt('admin')}</Link>
                                )}
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"><LogOut className="w-4 h-4"/> {txt('logout')}</button>
                            </div>
                        </>
                    )}
                </div>
             )}
          </div>

          {/* MOBILNI MENI DUGME */}
          <button className="md:hidden p-2 text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* --- MOBILNI MENI (OVO JE GLAVNO ZA TEBE) --- */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-2xl z-40 p-4 rounded-b-2xl animate-in slide-in-from-top-5">
           
           {isLoggedIn && (
               <div className="bg-purple-50 p-4 rounded-xl mb-4 flex items-center gap-3 border border-purple-100">
                   <div className="w-12 h-12 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center font-bold text-xl shadow-sm">
                       {username.charAt(0).toUpperCase()}
                   </div>
                   <div>
                       <p className="text-xs text-purple-600 font-bold uppercase">{txt('hello')},</p>
                       <p className="font-bold text-gray-900 text-lg">{username}</p>
                   </div>
               </div>
           )}

           <nav className="flex flex-col gap-2">
             <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition">
               <Home className="w-5 h-5 text-gray-400" /> Početna
             </Link>

             <Link href="/create" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition">
               <PlusCircle className="w-5 h-5 text-purple-500" /> {t('navPostService')}
             </Link>

             {/* 👇 NOVO DUGME ZA PROFIL (JEZIČKI PODRŽANO) */}
             {isLoggedIn && (
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 font-bold text-white bg-purple-600 rounded-xl shadow-md my-1 hover:bg-purple-700 transition">
                    <User className="w-5 h-5" /> {txt('profile')}
                </Link>
             )}

             {/* ADMIN */}
             {(isLoggedIn && (username === 'Ilija1969' || username === 'admin')) && (
                 <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 font-bold text-red-600 bg-red-50 rounded-xl mt-1 border border-red-100">
                    <ShieldCheck className="w-5 h-5" /> {txt('admin')}
                 </Link>
             )}

             {/* ODJAVA */}
             {isLoggedIn ? (
                 <button onClick={handleLogout} className="flex items-center gap-3 p-3 font-medium text-gray-500 hover:text-red-600 mt-2 border-t border-gray-100 transition">
                    <LogOut className="w-5 h-5" /> {txt('logout')}
                 </button>
             ) : (
                 <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-gray-900 text-white rounded-xl text-center font-bold mt-2 shadow-lg">
                     {t('login')}
                 </Link>
             )}
           </nav>
        </div>
      )}
    </header>
  );
}
