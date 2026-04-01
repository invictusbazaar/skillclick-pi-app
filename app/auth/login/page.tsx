"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Smartphone, Loader2, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)

  const syncUserToDatabase = async (username: string, uid?: string) => {
    try {
        await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, uid }) 
        });
    } catch (error) {
        console.error("Greška pri sinhronizaciji:", error);
    }
  };

  const finishLogin = (userData: any) => {
    const finalUser = {
        username: userData.username,
        isAdmin: userData.role === "admin"
    };
    localStorage.setItem("pi_user", JSON.stringify(finalUser));
    
    const redirectUrl = searchParams.get('redirect') || "/";
    window.location.href = redirectUrl;
  };

  useEffect(() => {
    let attempts = 0;
    const checkSdk = async () => {
        if (window.Pi) {
            setIsLoading(false);
        } else {
            attempts++;
            if (attempts < 20) {
                setTimeout(checkSdk, 100);
            } else {
                setIsLoading(false);
            }
        }
    };
    checkSdk();
  }, []);

  const handleDevLogin = () => {
      finishLogin({ username: "Ilija1969", role: "admin" });
  }

  const handleManualPiLogin = async () => {
      setIsLoading(true);
      if (window.Pi) {
          try {
              // Hvatamo grešku ako je Pi SDK već inicijalizovan da ne bi prekinuo proces
              try {
                  await window.Pi.init({ version: "2.0", sandbox: true });
              } catch (initError) {
                  console.log("Pi SDK je već inicijalizovan, nastavljamo...", initError);
              }
              
              // Kratka pauza da pretraživač procesira zahtev pre nego što iskoči prozor
              await new Promise(resolve => setTimeout(resolve, 500));

              const scopes = ['username', 'payments'];
              const authResults = await window.Pi.authenticate(scopes, async (payment: any) => {
                  console.log("Nedovršeno plaćanje:", payment);
                  try {
                      await fetch('/api/payments/incomplete', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ paymentId: payment.identifier })
                      });
                  } catch (err) {}
              });

              const username = authResults.user.username;
              let role = "user";

              if (username === "Ilija1969" || username === "ilijabrdar") {
                  role = "admin";
              }

              await syncUserToDatabase(username, authResults.user.uid);

              finishLogin({
                  username: username,
                  role: role
              });

          } catch (err) {
              console.error("Pi login greška:", err);
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
