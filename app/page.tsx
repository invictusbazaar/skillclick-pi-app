"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { 
  Search, Layers, Heart, Star, Wrench, Car, Bot, PawPrint, Palette, Home
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useLanguage } from "@/components/LanguageContext" 

declare global {
  interface Window {
    Pi: any;
  }
}

function HomeContent() {
  const [searchQuery, setSearchQuery] = useState("") 
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<any>(null); 
  
  // 👇 DEBUG LOGOVI - DA VIDIMO ŠTA TELEFON RADI 👇
  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  const piInitRan = useRef(false);
  const itemsPerPage = 12;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // 👇 PI NETWORK LOGIKA SA ISPISOM NA EKRAN 👇
  useEffect(() => {
    if (piInitRan.current) return;
    piInitRan.current = true;

    const initPi = async () => {
      try {
        addLog("🚀 Počinjem Pi Init...");
        
        if (!window.Pi) {
             addLog("⚠️ Pi skripta nije nađena, čekam 1s...");
             await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if(!window.Pi) {
            addLog("❌ GREŠKA: Pi SDK i dalje ne postoji!");
            return;
        }

        addLog("⚙️ Pokrećem Pi.init...");
        await window.Pi.init({ version: "2.0", sandbox: true });
        addLog("✅ Pi Init uspešan.");

        const scopes = ['username', 'payments', 'wallet_address'];
        const onIncompletePaymentFound = (payment: any) => { addLog("Nezavršeno plaćanje nađeno"); };

        addLog("🔐 Tražim autentifikaciju...");
        const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
        addLog(`👤 Uspeh! Korisnik: ${authResult.user.username}`);
        
        setUser(authResult.user);

        // Provera sa bazom
        addLog("📡 Šaljem podatke bazi...");
        await verifyUser(authResult);

      } catch (error: any) {
        addLog(`❌ KATASTROFALNA GREŠKA: ${error.message || JSON.stringify(error)}`);
        console.error("Pi Error:", error);
      }
    };

    // Učitavanje skripte
    if (!window.Pi) {
      addLog("📥 Učitavam Pi skriptu sa interneta...");
      const script = document.createElement('script');
      script.src = "https://sdk.minepi.com/pi-sdk.js";
      script.async = true;
      script.onload = () => {
          addLog("📥 Skripta učitana!");
          // Ako init još nije krenuo (zbog tajminga), pokreni ga sad
          initPi(); 
      };
      script.onerror = () => addLog("❌ GREŠKA: Ne mogu da učitam Pi SDK skriptu (proveri internet).");
      document.body.appendChild(script);
    } else {
      initPi();
    }
  }, []);

  const verifyUser = async (authData: any) => {
    try {
      const res = await fetch('/api/auth/pi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: authData.accessToken, user: authData.user }),
      });
      if (res.ok) {
        const data = await res.json();
        addLog("💾 Baza odgovorila OK.");
      } else {
        addLog(`⚠️ Baza vratila grešku: ${res.status}`);
      }
    } catch (err) { 
        addLog("⚠️ Baza nije dostupna (to je OK za sad)."); 
    }
  };

  // Učitavanje oglasa (skraćeno za preglednost)
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/services');
        let data = await response.json();
        if (!Array.isArray(data)) data = [];
        setFilteredServices(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [selectedCategory, searchTerm]); 

  // ... (Ostale pomoćne funkcije ostaju iste kao pre) ...
  const handleSearch = () => { if (searchQuery.trim()) router.push(`/?search=${encodeURIComponent(searchQuery)}`) };
  const handlePageChange = (n: number) => setCurrentPage(n);
  const getSmartIcon = (s:any) => <Bot className="w-10 h-10 text-white"/>; // Skraćeno
  const getRandomGradient = (id:any) => "from-purple-500 to-indigo-600";
  const indexOfLastItem = currentPage * itemsPerPage;
  const currentServices = filteredServices.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
      
      {/* 🔴 DEBUG KONZOLA NA EKRANU 🔴 */}
      <div className="bg-black text-green-400 p-4 font-mono text-xs md:text-sm border-b-4 border-red-500 max-h-60 overflow-y-auto z-50">
        <h3 className="font-bold text-white border-b border-gray-700 mb-2">🔍 SYSTEM LOGS (Pokaži mi ovo):</h3>
        {logs.length === 0 ? "Čekam logove..." : logs.map((log, i) => <div key={i}>{log}</div>)}
      </div>

      {/* HERO SECTION */}
      <main className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-800 text-white py-10 md:py-32 overflow-hidden">
         <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            {user ? (
              <div className="mb-4 py-1 px-3 bg-white/10 rounded-full border border-white/20 text-xs md:text-sm text-purple-200">
                 Dobrodošao, {user.username}!
              </div>
            ) : (
                <div className="mb-4 py-1 px-3 bg-red-500/20 rounded-full border border-red-500/50 text-xs md:text-sm text-red-200 animate-pulse">
                    Status: Nisi ulogovan
                </div>
            )}
            
            <h1 className="text-4xl font-extrabold mb-1">SkillClick</h1>
            <p className="text-sm font-bold text-purple-200 mb-6">{t('heroTitle')}</p>
         </div>
      </main>

      {/* SERVICES GRID */}
      <section className="container mx-auto px-4 py-6">
        {loading ? (
            <div className="text-center p-10">Učitavam oglase...</div>
        ) : (
            <div className="text-center p-10 text-gray-500">
                {currentServices.length > 0 ? "Oglasi učitani" : "Nema oglasa (Baza je prazna)"}
            </div>
        )}
      </section>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}