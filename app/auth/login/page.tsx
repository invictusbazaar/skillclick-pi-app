"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState("Spreman.")

  const login = async (withPayments: boolean) => {
    setStatus("⏳ Povezujem se...");
    
    try {
        if (!window.Pi) throw new Error("Pi Skripta nije učitana (Proveri layout.tsx)!");

        // Pokušavamo inicijalizaciju
        try {
            await window.Pi.init({ version: "2.0", sandbox: true });
        } catch (err: any) {
             // Ako je već inicijalizovan, samo nastavi, inače prijavi grešku
             if (!err.message?.includes("already initialized")) {
                 throw new Error("Init greška: " + err.message);
             }
        }
        
        // Definišemo dozvole
        const scopes = withPayments ? ['username', 'payments'] : ['username'];
        
        setStatus(withPayments ? "⏳ Tražim dozvolu: NOVAC..." : "⏳ Tražim dozvolu: IME...");

        // Autentifikacija
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
            alert("USPEH! Plaćanje odobreno. Prebacujem te...");
            setTimeout(() => router.push('/'), 1000);
        } else {
            alert("Ime je prošlo! Sada probaj drugo dugme.");
        }

    } catch (error: any) {
        console.error(error);
        setStatus("❌ GREŠKA: " + (error.message || JSON.stringify(error)));
        alert("Greška: " + error.message);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-100 gap-4">
        <h1 className="text-xl font-bold">SkillClick Login</h1>
        
        <div className="bg-white p-4 rounded-xl shadow w-full text-xs font-mono min-h-[60px] flex items-center justify-center border-2 border-purple-100 break-words">
            {status}
        </div>

        <Button onClick={() => login(false)} className="w-full bg-blue-600 h-14 text-lg shadow-lg">
            1. Proveri Ime (Auth)
        </Button>

        <Button onClick={() => login(true)} className="w-full bg-purple-600 h-14 text-lg font-bold shadow-xl border-2 border-purple-400">
            2. ODOBRI PLAĆANJE (Klikni ovo!)
        </Button>
    </div>
  )
}