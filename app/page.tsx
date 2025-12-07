"use client"

import { useState, useEffect, Suspense } from "react"
// 👇 DODATE SVE IKONICE IZ KREATORA (Bot, PawPrint, GraduationCap, itd.)
import { 
  Search, Layers, Heart, Star, PenTool, Monitor, Briefcase, Video, Code, Music, 
  Coffee, Database, ChevronLeft, ChevronRight, 
  Bike, Wrench, Car, Smartphone, Globe, Megaphone,
  Bot, PawPrint, Palette, GraduationCap, Camera, Home, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useLanguage } from "@/components/LanguageContext"
import { SERVICES_DATA } from "@/lib/data"

function HomeContent() {
  const [searchQuery, setSearchQuery] = useState("") 
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [title, setTitle] = useState("Popular Services");
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const selectedCategory = searchParams.get('category');
  const searchTerm = searchParams.get('search');

  // 👇 NOVA PAMETNA FUNKCIJA (ISTI MOZAK KAO U KREATORU OGLASA)
  const getSmartIcon = (service: any) => {
    const iconClass = "h-10 w-10 md:h-12 md:w-12 text-white/90 drop-shadow-md";
    
    // Uzimamo naslov i pretvaramo u mala slova radi provere
    const titleLower = (service.title || "").toLowerCase();
    const category = service.category || "";

    // --- 1. PROVERA KLJUČNIH REČI (IDENTIČNO KAO KOD KREIRANJA) ---
    
    // Automobili
    if (titleLower.includes('auto') || titleLower.includes('opel') || titleLower.includes('alfa') || titleLower.includes('fiat') || titleLower.includes('bmw') || titleLower.includes('vozil')) 
      return <Car className={iconClass} />;
    
    // Majstori / Popravke
    if (titleLower.includes('popravka') || titleLower.includes('majstor') || titleLower.includes('servis') || titleLower.includes('mehaničar') || titleLower.includes('fix')) 
      return <Wrench className={iconClass} />;

    // Mašine / CNC
    if (titleLower.includes('cnc') || titleLower.includes('laser') || titleLower.includes('mašina') || titleLower.includes('3d')) 
      return <Bot className={iconClass} />;

    // Ljubimci
    if (titleLower.includes('pas') || titleLower.includes('mačka') || titleLower.includes('ljubimac') || titleLower.includes('šetnja')) 
      return <PawPrint className={iconClass} />;

    // Programiranje / Web
    if (titleLower.includes('sajt') || titleLower.includes('web') || titleLower.includes('kod') || titleLower.includes('app')) 
      return <Code className={iconClass} />;

    // Dizajn
    if (titleLower.includes('logo') || titleLower.includes('dizajn') || titleLower.includes('slika')) 
      return <Palette className={iconClass} />;

    // Edukacija
    if (titleLower.includes('časovi') || titleLower.includes('matematika') || titleLower.includes('škola')) 
      return <GraduationCap className={iconClass} />;

    // Hrana / Lifestyle
    if (titleLower.includes('hrana') || titleLower.includes('torta') || titleLower.includes('catering') || titleLower.includes('kafa')) 
      return <Coffee className={iconClass} />;

    // Foto / Video
    if (titleLower.includes('foto') || titleLower.includes('slikanje') || titleLower.includes('video')) 
      return <Camera className={iconClass} />;

    // Kuća
    if (titleLower.includes('kuća') || titleLower.includes('stan') || titleLower.includes('čišćenje')) 
      return <Home className={iconClass} />;

    // Bicikli (Dodato jer si tražio)
    if (titleLower.includes('bicikl') || titleLower.includes('bike')) 
       return <Bike className={iconClass} />;


    // --- 2. FALLBACK PO KATEGORIJAMA (AKO NEMA KLJUČNE REČI) ---
    switch(category) {
        case "Lifestyle": return <Heart className={iconClass} />;
        
        // 👇 IZMENJENO OVDE: Graphics sada koristi Palette 🎨
        case "Graphics & Design": return <Palette className={iconClass} />;
        
        case "Programming & Tech": return <Code className={iconClass} />;
        case "Digital Marketing": return <Monitor className={iconClass} />;
        
        // 👇 IZMENJENO OVDE: Writing sada koristi PenTool ✒️
        case "Writing & Translation": return <PenTool className={iconClass} />;
        
        case "Video & Animation": return <Video className={iconClass} />;
        
        // 👇 IZMENJENO OVDE: Business sada koristi Briefcase 💼
        case "Business": return <Briefcase className={iconClass} />;
        
        case "Music & Audio": return <Music className={iconClass} />;
        default: return <Layers className={iconClass} />;
    }
  };

  useEffect(() => {
    setLoading(true);
    
    let allServices = [...SERVICES_DATA];

    if (typeof window !== 'undefined') {
        const localServicesStr = localStorage.getItem('skillclick_services');
        if (localServicesStr) {
            try {
                const localServices = JSON.parse(localServicesStr);
                // Dodajemo lokalne oglase na početak
                allServices = [...localServices, ...allServices];
            } catch (e) {
                console.error("Greška pri učitavanju sačuvanih oglasa:", e);
            }
        }
    }

    let data = allServices;

    if (selectedCategory) {
      data = data.filter((service: any) => service.category === selectedCategory);
      setTitle(selectedCategory); 
    } else if (searchTerm) {
      data = data.filter((service: any) => 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setTitle(`Rezultati pretrage: "${searchTerm}"`);
    } else {
      setTitle("Popular Services");
    }

    setFilteredServices(data);
    setCurrentPage(1); 
    setLoading(false);
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
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getRandomGradient = (id: number) => {
    const gradients = ["from-fuchsia-500 to-pink-600", "from-violet-500 to-purple-600", "from-blue-500 to-indigo-600", "from-emerald-400 to-teal-500"];
    const numId = typeof id === 'number' ? id : 1;
    return gradients[(numId - 1) % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* --- HERO SEKCIJA --- */}
      <main className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-800 text-white py-10 md:py-32 overflow-hidden">
         <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-[80px] md:blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-indigo-500/20 rounded-full blur-[100px] md:blur-[120px] translate-x-1/3 translate-y-1/3"></div>

         <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-extrabold mb-1 tracking-tighter drop-shadow-2xl">SkillClick</h1>
            <p className="text-xs sm:text-sm md:text-2xl font-bold text-purple-200 tracking-[0.2em] uppercase mb-6 md:mb-10 shadow-black drop-shadow-md">Find skill, pay with Pi</p>

            <div className="w-full max-w-3xl flex items-center bg-white p-1 md:p-2 rounded-full shadow-2xl shadow-purple-900/40 transform hover:scale-[1.01] transition-transform duration-300 h-10 md:h-auto">
                <div className="pl-3 md:pl-4 text-gray-400"><Search className="w-4 h-4 md:w-6 md:h-6" /></div>
                <Input type="text" placeholder={t('searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-grow border-none shadow-none focus-visible:ring-0 text-gray-800 px-2 md:px-4 h-8 md:h-14 text-sm md:text-lg bg-transparent placeholder:text-gray-400" />
                <Button onClick={handleSearch} className="h-8 md:h-14 px-4 md:px-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-md transition-all text-xs md:text-lg">Traži</Button>
            </div>
         </div>
      </main>

      {/* --- OGLASI --- */}
      <section id="services-section" className="container mx-auto px-2 md:px-4 py-6 md:py-16 flex-grow bg-gray-50">
        <div className="flex justify-between items-end mb-4 md:mb-10">
            <div>
              <h2 className="text-lg md:text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>
              <p className="text-gray-500 mt-0.5 text-xs md:text-base">
                 {selectedCategory ? `Kategorija: ${selectedCategory}` : "Istražite najbolje ponude"}
              </p>
            </div>
            
            {(selectedCategory || searchTerm) && (
               <Link href="/" className="text-gray-500 hover:text-purple-600 font-semibold text-xs md:text-sm flex items-center gap-1">
                  Prikaži sve
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
                                <div className={`absolute inset-0 bg-gradient-to-br ${gig.gradient || getRandomGradient(gig.id)} flex items-center justify-center`}>
                                    <div className="transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out scale-75 md:scale-100">
                                      {/* 👇 POZIV NOVE FUNKCIJE */}
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
                                    <Link href={`/seller/${gig.author}`} className="text-[10px] md:text-xs font-semibold text-gray-500 hover:text-purple-600 transition-colors">@{gig.author}</Link>
                                </div>
                                <Link href={`/services/${gig.id}`}>
                                  <h3 className="text-gray-900 font-bold mb-1 md:mb-2 text-xs md:text-lg leading-tight md:leading-snug group-hover:text-purple-600 transition-colors line-clamp-2">{gig.title}</h3>
                                </Link>
                                <div className="mt-auto pt-2 md:pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center text-gray-700 text-[10px] md:text-sm font-semibold gap-0.5 md:gap-1">
                                      <Star className="h-3 w-3 md:h-4 md:w-4 fill-amber-400 text-amber-400" /> {gig.rating || 'New'} <span className="text-gray-400 font-normal">({gig.reviews || 0})</span>
                                    </div>
                                    <span className="text-sm md:text-lg font-bold text-gray-900">{gig.price} π</span>
                                </div>
                            </div>
                        </div>
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-500">
                      <p className="text-lg font-medium">Nema oglasa u ovoj kategoriji.</p>
                      <Link href="/" className="mt-4 text-purple-600 hover:underline">Vrati se na sve oglase</Link>
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
    <Suspense fallback={<div className="p-10 text-center">Učitavanje...</div>}>
      <HomeContent />
    </Suspense>
  )
}