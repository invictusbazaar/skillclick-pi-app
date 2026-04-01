"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Smartphone, Loader2, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)

  const finishLogin = (user: any) => {
    localStorage.setItem("user", JSON.stringify(user));
    const redirectUrl = searchParams.get('redirect') || "/";
    router.push(redirectUrl);
  };

  // --- 1. PROVERA SDK-A (BEZ AUTO-LOGINA) ---
  useEffect(() => {
    let attempts = 0;
    
    const checkSdk = async () => {
        if (window.Pi) {
            // Samo gasimo loader čim prepoznamo da je Pi SDK spreman
            setIsLoading(false);
        } else {
            attempts++;
            if (attempts < 20) {
                setTimeout(checkSdk, 100);
            } else {
                console.log("Pi SDK nije nađen (PC mod).");
                setIsLoading(false);
            }
        }
    };

    checkSdk();
  }, []);

  // --- 2. RUČNI LOGIN ZA PC (ADMIN) ---
  const handleDevLogin = () => {
      const adminUser = {
          username: "Ilija1969",
          uid: "dev-admin-uid-123",
          role: "admin", 
          accessToken: "dev-access-token"
      };
      finishLogin(adminUser);
  }

  // --- 3. PRAVI PI LOGIN NA KLIK (Ovde iskače Sandbox kôd) ---
  const handleManualPiLogin = async () => {
      setIsLoading(true);
      if (window.Pi) {
          try {
              // Inicijalizujemo Sandbox tek na klik
              await window.Pi.init({ version: "2.0", sandbox: true });
              
              const scopes = ['username', 'payments'];
              const authResults = await window.Pi.authenticate(scopes, (payment: any) => {
                  console.log("Nedovršeno plaćanje:", payment);
              });

              const username = authResults.user.username;
              let role = "user";

              if (username === "Ilija1969" || username === "ilijabrdar") {
                  role = "admin";
              }

              finishLogin({
                  username: username,
                  uid: authResults.user.uid,
                  role: role,
                  accessToken: authResults.accessToken
              });

          } catch (err) {
              console.error("Pi login greška:", err);
              // Ako korisnik zatvori prozor ili se desi greška, vraćamo dugme
              setIsLoading(false); 
          }
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
                    <p className="text-gray-500">Provera okruženja...</p>
                </div>
            ) : (
                <>
                    <p className="text-gray-500 text-sm mb-8">Odaberite način prijave</p>

                    <Button 
                        onClick={handleManualPiLogin}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 rounded-2xl text-lg mb-4"
                    >
                        <Smartphone className="mr-2" />
                        Login with Pi
                    </Button>

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
