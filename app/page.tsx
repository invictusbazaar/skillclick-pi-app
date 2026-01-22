"use client"

import { useState, useEffect, Suspense } from "react"
import { 
  Star, Wrench, Car, ShieldCheck, Layers
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
  
  const { user } = useAuth(); // Koristimo auth samo za prikaz dugmića, NE za redirect
  const router = useRouter();
  
  const searchParams = useSearchParams();
  const { t, lang } = useLanguage();

  const selectedCategory = searchParams.get('category');
  const searchTerm = searchParams.get('search');

  // ❌ UKLONJEN JE AUTOMATSKI REDIRECT
  // Sada možeš slobodno da gledaš početnu stranicu čak i kao admin.

  // Učitavanje oglasa
  useEffect(() => {
    const fetchServices = async () => {
      setDataLoading(true);
      try {
        const response = await fetch('/api/services'); 
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
          setFilteredServices([]); 
      } finally { setDataLoading(false); }
    };
    fetchServices();
  }, [selectedCategory, searchTerm]);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-800 text-white py-16 md:py-32 overflow-hidden">
         <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            
            {/* Admin dugme na Hero sekciji - Ostavili smo ga jer je korisno */}
            {user?.isAdmin && (
              <Link href="/admin" className="mb-8 animate-bounce">
                <Button className="bg-red-600 font-bold px-8 py-6 rounded-xl shadow-xl flex items-center gap-2 border-2 border-white">
                  <ShieldCheck className="w-6 h-6" /> IDI NA ADMIN PANEL
                </Button>
              </Link>
            )}

            <h1 className="text-5xl md:text-8xl font-extrabold mb-1 tracking-tighter drop-shadow-2xl">SkillClick</h1>
            <p className="text-sm md:text-2xl font-bold text-purple-200 uppercase mb-10">{t('heroTitle')}</p>
            
            <div className="w-full max-w-3xl flex items-center bg-white p-1 rounded-full shadow-2xl h-14">
                <Input 
                    placeholder={t('searchPlaceholder')} 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="flex-grow border-none shadow-none focus-visible:ring-0 text-gray-800 h-full bg-transparent text-lg pl-6" 
                />
                <Button onClick={() => router.push(`/?search=${searchQuery}`)} className="h-full px-8 rounded-full bg-purple-600 font-bold text-lg hover:bg-purple-700">
                    {t('searchBtn')}
                </Button>
            </div>
         </div>
      </main>

      <section className="container mx-auto px-4 py-16 flex-grow bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 uppercase tracking-tight">
            {selectedCategory ? selectedCategory : t('adsTitle')}
        </h2>
        {dataLoading ? ( <div className="text-center py-10 text-gray-500">Učitavanje...</div> ) : 
        filteredServices.length === 0 ? ( <div className="text-center py-10 text-gray-500">Nema oglasa.</div> ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredServices.map((gig) => (
                    <div key={gig.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col h-full">
                        <Link href={`/services/${gig.id}`} className="block relative h-48">
                            <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(gig.id)} flex items-center justify-center`}>
                                {gig.images && gig.images.length > 0 ? ( <img src={gig.images[0]} alt={gig.title} className="w-full h-full object-cover" /> ) : ( getSmartIcon(gig) )}
                            </div>
                        </Link>
                        <div className="p-5 flex flex-col flex-grow relative">
                            <h3 className="text-gray-900 font-bold mb-1 text-lg line-clamp-2">
                              {typeof gig.title === 'object' ? (gig.title[lang] || gig.title['en']) : gig.title}
                            </h3>
                            <div className="mt-auto pt-4 border-t flex items-center justify-between">
                                <span className="text-lg font-bold text-purple-700">{gig.price} π</span>
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

export default function HomePage() { 
    return ( <Suspense fallback={<div>...</div>}><HomeContent /></Suspense> ) 
}