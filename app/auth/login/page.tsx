"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Smartphone, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const handlePiLogin = async () => {
    setIsLoading(true);
    try {
        if (!window.Pi) {
            alert("Pi Browser nije detektovan.");
            setIsLoading(false);
            return;
        }

        // Inicijalizacija (Sandbox: true)
        await window.Pi.init({ version: "2.0", sandbox: true });

        // Standardne dozvole
        const scopes = ['username', 'payments'];

        const onIncompletePaymentFound = (payment: any) => {
            console.log("Nedovršeno plaćanje:", payment);
        };

        // Autentifikacija
        const authResults = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

        // --- ADMIN LOGIKA (NOVO) ---
        const username = authResults.user.username;
        let role = "user";
        
        // Provera da li si to ti
        if (username === "Ilija1969" || username === "ilijabrdar") {
            role = "admin";
        }
        // ---------------------------

        // Čuvanje korisnika
        const piUser = {
            username: username,
            uid: authResults.user.uid,
            role: role, // Ovde sada upisujemo "admin" ako si to ti
            accessToken: authResults.accessToken
        };

        localStorage.setItem("user", JSON.stringify(piUser));

        // Preusmeravanje na početnu
        const redirectUrl = searchParams.get('redirect') || "/";
        router.push(redirectUrl);

    } catch (error: any) {
        console.error(error);
        setIsLoading(false);
        // Ako korisnik otkaže, samo ispišemo grešku
        alert("Greška: " + (error.message || "Login failed"));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] font-sans p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
            
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">SkillClick Login</h1>
            <p className="text-gray-500 text-sm mb-8">Prijavi se putem Pi Network-a</p>

            <Button 
                onClick={handlePiLogin}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 rounded-2xl text-lg mb-4"
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Smartphone className="mr-2" />}
                {isLoading ? "Povezivanje..." : "Login with Pi"}
            </Button>
      </div>
    </div>
  )
}