"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState("Spreman.")

  const login = async (withPayments: boolean) => {
    setStatus(withPayments ? "⏳ Probam: Ime + NOVAC..." : "⏳ Probam: Samo IME...");
    
    try {
        if (!window.Pi) throw new Error("Nema Pi Browsera");

        // 1. Inicijalizacija
        await window.Pi.init({ version: "2.0", sandbox: true });
        
        // 2. Biramo dozvole
        const scopes = withPayments ? ['username', 'payments'] : ['username'];
        
        // 3. Autentifikacija
        const auth = await window.Pi.authenticate(scopes, (p: any) => console.log(p));
        
        setStatus("✅ USPEH! Ulogovan kao: " + auth.user.username);
        
        // Čuvanje
        localStorage.setItem("user", JSON.stringify({
            username: auth.user.username,
            role: "user",
            accessToken: auth.accessToken
        }));

        if(withPayments) {
            alert("To je to! Plaćanje je odobreno!");
            setTimeout(() => router.push('/'), 1000);
        } else {
            alert("Ulogovan si (Samo ime). Sad probaj drugo dugme!");
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

        {/* DUGME 1: SAMO IME (Ovo mora da radi) */}
        <Button onClick={() => login(false)} className="w-full bg-blue-600 h-14 text-lg">
            1. TEST: Samo Ime
        </Button>

        {/* DUGME 2: IME + PARE (Ovo nas muči) */}
        <Button onClick={() => login(true)} className="w-full bg-purple-600 h-14 text-lg">
            2. TEST: Ime + Plaćanje
        </Button>
        
        <p className="text-xs text-gray-500 mt-4">
            Prvo klikni plavo dugme. Ako prođe, onda probaj ljubičasto.
        </p>
    </div>
  )
}