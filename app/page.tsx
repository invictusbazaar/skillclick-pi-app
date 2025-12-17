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

// 👇 AŽURIRANO: Stavio sam veliko slovo, ali kod će sada raditi svakako
const ADMIN_USERNAME = "Ilija1969";

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
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Status za UI (dok se ne učita)
  const [authStatus, setAuthStatus] = useState("Učitavanje...");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // 👇 1. AUTOPILOT LOGOVANJE (SA FIXOM ZA VELIKA SLOVA) 👇
  useEffect(() => {
    const initAutopilot = async () => {
      try {
        if (!window.Pi) {
            setTimeout(initAutopilot, 300);
            return;
        }

        await window.Pi.init({ version: "2.0", sandbox: false });
        
        const scopes = ['username', 'payments'];
        const auth = await window.Pi.authenticate(scopes, (p: any) => console.log(p));
        
        const currentUser = auth.user;
        setUser(currentUser);

        // 👇 FIX: Pretvaramo oba imena u mala slova pre poređenja 👇
        // Ovo rešava problem "Ilija" vs "ilija" zauvek!
        const currentNameLower = currentUser.username.toLowerCase();
        const adminNameLower = ADMIN_USERNAME.toLowerCase();

        if (currentNameLower === adminNameLower) {
            setAuthStatus(`Zdravo šefe (@${currentUser.username})! Ulazimo...`);
            router.push('/admin/services'); // AUTOMATSKI PREBACUJE
            return;
        } else {
            setAuthStatus(""); // Sklanja poruku za ostale
        }

      } catch (err) {
        console.error("Login Error:", err);
        setAuthStatus(""); 
      }
    };

    initAutopilot();
  }, [router]);


  // 👇 2. UČITAVANJE OGLASA 👇
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
            const data = await res.json();
            setServices(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Filtriranje
  const category = searchParams.get('category');
  const term = searchParams.get('search');
  let filtered = services;
  if (category) filtered = filtered.filter(s => s.category?.toLowerCase().includes(category.toLowerCase()));
  else if (term) filtered = filtered.filter(s => s.title?.toLowerCase().includes(term.toLowerCase()));

  // Paginacija
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Helperi
  const getIcon = (cat: string) => <Layers className="h-10 w-10 text-white" />;
  const getGradient = (id: any) => "from-purple-500 to-indigo-600";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* HERO SECTION */}
      <main className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-800 text-white py-12 md:py-24">
         <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10">
            
            {/* OBAVEŠTENJE O LOGOVANJU (Samo dok ne prebaci admina) */}
            {authStatus && (
                <div className="mb-6 px-4 py-2 bg-white/10 rounded-full flex items-center gap-2 animate-pulse text-sm font-medium">
                    {authStatus.includes("šefe") ? (
                        <span className="text-green-300">✅ {authStatus}</span>
                    ) : (
                        <>
                           <div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                           <span>{authStatus}</span>
                        </>
                    )}
                </div>
            )}

            <h1 className="text-4xl md:text-7xl font-extrabold mb-4 tracking-tighter">
                SkillClick<span className="text-purple-300">π</span>
            </h1>
            
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
         {loading ? (
             <div className="text-center py-10 text-gray-400">Učitavanje oglasa...</div>
         ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition">
                            <Link href={`/services/${item.id}`}>
                                <div className={`h-32 bg-gradient-to-br ${getGradient(item.id)} flex items-center justify-center`}>
                                    {getIcon(item.category)}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 truncate">{item.title}</h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-gray-500">@{item.author}</span>
                                        <span className="font-bold text-purple-600">{item.price} π</span>
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
