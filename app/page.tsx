"use client"

import { useState, useEffect, Suspense } from "react"
import { 
  Search, Layers, Heart, Star, ChevronLeft, ChevronRight, 
  Wrench, Car, Bot, Code, PawPrint, Palette
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
  
  const itemsPerPage = 12;

  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // 👇👇👇 POPRAVLJENA PI LOGIKA: REDIRECT SAMO JEDNOM PO SESIJI 👇👇👇
  useEffect(() => {
    const startLogin = async () => {
      try {
        if (!window.Pi) return; 

        await window.Pi.init({ version: "2.0", sandbox: false });
        
        const scopes = ['username', 'payments']; 
        const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
        
        const userData = {
            username: authResult.user.username,
            role: authResult.user.username === 'Ilija1969' ? 'admin' : 'user',
            uid: authResult.user.uid
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        // PROVERA: Preusmeravaj samo ako je to prvi put u ovoj sesiji (tabu)
        const hasRedirected = sessionStorage.getItem("adminRedirected");

        if (userData.username === 'Ilija1969' && !hasRedirected) {
           sessionStorage.setItem("adminRedirected", "true"); // Označi da je redirect obavljen
           router.push('/profile');
        }

      } catch (error) {
        console.error("Greška pri Pi logovanju:", error);
      }
    };

    const onIncompletePaymentFound = (payment: any) => { console.log("Incomplete:", payment); };

    const intervalId = setInterval(() => {
      if (window.Pi) {
        clearInterval(intervalId);
        startLogin();
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [router]);

  // --- LOGIKA ZA PRETRAGU I FILTERE ---
  const selectedCategory = searchParams.get('category');
  const searchTerm = searchParams.get('search');

  const getCategoryName = (slug: string) => {
    switch(slug) {
        case 'design': return t('catDesign');
        case 'marketing': return t('catMarketing');
        case 'writing': return t('catWriting');
        case 'video': return t('catVideo');
        case 'tech': return t('catTech');
        case 'business': return t('catBusiness');
        case 'lifestyle': return t('catLifestyle');
        default: return slug;
    }
  }

  let displayTitle = t('adsTitle');
  let displaySubtitle = t('exploreBest');

  if (selectedCategory) {
      displayTitle = getCategoryName(selectedCategory);
      displaySubtitle = t('adsTitle'); 
  } else if (searchTerm) {
      displayTitle = `"${searchTerm}"`;
      displaySubtitle = t('searchPlaceholder');
  }

  const getSmartIcon = (service: any) => {
    const iconClass = "h-10 w-10 md:h-12 md:w-12 text-white/90 drop-shadow-md";
    const titleLower = (service.title || "").toLowerCase();
    if (titleLower.includes('auto') || titleLower.includes('alfa')) return <Car className={iconClass} />;
    if (titleLower.includes('popravka')) return <Wrench className={iconClass} />;
    if (titleLower.includes('kod')) return <Code className={iconClass} />;
    return <Layers className={iconClass} />;
  };

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/services');
        if (!response.ok) throw new Error('Mrežna greška');
        let data = await response.json();
        
        if (selectedCategory) {
          data = data.filter((s: any) => s.category.toLowerCase().includes(selectedCategory.toLowerCase()));
        } else if (searchTerm) {
          data = data.filter((s: any) => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        setFilteredServices(data);
      } catch (error) {
        console.error("Greška:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [selectedCategory, searchTerm]); 

  const handleSearch = () => {
    if (searchQuery.trim()) { router.push(`/?search=${encodeURIComponent(searchQuery)}`) }
  }

  const currentServices = filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* HERO */}
      <main className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-800 text-white py-10 md:py-32 overflow-hidden">
         <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-extrabold mb-1 tracking-tighter drop-shadow-2xl">SkillClick</h1>
            <p className="text-xs sm:text-sm md:text-2xl font-bold text-purple-200 tracking-[0.1em] uppercase mb-6 md:mb-10">{t('heroTitle')}</p>

            <div className="w-full max-w-3xl flex items-center bg-white p-1 md:p-2 rounded-full shadow-2xl h-10 md:h-auto">
                <div className="pl-3 md:pl-4 text-gray-400"><Search className="w-4 h-4 md:w-6 md:h-6" /></div>
                <Input 
                    type="text" 
                    placeholder={t('searchPlaceholder')} 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="flex-grow border-none shadow-none focus-visible:ring-0 text-gray-800 h-8 md:h-14 bg-transparent" 
                />
                <Button onClick={handleSearch} className="h-8 md:h-14 px-4 md:px-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold">
                    {t('searchBtn') || "Search"}
                </Button>
            </div>
         </div>
      </main>

      {/* SERVICES */}
      <section className="container mx-auto px-2 md:px-4 py-6 md:py-16 flex-grow">
        <h2 className="text-lg md:text-3xl font-bold text-gray-900 mb-6">{displayTitle}</h2>
        {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>)}
            </div>
        ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {currentServices.map((gig) => (
                      <div key={gig.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                          <Link href={`/services/${gig.id}`} className="block h-28 md:h-48 relative bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                              {getSmartIcon(gig)}
                          </Link>
                          <div className="p-3 flex flex-col flex-grow">
                              <h3 className="font-bold text-sm md:text-lg line-clamp-2">{gig.title}</h3>
                              <div className="mt-auto pt-2 border-t flex justify-between">
                                  <span className="font-bold text-purple-700">{gig.price} π</span>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-10 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-full w-10 h-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-full w-10 h-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </>
        )}
      </section>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Učitavanje...</div>}>
      <HomeContent />
    </Suspense>
  )
}
