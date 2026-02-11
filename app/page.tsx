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
    const iconClass = "h-10 w-10 text-white/90 drop-shadow-md"; // Smanjena ikonica
    const title = (typeof service.title === 'string' ? service.title : (service.title?.en || "")).toLowerCase();
    if (title.includes('auto') || title.includes('alfa')) return <Car className={iconClass} />;
    if (title.includes('popravka') || title.includes('servis')) return <Wrench className={iconClass} />;
    return <Layers className={iconClass} />;
  };

  const renderRating = (rating: number, count: number) => {
    if (!count || count === 0) {
      return (
        <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full w-fit">
           <span>🆕</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full w-fit border border-amber-100">
        <Star className="w-3 h-3 fill-current" />
        <span>{rating.toFixed(1)}</span>
        <span className="text-[10px] text-gray-400 font-normal">({count})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-800 text-white py-12 md:py-24 overflow-hidden">
         <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            
            {/* --- ADMIN DUGME (VRAĆENO NA STARO - VELIKO I CRVENO) --- */}
            {user?.isAdmin && (
              <Link href="/admin" className="mb-8 animate-bounce">
                <Button className="bg-red-600 font-bold px-8 py-6 rounded-xl shadow-xl flex items-center gap-2 border-2 border-white">
                  <ShieldCheck className="w-6 h-6" /> IDI NA ADMIN PANEL
                </Button>
              </Link>
            )}

            <h1 className="text-4xl md:text-7xl font-extrabold mb-2 tracking-tighter drop-shadow-2xl">SkillClick</h1>
            <p className="text-xs md:text-xl font-bold text-purple-200 uppercase mb-8">{t('heroTitle')}</p>
            
            <div className="w-full max-w-2xl flex items-center bg-white p-1 rounded-full shadow-2xl h-12">
                <Input 
                    placeholder={t('searchPlaceholder')} 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="flex-grow border-none shadow-none focus-visible:ring-0 text-gray-800 h-full bg-transparent text-sm md:text-base pl-5" 
                />
                <Button onClick={() => router.push(`/?search=${searchQuery}`)} className="h-full px-6 rounded-full bg-purple-600 font-bold text-sm hover:bg-purple-700">
                    {t('searchBtn')}
                </Button>
            </div>
         </div>
      </main>

      <section className="container mx-auto px-4 py-12 flex-grow bg-gray-50">
        
        <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-1 uppercase tracking-tight">
                {getCategoryTitle()}
            </h2>
            <div className="h-1 w-16 bg-purple-600 rounded-full"></div>
        </div>

        {dataLoading ? ( <div className="text-center py-10 text-gray-500 text-sm">{t('loading')}</div> ) : 
        filteredServices.length === 0 ? ( <div className="text-center py-10 text-gray-500 text-sm">Nema rezultata.</div> ) : (
            <>
                {/* GRID SA MANJIM KARTICAMA (lg:grid-cols-5) */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {currentServices.map((gig) => (
                        <div key={gig.id} className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
                            
                            {/* Slika smanjena na h-40 */}
                            <Link href={`/services/${gig.id}`} className="block relative h-36 md:h-40 overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(gig.id)} flex items-center justify-center transition-transform duration-500 group-hover:scale-110`}>
                                    {gig.images && gig.images.length > 0 ? ( <img src={gig.images[0]} alt={gig.title} className="w-full h-full object-cover" /> ) : ( getSmartIcon(gig) )}
                                </div>
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold text-purple-700 shadow-sm">
                                    {gig.price} π
                                </div>
                            </Link>

                            <div className="p-3 flex flex-col flex-grow relative gap-1.5">
                                <div className="flex justify-between items-start">
                                    {renderRating(gig.sellerRating || 0, gig.reviewCount || 0)}
                                </div>

                                {/* Naslov smanjen na text-sm */}
                                <h3 className="text-gray-900 font-bold text-sm leading-tight line-clamp-2 hover:text-purple-600 transition-colors">
                                  {typeof gig.title === 'object' ? (gig.title[lang] || gig.title['en']) : gig.title}
                                </h3>
                                
                                <div className="mt-auto pt-2 border-t flex items-center gap-1.5 text-[11px] text-gray-500 relative z-20">
                                    <User className="w-3 h-3" />
                                    <Link 
                                      href={`/seller/${gig.seller?.username}`} 
                                      className="truncate hover:text-purple-600 hover:underline font-medium cursor-pointer"
                                      onClick={(e) => e.stopPropagation()} 
                                    >
                                        {gig.seller?.username || "Prodavac"}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* PAGINACIJA DUGMIĆI */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-12">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="rounded-full text-xs font-bold px-4"
                        >
                            <ChevronLeft className="w-3 h-3 mr-1"/>
                        </Button>
                        
                        <span className="text-xs font-bold text-gray-500">
                            {currentPage} / {totalPages}
                        </span>

                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => changePage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="rounded-full text-xs font-bold px-4"
                        >
                            <ChevronRight className="w-3 h-3 ml-1"/>
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
