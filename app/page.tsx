"use client"

import { useState, useEffect, Suspense } from "react"
import { Search, Layers, Heart, Star, ChevronLeft, ChevronRight, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useLanguage } from "@/components/LanguageContext" 

// 👇 UPISI SVOJE IME (SA ili BEZ @, sad je svejedno)
const ADMIN_USERNAME = "ilija1969";

declare global {
  interface Window {
    Pi: any;
  }
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  
  // 👇 STATUSI ZA DEBUGIRANJE
  const [debugMsg, setDebugMsg] = useState("Čekam Pi...");
  const [detectedUser, setDetectedUser] = useState("");

  useEffect(() => {
    const initSmartLogin = async () => {
      try {
        if (!window.Pi) {
            setDebugMsg("Pi SDK nije učitan. Čekam...");
            setTimeout(initSmartLogin, 500);
            return;
        }

        // 1. Povezivanje
        setDebugMsg("Inicijalizacija...");
        await window.Pi.init({ version: "2.0", sandbox: false });

        // 2. Tražimo korisnika
        setDebugMsg("Tražim korisnika...");
        const scopes = ['username', 'payments'];
        const auth = await window.Pi.authenticate(scopes, (p: any) => console.log(p));
        
        const currentUser = auth.user.username;
        setDetectedUser(currentUser); // Čuvamo šta je Pi tačno vratio
        
        // 👇 PAMETNA PROVERA (Ignoriše @) 👇
        const cleanCurrent = currentUser.replace("@", "").trim();
        const cleanAdmin = ADMIN_USERNAME.replace("@", "").trim();

        setDebugMsg(`Proveravam: ${cleanCurrent} == ${cleanAdmin}?`);

        if (cleanCurrent === cleanAdmin) {
            setDebugMsg("✅ TI SI ADMIN! Prebacujem...");
            setTimeout(() => {
                router.push('/admin/services');
            }, 1000); // Mala pauza da vidiš poruku
        } else {
            setDebugMsg(`❌ Nisi Admin. (${cleanCurrent} nije ${cleanAdmin})`);
        }

      } catch (err: any) {
        console.error(err);
        setDebugMsg(`Greška: ${err.message || err}`);
      }
    };

    initSmartLogin();
  }, [router]);

  // --- OSTATAK KODA (Učitavanje oglasa) ---
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
           const data = await res.json();
           setServices(Array.isArray(data) ? data : []);
        }
      } catch (e) { console.error(e); } 
      finally { setLoadingServices(false); }
    };
    fetchServices();
  }, []);

  const category = searchParams.get('category');
  const term = searchParams.get('search');
  let filtered = services;
  if (category) filtered = filtered.filter(s => s.category?.toLowerCase().includes(category.toLowerCase()));
  else if (term) filtered = filtered.filter(s => s.title?.toLowerCase().includes(term.toLowerCase()));
  
  // Helperi za UI
  const currentItems = filtered.slice(0, 12);
  const getGradient = (id: any) => "from-purple-500 to-indigo-600";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* HERO SECTION */}
      <main className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-800 text-white py-12">
         <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10">
            
            {/* 👇 CRVENI DEBUG BOX - DA VIDIMO ŠTA SE DEŠAVA 👇 */}
            <div className="mb-6 p-4 bg-black/50 rounded-xl border border-white/20 text-left font-mono text-sm max-w-md w-full">
                <p className="text-yellow-400 font-bold mb-1">🔍 DEBUG INFO:</p>
                <p>Status: <span className="text-white">{debugMsg}</span></p>
                {detectedUser && (
                    <p>Pi kaže da si: <span className="text-green-400 font-bold">"{detectedUser}"</span></p>
                )}
                <p className="text-gray-400 text-xs mt-2">
                    (Admin podešen kao: "{ADMIN_USERNAME}")
                </p>
            </div>
            {/* 👆 KAD PRORADI, OVO ĆEMO OBRISATI 👆 */}

            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">SkillClick<span className="text-purple-300">π</span></h1>
            
            <div className="w-full max-w-lg bg-white p-2 rounded-full shadow-xl flex items-center">
                <Search className="ml-3 text-gray-400" />
                <Input placeholder="Pretraži..." className="border-none shadow-none text-gray-800" />
            </div>
         </div>
      </main>

      {/* REZULTATI */}
      <section className="container mx-auto px-4 py-8 flex-grow">
         {loadingServices ? (
             <div className="text-center text-gray-400">Učitavanje...</div>
         ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentItems.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border">
                        <h3 className="font-bold">{item.title}</h3>
                        <p className="text-purple-600 font-bold">{item.price} π</p>
                    </div>
                ))}
            </div>
         )}
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
