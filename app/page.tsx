"use client"

import { useState, useEffect, Suspense } from "react"
import { 
  Search, Layers, Heart, Star, PenTool, Monitor, Briefcase, Video, Code, Music, 
  Coffee, ChevronLeft, ChevronRight, 
  Wrench, Car, Bot, PawPrint, Palette
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useLanguage } from "@/components/LanguageContext" 

// 👇 TVOJ USERNAME (Samo ti ulaziš u Admin Panel)
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

  // Stanja
  const [user, setUser] = useState<any>(null);
  const [loadingServices, setLoadingServices] = useState(true);
  const [authStatus, setAuthStatus] = useState("Učitavanje Pi mreže..."); // Da vidiš šta se dešava
  
  // Podaci
  const [services, setServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // 👇 1. AUTOPILOT LOGOVANJE 👇
  useEffect(() => {
    const initAutopilot = async () => {
      try {
        // 1. Čekamo Pi SDK (ako kasni na telefonu)
        if (!window.Pi) {
            setAuthStatus("Čekam Pi Browser...");
            setTimeout(initAutopilot, 500); // Probaj opet za pola sekunde
            return;
        }

        // 2. Init
        setAuthStatus("Povezivanje...");
        await window.Pi.init({ version: "2.0", sandbox: false }); // False jer ti je prošlo

        // 3. Autentifikacija
        const scopes = ['username', 'payments'];
        const auth = await window.Pi.authenticate(scopes, (p: any) => console.log(p));
        
        const currentUser = auth.user;
        setUser(currentUser);
        console.log("Ulogovan:", currentUser.username);

        // 🚨 GLAVNA MAGIJA: Ako si ti, odmah ide Redirect 🚨
        if (currentUser.username === ADMIN_USERNAME) {
            setAuthStatus(`Zdravo šefe (@${currentUser.username})! Prebacujem u Admin...`);
            router.push('/admin/services'); 
            return;
        } else {
            setAuthStatus(""); // Skloni poruku za obične korisnike
        }

      } catch (err) {
        console.error("Greška login:", err);
        setAuthStatus("Greška pri povezivanju. Osveži stranu.");
      }
    };

    initAutopilot();
  }, [router]);

  // 👇 2. UČITAVANJE OGLASA (Za obične korisnike) 👇
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
           const data = await res.json();
           setServices(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Greška baze:", e);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Filtriranje i Paginacija (Standardno)
  const category = searchParams.get('category');
  const term = searchParams.get('search');
  let filtered = services;
  if (category) filtered = filtered.filter(s => s.category?.toLowerCase().includes(category.toLowerCase()));
  else if (term) filtered = filtered.filter(s => s.title?.toLowerCase().includes(term.toLowerCase()));

  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // Helper za ikonice
  const getIcon = (cat: string) => <Layers className="h-10 w-10 text-white" />;
  const getGradient = (id: any) => "from-purple-500 to-indigo-600";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* HERO SECTION */}
      <main className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-800 text-white py-12 md:py-24">
         <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10">
            
            {/* STATUS BAR - Da znaš šta se dešava na telefonu */}
            {authStatus && (
                <div className="mb-6 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg flex items-center gap-3 animate-pulse">
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    <span className="text-sm font-bold text-white">{authStatus}</span>
                </div>
            )}

            <h1 className="text-4xl md:text-7xl font-extrabold mb-4 tracking-tighter">
                SkillClick<span className="text-purple-300">π</span>
            </h1>
            
            {/* PRETRAGA */}
            <div className="w-full max-w-xl flex items-center bg-white p-2 rounded-full shadow-xl mt-4">
                <Search className="ml-3 text-gray-400" />
                <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder') || "Search services..."}
                    className="border-none shadow-none text-gray-800 h-10 md:h-12"
                />
                <Button onClick={() => router.push(`/?search=${searchQuery}`)} className="rounded-full bg-purple-600 hover:bg-purple-700 h-10 md:h-12 px-6">
                    {t('searchBtn') || "Search"}
                </Button>
            </div>
         </div>
      </main>

      {/* REZULTATI */}
      <section className="container mx-auto px-4 py-10 flex-grow">
         {loadingServices ? (
             <div className="text-center py-10 text-gray-400">Učitavanje oglasa...</div>
         ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition cursor-pointer">
                            <Link href={`/services/${item.id}`}>
                                <div className={`h-28 md:h-32 bg-gradient-to-br ${getGradient(item.id)} flex items-center justify-center`}>
                                    {getIcon(item.category)}
                                </div>
                                <div className="p-3 md:p-4">
                                    <h3 className="font-bold text-gray-900 truncate text-sm md:text-base">{item.title}</h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-gray-500">@{item.author}</span>
                                        <span className="font-bold text-purple-600 text-sm md:text-base">{item.price} π</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        Nema aktivnih oglasa.
                    </div>
                )}
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
