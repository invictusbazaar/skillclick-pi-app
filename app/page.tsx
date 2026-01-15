"use client"

import { useState, useEffect, Suspense } from "react"
import { 
  Search, Layers, Heart, Star,  
  Wrench, Car, ShieldCheck, LogOut, User as UserIcon, LogIn
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useLanguage } from "@/components/LanguageContext" 

declare global { interface Window { Pi: any; } }

function HomeContent() {
  const [searchQuery, setSearchQuery] = useState("") 
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<any>(null); 
  
  const itemsPerPage = 12;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang } = useLanguage();

  const selectedCategory = searchParams.get('category');
  const searchTerm = searchParams.get('search');

  const categoryMap: Record<string, string> = {
    "design": "catDesign",
    "marketing": "catMarketing",
    "writing": "catWriting",
    "video": "catVideo",
    "tech": "catTech",
    "business": "catBusiness",
    "lifestyle": "catLifestyle"
  };

  const getGradient = (id: string) => {
    if (!id) return "from-indigo-500 to-purple-600";
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      "from-fuchsia-600 to-pink-600", 
      "from-violet-600 to-indigo-600", 
      "from-blue-600 to-cyan-500", 
      "from-emerald-500 to-teal-600",
      "from-orange-500 to-red-600",
      "from-purple-600 to-blue-600"
    ];
    return gradients[sum % gradients.length];
  };

  // --- IZMENA: NEMA VIŠE AUTO-LOGINA SA PI MREŽOM OVDE ---
  // Samo proveravamo da li je korisnik već sačuvan u telefonu
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("Greška pri čitanju korisnika", e);
            localStorage.removeItem("user");
        }
    }
  }, []);

  // --- NOVA FUNKCIJA ZA ODJAVU ---
  const handleLogout = () => {
      localStorage.clear(); // Brišemo sve podatke
      setUser(null);
      window.location.reload(); // Osvežavamo stranicu
  };

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/services', { cache: 'no-store' }); 
        let data = await response.json();
        
        if (!Array.isArray(data)) data = [];

        if (selectedCategory) {
          const cat = selectedCategory.toLowerCase();
          data = data.filter((s: any) => s.category.toLowerCase().includes(cat));
        } else if (searchTerm) {
          const st = searchTerm.toLowerCase();
          data = data.filter((s: any) => s.title.toLowerCase().includes(st) || s.description.toLowerCase().includes(st));
        }
        setFilteredServices(data);
      } catch (error) { 
          console.error("Fetch error:", error); 
          setFilteredServices([]); 
      } finally { setLoading(false); }
    };
    fetchServices();
  }, [selectedCategory, searchTerm]);

  const getSmartIcon = (service: any) => {
    const iconClass = "h-10 w-10 md:h-12 md:w-12 text-white/90 drop-shadow-md";
    const title = (typeof service.title === 'string' ? service.title : (service.title?.en || "")).toLowerCase();
    if (title.includes('auto') || title.includes('alfa')) return <Car className={iconClass} />;
    if (title.includes('popravka') || title.includes('servis')) return <Wrench className={iconClass} />;
    return <Layers className={iconClass} />;
  };

  const currentServices = Array.isArray(filteredServices) ? filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-800 text-white py-10 md:py-32 overflow-hidden">
         
         {/* HEADER ZA LOGIN/LOGOUT */}
         <div className="absolute top-4 right-4 z-50 flex gap-2">
            {user ? (
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md p-2 rounded-full pr-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold">{user.username}</span>
                    <button onClick={handleLogout} className="bg-red-500/80 p-2 rounded-full hover:bg-red-600 transition ml-2">
                        <LogOut className="w-4 h-4 text-white" />
                    </button>
                </div>
            ) : (
                <Link href="/auth/login">
                    <Button className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold rounded-full">
                        <LogIn className="w-4 h-4 mr-2" /> Login
                    </Button>
                </Link>
            )}
         </div>

         <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            {user?.role === 'admin' && (
              <Link href="/profile" className="mb-8">
                <Button className="bg-red-600 font-bold px-8 py-6 rounded-xl shadow-xl flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
                  <ShieldCheck className="w-6 h-6" /> ADMIN PANEL
                </Button>
              </Link>
            )}
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-extrabold mb-1 tracking-tighter drop-shadow-2xl">SkillClick</h1>
            <p className="text-xs sm:text-sm md:text-2xl font-bold text-purple-200 uppercase mb-6 md:mb-10">{t('heroTitle')}</p>
            <div className="w-full max-w-3xl flex items-center bg-white p-1 rounded-full shadow-2xl h-10 md:h-auto">
                <Input placeholder={t('searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-grow border-none shadow-none focus-visible:ring-0 text-gray-800 h-8 md:h-14 bg-transparent" />
                <Button onClick={() => router.push(`/?search=${searchQuery}`)} className="h-8 md:h-14 px-4 rounded-full bg-purple-600 font-bold">{t('searchBtn')}</Button>
            </div>
         </div>
      </main>

      <section className="container mx-auto px-2 md:px-4 py-6 md:py-16 flex-grow bg-gray-50">
        <h2 className="text-lg md:text-3xl font-bold text-gray-900 mb-6">
            {selectedCategory ? (categoryMap[selectedCategory] ? t(categoryMap[selectedCategory]) : selectedCategory.toUpperCase()) : t('adsTitle')}
        </h2>

        {loading ? (
           <div className="text-center py-10 text-gray-500">Učitavanje oglasa...</div>
        ) : currentServices.length === 0 ? (
           <div className="text-center py-10 text-gray-500">Nema pronađenih oglasa.</div>
        ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                {currentServices.map((gig) => (
                    <div key={gig.id} className="group bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col h-full">
                        <Link href={`/services/${gig.id}`} className="block relative h-28 md:h-48">
                            <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(gig.id)} flex items-center justify-center`}>
                                {gig.images && gig.images.length > 0 ? (
                                    <img src={gig.images[0]} alt={gig.title} className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                                ) : (
                                    getSmartIcon(gig)
                                )}
                            </div>
                            <div className="absolute top-2 right-2 p-1.5 bg-white/30 backdrop-blur-md rounded-full text-white">
                                <Heart className="h-3 w-3 md:h-4 md:w-4" />
                            </div>
                        </Link>
                        <div className="p-2.5 md:p-5 flex flex-col flex-grow relative">
                            <div className="absolute -top-5 left-3 md:-top-6 md:left-5">
                                <div className="w-9 h-9 md:w-12 md:h-12 bg-white p-0.5 rounded-full shadow-md">
                                    <div className="w-full h-full bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-xs md:text-sm">
                                        {gig.author?.username?.[0].toUpperCase() || 'U'}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 mb-1 flex justify-end">
                                <span className="text-[10px] md:text-sm font-semibold text-gray-500">@{gig.author?.username || 'user'}</span>
                            </div>
                            <h3 className="text-gray-900 font-bold mb-1 text-xs md:text-lg line-clamp-2">
                              {typeof gig.title === 'object' ? (gig.title[lang] || gig.title['en']) : gig.title}
                            </h3>
                            <div className="mt-auto pt-2 border-t flex items-center justify-between">
                                <div className="flex items-center text-gray-700 text-[10px] md:text-sm font-semibold gap-1">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {gig.rating || '5.0'}
                                </div>
                                <span className="text-sm md:text-lg font-bold text-purple-700">{gig.price} π</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </section>
    </div>
  )
}

export default function HomePage() { return ( <Suspense fallback={<div>...</div>}><HomeContent /></Suspense> ) }