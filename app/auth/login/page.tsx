"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState("Spreman.")

  const login = async (withPayments: boolean) => {
    setStatus(withPayments ? "⏳ Probam: Ime + NOVAC..." : "⏳ Probam: Samo IME...");
    
    try {
        if (!window.Pi) throw new Error("Nema Pi Browsera");

        // 👇 VRAĆENO NA TRUE: Ovo je obavezno za testiranje plaćanja!
        await window.Pi.init({ version: "2.0", sandbox: true });
        
        const scopes = withPayments ? ['username', 'payments'] : ['username'];
        
        const auth = await window.Pi.authenticate(scopes, (p: any) => {
            console.log("Nedovršeno plaćanje:", p);
        });
        
        setStatus("✅ USPEH! Ulogovan kao: " + auth.user.username);
        
        localStorage.setItem("user", JSON.stringify({
            username: auth.user.username,
            role: "user",
            accessToken: auth.accessToken
        }));

        if(withPayments) {
            // Ako je prošlo plaćanje auth, idemo na početnu
            alert("BRAVO! Dobio si dozvolu za PLAĆANJE! Sada možeš da kupuješ.");
            setTimeout(() => router.push('/'), 1000);
        } else {
            alert("Ime je prošlo! Sada klikni LJUBIČASTO dugme za pare.");
        }

    } catch (error: any) {
        console.error(error);
        setStatus("❌ GREŠKA: " + (error.message || "Unknown"));
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-100 gap-4">
        <h1 className="text-xl font-bold">Test Dozvola</h1>
        
        <div className="bg-white p-4 rounded-xl shadow w-full text-sm font-mono min-h-[80px] flex items-center justify-center border-2 border-purple-100">
            {status}
        </div>

        <Button onClick={() => login(false)} className="w-full bg-blue-600 h-14 text-lg">
            1. TEST: Samo Ime (Rade!)
        </Button>

        <Button onClick={() => login(true)} className="w-full bg-purple-600 h-14 text-lg font-bold shadow-xl">
            2. KLIKNI OVDE: Traži Dozvolu za PARE
        </Button>
        
        <p className="text-xs text-gray-500 mt-4">
            Klikni ljubičasto dugme. Trebalo bi da piše "Username" i "PAYMENTS".
        </p>
    </div>
  )
}
