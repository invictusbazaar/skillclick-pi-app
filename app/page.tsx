"use client"

import { useState, useEffect, Suspense } from "react"
import { 
  Search, Layers, Heart, Star, ChevronLeft, ChevronRight, 
  ShieldCheck, LogOut 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useLanguage } from "@/components/LanguageContext" 

// TVOJ USERNAME (Pazi na velika/mala slova, ali kod će rešiti ostalo)
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
  
  // Stanje korisnika
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authStatus, setAuthStatus] = useState("Učitavanje...");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // 👇 1. LOGOVANJE (BEZ AUTOMATSKOG PREBACIVANJA) 👇
  useEffect(() => {
    const initLogin = async () => {
      try {
        if (!window.Pi) {
            setTimeout(initLogin, 500);
            return;
        }

        // Init
        await window.Pi.init({ version: "2.0", sandbox: false });
        
        // Auth
        const scopes = ['username', 'payments'];
        const auth = await window.Pi.authenticate(scopes, (p: any) => console.log(p));
        
        const currentUser = auth.user;
        setUser(currentUser);

        // Provera Admina (Ignorišemo velika/mala slova)
        const currentName = currentUser.username.toLowerCase();
        const adminName = ADMIN_USERNAME.toLowerCase();

        if (currentName === adminName) {
            setIsAdmin(true); // SAMO UPALIMO ZASTAVICU, NE RADIMO REDIRECT
            setAuthStatus(`Zdravo šefe (@${currentUser.username})`);
        } else {
            setIsAdmin(false);
            setAuthStatus("");
        }

      } catch (err) {
        console.error("Login greška:", err);
        setAuthStatus(""); 
      }
    };

    initLogin();
  }, []);

  // 👇 FUNKCIJA ZA LOGOUT 👇
  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    setAuthStatus("Izlogovan.");
    // Ovde bi idealno zvali Pi SDK logout ako postoji, ali za sad samo čistimo UI
    window.location.reload(); // Osveži stranicu da resetuje sve
  };

  // 2. UČITAVANJE OGLASA
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

  // Filtriranje & Paginacija
  const category = searchParams.get('category');
  const term = searchParams.get('search');
  let filtered = services;
  if (category) filtered = filtered.filter(s => s.category?.toLowerCase().includes(category.toLowerCase()));
  else if (term) filtered = filtered.filter(s => s.title?.toLowerCase().includes(term.toLowerCase()));

  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const getGradient = (id: any) => "from-purple-500 to-indigo-600";
  const getIcon = (cat: string) => <Layers className="h-10 w-10 text-white" />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* HERO SECTION */}
      <main className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-800 text-white py-10 md:py-20">
         <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10">
            
            {/* STATUS I DUGMIĆI */}
            <div className="mb-6 flex flex-col items-center gap-3 animate-fade-in">
                
                {/* Prikaz korisnika */}
                {user ? (
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                        <span className="text-sm font-bold text-green-300">👋 {user.username}</span>
                        <button onClick={handleLogout} className="ml-2 text-xs text-red-300 hover:text-white underline">
                            (Odjavi se)
                        </button>
                    </div>
                ) : (
                    <span className="text-xs text-gray-300">{authStatus}</span>
                )}

                {/* 👇 GLAVNO ADMIN DUGME (Samo za tebe) 👇 */}
                {isAdmin && (
                    <Link href="/admin/services">
                        <Button className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg border-2 border-white/30 transform hover:scale-105 transition-all">
                            <ShieldCheck className="w-5 h-5 mr-2" />
                            UDJI U ADMIN PANEL
                        </Button>
                    </Link>
                )}
            </div>

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
            <>
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
                        <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                            <p>Nema aktivnih oglasa.</p>
                            {isAdmin && (
                                <p className="text-sm text-purple-600 mt-2 font-bold">
                                    👆 Klikni na "UDJI U ADMIN PANEL" da dodaš prvi oglas!
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </>
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
