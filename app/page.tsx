"use client"

import { useState, useEffect, Suspense } from "react"
import { Search, Car, Wrench, Bot, Code, PawPrint, Heart, Palette, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useLanguage } from "@/components/LanguageContext" 

// Da TypeScript ne viče na 'window.Pi'
declare global {
  interface Window {
    Pi: any;
  }
}

function HomeContent() {
  const [searchQuery, setSearchQuery] = useState("") 
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Učitavanje dok ne vidimo ko si
  const [user, setUser] = useState<any>(null); 
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // --- FUNKCIJA KOJA JAVLJA SERVERU DA STE ULOGOVALI ---
  const verifyUser = async (authData: any) => {
    try {
      const res = await fetch('/api/auth/pi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: authData.accessToken, user: authData.user }),
      });
      
      if (res.ok) {
        const data = await res.json();
        // Čuvamo podatke da Navbar zna da ne prikazuje Login dugme
        localStorage.setItem("user", JSON.stringify(data.user)); 
        return data.user;
      }
    } catch (err) { console.error(err); }
    return null;
  };

  // --- GLAVNA PI LOGIKA ---
  useEffect(() => {
    const startLogin = async () => {
      try {
        if (!window.Pi) return;

        await window.Pi.init({ version: "2.0", sandbox: false });
        
        // Tražimo od Pi mreže podatke (ovo radi automatski u Pi Browseru)
        const scopes = ['username', 'payments']; 
        const authResult = await window.Pi.authenticate(scopes, (payment: any) => console.log(payment));
        
        const piUser = authResult.user;
        const username = piUser.username.toLowerCase();

        // 1. JAVIMO SERVERU (da ne bi tražio login kasnije na /create)
        await verifyUser(authResult);
        setUser(piUser);

        // 2. AKO JE ILIJA -> ODMAH NA ADMIN/PROFIL
        if (username === "ilija1969" || username === "@ilija1969") {
            window.location.href = "/profile"; // Tvrdi redirect
            return;
        }

        // 3. AKO NIJE ILIJA -> PRIKAŽI SAJT
        setLoading(false);

      } catch (error) {
        console.error("Pi Greška:", error);
        setLoading(false); // Pustimo korisnika da vidi sajt čak i ako Pi zeza
      }
    };

    // Pokušavamo da nađemo Pi SDK
    const intervalId = setInterval(() => {
      if (window.Pi) {
        clearInterval(intervalId);
        startLogin();
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  // --- DOK SE UČITAVA ILI PREBACUJE ILIJU, NE PRIKAZUJ NIŠTA ---
  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>;
  }

  // --- OVO VIDE SVI OSIM ILIJE (Jer je Ilija već otišao na /profile) ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* HERO SEKCIJA */}
      <main className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-800 text-white py-10 md:py-32 overflow-hidden">
         <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-extrabold mb-1 tracking-tighter drop-shadow-2xl">SkillClick</h1>
            
            <p className="text-xs sm:text-sm md:text-2xl font-bold text-purple-200 tracking-[0.1em] uppercase mb-6 md:mb-10 shadow-black drop-shadow-md max-w-3xl">
                {t('heroTitle')}
            </p>

            {/* PRETRAGA */}
            <div className="w-full max-w-3xl flex items-center bg-white p-1 md:p-2 rounded-full shadow-2xl h-10 md:h-auto">
                <div className="pl-3 md:pl-4 text-gray-400"><Search className="w-4 h-4 md:w-6 md:h-6" /></div>
                <Input 
                    type="text" 
                    placeholder={t('searchPlaceholder')} 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="flex-grow border-none shadow-none focus-visible:ring-0 text-gray-800 px-2 md:px-4 h-8 md:h-14 text-sm md:text-lg bg-transparent" 
                />
                <Button className="h-8 md:h-14 px-4 md:px-8 rounded-full bg-purple-600 text-white font-bold text-xs md:text-lg">
                    {t('searchBtn') || "Search"}
                </Button>
            </div>

            {/* DUGME POSTAVI OGLAS - Odmah dostupno jer smo već ulogovani */}
            <div className="mt-8">
                <a 
                  href="/create" 
                  className="inline-flex items-center justify-center px-6 py-3 text-base md:text-lg font-bold text-white bg-purple-500/20 border border-purple-400/30 rounded-full hover:bg-purple-500/40 transition-all no-underline"
                >
                  + {t('navPostService')}
                </a>
            </div>
         </div>
      </main>

      {/* OSTATAK SAJTA (Kategorije i Oglasi) - Skraćeno radi preglednosti, ali ti ostavi svoj donji deo */}
      <section className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500">Učitavanje oglasa...</p>
      </section>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">...</div>}>
      <HomeContent />
    </Suspense>
  )
}
