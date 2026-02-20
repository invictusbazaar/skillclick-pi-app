"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { useLanguage } from './LanguageContext';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User, ArrowLeft, PlusCircle, ShieldCheck, LogOut, Home } from 'lucide-react';

const languagesList = [
  { code: 'sr', label: '🇷🇸 SR', name: 'Srpski' },
  { code: 'en', label: '🇬🇧 EN', name: 'English' },
];

export default function Header({ sessionKeyProp }: { sessionKeyProp?: string | null }) {
  const { t, changeLanguage, lang } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Podaci o korisniku
  const [username, setUsername] = useState<string>("Korisnik");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const pathname = usePathname();
  const router = useRouter();     
  const isHome = pathname === '/'; 

  // --- OČITAVANJE KORISNIKA ---
  useEffect(() => {
    const checkUser = () => {
        const storedUser = localStorage.getItem('user'); 
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
    };
    checkUser();
  }, [sessionKeyProp]);

  const handleLogout = () => {
    localStorage.removeItem('sessionKey');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user'); 
    window.location.href = '/'; 
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LEVO: Logo */}
        <div className="flex items-center gap-2">
          {!isHome && (
            <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-full text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Link href="/" className="relative w-32 h-10"> 
             <Image src="/skillclick_logo.png" alt="Logo" fill className="object-contain object-left" priority />
          </Link>
        </div>

        {/* DESNO: Hamburger (Tri crtice) */}
        <div className="flex items-center gap-2">
            
            {/* Prikazujemo avatar i van menija ako je ulogovan */}
            {isLoggedIn && (
                <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm border border-purple-200">
                    {username.charAt(0).toUpperCase()}
                </div>
            )}

            <button 
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
        </div>
      </div>

      {/* --- OVO JE MENI KOJI SE OTVARA NA TRI CRTICE --- */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 right-0 w-full md:w-80 bg-white border-b border-gray-200 shadow-2xl z-50 p-4 rounded-b-2xl">
           
           {/* 1. Header Menija */}
           {isLoggedIn && (
               <div className="bg-purple-50 p-3 rounded-xl mb-3 flex items-center gap-3 border border-purple-100">
                   <div className="w-10 h-10 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center font-bold">
                       {username.charAt(0).toUpperCase()}
                   </div>
                   <div>
                       <p className="text-xs text-purple-500 font-bold uppercase">Zdravo,</p>
                       <p className="font-bold text-gray-900">{username}</p>
                   </div>
               </div>
           )}

           <nav className="flex flex-col gap-1">
             
             <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
               <Home className="w-5 h-5 text-gray-400" /> Nazad na početnu
             </Link>

             <Link href="/create" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
               <PlusCircle className="w-5 h-5 text-purple-500" /> Objavi Uslugu
             </Link>

             {/* MOJ PROFIL - Istaknuto dugme */}
             {isLoggedIn && (
                <Link 
                    href="/profile" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="flex items-center gap-3 p-3 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm my-1"
                >
                    <User className="w-5 h-5" /> MOJ PROFIL
                </Link>
             )}

             {/* Admin Panel (Samo za tebe) */}
             {(isLoggedIn && (username === 'Ilija1969' || username === 'admin')) && (
                 <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 font-bold text-red-600 bg-red-50 rounded-xl mt-1 border border-red-100">
                    <ShieldCheck className="w-5 h-5" /> Admin Panel
                 </Link>
             )}

             {/* Odjava */}
             {isLoggedIn ? (
                 <button onClick={handleLogout} className="flex items-center gap-3 p-3 font-medium text-gray-400 hover:text-red-500 mt-2 border-t border-gray-100">
                    <LogOut className="w-5 h-5" /> Odjavi se
                 </button>
             ) : (
                 <Link href="/login" className="p-3 bg-gray-900 text-white rounded-xl text-center font-bold mt-2">
                     Prijavi se
                 </Link>
             )}

           </nav>
        </div>
      )}
    </header>
  );
}
