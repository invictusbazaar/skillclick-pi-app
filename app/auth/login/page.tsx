"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Smartphone, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState("")
  const [showForceBtn, setShowForceBtn] = useState(false) // Novo dugme za spas

  // 🧹 ČISTIMO SVE KAD DOĐEŠ OVDE
  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
    console.log("🧹 Sve obrisano. Spreman za čist start.");
  }, []);

  const handlePiLogin = async () => {
    setIsLoading(true);
    setStatus("Povezujem se sa Pi Wallet-om...");
    
    // Tajmer: Ako se vrti duže od 5 sekundi, dajemo opciju za silu
    const timer = setTimeout(() => setShowForceBtn(true), 5000);

    try {
        if (!window.Pi) throw new Error("Pi Browser nije nađen");

        const Pi = window.Pi;
        await Pi.init({ version: "2.0", sandbox: true });

        // 👇 OVO JE ONO ŠTO GA ZBUNJUJE AKO URL NIJE DOBAR U PORTALU
        const scopes = ['username', 'payments']; 
        
        const auth = await Pi.authenticate(scopes, (p: any) => console.log(p));
        
        clearTimeout(timer);
        setStatus(`Uspeh! Zdravo ${auth.user.username}`);
        
        // Čuvamo podatke
        localStorage.setItem("user", JSON.stringify({
            username: auth.user.username,
            uid: auth.user.uid,
            role: "user",
            accessToken: auth.accessToken
        }));

        setTimeout(() => router.push('/'), 1000);

    } catch (error: any) {
        console.error(error);
        setStatus("Greška: " + (error.message || "Auth Failed"));
        setShowForceBtn(true); // Pokaži dugme za spas ako pukne
    }
  }

  // 👇 OVO KORISTI SAMO AKO SE SVE ZAGLAVI
  const forceAdminLogin = () => {
      if(confirm("Ovo je samo za testiranje! Da li želiš da uđeš kao Admin bez Pi provere?")) {
        localStorage.setItem("user", JSON.stringify({
            username: "ilijabrdar", // Tvoje ime
            role: "admin"
        }));
        router.push('/');
      }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">SkillClick Login</h1>
        
        {status && <div className="bg-yellow-50 text-yellow-800 p-2 rounded mb-4 text-sm">{status}</div>}

        <Button onClick={handlePiLogin} className="w-full bg-purple-600 h-14 text-lg mb-4" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Smartphone className="mr-2"/>}
            Prijavi se (Pi)
        </Button>

        {/* Dugme koje se pojavi ako se Login zaglavi */}
        {showForceBtn && (
            <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-red-500 mb-2">Login ne reaguje? Verovatno URL u Developer Portalu nije dobar.</p>
                <button onClick={forceAdminLogin} className="text-gray-500 text-xs underline flex items-center justify-center w-full gap-1">
                    <AlertTriangle className="w-3 h-3"/> Uđi na silu (Samo za Test)
                </button>
            </div>
        )}
      </div>
    </div>
  )
}
