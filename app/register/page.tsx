"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User, Mail, Lock, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
// ✅ Uvozimo AuthContext
import { useAuth } from '@/components/AuthContext';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ✅ NOVO: Polje za potvrdu lozinke
  const [confirmPassword, setConfirmPassword] = useState('');
  // ✅ NOVO: Prikaz greške
  const [error, setError] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const { login } = useAuth();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Resetuj grešku pre nove provjere

    // ✅ VALIDACIJA: Provjera da li su lozinke iste
    if (password !== confirmPassword) {
        setError('Lozinke se ne poklapaju. Molimo pokušajte ponovo.');
        return; 
    }

    if (password.length < 6) {
        setError('Lozinka mora imati najmanje 6 karaktera.');
        return;
    }

    setIsLoading(true);

    // --- SIMULACIJA REGISTRACIJE ---
    setTimeout(() => {
      // 1. (Opciono) Čuvamo podatke u "localStorage" da bi Login stranica znala za ovog korisnika
      localStorage.setItem('db_user_email', email);
      localStorage.setItem('db_user_name', fullName);
      
      // 2. Automatski logujemo korisnika u aplikaciju
      login(fullName, email);

      // 3. Preusmjeravanje na početnu
      router.push('/'); 
      
    }, 1200); 
  };

  // Stilovi (identični kao na Login stranici)
  const inputContainerClass = "relative group";
  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors w-5 h-5";
  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none text-sm font-medium shadow-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans py-10">
      
      {/* Dugme za povratak */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors font-bold text-sm z-10">
        <ArrowLeft className="w-5 h-5" /> Nazad na početnu
      </Link>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-purple-900/10 border border-white overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* ZAGLAVLJE: Logo i Naslov */}
        <div className="pt-8 pb-4 text-center px-8">
          <div className="flex justify-center mb-4">
             <Image 
                src="/skillclick_logo.png" 
                alt="SkillClick Logo" 
                width={200} 
                height={60} 
                className="h-10 w-auto object-contain"
                priority
             />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Kreiraj nalog</h2>
          <p className="text-gray-500 text-sm mt-1">Postani dio SkillClick zajednice</p>
        </div>

        {/* FORMA */}
        <div className="p-8 pt-2">
          
          {/* ✅ PRIKAZ GREŠKE (Crveni okvir) */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 mb-4 animate-in slide-in-from-top-2 border border-red-100">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Ime i Prezime */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 ml-1">Ime i Prezime</label>
              <div className={inputContainerClass}>
                <User className={iconClass} />
                <input 
                  type="text" 
                  required
                  className={inputClass}
                  placeholder="Npr. Petar Petrović"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 ml-1">Email adresa</label>
              <div className={inputContainerClass}>
                <Mail className={iconClass} />
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

            {/* Lozinka */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 ml-1">Lozinka</label>
              <div className={inputContainerClass}>
                <Lock className={iconClass} />
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

            {/* ✅ NOVO: Potvrdi Lozinku */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 ml-1">Potvrdi lozinku</label>
              <div className={inputContainerClass}>
                <CheckCircle className={iconClass} />
                <input 
                  type="password" 
                  required
                  className={inputClass}
                  placeholder="Ponovite vašu lozinku"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Dugme */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-600/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   <span>Kreiranje...</span>
                </div>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" /> Registruj se
                </>
              )}
            </button>
          </form>

          {/* Podnožje */}
          <div className="mt-6 text-center text-sm text-gray-500 border-t border-gray-100 pt-6">
            Već imaš nalog?{' '}
            <Link href="/login" className="text-purple-600 font-bold hover:text-purple-800 transition-colors">
              Prijavi se ovdje
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}