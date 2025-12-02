"use client"

import { useState, useEffect } from "react"
import { Search, Layers, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/LanguageContext"
import { SERVICES_DATA } from "@/lib/data"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("") 
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter()
  const { t } = useLanguage();

  useEffect(() => {
    setServices(SERVICES_DATA);
    setLoading(false);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) { router.push(`/services?search=${encodeURIComponent(searchQuery)}`) }
  }
  
  const handleTagClick = (tag: string) => {
    router.push(`/services?search=${encodeURIComponent(tag)}`)
  }

  const getRandomGradient = (id: number) => {
    const gradients = ["from-fuchsia-500 to-pink-600", "from-violet-500 to-purple-600", "from-blue-500 to-indigo-600", "from-emerald-400 to-teal-500"];
    return gradients[(id - 1) % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* ❌ OBRISANO: OVDE JE BIO ONAJ RED SA LINKOVIMA (KATEGORIJE TRAKA)
          Sada je to čisto i kontroliše se samo kroz Navbar.
      */}

      {/* --- HERO SEKCIJA --- */}
      <main className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-800 text-white py-10 md:py-32 overflow-hidden">
         
         <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-[80px] md:blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-indigo-500/20 rounded-full blur-[100px] md:blur-[120px] translate-x-1/3 translate-y-1/3"></div>

         <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-extrabold mb-1 tracking-tighter drop-shadow-2xl">
               SkillClick
            </h1>
            <p className="text-xs sm:text-sm md:text-2xl font-bold text-purple-200 tracking-[0.2em] uppercase mb-6 md:mb-10 shadow-black drop-shadow-md">
               Find skill, pay with Pi
            </p>

            {/* SEARCH BAR */}
            <div className="w-full max-w-3xl flex items-center bg-white p-1 md:p-2 rounded-full shadow-2xl shadow-purple-900/40 transform hover:scale-[1.01] transition-transform duration-300 h-10 md:h-auto">
                <div className="pl-3 md:pl-4 text-gray-400">
                    <Search className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                <Input 
                  type="text" 
                  placeholder={t('searchPlaceholder')} 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="flex-grow border-none shadow-none focus-visible:ring-0 text-gray-800 px-2 md:px-4 h-8 md:h-14 text-sm md:text-lg bg-transparent placeholder:text-gray-400" 
                />
                <Button onClick={handleSearch} className="h-8 md:h-14 px-4 md:px-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold shadow-md transition-all text-xs md:text-lg">
                  Traži
                </Button>
            </div>

            {/* TAGOVI */}
            <div className="mt-4 md:mt-8 flex flex-wrap gap-2 items-center justify-center text-xs md:text-sm text-purple-200">
                <span className="font-medium mr-1 md:mr-2 opacity-80">{t('popularTag')}</span>
                <button onClick={() => handleTagClick("Website")} className="border border-white/20 bg-white/10 hover:bg-white hover:text-purple-900 rounded-full px-2 py-1 md:px-4 md:py-1.5 transition-all backdrop-blur-sm">Website</button>
                <button onClick={() => handleTagClick("Pi App")} className="border border-white/20 bg-white/10 hover:bg-white hover:text-purple-900 rounded-full px-2 py-1 md:px-4 md:py-1.5 transition-all backdrop-blur-sm">Pi App</button>
                <button onClick={() => handleTagClick("Logo")} className="border border-white/20 bg-white/10 hover:bg-white hover:text-purple-900 rounded-full px-2 py-1 md:px-4 md:py-1.5 transition-all backdrop-blur-sm">Logo</button>
            </div>
         </div>
      </main>

      {/* --- OGLASI --- */}
      <section className="container mx-auto px-2 md:px-4 py-6 md:py-16 flex-grow bg-gray-50">
        <div className="flex justify-between items-end mb-4 md:mb-10">
            <div>
              <h2 className="text-lg md:text-3xl font-bold text-gray-900 tracking-tight">{t('adsTitle')}</h2>
              <p className="text-gray-500 mt-0.5 text-xs md:text-base">Najtraženije usluge ove nedelje</p>
            </div>
            <Link href="/services" className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 transition-colors bg-purple-50 px-2 py-1 md:px-4 md:py-2 rounded-lg hover:bg-purple-100 text-xs md:text-sm">
              {t('viewAll')} <Layers className="w-3 h-3 md:w-4 md:h-4" />
            </Link>
        </div>

        {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-64 md:h-80 bg-gray-200 rounded-2xl"></div>)}
            </div>
        ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                {services.map((gig) => (
                    <div key={gig.id} className="group bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-purple-900/10 hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer">
                        
                        <Link href={`/services/${gig.id}`} className="block relative overflow-hidden h-28 md:h-48">
                            <div className={`absolute inset-0 bg-gradient-to-br ${gig.gradient || getRandomGradient(gig.id)} flex items-center justify-center`}>
                                <div className="transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out scale-75 md:scale-100">
                                  {gig.icon ? gig.icon : <Layers className="h-10 w-10 md:h-12 md:w-12 text-white/90" />}
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
                                    {gig.author ? gig.author[0].toUpperCase() : 'U'}
                                  </div>
                                </div>
                            </div>

                            <div className="mt-4 mb-1 md:mb-2 flex justify-end">
                                <Link href={`/seller/${gig.author}`} className="text-[10px] md:text-xs font-semibold text-gray-500 hover:text-purple-600 transition-colors">
                                  @{gig.author}
                                </Link>
                            </div>

                            <Link href={`/services/${gig.id}`}>
                              <h3 className="text-gray-900 font-bold mb-1 md:mb-2 text-xs md:text-lg leading-tight md:leading-snug group-hover:text-purple-600 transition-colors line-clamp-2">
                                {gig.title}
                              </h3>
                            </Link>

                            <div className="mt-auto pt-2 md:pt-4 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center text-gray-700 text-[10px] md:text-sm font-semibold gap-0.5 md:gap-1">
                                  <Star className="h-3 w-3 md:h-4 md:w-4 fill-amber-400 text-amber-400" /> 
                                  {gig.rating || 'New'} <span className="text-gray-400 font-normal">({gig.reviews || 0})</span>
                                </div>
                                <span className="text-sm md:text-lg font-bold text-gray-900">{gig.price} π</span>
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