"use client"

import { useState, useEffect, Suspense } from "react"
import { 
  Star, Wrench, Car, ShieldCheck, Layers, User, ChevronLeft, ChevronRight 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useLanguage } from "@/components/LanguageContext" 
import { useAuth } from "@/components/AuthContext" 

function HomeContent() {
  const [searchQuery, setSearchQuery] = useState("") 
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // 1. Paginacija - State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Max 12 oglasa po strani

  const { user } = useAuth(); 
  const router = useRouter();
  
  const searchParams = useSearchParams();
  const { t, lang } = useLanguage();

  const selectedCategory = searchParams.get('category');
  const searchTerm = searchParams.get('search');

  // Funkcija za prevod naslova kategorije
  const getCategoryTitle = () => {
    if (!selectedCategory) return t('adsTitle');
    if (searchTerm) return `Rezultati za: "${searchTerm}"`;

    const slug = selectedCategory.toLowerCase();
    const translationKey = 'cat' + slug.charAt(0).toUpperCase() + slug.slice(1);
    
    const translated = t(translationKey);
    return translated === translationKey ? selectedCategory.toUpperCase() : translated;
  };

  useEffect(() => {
    const fetchServices = async () => {
      setDataLoading(true);
      try {
        const response = await fetch('/api/services'); 
        let data = await response.json();
        if (!Array.isArray(data)) data = [];

        // Filtriranje
        if (selectedCategory) {
          const cat = selectedCategory.toLowerCase();
          data = data.filter((s: any) => s.category.toLowerCase().includes(cat));
        } else if (searchTerm) {
          const st = searchTerm.toLowerCase();
          data = data.filter((s: any) => s.title.toLowerCase().includes(st) || s.description.toLowerCase().includes(st));
        }
        setFilteredServices(data);
        setCurrentPage(1); // Reset na prvu stranu kod nove pretrage
      } catch (error) { 
          setFilteredServices([]); 
      } finally { setDataLoading(false); }
    };
    fetchServices();
  }, [selectedCategory, searchTerm]);

  // 2. Logika za seckanje niza (Paginacija)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServices = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        window.scrollTo({ top: 400, behavior: 'smooth' }); // Vraća na vrh liste
    }
  };

  const getGradient = (id: string) => {
    if (!id) return "from-indigo-500 to-purple-600";
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = ["from-fuchsia-600 to-pink-600", "from-violet-600 to-indigo-600", "from-blue-600 to-cyan-500", "from-emerald-500 to-teal-600"];
    return gradients[sum % gradients.length];
  };

  const getSmartIcon = (service: any) => {
    const iconClass = "h-12 w-12 text-white/90 drop-shadow-md"; 
    const title = (typeof service.title === 'string' ? service.title : (service.title?.en || "")).toLowerCase();
    if (title.includes('auto') || title.includes('alfa')) return <Car className={iconClass} />;
    if (title.includes('popravka') || title.includes('servis')) return <Wrench className={iconClass} />;
    return <Layers className={iconClass} />;
  };

  const renderRating = (rating: number, count: number) => {
    if (!count || count === 0) {
      return (
        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md w-fit border border-indigo-100 uppercase tracking-wide">
           <span>Novo</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md w-fit border border-amber-200 shadow-sm">
        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
        <span>{rating.toFixed(1)}</span>
        <span className="text-[10px] text-gray-500 font-medium">({count})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* HEADER SEKCIJA */}
      <main className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-800 text-white py-16 md:py-28 overflow-hidden">
         
         {/* ELEGANTNO ADMIN DUGME (Prikazano samo tebi) - SMANJEN Z-INDEX */}
         {user?.isAdmin && (
            <div className="absolute top-4 right-4 z-10 animate-fade-in">
              <Link href="/admin">
                <Button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full shadow-lg flex items-center gap-2 text-xs font-bold px-4 transition-all duration-300">
                  <ShieldCheck className="w-4 h-4 text-green-300" /> ADMIN
                </Button>
              </Link>
            </div>
         )}

         <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            
            <h1 className="text-5xl md:text-7xl font-black mb-3 tracking-tight drop-shadow-2xl">
              SkillClick
            </h1>
            <p className="text-sm md:text-lg font-medium text-purple-200 mb-10 max-w-xl leading-relaxed">
              {t('heroTitle')}
            </p>
            
            {/* SEARCH BAR */}
            <div className="w-full max-w-2xl flex items-center bg-white p-1.5 rounded-full shadow-2xl h-14 md:h-16 transition-all focus-within:ring-4 focus-within:ring-purple-400/30">
                <Input 
                    placeholder={t('searchPlaceholder')} 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="flex-grow border-none shadow-none focus-visible:ring-0 text-gray-800 h-full bg-transparent text-sm md:text-base pl-6 placeholder:text-gray-400" 
                    onKeyDown={(e) => e.key === 'Enter' && router.push(`/?search=${searchQuery}`)}
                />
                <Button onClick={() => router.push(`/?search=${searchQuery}`)} className="h-full px-8 rounded-full bg-purple-600 font-bold text-sm md:text-base hover:bg-purple-700 shadow-md transition-colors">
                    {t('searchBtn')}
                </Button>
            </div>
         </div>
      </main>

      {/* OGLASI SEKCIJA */}
      <section className="container mx-auto px-4 py-16 flex-grow bg-gray-50">
        
        <div className="mb-8 flex flex-col items-center md:items-start">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">
                {getCategoryTitle()}
            </h2>
            <div className="h-1.5 w-20 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"></div>
        </div>

        {dataLoading ? ( <div className="text-center py-20 text-gray-400 font-medium animate-pulse">{t('loading')}</div> ) : 
        filteredServices.length === 0 ? ( 
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                <p className="text-gray-500 font-medium">Nema rezultata za ovu pretragu.</p>
            </div> 
        ) : (
            <>
                {/* GRID KARTICA */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {currentServices.map((gig) => (
                        <div key={gig.id} className="group bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col h-full">
                            
                            {/* SLIKA KARTICE */}
                            <Link href={`/services/${gig.id}`} className="block relative aspect-[4/3] md:aspect-[3/2] overflow-hidden bg-gray-100 cursor-pointer">
                                <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(gig.id)} flex items-center justify-center transition-transform duration-700 group-hover:scale-110`}>
                                    {gig.images && gig.images.length > 0 ? ( 
                                        <img src={gig.images[0]} alt={gig.title} className="w-full h-full object-cover" /> 
                                    ) : ( 
                                        getSmartIcon(gig) 
                                    )}
                                </div>
                                {/* PREFINJENI CENA BEDŽ */}
                                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs md:text-sm font-black text-purple-700 shadow-sm border border-white/50">
                                    {gig.price} π
                                </div>
                            </Link>

                            {/* SADRŽAJ KARTICE */}
                            <div className="p-4 flex flex-col flex-grow relative gap-2">
                                <div className="flex justify-between items-start mb-1">
                                    {renderRating(gig.sellerRating || 0, gig.reviewCount || 0)}
                                </div>

                                <Link href={`/services/${gig.id}`} className="block cursor-pointer">
                                    <h3 className="text-gray-900 font-bold text-sm md:text-base leading-snug line-clamp-2 group-hover:text-purple-600 transition-colors">
                                      {typeof gig.title === 'object' ? (gig.title[lang] || gig.title['en']) : gig.title}
                                    </h3>
                                </Link>
                                
                                {/* PRODAVAC INFO */}
                                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                        {gig.seller?.username ? gig.seller.username[0].toUpperCase() : <User className="w-3 h-3"/>}
                                    </div>
                                    <Link 
                                      href={`/seller/${gig.seller?.username}`} 
                                      className="truncate hover:text-purple-600 hover:underline font-medium"
                                      onClick={(e) => e.stopPropagation()} 
                                    >
                                        {gig.seller?.username || "Korisnik"}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* PAGINACIJA */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-14">
                        <Button 
                            variant="outline" 
                            onClick={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="rounded-full w-10 h-10 p-0 shadow-sm hover:bg-purple-50 hover:text-purple-700 border-gray-200"
                        >
                            <ChevronLeft className="w-5 h-5"/>
                        </Button>
                        
                        <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-sm font-bold text-gray-600">
                            {currentPage} <span className="text-gray-400 font-normal mx-1">/</span> {totalPages}
                        </div>

                        <Button 
                            variant="outline" 
                            onClick={() => changePage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="rounded-full w-10 h-10 p-0 shadow-sm hover:bg-purple-50 hover:text-purple-700 border-gray-200"
                        >
                            <ChevronRight className="w-5 h-5"/>
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
    return ( <Suspense fallback={<div>...</div>}><HomeContent /></Suspense> ) 
}
