"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState("Spreman.")
  const [currentUrl, setCurrentUrl] = useState("")

  useEffect(() => {
    // Čistimo stare podatke
    localStorage.clear();
    // Prikazujemo trenutnu adresu
    if (typeof window !== 'undefined') {
        setCurrentUrl(window.location.href);
    }
  }, []);

  const handlePiLogin = async () => {
    setStatus("1. Inicijalizacija...");
    
    try {
        if (!window.Pi) throw new Error("Pi Browser nije detektovan!");

        // Inicijalizacija
        await window.Pi.init({ version: "2.0", sandbox: true });
        setStatus("2. Pi Init OK. Tražim Auth...");

        // Autentifikacija
        const scopes = ['username', 'payments']; 
        const auth = await window.Pi.authenticate(scopes, (p: any) => setStatus("Nedovršeno: " + p.paymentId));
        
        setStatus("3. USPEH! " + auth.user.username);
        
        // Čuvanje
        localStorage.setItem("user", JSON.stringify({
            username: auth.user.username,
            uid: auth.user.uid,
            role: "user",
            accessToken: auth.accessToken
        }));

        setTimeout(() => router.push('/'), 1000);

    } catch (error: any) {
        console.error(error);
        setStatus("GREŠKA: " + (error.message || JSON.stringify(error)));
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full">
        <h1 className="text-xl font-bold mb-4">Debug Login</h1>
        
        <div className="bg-gray-800 text-green-400 p-4 rounded text-xs text-left mb-4 font-mono break-all">
            <p>TRENUTNA ADRESA (Mora biti ista u Portalu):</p>
            <p className="font-bold text-yellow-300 my-2">{currentUrl}</p>
            <p className="border-t border-gray-600 pt-2">STATUS:</p>
            <p>{status}</p>
        </div>

        <Button onClick={handlePiLogin} className="w-full bg-purple-600 h-12 text-lg font-bold">
            POKRENI LOGIN
        </Button>
        
        <p className="text-xs text-red-500 mt-4">
            Ako se zaglavi na "2. Pi Init OK", znači da URL nije dobar.
        </p>
      </div>
    </div>
  )
}
