"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Search, ExternalLink, Star, ChevronLeft, ChevronRight, LayoutList, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // PAGINACIJA
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // BACK DUGME
  const [isBackActive, setIsBackActive] = useState(false);

  useEffect(() => {
    const loadData = async () => {
        let allServices: any[] = [];

        try {
            // 👇 ISPRAVLJENO: Sada admin vuče SVE oglase (i odobrene i neodobrene)
            const res = await fetch('/api/services?all=true');
            if (res.ok) {
                const dbData = await res.json();
                if (Array.isArray(dbData)) {
                    allServices = [...dbData];
                }
            }
        } catch (error) {
            console.error("Greška pri učitavanju iz API-ja:", error);
        }

        if (typeof window !== 'undefined') {
            const localServicesStr = localStorage.getItem('skillclick_services');
            if (localServicesStr) {
                try {
                    const localServices = JSON.parse(localServicesStr);
                    allServices = [...localServices, ...allServices];
                } catch (e) {
                    console.error("Greška local storage", e);
                }
            }
        }
        
        setServices(allServices);
    };

    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleBack = () => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        setIsBackActive(true);
        setTimeout(() => {
            router.back();
        }, 500);
    } else {
        router.back();
    }
  }

  // --- FUNKCIJA ZA BRISANJE ---
  const handleDeleteService = async (id: number | string) => {
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

        try {
            await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
        } catch (e) {
            console.error("Greška pri brisanju sa servera:", e);
        }
    }
  };

  // --- FUNKCIJA ZA ODOBRAVANJE / SUSPENZIJU ---
  const handleApproveService = async (id: number | string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // 1. Vizuelno (optimistično) ažuriramo listu odmah
    const updatedServices = services.map(s => 
        s.id === id ? { ...s, isApproved: newStatus } : s
    );
    setServices(updatedServices);

    // 2. Šaljemo zahtev serveru da upiše promenu u bazu
    try {
        await fetch(`/api/services`, { 
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, isApproved: newStatus })
        });
    } catch (e) {
        console.error("Greška pri promeni statusa oglasa:", e);
        alert("Došlo je do greške pri komunikaciji sa serverom.");
    }
  };

  const getGradient = (id: number) => {
    const gradients = [
      "from-fuchsia-500 to-pink-600",
      "from-violet-500 to-purple-600",
      "from-blue-500 to-indigo-600",
      "from-emerald-400 to-teal-500"
    ];
    const numId = typeof id === 'number' ? id : (id ? id.toString().charCodeAt(0) : 1);
    return gradients[numId % gradients.length] || gradients[0];
  };

  const getAuthorName = (author: any) => {
      if (!author) return 'unknown';
      if (typeof author === 'object') return author.username || 'unknown';
      return author;
  };

  const filteredServices = services.filter(service => {
    const titleMatch = service.title && service.title.toLowerCase().includes(searchTerm.toLowerCase());
    const authorName = getAuthorName(service.author).toLowerCase();
    const authorMatch = authorName.includes(searchTerm.toLowerCase());
    return titleMatch || authorMatch;
  });

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
             <button 
                onClick={handleBack}
                className={`
                    flex items-center gap-2 font-bold transition-all duration-200 outline-none
                    hover:text-purple-600 hover:scale-105
                    ${isBackActive ? "text-purple-600 scale-95" : "text-gray-600 px-3 py-2 rounded-xl" }
                `}
                style={{ WebkitTapHighlightColor: "transparent" }}
             >
                <ArrowLeft className={`w-5 h-5 transition-transform ${isBackActive ? '-translate-x-1' : ''}`} />
                <span>Nazad</span>
             </button>
             <div className="border-l border-gray-300 h-6 mx-2 hidden md:block"></div>
             <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                    <LayoutList className="w-5 h-5 text-purple-600" /> Upravljanje Oglasima
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
                    placeholder="Pretraži oglase ili autore..." 
                    className="border-none shadow-none text-sm focus-visible:ring-0 h-full bg-transparent p-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <span className="text-xs font-bold text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                Ukupno: {filteredServices.length}
            </span>
        </div>

        {/* GRID LISTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
            {paginatedServices.map((service) => {
                const authorName = getAuthorName(service.author);
                const isApproved = service.isApproved !== false; 
                
                return (
                <div key={service.id} className={`group bg-white rounded-xl border p-2 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-3 ${!isApproved ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200 hover:border-purple-200'}`}>
                    
                    {/* LEVO: Ikonica */}
                    <div className={`w-16 h-16 shrink-0 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shadow-inner ${!isApproved ? 'from-amber-400 to-orange-500 grayscale-[30%]' : getGradient(service.id)}`}>
                         <div className="font-bold text-lg opacity-90">
                            {authorName[0]?.toUpperCase() || 'U'}
                         </div>
                    </div>

                    {/* SREDINA: Info */}
                    <div className="flex-1 min-w-0 py-1">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-gray-900 text-sm truncate pr-2 group-hover:text-purple-600 transition-colors">
                                {service.title}
                            </h3>
                            <span className="font-extrabold text-purple-700 text-sm whitespace-nowrap bg-purple-50 px-2 py-0.5 rounded-md">{service.price} π</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                             <span className="truncate max-w-[100px]">{service.category}</span>
                             <span className="text-gray-300">•</span>
                             <span className="flex items-center gap-1 text-amber-500 font-bold">
                                <Star className="w-3 h-3 fill-current" /> {service.rating || 'N/A'}
                             </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-[10px] text-gray-400 truncate">
                                Autor: <span className="font-semibold text-gray-600">@{authorName}</span>
                            </p>
                            
                            {/* STATUS BADGE */}
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${isApproved ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-300 animate-pulse'}`}>
                                {isApproved ? 'Odobreno' : 'Na čekanju'}
                            </span>
                        </div>
                    </div>

                    {/* DESNO: Dugmići */}
                    <div className="flex flex-col gap-1 border-l border-gray-100 pl-2">
                        {/* Dugme ODOBRI / SUSPENDUJ */}
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className={`h-7 w-7 rounded-lg transition-colors ${!isApproved ? 'text-green-500 hover:bg-green-50' : 'text-amber-500 hover:bg-amber-50'}`}
                            onClick={() => handleApproveService(service.id, isApproved)}
                            title={isApproved ? "Suspenduj oglas" : "Odobri oglas"}
                        >
                            {isApproved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </Button>

                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => router.push(`/services/${service.id}`)}
                            title="Pregledaj oglas"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </Button>

                        <Button 
                            size="icon" 
                            variant="ghost"
                            className="h-7 w-7 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteService(service.id)}
                            title="Trajno obriši"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )})}
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
