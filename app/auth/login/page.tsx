"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Smartphone, Loader2, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Počinjemo sa učitavanjem da bismo dali šansu Mobilnom da se sam uloguje
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Čekamo samo 500ms da vidimo da li je Pi Browser tu
    const checkTimer = setTimeout(() => {
        if (window.Pi) {
            // A) MOBILNI: Pi je tu, pokrećemo automatski login
            runAutoPiLogin();
        } else {
            // B) PC: Pi nije tu, SKLANJAMO LOADER odmah da vidiš dugmiće
            setIsLoading(false);
        }
    }, 500);

    return () => clearTimeout(checkTimer);
  }, []);

  // --- 1. AUTOMATSKI LOGIN ZA MOBILNI ---
  const runAutoPiLogin = async () => {
    try {
        await window.Pi.init({ version: "2.0", sandbox: true });
        
        // Uzimamo korisnika
        const scopes = ['username', 'payments'];
        const authResults = await window.Pi.authenticate(scopes, (p:any) => console.log(p));

        const username = authResults.user.username;
        let role = "user";

        // Provera da li si ti
        if (username === "Ilija1969" || username === "ilijabrdar") {
            role = "admin";
        }

        // Čuvanje i brzi prolaz
        localStorage.setItem("user", JSON.stringify({
            username: username,
            uid: authResults.user.uid,
            role: role,
            accessToken: authResults.accessToken
        }));

        // Preusmeravanje
        window.location.href = searchParams.get('redirect') || "/";

    } catch (error) {
        console.error("Auto-login failed", error);
        setIsLoading(false); // Ako pukne, prikaži dugme da možeš opet
    }
  };

  // --- 2. TRENUTNI ADMIN LOGIN ZA PC ---
  const handlePCAdminLogin = () => {
      // NEMA setIsLoading(true) OVDE - TO JE PRAVILO BESKONAČNI KRUG!
      // Samo upiši i idi.
      
      const adminUser = {
          username: "Ilija1969",
          uid: "dev-admin-uid-123",
          role: "admin", 
          accessToken: "dev-access-token"
      };

      localStorage.setItem("user", JSON.stringify(adminUser));
      
      // Koristimo window.location.href jer je "jači" od router.push i sigurno osvežava stanje
      window.location.href = searchParams.get('redirect') || "/";
  }

  // Ručni Pi login (samo ako auto ne uspe)
  const handleManualPiLogin = () => {
      setIsLoading(true);
      if(window.Pi) runAutoPiLogin();
      else { alert("Nema Pi mreže."); setIsLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] font-sans p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
            
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">SkillClick</h1>
            
            {isLoading ? (
                <div className="py-10">
                    <Loader2 className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-500">Povezivanje...</p>
                </div>
            ) : (
                <>
                    {/* OVO VIDIŠ SAMO KADA AUTOMATSKI LOGIN NE USPE (ILI NA PC-u) */}
                    <p className="text-gray-500 text-sm mb-8">Izaberi pristup</p>

                    <Button 
                        onClick={handleManualPiLogin}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 rounded-2xl text-lg mb-4"
                    >
                        <Smartphone className="mr-2" />
                        Login with Pi
                    </Button>

                    <div className="mt-6 border-t pt-4">
                        <button 
                            onClick={handlePCAdminLogin}
                            className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 font-bold"
                        >
                            <Laptop size={20} />
                            PC ADMIN ULAZ (KLIKNI OVDE)
                        </button>
                    </div>
                </>
            )}
      </div>
    </div>
  )
}
