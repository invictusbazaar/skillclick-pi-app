"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
// UVOZIMO SVE POTREBNE IKONICE
import { 
  Search, Layers, Heart, Star, ArrowLeft, Filter, Sparkles, ChevronLeft, ChevronRight,
  Car, Wrench, Code, PenTool, Video, Globe, Smartphone, Megaphone, Music, Database, Coffee, Monitor, Briefcase
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Uvoz podataka
import { SERVICES_DATA } from "@/lib/data";

function ServicesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "all";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  
  // State za sve oglase (iz fajla + local storage)
  const [allServices, setAllServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  
  // DODATO: State za Pi korisnika (da bismo znali ko je ulogovan)
  const [piUser, setPiUser] = useState<any>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const [isBackActive, setIsBackActive] = useState(false);

  // --- 1. PI AUTHENTICATION (NOVA LOGIKA) ---
  useEffect(() => {
    const initPi = async () => {
      try {
        const Pi = (window as any).Pi;
        if (Pi) {
          // Inicijalizacija bez debug konzole
          await Pi.init({ version: "2.0", sandbox: true });
          
          // Tražimo samo Username i Payments
          const scopes = ['username', 'payments'];
          const auth = await Pi.authenticate(scopes, (payment: any) => {
             console.log("Nedovršeno plaćanje:", payment);
          });
          
          // Čuvamo korisnika
          console.log("Uspešno ulogovan:", auth.user.username);
          setPiUser(auth.user);
        }
      } catch (err) {
        console.error("Pi Greška:", err);
      }
    };

    if ((window as any).Pi) {
      initPi();
    } else {
      window.addEventListener('pi-ready', initPi);
    }
  }, []);
  // -------------------------------------------

  // --- GLAVNA FUNKCIJA ZA IKONICE (PAMETNA DETEKCIJA) ---
  const getServiceIcon = (service: any) => {
    const iconClass = "h-14 w-14 text-white/90 drop-shadow-md";

    const textToCheck = `${service.icon || ''} ${service.title || ''} ${service.category || ''}`.toLowerCase();

    if (textToCheck.includes('car') || textToCheck.includes('auto') || textToCheck.includes('vehicle')) 
      return <Car className={iconClass} />;
    
    if (textToCheck.includes('repair') || textToCheck.includes('fix') || textToCheck.includes('mechanic')) 
      return <Wrench className={iconClass} />;

    if (textToCheck.includes('mobile') || textToCheck.includes('app') || textToCheck.includes('android')) 
        return <Smartphone className={iconClass} />;

    switch (service.category) {
        case "Graphics & Design": return <PenTool className={iconClass} />;
        case "Digital Marketing": return <Monitor className={iconClass} />;
        case "Writing & Translation": return <Briefcase className={iconClass} />;
        case "Video & Animation": return <Video className={iconClass} />;
        case "Programming & Tech": return <Code className={iconClass} />;
        case "Music & Audio": return <Music className={iconClass} />;
        case "Business": return <Database className={iconClass} />;
        case "Lifestyle": 
            return <Coffee className={iconClass} />;
        default: return <Layers className={iconClass} />;
    }
  };

  const handleBackClick = () => {
    setIsBackActive(true);
    setTimeout(() => {
      router.push('/'); 
    }, 500);
  };

  const getRandomGradient = (id: number) => {
    const gradients = [
      "from-fuchsia-600 to-pink-600",
      "from-violet-600 to-purple-700",
      "from-blue-600 to-indigo-700",
      "from-emerald-500 to-teal-600",
      "from-orange-500 to-red-600"
    ];
    const numId = typeof id === 'number' ? id : 1; 
    return gradients[(numId - 1) % gradients.length];
  };

  // UČITAVANJE PODATAKA (Local Storage + Data fajl)
  useEffect(() => {
    let combinedData = [...SERVICES_DATA];

    if (typeof window !== 'undefined') {
        const localServicesStr = localStorage.getItem('skillclick_services');
        if (localServicesStr) {
            try {
                const localServices = JSON.parse(localServicesStr);
                combinedData = [...localServices, ...combinedData];
            } catch (e) {
                console.error("Error loading local services", e);
            }
        }
    }
    setAllServices(combinedData);
  }, []);

  // FILTRIRANJE
  useEffect(() => {
    let results = allServices;

    if (searchTerm) {
      results = results.filter((service: any) => 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      results = results.filter((service: any) => service.category === selectedCategory);
    }

    setFilteredServices(results);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, allServices]);

  // PAGINACIJA
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentServices = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'Graphics & Design', label: 'Graphics & Design' },
    { id: 'Programming & Tech', label: 'Programming & Tech' },
    { id: 'Writing & Translation', label: 'Writing & Translation' },
    { id: 'Video & Animation', label: 'Video & Animation' },
    { id: 'Digital Marketing', label: 'Digital Marketing' },
    { id: 'Lifestyle', label: 'Lifestyle' },
    { id: 'Business', label: 'Business' },
    { id: 'Music & Audio', label: 'Music & Audio' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* --- HEADER --- */}
      <div className="bg-[#2A1A3A] text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-blue-600/20 blur-[60px] rounded-full pointer-events-none"></div>

         <div className="container mx-auto px-4 pt-8 pb-12 relative z-10">
            <div className="flex justify-between items-start mb-6">
                <button 
                    onClick={handleBackClick}
                    className={`flex items-center text-sm font-medium transition-colors duration-300 ${
                       isBackActive ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <ArrowLeft className={`w-4 h-4 mr-2 ${isBackActive ? 'text-purple-400' : ''}`} />
                    Back to Home
                </button>
                
                {/* Prikaz korisnika ako je ulogovan */}
                {piUser && (
                   <span className="text-sm font-medium text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                     @{piUser.username}
                   </span>
                )}
            </div>

            <div className="max-w-3xl">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 flex items-center gap-3">
                   Find services <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                </h1>
                
                <div className="relative max-w-2xl mt-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      type="text" 
                      placeholder="Search for services..." 
                      className="pl-12 h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-2xl focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-500 transition-all shadow-lg backdrop-blur-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
         </div>
      </div>

      {/* --- FILTER BAR --- */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
             <Filter className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
             {categories.map((cat) => (
                <button 
                   key={cat.id}
                   onClick={() => setSelectedCategory(cat.id)}
                   className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                      selectedCategory === cat.id 
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-200 scale-105' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                   }`}
                >
                   {cat.label}
                </button>
             ))}
          </div>
        </div>
      </div>

      {/* --- REZULTATI --- */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold text-gray-900">
               {filteredServices.length} <span className="text-gray-500 font-normal text-base">Results found</span>
            </h2>
            <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages || 1}
            </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {currentServices.map((gig: any) => (
                <div key={gig.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer h-full">
                    
                    <Link href={`/services/${gig.id}`} className="block relative overflow-hidden h-48">
                        <div className={`absolute inset-0 bg-gradient-to-br ${gig.gradient || getRandomGradient(gig.id)} flex items-center justify-center`}>
                             <div className="transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out drop-shadow-md">
                                {getServiceIcon(gig)}
                             </div>
                        </div>
                        <div className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white text-white hover:text-red-500 transition-all z-20">
                              <Heart className="h-4 w-4" />
                        </div>
                    </Link>

                    <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700 ring-2 ring-white shadow-sm">
                              {(gig.author && gig.author[0]) ? gig.author[0].toUpperCase() : 'U'}
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">@{gig.author || 'user'}</span>
                        </div>

                        <Link href={`/services/${gig.id}`} className="block mb-3">
                          <h3 className="text-gray-900 font-bold text-lg leading-snug hover:text-purple-600 transition-colors line-clamp-2">
                            {gig.title}
                          </h3>
                        </Link>

                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center bg-amber-50 px-2 py-1 rounded-md">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 mr-1" /> 
                              <span className="text-xs font-bold text-amber-700">{gig.rating || 'New'}</span>
                              <span className="text-xs text-amber-600/70 ml-1">({gig.reviews || 0})</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs text-gray-400 font-medium">Starting at</span>
                                <span className="text-lg font-extrabold text-purple-700">{gig.price} π</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* --- EMPTY STATE --- */}
        {filteredServices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                 <Search className="w-10 h-10 text-gray-400" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
             <p className="text-gray-500 max-w-md">Try adjusting your filters or search term.</p>
             <Button 
                onClick={() => {setSearchTerm(''); setSelectedCategory('all');}}
                variant="outline" 
                className="mt-6 border-purple-200 text-purple-700 hover:bg-purple-50"
             >
                Clear all filters
             </Button>
          </div>
        )}

        {/* --- PAGINATION --- */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-10 px-4 rounded-xl border-gray-300 text-gray-600 hover:text-purple-600 hover:border-purple-300 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                <span>Page</span>
                <span className="text-purple-600">{currentPage}</span>
                <span className="text-gray-400">/</span>
                <span>{totalPages}</span>
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-10 px-4 rounded-xl border-gray-300 text-gray-600 hover:text-purple-600 hover:border-purple-300 disabled:opacity-50"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AllServicesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading services...</div>}>
      <ServicesContent />
    </Suspense>
  );
}