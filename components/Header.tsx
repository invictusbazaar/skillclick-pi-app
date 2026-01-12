"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { useLanguage } from './LanguageContext';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, LogOut, User, ArrowLeft, PlusCircle } from 'lucide-react';

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

  const [username, setUsername] = useState<string>("Korisnik");
  const [email, setEmail] = useState<string>("user@example.com");

  const pathname = usePathname();
  const router = useRouter();     
  const isHome = pathname === '/'; 

  const currentLang = languagesList.find(l => l.code === lang) || languagesList[1];

  // VRACENO: PC sesija
  useEffect(() => {
    if (sessionKeyProp) {
      const storedName = localStorage.getItem('user_name');
      const storedEmail = localStorage.getItem('user_email');
      
      if (storedName) setUsername(storedName);
      if (storedEmail) setEmail(storedEmail);
    }
  }, [sessionKeyProp]);

  const handleLogout = () => {
    localStorage.removeItem('sessionKey');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    window.location.href = '/'; 
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm transition-all">
      <div className="container mx-auto px-4 h-20 md:h-24 flex items-center justify-between relative">
        
        {/* LEVA STRANA */}
        <div className="flex items-center gap-2 md:gap-4 z-50">
          {!isHome && (
            <button 
              onClick={() => router.back()} 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-700 transition-all active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center group relative">
            <div className="w-10 md:w-10 h-1" />
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 transition-transform group-hover:scale-105 duration-300 pointer-events-none
                ${!isHome ? '-ml-20 md:-ml-52' : '-ml-24 md:-ml-56'}
                h-48 w-[28rem] md:h-80 md:w-[50rem]`}>
               <Image 
                 src="/skillclick_logo.png" 
                 alt="SkillClick Logo"
                 fill
                 className="object-contain object-left" 
                 priority 
               />
            </div>
          </Link>
        </div>

        {/* DESNA STRANA */}
        <div className="flex items-center gap-2 md:gap-5 z-[60] relative">
          
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 rounded-full hover:bg-gray-100 transition-colors border border-gray-200 bg-gray-50/50"
            >
              <span className="text-lg leading-none">{currentLang.label.split(' ')[0]}</span>
              <span className="font-semibold text-xs md:text-sm text-gray-700 hidden md:block">{currentLang.code.toUpperCase()}</span>
              <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 text-gray-500 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsLangOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                  {languagesList.map((l: any) => (
                    <button
                      key={l.code}
                      onClick={() => { changeLanguage(l.code); setIsLangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-purple-50 transition-colors ${lang === l.code ? 'bg-purple-50 text-purple-700 font-bold' : 'text-gray-700'}`}
                    >
                      <span className="text-lg">{l.label.split(' ')[0]}</span>
                      <span>{l.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* PC AUTH SEKCIJA - OSTAVLJENA NETAKNUTA */}
          {!sessionKeyProp ? (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <button className="text-sm font-semibold text-gray-600 hover:text-purple-600 px-4 py-2 transition-colors">
                  {t('login')}
                </button>
              </Link>
              <Link href="/register">
                <button className="text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 rounded-full shadow-md transition-all">
                  {t('register')}
                </button>
              </Link>
            </div>
          ) : (
             <div className="hidden md:flex relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold border border-purple-200"
                >
                  {username.charAt(0).toUpperCase()}
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                        <div className="px-4 py-3 border-b border-gray-50 mb-1">
                            <p className="text-sm font-bold text-gray-900">{username}</p>
                        </div>
                        <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-gray-700 hover:bg-purple-50">
                            <User className="w-4 h-4" /> Profil
                        </Link>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 font-medium">
                            <LogOut className="w-4 h-4" /> Odjavi se
                        </button>
                    </div>
                  </>
                )}
             </div>
          )}

          {/* MOBILNI DUGME */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILNI MENI (IZMENJEN) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white p-4 absolute w-full shadow-xl z-40">
           <nav className="flex flex-col gap-2">
             <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="p-3 hover:bg-purple-50 rounded-xl font-medium text-gray-700 flex items-center gap-3">
               🏠 <span className="text-gray-900">Home</span>
             </Link>
             {/* Na mobilnom ostaje samo Post a Service */}
             <Link href="/create" onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-purple-50 text-purple-700 rounded-xl font-bold flex items-center gap-3">
               <PlusCircle className="w-5 h-5" /> <span>{t('navPostService')}</span>
             </Link>
           </nav>
        </div>
      )}
    </header>
  );
}
