"use client"

import { useState, useEffect, Suspense } from "react"
import { 
  Search, Layers, Heart, Star, PenTool, Monitor, Briefcase, Video, Code, Music, 
  Coffee, ChevronLeft, ChevronRight, 
  Bike, Wrench, Car, Bot, PawPrint, Palette, GraduationCap, Camera, Home, ShieldCheck
} from "lucide-react"
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
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<any>(null); 
  
  const itemsPerPage = 12;

  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // 👇👇👇 PI LOGIKA 👇👇👇
  useEffect(() => {
    const startLogin = async () => {
      try {
        if (!window.Pi) {
          console.log("Pi SDK još nije spreman, čekam...");
          return; 
        }

        await window.Pi.init({ version: "2.0", sandbox: false });
        
        const scopes = ['username', 'payments']; 
        const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
        
        console.log("Uspešan login:", authResult.user.username);
        setUser(authResult.user);

      } catch (error) {
        console.error("Greška pri Pi logovanju:", error);
      }
    };

    const onIncompletePaymentFound = (payment: any) => { console.log("Nezavršeno plaćanje:", payment); };

    const intervalId = setInterval(() => {
      if (window.Pi) {
        clearInterval(intervalId);
        startLogin();
      }
    }, 500);

    return () => clearInterval(intervalId);
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
        setUser(data.user);
      }
    } catch (err) { console.error(err); }
  };

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
    const category = service.category || "";

    if (titleLower.includes('auto') || titleLower.includes('opel') || titleLower.includes('alfa') || titleLower.includes('bmw')) return <Car className={iconClass} />;
    if (titleLower.includes('popravka') || titleLower.includes('majstor') || titleLower.includes('servis')) return <Wrench className={iconClass} />;
    if (titleLower.includes('cnc') || titleLower.includes('laser') || titleLower.includes('mašina') || titleLower.includes('node')) return <Bot className={iconClass} />;
    if (titleLower.includes('sajt') || titleLower.includes('web') || titleLower.includes('kod') || titleLower.includes('app')) return <Code className={iconClass} />;
    if (titleLower.includes('pas') || titleLower.includes('ljubimac')) return <PawPrint className={iconClass} />;
    
    switch(category) {
        case "Lifestyle": return <Heart className={iconClass} />;
        case "Tech": return <Code className={iconClass} />;
        case "Graphics & Design": return <Palette className={iconClass} />;
        default: return <Layers className={iconClass} />;
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        console.log("📡 Zovem bazu...");
        const response = await fetch('/api/services');
        
        if (!response.ok) {
           throw new Error('Problem sa mrežom');
        }
        
        let data = await response.json();
        
        if (!Array.isArray(data)) data = [];
        
        if (selectedCategory) {
          const filterLower = selectedCategory.toLowerCase();
          data = data.filter((service: any) => 
             service.category.toLowerCase().includes(filterLower) ||
             (filterLower === 'tech' && service.category.includes('Tech')) 
          );
        } else if (searchTerm) {
          data = data.filter((service: any) => 
            service.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            service.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setFilteredServices(data);
      } catch (error) {
        console.error("❌ Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory, searchTerm]); 

  const handleSearch = () => {
    if (searchQuery.trim()) { router.push(`/?search=${encodeURIComponent(searchQuery)}`) }
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServices = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    const section = document.getElementById('services-section');
    if (section) { section.scrollIntoView({ behavior: 'smooth' }); }
  };

  const getRandomGradient = (id: any) => {
    const gradients = ["from-fuchsia-500 to-pink-600", "from-violet-500 to-purple-600", "from-blue-500 to-indigo-600", "from-emerald-400 to-teal-500"];
    return gradients[0]; 
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* HERO */}
      <main className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-800 text-white py-10 md:py-32 overflow-hidden">
         <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-[80px] md:blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-indigo-500/20 rounded-full blur-[100px] md:blur-[120px] translate-x-1/3 translate-y-1/3"></div>

         <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            
            {/* 👇👇👇 IZMENJENO: ADMIN DUGME I USER BADGE KAO NA SLICI 👇👇👇 */}
            {user && (
              <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in">
                 {/* Pozdravni bedž */}
                 <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-900/40 rounded-full border border-indigo-400/30 backdrop-blur-md shadow-lg">
                    <span className="text-xl">👋</span>
                    <span className="font-bold text-purple-100">{user.username}</span>
                    <span className="text-xs text-purple-300 hover:text-white cursor-pointer ml-2 border-l border-purple-500/50 pl-2">
                       (Odjavi se)
                    </span>
                 </div>

                 {/* CRVENO DUGME - LINK POPRAVLJEN NA /admin */}
                 <Link href="/admin">
                    <Button className="bg-red-600 hover:bg-red-700 text-white font-bold text-base md:text-lg py-6 px-8 rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all border border-red-500/20 flex items-center gap-2">
                       <ShieldCheck className="w-6 h-6" />
                       UDJI U ADMIN PANEL
                    </Button>
                 </Link>
              </div>
            )}
            {/* 👆👆👆 KRAJ IZMENE 👆👆👆 */}
            
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-extrabold mb-1 tracking-tighter drop-shadow-2xl">SkillClick</h1>
            
            <p className="text-xs sm:text-sm md:text-2xl font-bold text-purple-200 tracking-[0.1em] uppercase mb-6 md:mb-10 shadow-black drop-shadow-md max-w-3xl">
                {t('heroTitle')}
            </p>

            <div className="w-full max-w-3xl flex items-center bg-white p-1 md:p-2 rounded-full shadow-2xl shadow-purple-900/40 transform hover:scale-[1.01] transition-transform duration-300 h-10 md:h-auto">
                <div className="pl-3 md:pl-4 text-gray-400"><Search className="w-4 h-4 md:w-6 md:h-6" /></div>
                <Input 
                    type="text" 
                    placeholder={t('searchPlaceholder')} 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="flex-grow border-none shadow-none focus-visible:ring-0 text-gray-800 px-2 md:px-4 h-8 md:h-14 text-sm md:text-lg bg-transparent placeholder:text-gray-400" 
                />
                <Button onClick={handleSearch} className="h-8 md:h-14 px-4 md:px-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-md transition-all text-xs md:text-lg">
                    {t('searchBtn') || "Search"}
                </Button>
            </div>
         </div>
      </main>

      {/* SERVICES GRID */}
      <section id="services-section" className="container mx-auto px-2 md:px-4 py-6 md:py-16 flex-grow bg-gray-50">
        <div className="flex justify-between items-end mb-4 md:mb-10">
            <div>
              <h2 className="text-lg md:text-3xl font-bold text-gray-900 tracking-tight">{displayTitle}</h2>
              <p className="text-gray-500 mt-0.5 text-xs md:text-base">
                 {displaySubtitle}
              </p>
            </div>
            
            {(selectedCategory || searchTerm) && (
               <Link href="/" className="text-gray-500 hover:text-purple-600 font-semibold text-xs md:text-sm flex items-center gap-1">
                  {t('viewAll')}
               </Link>
            )}
        </div>

        {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-64 md:h-80 bg-gray-200 rounded-2xl"></div>)}
            </div>
        ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 min-h-[500px]">
                  {currentServices.length > 0 ? (
                    currentServices.map((gig) => (
                        <div key={gig.id} className="group bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-purple-900/10 hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer">
                            
                            <Link href={`/services/${gig.id}`} className="block relative overflow-hidden h-28 md:h-48">
                                <div className={`absolute inset-0 bg-gradient-to-br ${getRandomGradient(gig.id)} flex items-center justify-center`}>
                                    <div className="transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out scale-75 md:scale-100">
                                      {getSmartIcon(gig)}
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2 bg-white/30 backdrop-blur-md rounded-full hover:bg-white text-white hover:text-red-500 transition-all z-20 shadow-sm">
                                      <Heart className="h-3 w-3 md:h-4 md:w-4" />
                                </div>
                            </Link>

                            <div className="p-2.5 md:p-5 flex flex-col flex-grow relative">
                                <div className="absolute -top-5 left-3 md:-top-6 md:left-5">
                                    <div className="w-9 h-9 md:w-12 md:h-12 bg-white p-0.5 md:p-1 rounded-full shadow-md">
                                      <div className="w-full h-full bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold border border-purple-200 text-xs md:text-sm">
                                        {(gig.author && gig.author[0]) ? gig.author[0].toUpperCase() : 'U'}
                                      </div>
                                    </div>
                                </div>
                                <div className="mt-4 mb-1 md:mb-2 flex justify-end">
                                    <span className="text-[10px] md:text-xs font-semibold text-gray-500 hover:text-purple-600 transition-colors">@{gig.author}</span>
                                </div>
                                
                                <Link href={`/services/${gig.id}`}>
                                  <h3 className="text-gray-900 font-bold mb-1 md:mb-2 text-xs md:text-lg leading-tight md:leading-snug group-hover:text-purple-600 transition-colors line-clamp-2">{gig.title}</h3>
                                </Link>
                                <div className="mt-auto pt-2 md:pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center text-gray-700 text-[10px] md:text-sm font-semibold gap-0.5 md:gap-1">
                                      <Star className="h-3 w-3 md:h-4 md:w-4 fill-amber-400 text-amber-400" /> {gig.rating || '5.0'} <span className="text-gray-400 font-normal">({gig.reviews || 0})</span>
                                    </div>
                                    <span className="text-sm md:text-lg font-bold text-gray-900">{gig.price} π</span>
                                </div>
                            </div>
                        </div>
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-500">
                      <p className="text-lg font-medium">{t('noReviews') || "Nema rezultata."}</p>
                      <Link href="/" className="mt-4 text-purple-600 hover:underline">{t('viewAll')}</Link>
                    </div>
                  )}
              </div>

              {/* PAGINACIJA */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-10 gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-full w-10 h-10 border-gray-200 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => handlePageChange(number)}
                        className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
                          currentPage === number
                            ? "bg-purple-600 text-white shadow-md transform scale-105"
                            : "text-gray-500 hover:bg-purple-50 hover:text-purple-600"
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-full w-10 h-10 border-gray-200 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-30"
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
    <Suspense fallback={<div className="p-10 text-center">...</div>}>
      <HomeContent />
    </Suspense>
  )
}
