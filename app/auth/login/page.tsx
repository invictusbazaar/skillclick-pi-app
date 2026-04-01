"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Smartphone, Loader2, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Počinjemo sa učitavanjem dok proveravamo okruženje
  const [isLoading, setIsLoading] = useState(true)

  // Funkcija za preusmeravanje nakon logovanja
  const finishLogin = (user: any) => {
    // Čuvamo korisnika
    localStorage.setItem("user", JSON.stringify(user));
    
    // Odmah prebacujemo na početnu (ili gde je korisnik krenuo)
    const redirectUrl = searchParams.get('redirect') || "/";
    router.push(redirectUrl);
  };

  // --- 1. GLAVNA LOGIKA (AUTO-START) ---
  useEffect(() => {
    let attempts = 0;
    
    const checkAndLogin = async () => {
        // A) Ako je Pi SDK učitan, probaj auto-login
        if (window.Pi) {
            try {
                await window.Pi.init({ version: "2.0", sandbox: true });
                
                // Pokušaj autentifikacije
                const scopes = ['username', 'payments'];
                const authResults = await window.Pi.authenticate(scopes, (payment: any) => {
                    console.log("Nedovršeno plaćanje:", payment);
                });

                const username = authResults.user.username;
                let role = "user";

                // PROVERA: Da li je ovo gazda?
                if (username === "Ilija1969" || username === "ilijabrdar") {
                    role = "admin";
                }

                // Uspešan login - završi i preusmeri
                finishLogin({
                    username: username,
                    uid: authResults.user.uid,
                    role: role,
                    accessToken: authResults.accessToken
                });

            } catch (err) {
                console.error("Auto-login greška:", err);
                setIsLoading(false); // Pusti korisnika da proba ručno
            }
        } 
        // B) Ako Pi SDK nije tu (PC), čekamo malo pa odustanemo od auto-logina
        else {
            attempts++;
            if (attempts < 20) { // Pokušavaj oko 2 sekunde (20 x 100ms)
                setTimeout(checkAndLogin, 100);
            } else {
                // Isteklo vreme - verovatno smo na PC-u
                console.log("Pi SDK nije nađen (PC mod).");
                setIsLoading(false);
            }
        }
    };

    checkAndLogin();
  }, [router, searchParams]);


  // --- 2. RUČNI LOGIN ZA PC (ADMIN) ---
  const handleDevLogin = () => {
      // Ovaj login ne čeka ništa, radi odmah!
      const adminUser = {
          username: "Ilija1969",
          uid: "dev-admin-uid-123",
          role: "admin", 
          accessToken: "dev-access-token"
      };
      finishLogin(adminUser);
  }

  // --- 3. RUČNI PI LOGIN (Za svaki slučaj) ---
  const handleManualPiLogin = () => {
      setIsLoading(true);
      if(window.Pi) {
          window.location.reload(); // Najlakši način da ponovo pokrene auto-login
      } else {
          alert("Pi SDK nije učitan. Osveži stranicu.");
          setIsLoading(false);
      }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] font-sans p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
            
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">SkillClick</h1>
            
            {isLoading ? (
                <div className="py-10">
                    <Loader2 className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-500">Provera korisnika...</p>
                </div>
            ) : (
                <>
                    <p className="text-gray-500 text-sm mb-8">Odaberite način prijave</p>

                    {/* Dugme za Pi Browser */}
                    <Button 
                        onClick={handleManualPiLogin}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 rounded-2xl text-lg mb-4"
                    >
                        <Smartphone className="mr-2" />
                        Login with Pi
                    </Button>

                    {/* Dugme za PC Admina */}
                    <div className="mt-6 border-t pt-4">
                        <p className="text-xs text-gray-400 mb-2">Programerski pristup (PC):</p>
                        <button 
                            onClick={handleDevLogin}
                            className="w-full py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 flex items-center justify-center gap-2 font-medium transition-all"
                        >
                            <Laptop size={18} />
                            Uloguj se kao Admin
                        </button>
                    </div>
                </>
            )}
      </div>
    </div>
  )
}
