"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { useLanguage } from './LanguageContext';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, LogOut, User, ArrowLeft, PlusCircle, ShieldCheck } from 'lucide-react'; // Dodao ShieldCheck

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

  // Dodao sam logiku da čita korisnika iz localStorage ako sessionKeyProp nije prosleđen
  const [username, setUsername] = useState<string>("Korisnik");
  const [email, setEmail] = useState<string>("user@example.com");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const pathname = usePathname();
  const router = useRouter();     
  const isHome = pathname === '/'; 

  const currentLang = languagesList.find(l => l.code === lang) || languagesList[1];

  // AŽURIRANO: Bolja detekcija logovanja
  useEffect(() => {
    // Provera da li imamo podatke u localStorage (Bilo od Pi Auth ili Standard Auth)
    const storedUser = localStorage.getItem('user'); // Pi Auth čuva ovde
    const storedName = localStorage.getItem('user_name'); // Tvoj stari auth
    const storedEmail = localStorage.getItem('user_email');
    
    if (storedUser) {
        try {
            const parsed = JSON.parse(storedUser);
            if (parsed.username) {
                setUsername(parsed.username);
                setIsLoggedIn(true);
            }
        } catch(e) {}
    } else if (storedName) {
        setUsername(storedName);
        if (storedEmail) setEmail(storedEmail);
        setIsLoggedIn(true);
    }
  }, [sessionKeyProp]);

  const handleLogout = () => {
    localStorage.removeItem('sessionKey');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user'); // Brišemo i Pi user-a
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
             <div className="relative w-48 h-12 md:w-64 md:h-16"> 
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
          
          {/* JEZIK (Zadržano) */}
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

          {/* DESKTOP MENI */}
          {!isLoggedIn ? (
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
             <div className="hidden md:flex relative items-center gap-3">
                
                {/* ADMIN DUGME (Samo za tebe) */}
                {(username === 'Ilija1969' || username === 'admin') && (
                    <Link href="/admin">
                        <button className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-full font-bold text-xs hover:bg-red-100 transition">
                            <ShieldCheck className="w-4 h-4"/> Admin
                        </button>
                    </Link>
                )}

                <div className="relative">
                    <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold border border-purple-200 hover:bg-purple-200 transition"
                    >
                    {username.charAt(0).toUpperCase()}
                    </button>

                    {isUserMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                        <div className="absolute right-0 top-12 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                            <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                <p className="text-sm font-bold text-gray-900">{username}</p>
                                <p className="text-xs text-gray-500 truncate">{email}</p>
                            </div>
                            
                            {/* 👇 NOVO: Link ka Profilu */}
                            <Link href="/profile" onClick={() => setIsUserMenuOpen(false)}>
                                <div className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 text-gray-700 hover:bg-purple-50 transition cursor-pointer">
                                    <User className="w-4 h-4 text-purple-600" /> 
                                    <span className="font-medium">Moj Profil & Porudžbine</span>
                                </div>
                            </Link>

                            <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 text-red-600 hover:bg-red-50 font-medium transition mt-1 border-t border-gray-50">
                                <LogOut className="w-4 h-4" /> Odjavi se
                            </button>
                        </div>
                    </>
                    )}
                </div>
             </div>
          )}

          {/* MOBILNI HAMBURGER DUGME */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILNI MENI (PROŠIREN) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white p-4 absolute w-full shadow-xl z-40 rounded-b-2xl">
           <nav className="flex flex-col gap-2">
             
             {isLoggedIn && (
                 <div className="bg-purple-50 p-4 rounded-xl mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center font-bold">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{username}</p>
                            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-purple-600 font-bold underline">
                                Idi na Profil
                            </Link>
                        </div>
                    </div>
                 </div>
             )}

             <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="p-3 hover:bg-gray-50 rounded-xl font-medium text-gray-700 flex items-center gap-3">
               🏠 <span className="text-gray-900">Početna</span>
             </Link>
             
             <Link href="/create" onClick={() => setIsMobileMenuOpen(false)} className="p-3 hover:bg-gray-50 rounded-xl font-medium text-gray-700 flex items-center gap-3">
               <PlusCircle className="w-5 h-5 text-purple-600" /> <span>{t('navPostService')}</span>
             </Link>

             {/* 👇 NOVO: Link ka Profilu u mobilnom meniju */}
             {isLoggedIn && (
                 <>
                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="p-3 hover:bg-gray-50 rounded-xl font-medium text-gray-700 flex items-center gap-3">
                        <User className="w-5 h-5 text-blue-600" /> <span>Moje Porudžbine</span>
                    </Link>

                    {(username === 'Ilija1969' || username === 'admin') && (
                        <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-red-50 text-red-700 rounded-xl font-bold flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5" /> <span>Admin Panel</span>
                        </Link>
                    )}

                    <button onClick={handleLogout} className="p-3 text-red-600 font-bold flex items-center gap-3 mt-2 border-t border-gray-100">
                        <LogOut className="w-5 h-5" /> Odjavi se
                    </button>
                 </>
             )}

             {!isLoggedIn && (
                 <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-purple-600 text-white rounded-xl font-bold text-center mt-2">
                     Prijavi se
                 </Link>
             )}

           </nav>
        </div>
      )}
    </header>
  );
}
