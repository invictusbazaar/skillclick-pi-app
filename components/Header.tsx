"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { useLanguage } from './LanguageContext';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User, ArrowLeft, PlusCircle, ShieldCheck, LogOut } from 'lucide-react';

const languagesList = [
  { code: 'sr', label: '🇷🇸 SR', name: 'Srpski' },
  { code: 'en', label: '🇬🇧 EN', name: 'English' },
];

export default function Header({ sessionKeyProp }: { sessionKeyProp?: string | null }) {
  const { t, changeLanguage, lang } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Podaci o korisniku
  const [username, setUsername] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const pathname = usePathname();
  const router = useRouter();     
  const isHome = pathname === '/'; 

  // --- OVO JE KLJUČNO ZA PREPOZNAVANJE KORISNIKA NA MOBILNOM ---
  useEffect(() => {
    // 1. Provera Pi Auth podataka
    const storedUser = localStorage.getItem('user'); 
    
    // 2. Provera Standardnih podataka
    const storedName = localStorage.getItem('user_name');
    
    if (storedUser) {
        try {
            const parsed = JSON.parse(storedUser);
            if (parsed.username) {
                setUsername(parsed.username);
                setIsLoggedIn(true);
                return;
            }
        } catch(e) {}
    } 
    
    if (storedName) {
        setUsername(storedName);
        setIsLoggedIn(true);
    }
  }, [sessionKeyProp]);

  const handleLogout = () => {
    localStorage.removeItem('sessionKey');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user'); 
    window.location.href = '/'; 
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LEVO: Logo i Back dugme */}
        <div className="flex items-center gap-2 z-50">
          {!isHome && (
            <button 
              onClick={() => router.back()} 
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center">
             <div className="relative w-32 h-10"> 
               <Image 
                 src="/skillclick_logo.png" 
                 alt="SkillClick"
                 fill
                 className="object-contain object-left" 
                 priority 
               />
            </div>
          </Link>
        </div>

        {/* DESNO: Mobilni Meni Dugme (Hamburger) */}
        <div className="flex items-center gap-2">
            
            {/* Ako je ulogovan, prikaži avatar i van menija */}
            {isLoggedIn && (
                <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm border border-purple-200">
                    {username.charAt(0).toUpperCase()}
                </div>
            )}

            <button 
                className="p-2 text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>
      </div>

      {/* --- MOBILNI MENI (OVO JE DEO KOJI TE ZANIMA) --- */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-xl z-40 p-4 flex flex-col gap-2">
           
           {/* 1. INFORMACIJE O KORISNIKU */}
           {isLoggedIn ? (
               <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-2">
                   <p className="text-xs text-purple-600 font-bold uppercase mb-1">Prijavljen si kao:</p>
                   <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                       <User className="w-5 h-5"/> {username}
                   </p>
               </div>
           ) : (
               <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-yellow-800 text-sm mb-2">
                   Nisi ulogovan. Prijavi se da vidiš profil.
               </div>
           )}

           {/* 2. VELIKO DUGME: MOJ PROFIL (Ako je ulogovan) */}
           {isLoggedIn && (
               <Link 
                  href="/profile" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="bg-purple-600 text-white p-4 rounded-xl font-bold flex items-center justify-between shadow-md active:scale-95 transition-transform"
               >
                   <span className="flex items-center gap-3">
                       <User className="w-6 h-6" /> MOJ PROFIL
                   </span>
                   <span className="bg-white/20 px-2 py-1 rounded text-xs">Otvori</span>
               </Link>
           )}

           {/* 3. VELIKO DUGME: ADMIN (Samo za tebe) */}
           {(username === 'Ilija1969' || username === 'admin') && (
               <Link 
                  href="/admin" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl font-bold flex items-center gap-3 active:scale-95 transition-transform"
               >
                   <ShieldCheck className="w-6 h-6" /> ADMIN PANEL
               </Link>
           )}

           {/* 4. OSTALI LINKOVI */}
           <div className="grid grid-cols-2 gap-2 mt-2">
               <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-gray-50 rounded-xl text-center font-medium text-gray-700">
                   🏠 Početna
               </Link>
               <Link href="/create" onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-gray-50 rounded-xl text-center font-medium text-gray-700">
                   ➕ Dodaj Oglas
               </Link>
           </div>

           {/* 5. ODJAVA / PRIJAVA */}
           {isLoggedIn ? (
               <button onClick={handleLogout} className="mt-2 p-3 text-red-500 font-medium flex items-center justify-center gap-2">
                   <LogOut className="w-4 h-4"/> Odjavi se
               </button>
           ) : (
               <Link href="/login" className="mt-2 p-3 bg-gray-900 text-white rounded-xl text-center font-bold">
                   Prijavi se / Registruj se
               </Link>
           )}

        </div>
      )}
    </header>
  );
}
