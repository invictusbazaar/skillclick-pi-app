"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Search, ExternalLink, Star, ChevronLeft, ChevronRight, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SERVICES_DATA } from '@/lib/data';

export default function AdminServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 👇 PAGINACIJA: 20 komada (10 levo + 10 desno)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // 👇 BACK DUGME EFEKAT (Samo za mobilni vizuelni prikaz)
  const [isBackActive, setIsBackActive] = useState(false);

  useEffect(() => {
    let allServices = [...SERVICES_DATA];
    if (typeof window !== 'undefined') {
        const localServicesStr = localStorage.getItem('skillclick_services');
        if (localServicesStr) {
            try {
                const localServices = JSON.parse(localServicesStr);
                allServices = [...localServices, ...allServices];
            } catch (e) {
                console.error("Greška", e);
            }
        }
    }
    setServices(allServices);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 👇 NOVA PAMETNA FUNKCIJA ZA NAZAD
  const handleBack = () => {
    // Provera da li je mobilni uređaj
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
        // MOBILNI: Aktiviraj vizuelni efekat, sačekaj 0.5s, pa idi nazad
        setIsBackActive(true);
        setTimeout(() => {
            router.back();
        }, 500);
    } else {
        // PC: Idi nazad ODMAH (hover rešava boju)
        router.back();
    }
  }

  const handleDeleteService = (id: number) => {
    if (confirm("Da li sigurno želiš da obrišeš ovaj oglas?")) {
        const updatedServices = services.filter(s => s.id !== id);
        setServices(updatedServices);
        if (typeof window !== 'undefined') {
            const localServicesStr = localStorage.getItem('skillclick_services');
            if (localServicesStr) {
                 const localServices = JSON.parse(localServicesStr);
                 const newLocalServices = localServices.filter((s: any) => s.id !== id);
                 localStorage.setItem('skillclick_services', JSON.stringify(newLocalServices));
            }
        }
    }
  };

  const getGradient = (id: number) => {
    const gradients = [
      "from-fuchsia-500 to-pink-600",
      "from-violet-500 to-purple-600",
      "from-blue-500 to-indigo-600",
      "from-emerald-400 to-teal-500"
    ];
    return gradients[(id - 1) % gradients.length];
  };

  const filteredServices = services.filter(service => 
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
             
             {/* 👇 BACK DUGME SA PAMETNIM EFEKTOM */}
             <button 
                onClick={handleBack}
                className={`
                    flex items-center gap-2 font-bold transition-all duration-200 outline-none
                    /* PC: Hover efekat (ljubičasto + blago uvećanje) */
                    hover:text-purple-600 hover:scale-105
                    /* Mobilni: Active efekat (ljubičasto + smanjenje) */
                    ${isBackActive 
                        ? "text-purple-600 scale-95" 
                        : "text-gray-600 px-3 py-2 rounded-xl" 
                    }
                `}
                style={{ WebkitTapHighlightColor: "transparent" }}
             >
                <ArrowLeft className={`w-5 h-5 transition-transform ${isBackActive ? '-translate-x-1' : ''}`} />
                <span>Nazad</span>
             </button>

             <div className="border-l border-gray-300 h-6 mx-2 hidden md:block"></div>

             <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                    <LayoutList className="w-5 h-5 text-purple-600" /> Oglasi
                </h1>
             </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-7xl">

        {/* SEARCH BAR */}
        <div className="flex items-center justify-between mb-6 gap-4">
            <div className="bg-white px-3 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2 flex-1 max-w-md h-10">
                <Search className="w-4 h-4 text-gray-400" />
                <Input 
                    placeholder="Pretraži..." 
                    className="border-none shadow-none text-sm focus-visible:ring-0 h-full bg-transparent p-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <span className="text-xs font-bold text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                Ukupno: {filteredServices.length}
            </span>
        </div>

        {/* GRID LISTA - 2 KOLONE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
            {paginatedServices.map((service) => (
                <div key={service.id} className="group bg-white rounded-xl border border-gray-200 p-2 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 flex items-center gap-3">
                    
                    {/* LEVO: Mala ikonica/Gradijent */}
                    <div className={`w-16 h-16 shrink-0 rounded-lg bg-gradient-to-br ${getGradient(service.id)} flex items-center justify-center text-white shadow-inner`}>
                         <div className="font-bold text-lg opacity-90">{service.author[0].toUpperCase()}</div>
                    </div>

                    {/* SREDINA: Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-gray-900 text-sm truncate pr-2 group-hover:text-purple-600 transition-colors">
                                {service.title}
                            </h3>
                            <span className="font-extrabold text-purple-700 text-sm whitespace-nowrap">{service.price} π</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                             <span className="truncate max-w-[100px]">{service.category}</span>
                             <span className="text-gray-300">•</span>
                             <span className="flex items-center gap-1 text-amber-500 font-bold">
                                <Star className="w-3 h-3 fill-current" /> {service.rating}
                             </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                            Autor: @{service.author}
                        </p>
                    </div>

                    {/* DESNO: Dugmići */}
                    <div className="flex flex-col gap-1 border-l border-gray-100 pl-2">
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                            onClick={() => router.push(`/service/${service.id}`)}
                            title="Pogledaj"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button 
                            size="icon" 
                            variant="ghost"
                            className="h-7 w-7 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteService(service.id)}
                            title="Obriši"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>

        {/* PAGINACIJA */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 pb-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg h-8 px-3 text-xs font-bold"
                >
                    <ChevronLeft className="w-3 h-3 mr-1" /> Prethodna
                </Button>
                
                <span className="text-xs font-bold text-gray-600 bg-white px-3 py-1.5 rounded-md border border-gray-200">
                    {currentPage} / {totalPages}
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg h-8 px-3 text-xs font-bold"
                >
                    Sledeća <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
            </div>
        )}

        {filteredServices.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
                Nema rezultata pretrage.
            </div>
        )}

      </main>
    </div>
  );
}