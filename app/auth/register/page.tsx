"use client"

import { useState } from 'react';
import { Mail, Lock, User, CheckCircle, UserPlus, Briefcase, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// 👇 UVOZIMO PREVOD
import { useLanguage } from "@/components/LanguageContext"

export default function RegisterPage() {
  // 👇 AKTIVIRAMO JEZIK
  const { t } = useLanguage();
  
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirm) {
        setError(t('passMismatch')); // Prevedena greška
        setLoading(false);
        return;
    }

    if (!fullName || !email || !password) {
        setError(t('fillAll')); // Prevedena greška
        setLoading(false);
        return;
    }

    setTimeout(() => {
        setLoading(false);
        router.push('/auth/login');
    }, 1500);
  };

  // Stil (Ljubičasti okvir)
  const inputClass = "pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-purple-900 focus:ring-2 focus:ring-purple-900/20 outline-none rounded-xl transition-all font-medium text-gray-800";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] font-sans relative overflow-hidden py-10">
      
      {/* POZADINA */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-purple-900 to-[#f8f9fc] -z-10" />
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl" />
      <div className="absolute top-40 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />

      <div className="w-full max-w-lg px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* BACK DUGME */}
        <Link 
            href="/" 
            className="inline-flex items-center text-sm font-bold text-white/80 hover:text-white mb-6 transition-colors"
        >
            <ArrowLeft className="w-4 h-4 mr-2" /> {t('backHome')}
        </Link>

        {/* GLAVNA KARTICA */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-900/20 border border-white/50 overflow-hidden">
          
          {/* Header */}
          <div className="pt-8 pb-4 px-8 text-center bg-gradient-to-b from-white to-gray-50/50">
             <div className="flex justify-center mb-4 relative">
                 <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 rounded-full scale-150"></div>
                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg relative z-10 text-purple-600">
                    <UserPlus className="w-8 h-8" />
                 </div>
            </div>
            {/* 👇 PREVOD: Pridruži se */}
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{t('joinTitle')}</h1>
            {/* 👇 PREVOD: Kreiraj nalog */}
            <p className="text-gray-500 text-sm mt-2">{t('joinSubtitle')}</p>
          </div>
        
          <div className="px-8 pb-8 pt-2">
            <form onSubmit={handleRegister} className="space-y-5">
            
                {/* IZBOR ULOGE */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <div 
                        onClick={() => setRole('buyer')}
                        className={`cursor-pointer relative overflow-hidden rounded-2xl p-4 text-center transition-all border-2 group
                        ${role === 'buyer' 
                            ? 'border-purple-600 bg-purple-50 shadow-md' 
                            : 'border-gray-100 bg-white hover:border-purple-200 hover:bg-gray-50'}`}
                    >
                        <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center transition-colors ${role === 'buyer' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                             <ShoppingBag className="w-5 h-5" />
                        </div>
                        {/* 👇 PREVOD: Kupac */}
                        <p className={`font-bold text-sm ${role === 'buyer' ? 'text-purple-900' : 'text-gray-500'}`}>{t('roleBuyer')}</p>
                        {/* 👇 PREVOD: Tražim usluge */}
                        <p className="text-[10px] text-gray-400">{t('roleBuyerDesc')}</p>
                        {role === 'buyer' && <div className="absolute top-2 right-2 text-purple-600"><CheckCircle className="w-4 h-4" /></div>}
                    </div>

                    <div 
                        onClick={() => setRole('seller')}
                        className={`cursor-pointer relative overflow-hidden rounded-2xl p-4 text-center transition-all border-2 group
                        ${role === 'seller' 
                            ? 'border-purple-600 bg-purple-50 shadow-md' 
                            : 'border-gray-100 bg-white hover:border-purple-200 hover:bg-gray-50'}`}
                    >
                        <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center transition-colors ${role === 'seller' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                             <Briefcase className="w-5 h-5" />
                        </div>
                        {/* 👇 PREVOD: Prodavac */}
                        <p className={`font-bold text-sm ${role === 'seller' ? 'text-purple-900' : 'text-gray-500'}`}>{t('roleSeller')}</p>
                        {/* 👇 PREVOD: Nudim veštine */}
                        <p className="text-[10px] text-gray-400">{t('roleSellerDesc')}</p>
                        {role === 'seller' && <div className="absolute top-2 right-2 text-purple-600"><CheckCircle className="w-4 h-4" /></div>}
                    </div>
                </div>

                {/* Input Polja */}
                <div className="space-y-4">
                    <div className="relative group">
                        <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-800 transition-colors" />
                        <Input 
                            type="text" 
                            placeholder={t('fullName')} // 👇 PREVOD: Ime
                            className={inputClass}
                            value={fullName} 
                            onChange={(e) => setFullName(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className="relative group">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-800 transition-colors" />
                        <Input 
                            type="email" 
                            placeholder={t('email')} // 👇 PREVOD: Email
                            className={inputClass}
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-800 transition-colors" />
                            <Input 
                                type="password" 
                                placeholder={t('password')} // 👇 PREVOD: Lozinka
                                className={inputClass}
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-800 transition-colors" />
                            <Input 
                                type="password" 
                                placeholder={t('confirmPassword')} // 👇 PREVOD: Potvrdi
                                className={inputClass}
                                value={confirm} 
                                onChange={(e) => setConfirm(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>
                </div>
                
                {error && <p className="text-sm text-red-500 text-center font-bold bg-red-50 p-2 rounded-lg">{error}</p>}

                <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold py-6 rounded-xl shadow-lg shadow-purple-500/30 transition-all active:scale-[0.98] mt-2 group"
                    disabled={loading}
                >
                    {/* 👇 PREVOD: Dugme Registruj se */}
                    {loading ? t('loading') : (role === 'seller' ? t('registerBtn') : t('registerBtn'))}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
                {/* 👇 PREVOD: Imaš nalog? Prijavi se */}
                {t('haveAccount')} <Link href="/auth/login" className="text-purple-700 font-bold hover:underline">{t('loginLink')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}