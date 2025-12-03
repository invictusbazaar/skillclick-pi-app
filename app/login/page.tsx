"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulacija prijave
    setTimeout(() => {
      // 1. Proveravamo da li imamo sačuvane podatke od registracije (opciono)
      const storedEmail = localStorage.getItem('db_user_email');
      const storedName = localStorage.getItem('db_user_name');
      
      let displayName = "Korisnik";
      
      // Ako se email poklapa sa onim iz registracije, koristi to ime
      if (email === storedEmail && storedName) {
          displayName = storedName;
      } else {
          // Ako ne, izvuci ime iz emaila (npr. marko iz marko@gmail.com)
          const namePart = email.split('@')[0];
          displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      }

      // 2. Logujemo korisnika u aplikaciju
      login(displayName, email);

      // 3. Preusmeravanje na početnu
      router.push('/');
      
    }, 1000); 
  };

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-sm font-medium shadow-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors font-bold text-sm">
        <ArrowLeft className="w-5 h-5" /> Nazad na početnu
      </Link>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-purple-900/10 border border-white overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <div className="pt-10 pb-6 text-center">
          <div className="flex justify-center mb-6">
             <Image 
                src="/skillclick_logo.png" 
                alt="SkillClick Logo" 
                width={200} 
                height={60} 
                className="h-12 w-auto object-contain"
                priority
             />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Dobrodošli nazad!</h2>
          <p className="text-gray-500 text-sm mt-2">Unesite podatke za pristup nalogu</p>
        </div>

        <div className="p-8 pt-0">
          <form onSubmit={handleLogin} className="space-y-5">
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Email adresa</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors w-5 h-5" />
                <input 
                  type="email" 
                  required
                  className={inputClass}
                  placeholder="ime@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-xs font-bold text-gray-700 uppercase">Lozinka</label>
                <a href="#" className="text-xs text-purple-600 hover:text-purple-700 font-semibold">Zaboravljena lozinka?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors w-5 h-5" />
                <input 
                  type="password" 
                  required
                  className={inputClass}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-600/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Učitavanje...</span>
                </div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" /> Prijavi se
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-100 pt-6">
            Nemaš nalog?{' '}
            <Link href="/register" className="text-purple-600 font-bold hover:text-purple-800 transition-colors">
              Registruj se besplatno
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}