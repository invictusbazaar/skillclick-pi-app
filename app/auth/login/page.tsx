"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ShieldCheck, ArrowLeft, Loader2, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from 'next/image'
import { useLanguage } from "@/components/LanguageContext"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage();

  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState("")
  // 👇 PROVERA: Da li smo u modu za razvijanje (na tvom kompu)?
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // Ovo osigurava da proveru radimo samo na klijentu
    if (process.env.NODE_ENV === 'development') {
        setIsDev(true);
    }
  }, []);

  const handlePiLogin = async () => {
    setIsLoading(true);
    setStatus(t('piConnecting')); 

    try {
        if (typeof window !== 'undefined' && (window as any).Pi) {
            const Pi = (window as any).Pi;
            Pi.init({ version: "2.0", sandbox: true });

            const scopes = ['username', 'payments'];
            const onIncompletePaymentFound = (payment: any) => { console.log(payment); };

            const authResults = await Pi.authenticate(scopes, onIncompletePaymentFound);
            
            setStatus(`${t('piWelcomeUser')}, ${authResults.user.username}!`);

            const piUser = {
                username: authResults.user.username,
                uid: authResults.user.uid,
                role: "user",
                piBalance: "0.00",
                accessToken: authResults.accessToken
            };

            localStorage.setItem("user", JSON.stringify(piUser));
            
            setTimeout(() => {
                const redirectUrl = searchParams.get('redirect') || "/profile";
                router.push(redirectUrl);
            }, 1000);

        } else {
            alert(t('piBrowserError')); 
            setIsLoading(false);
            setStatus(t('piBrowserError'));
        }
    } catch (error) {
        console.error("Pi Auth Error:", error);
        setStatus(t('piAuthFailed')); 
        setIsLoading(false);
    }
  }

  const handleDemoLogin = () => {
      const demoUser = {
          username: "ilijabrdar",
          role: "admin",
          piBalance: "1250.00"
      };
      localStorage.setItem("user", JSON.stringify(demoUser));
      router.push("/profile");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] font-sans relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-purple-900 to-[#f8f9fc] -z-10" />
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <Link href="/" className="inline-flex items-center text-sm font-bold text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> {t('backHome')}
        </Link>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-900/20 border border-white/50 overflow-hidden text-center p-8">
          
            <div className="flex justify-center mb-6">
                 <Image 
                    src="/skillclick_logo.png" 
                    alt="Logo" 
                    width={220} 
                    height={70} 
                    className="h-14 w-auto object-contain"
                />
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">{t('welcomeBack')}</h1>
            
            <p className="text-gray-500 text-sm mb-8">
                {t('piLoginDesc')}
            </p>

            {status && (
                <div className="mb-6 p-3 bg-purple-50 text-purple-700 text-sm font-bold rounded-xl border border-purple-100">
                    {status}
                </div>
            )}

            <Button 
                onClick={handlePiLogin}
                className="w-full bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold py-7 rounded-2xl shadow-lg shadow-purple-500/30 transition-all active:scale-[0.98] text-lg relative overflow-hidden group"
                disabled={isLoading}
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin w-6 h-6" />
                        <span>{t('piVerifying')}</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-3">
                        <Smartphone className="w-6 h-6" /> 
                        <span>{t('piLoginBtn')}</span>
                    </div>
                )}
            </Button>

            <p className="text-xs text-gray-400 mt-6 max-w-xs mx-auto">
                {t('piLoginDisclaimer')}
            </p>

            {/* 👇 OVO JE PAMETNO DUGME: Prikazuje se SAMO u 'development' modu */}
            {isDev && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <button 
                        onClick={handleDemoLogin} 
                        className="text-xs text-gray-300 hover:text-purple-500 font-mono transition-colors"
                    >
                        [Developer Mode: PC Login]
                    </button>
                </div>
            )}

            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-4">
                <ShieldCheck className="w-3 h-3" /> {t('securedBy')}
            </div>

        </div>
      </div>
    </div>
  )
}