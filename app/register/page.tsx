"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Lock, UserPlus } from 'lucide-react';
// Prilagodi putanju ako je potrebno
import { useLanguage } from '../../components/LanguageContext'; 

export default function RegisterPage() {
  const [fullName, setFullName] = useState(''); // <--- OVDE KORISNIK UPISUJE IME
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Ako useLanguage pravi problem sa putanjom, zakomentariši
  const { t } = useLanguage(); 

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // --- SIMULACIJA REGISTRACIJE ---
    setTimeout(() => {
      // 1. Čuvamo podatke u "Lažnu Bazu" (localStorage)
      // Ovo omogućava da Login stranica kasnije prepozna ovog korisnika
      localStorage.setItem('db_user_email', email);
      localStorage.setItem('db_user_name', fullName);
      localStorage.setItem('db_user_password', password); // U praksi se ovo nikad ne radi ovako, ali za demo je ok

      // 2. Automatski logujemo korisnika odmah nakon registracije
      const fakeSessionKey = 'session_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionKey', fakeSessionKey);
      localStorage.setItem('user_name', fullName); // <--- Šaljemo uneto ime u Header
      localStorage.setItem('user_email', email);

      // 3. Preusmeravanje na početnu
      window.location.href = '/'; 
      
    }, 1500); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center relative">
          <Link href="/" className="absolute top-6 left-6 text-purple-100 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Registracija</h2>
          <p className="text-purple-100 opacity-90">Postani deo SkillClick zajednice</p>
        </div>

        {/* Forma */}
        <div className="p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* NOVO: Ime i Prezime */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ime i Prezime (ili Username)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                  placeholder="Npr. Petar Petrović"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

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
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
            >
              {isLoading ? (
                <span>Kreiranje naloga...</span>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" /> Registruj se
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Već imaš nalog?{' '}
            <Link href="/login" className="text-purple-600 font-semibold hover:underline">
              Prijavi se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}