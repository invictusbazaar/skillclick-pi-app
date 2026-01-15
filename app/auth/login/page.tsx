"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState("Tražim Pi Skriptu...")
  const [piReady, setPiReady] = useState(false)

  // 👇 OVO JE NOVO: Aktivno čekamo da se Pi pojavi
  useEffect(() => {
    const checkInterval = setInterval(() => {
        if (window.Pi) {
            setPiReady(true);
            setStatus("✅ Pi SDK je SPREMAN!");
            clearInterval(checkInterval);
        } else {
            setStatus("⏳ Učitavam Pi SDK... (Proveri layout.tsx)");
        }
    }, 500); // Proveravamo svakih pola sekunde

    return () => clearInterval(checkInterval);
  }, []);

  const login = async (withPayments: boolean) => {
    if (!piReady) {
        alert("Sačekaj da se Pi učita!");
        return;
    }

    setStatus("⏳ Povezujem se...");
    
    try {
        // Inicijalizacija
        try {
            await window.Pi.init({ version: "2.0", sandbox: true });
        } catch (err: any) {
             console.log("Init info:", err);
        }
        
        const scopes = withPayments ? ['username', 'payments'] : ['username'];
        
        setStatus(withPayments ? "⏳ Molim te ODOBRI DOZVOLU..." : "⏳ Prijavljujem se...");

        const auth = await window.Pi.authenticate(scopes, (p: any) => {
            console.log("Nedovršeno plaćanje:", p);
        });
        
        setStatus("✅ USPEH! " + auth.user.username);
        
        localStorage.setItem("user", JSON.stringify({
            username: auth.user.username,
            role: "user",
            accessToken: auth.accessToken
        }));

        if(withPayments) {
            alert("USPEH! Plaćanje odobreno. Ulazim...");
            router.push('/');
        } else {
            alert("Ime OK. Sad probaj dugme za PLAĆANJE.");
        }

    } catch (error: any) {
        console.error(error);
        setStatus("❌ GREŠKA: " + error.message);
        alert("Greška: " + error.message);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-100 gap-6">
        <h1 className="text-2xl font-bold text-purple-900">SkillClick Login</h1>
        
        {/* Status prozor */}
        <div className={`p-4 rounded-xl shadow w-full text-sm font-bold border-2 ${piReady ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
            {status}
        </div>

        {/* Dugmići su onemogućeni dok se Pi ne učita */}
        <div className="space-y-4 w-full">
            <Button 
                onClick={() => login(false)} 
                disabled={!piReady}
                className="w-full bg-blue-600 h-14 text-lg shadow-md disabled:opacity-50"
            >
                1. Test: Samo Ime
            </Button>

            <Button 
                onClick={() => login(true)} 
                disabled={!piReady}
                className="w-full bg-purple-600 h-14 text-lg font-bold shadow-xl border-2 border-purple-400 disabled:opacity-50"
            >
                2. Test: IME + PLAĆANJE
            </Button>
        </div>
        
        {!piReady && (
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin"/> Čekam Pi Browser...
            </div>
        )}
    </div>
  )
}