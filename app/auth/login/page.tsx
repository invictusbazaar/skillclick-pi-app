"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Smartphone, Loader2, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true) // Krećemo odmah sa učitavanjem (Auto-login)

  // Ova funkcija radi pravi Login preko Pi Mreže
  const performPiLogin = async () => {
    try {
        // 1. Provera: Da li smo u Pi Browseru?
        if (!window.Pi) {
            console.log("Pi Browser nije detektovan (verovatno PC).");
            setIsLoading(false); // Prekidamo učitavanje da bi se videli dugmići
            return;
        }

        // 2. Inicijalizacija
        await window.Pi.init({ version: "2.0", sandbox: true });

        // 3. Autentifikacija (Ovo se na telefonu dešava automatski ili iskoči prozorčić)
        const scopes = ['username', 'payments'];
        const onIncompletePaymentFound = (payment: any) => {
            console.log("Nedovršeno plaćanje:", payment);
        };

        const authResults = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

        // 4. Provera Admina
        const username = authResults.user.username;
        let role = "user";
        
        if (username === "Ilija1969" || username === "ilijabrdar") {
            role = "admin";
        }

        // 5. Čuvanje podataka
        const piUser = {
            username: username,
            uid: authResults.user.uid,
            role: role,
            accessToken: authResults.accessToken
        };

        localStorage.setItem("user", JSON.stringify(piUser));

        // 6. Preusmeravanje (Konačno te pušta u aplikaciju)
        const redirectUrl = searchParams.get('redirect') || "/";
        router.push(redirectUrl);

    } catch (error: any) {
        console.error("Auto-login failed:", error);
        setIsLoading(false); // Ako pukne, pokaži dugme da možeš probati opet
    }
  };

  // --- AUTOMATSKI START ---
  // Ovo se pokreće čim se stranica otvori
  useEffect(() => {
    performPiLogin();
  }, []);

  // --- RUČNI LOGIN ZA PC (ADMIN) ---
  const handleDevLogin = () => {
      const adminUser = {
          username: "Ilija1969",
          uid: "dev-admin-uid-123",
          role: "admin", 
          accessToken: "dev-access-token"
      };
      localStorage.setItem("user", JSON.stringify(adminUser));
      const redirectUrl = searchParams.get('redirect') || "/";
      router.push(redirectUrl);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] font-sans p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
            
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">SkillClick</h1>
            
            {/* Ako se učitava (Auto-login u toku), prikazujemo samo vrti-guz */}
            {isLoading ? (
                <div className="py-10">
                    <Loader2 className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-500">Prepoznavanje korisnika...</p>
                </div>
            ) : (
                /* Ako auto-login nije uspeo (npr. na PC-u si), prikazujemo dugmiće */
                <>
                    <p className="text-gray-500 text-sm mb-8">Prijavi se da bi nastavio</p>

                    {/* Dugme za Pi (u slučaju da auto-login zapne) */}
                    <Button 
                        onClick={() => { setIsLoading(true); performPiLogin(); }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 rounded-2xl text-lg mb-4"
                    >
                        <Smartphone className="mr-2" />
                        Pokušaj Pi Login
                    </Button>

                    {/* Skriveno dugme za tebe na PC-u */}
                    <div className="mt-6 border-t pt-4">
                        <p className="text-xs text-gray-400 mb-2">Opcije za programera (PC):</p>
                        <button 
                            onClick={handleDevLogin}
                            className="text-sm text-gray-500 hover:text-purple-600 underline flex items-center justify-center w-full gap-2"
                        >
                            <Laptop size={16} />
                            Uloguj se kao Admin (PC)
                        </button>
                    </div>
                </>
            )}
      </div>
    </div>
  )
}
