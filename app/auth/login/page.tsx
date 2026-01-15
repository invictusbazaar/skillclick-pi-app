"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ShieldCheck, ArrowLeft, Loader2, Smartphone, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/components/LanguageContext"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage();

  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState("")

  // Čišćenje pri dolasku na stranu
  useEffect(() => {
    // Opciono: Očistimo stare podatke da budemo sigurni
    // localStorage.removeItem("user");
  }, []);

  const handlePiLogin = async () => {
    if (isLoading) return; // Spreči dupli klik
    setIsLoading(true);
    setStatus("Povezujem se sa Pi Mrežom..."); 

    // Tajmer za slučaj da se zaglavi
    const safetyTimer = setTimeout(() => {
        if(isLoading) {
            setIsLoading(false);
            setStatus("Pi Browser ne reaguje. Osveži stranicu.");
            alert("Login traje predugo. Molim te osveži stranicu (povuci nadole) i probaj ponovo.");
        }
    }, 8000); // 8 sekundi čekamo

    try {
        if (typeof window !== 'undefined' && (window as any).Pi) {
            const Pi = (window as any).Pi;
            
            // Inicijalizacija (bezbedna)
            try {
                await Pi.init({ version: "2.0", sandbox: true });
            } catch (err) {
                console.log("Pi init already done or failed", err);
            }

            // OVO JE ONO ŠTO GA ZBUNJUJE - TRAŽIMO PLAĆANJE
            const scopes = ['username', 'payments']; 
            
            const onIncompletePaymentFound = (payment: any) => { 
                console.log("Nedovršeno:", payment); 
            };

            // Pokušaj autentifikacije
            const authResults = await Pi.authenticate(scopes, onIncompletePaymentFound);
            
            // Ako prođe, gasimo tajmer
            clearTimeout(safetyTimer);

            setStatus(`Dobrodošao, ${authResults.user.username}!`);

            const piUser = {
                username: authResults.user.username,
                uid: authResults.user.uid,
                role: "user", 
                accessToken: authResults.accessToken
            };

            localStorage.setItem("user", JSON.stringify(piUser));
            
            // Preusmeravanje
            setTimeout(() => {
                const redirectUrl = searchParams.get('redirect') || "/profile"; // Ili / (home)
                router.push(redirectUrl);
            }, 500);

        } else {
            clearTimeout(safetyTimer);
            alert("Nisi u Pi Browseru!"); 
            setIsLoading(false);
            setStatus("Greška: Nema Pi Browsera");
        }
    } catch (error: any) {
        clearTimeout(safetyTimer);
        console.error("Pi Auth Error:", error);
        setIsLoading(false);
        // Ovde ćemo ispisati tačnu grešku da vidimo šta ga muči
        setStatus("Greška pri logovanju. Probaj refresh.");
        alert("Greška: " + (error.message || JSON.stringify(error)));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] font-sans relative p-4">
      
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
            
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">SkillClick Login</h1>
            <p className="text-gray-500 text-sm mb-8">Prijavi se putem Pi Network-a</p>

            {status && (
                <div className="mb-6 p-3 bg-purple-50 text-purple-700 text-sm font-bold rounded-xl border border-purple-100">
                    {status}
                </div>
            )}

            <Button 
                onClick={handlePiLogin}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 rounded-2xl text-lg mb-4"
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Smartphone className="mr-2" />}
                {isLoading ? "Čekam Pi..." : "Login with Pi"}
            </Button>

            {/* Dugme za osvežavanje ako sve zakuca */}
            <button 
                onClick={() => window.location.reload()}
                className="text-gray-400 text-sm flex items-center justify-center gap-1 mx-auto hover:text-purple-600 mt-4"
            >
                <RefreshCcw className="w-3 h-3" /> Ako zablokira, klikni ovde
            </button>
      </div>
    </div>
  )
}
