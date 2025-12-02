"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, LogIn } from 'lucide-react';
// Prilagodi putanju ako je potrebno
import { useLanguage } from '../../components/LanguageContext'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // Za prikaz greške
  
  const { t } = useLanguage(); 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // --- SIMULACIJA PROVERE U BAZI ---
    setTimeout(() => {
      // 1. Proveravamo "bazu" (localStorage)
      const registeredEmail = localStorage.getItem('db_user_email');
      const registeredName = localStorage.getItem('db_user_name');
      
      let finalName = "Korisnik"; // Podrazumevano
      
      // LOGIKA: Ako se email poklapa sa registrovanim, uzmi TO ime
      if (email === registeredEmail && registeredName) {
         finalName = registeredName;
      } else {
         // Ako korisnik nije registrovan, a pokušava login (za potrebe demoa)
         // možemo ili odbiti ili izvući iz maila. 
         // Pošto si tražio striktno, ovde ćemo izvući iz maila samo kao fallback,
         // ali prioritet je gornji if.
         finalName = email.split('@')[0];
      }

      // 2. Uspešan login
      const fakeSessionKey = 'session_' + Math.random().toString(36).substr(2, 9);
      
      localStorage.setItem('sessionKey', fakeSessionKey);
      localStorage.setItem('user_name', finalName); // <--- Ovde se upisuje ime koje ide u Header
      localStorage.setItem('user_email', email);

      window.location.href = '/'; 
      
    }, 1000); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-center relative">
          <Link href="/" className="absolute top-6 left-6 text-purple-100 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Prijavi se</h2>
          <p className="text-purple-100 opacity-90">SkillClick Freelance</p>
        </div>

        {/* Forma */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email adresa</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="email" 
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                  placeholder="ime@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lozinka</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="password" 
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Dugme */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <span>Prijavljivanje...</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5" /> Prijavi se
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Nemaš nalog?{' '}
            <Link href="/register" className="text-purple-600 font-semibold hover:underline">
              Registruj se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}