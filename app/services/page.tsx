"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, Suspense, useEffect } from "react"
import { Search, Star, Heart, ArrowLeft, MessageSquare, User, Menu, LogIn, UserPlus, Palette, Code, PenTool, Video, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

// MOCK PODACI (Samo kao fallback ako je baza prazna)
const MOCK_SERVICES = [
  { id: 1, title: "Modern Minimalist Logo Design", author: "pixel_art", price: 50, rating: 5.0, reviews: 124, category: "Design", icon: <Palette className="text-white h-10 w-10" /> },
];

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const initialQuery = searchParams.get("search") || ""
  const initialCategory = searchParams.get("category") || ""

  // Stanje za oglase
  const [services, setServices] = useState<any[]>([]); 
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [lang, setLang] = useState<"en" | "sr">("en") 
  const [query, setQuery] = useState(initialQuery)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  const t = {
    login: { en: "Login", sr: "Prijavi se" }, 
    register: { en: "Register", sr: "Registruj se" },
    messages: { en: "Messages", sr: "Poruke" },
    profile: { en: "Profile", sr: "Profil" },
    search: { en: "Search", sr: "Traži" },
    back: { en: "Back to Home", sr: "Nazad na početnu" },
  }

  // 1. UČITAVANJE PODATAKA IZ BAZE (OVO JE KLJUČNO!)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (response.ok) {
          const realData = await response.json();
          
          // Ako baza ima oglase, koristi njih. Ako ne, koristi Mock.
          const allData = realData.length > 0 ? realData : MOCK_SERVICES;
          
          setServices(allData);
          
          // Odmah primeni filtere na učitane podatke
          applyFilters(allData, initialCategory, initialQuery);
        } else {
            setServices(MOCK_SERVICES);
            applyFilters(MOCK_SERVICES, initialCategory, initialQuery);
        }
      } catch (error) {
        setServices(MOCK_SERVICES);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []); // Pokreće se samo jednom na startu

  // 2. FUNKCIJA ZA FILTRIRANJE
  const applyFilters = (data: any[], category: string, searchQuery: string) => {
      let result = data;

      if (category) {
        const cat = category.toLowerCase();
        result = result.filter((s: any) => {
            const serviceCat = s.category.toLowerCase();
            // Provera da li kategorija sadrži traženu reč (npr. "design" u "graphic design")
            return serviceCat.includes(cat) || cat.includes(serviceCat) || 
                   (cat === "graphics" && serviceCat.includes("design"));
        });
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter((s: any) => 
            s.title.toLowerCase().includes(q) || 
            s.description?.toLowerCase().includes(q)
        );
      }
      
      setFilteredServices(result);
  };

  // Kada se promene parametri u URL-u ili search polju, ponovo filtriraj
  useEffect(() => {
      if (services.length > 0) {
          applyFilters(services, initialCategory, query);
      }
  }, [initialCategory, query, services]);

  const handleSearch = () => {
    router.push(`/services?search=${encodeURIComponent(query)}`)
  }

  const getRandomGradient = (id: number) => {
    const gradients = ["from-pink-500 to-rose-500", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-orange-500 to-amber-500", "from-purple-500 to-indigo-500"];
    return gradients[id % gradients.length];
  };

  const buttonStyle = "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md px-4 py-1 h-9 transition-all text-sm font-medium";

  return (
    <div className="min-h-screen bg-blue-50/50">
      
      {/* HEADER (ISTI PLAVI) */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border"> 
        <div className="container mx-auto px-4 py-1 flex items-center justify-between"> 
          <Link href="/" className="flex items-center"><img src="/skillclick_logo.png" alt="SkillClick Logo" width={140} height={30} style={{ objectFit: 'contain' }} className="object-contain" /></Link>
          <div className="flex items-center gap-3">
             <Button variant="outline" onClick={() => setLang(lang === "en" ? "sr" : "en")} className={buttonStyle}>{lang === "en" ? "SR" : "EN"}</Button>
             <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-600"><Menu className="h-5 w-5" /></Button>
             {isLoggedIn ? (
                <div className="hidden md:flex gap-3 ml-2"><Link href="/messages"><Button variant="ghost" className="h-8 px-2 text-xs text-gray-600 hover:text-blue-600"><MessageSquare className="h-4 w-4 mr-1" />{t.messages[lang]}</Button></Link><Link href="/profile"><Button variant="ghost" className="h-8 px-2 text-xs text-gray-600 hover:text-blue-600"><User className="h-4 w-4 mr-1" />{t.profile[lang]}</Button></Link></div>
             ) : (
                <div className="hidden md:flex gap-3 items-center ml-2"><Link href="/auth/login"><Button variant="outline" className={buttonStyle}><LogIn className="h-4 w-4 mr-1" />{t.login[lang]}</Button></Link><Link href="/auth/register"><Button variant="outline" className={buttonStyle}><UserPlus className="h-4 w-4 mr-1" />{t.register[lang]}</Button></Link></div>
             )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <Link href="/" className="text-sm text-blue-600 hover:underline mb-2 inline-block flex items-center font-medium"><ArrowLeft className="w-4 h-4 mr-1"/> {t.back[lang]}</Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                    {initialCategory ? `Category: ${initialCategory.replace(/-/g, ' ').toUpperCase()}` : "Browse All Services"}
                    </h1>
                </div>
                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-grow md:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="pl-10 bg-white border-blue-200 focus-visible:ring-blue-600" placeholder={lang === "en" ? "Search..." : "Pretraži..."} />
                    </div>
                    <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white">{t.search[lang]}</Button>
                </div>
            </div>

          {loading ? (<div className="text-center py-20 text-gray-500">Loading marketplace...</div>) : filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredServices.map((gig) => (
                    <Link key={gig.id} href={`/services/${gig.id}`}>
                        <div className="group bg-white rounded-xl border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col relative">
                            <div className={`h-40 w-full bg-gradient-to-br ${getRandomGradient(gig.id)} flex items-center justify-center relative`}>
                                <div className="transform group-hover:scale-110 transition-transform duration-300 text-white text-5xl">{gig.image && gig.image.length < 5 ? gig.image : <Layers className="h-10 w-10 text-white" />}</div>
                                <button className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 text-white transition z-20"><Heart className="h-4 w-4" /></button>
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <div className="flex items-center gap-2 mb-2 relative z-20">
                                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">{gig.author ? gig.author[0].toUpperCase() : 'U'}</div>
                                    <span className="text-xs font-semibold text-gray-700 truncate">{gig.author || "Unknown"}</span>
                                    <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ml-auto">{gig.category}</span>
                                </div>
                                <p className="text-gray-900 hover:text-blue-600 font-bold mb-3 line-clamp-2 min-h-[3rem] text-sm relative z-20">{gig.title}</p>
                                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
                                    <div className="flex items-center text-yellow-500 text-sm font-bold gap-1"><Star className="h-4 w-4 fill-current" /> {gig.rating || 'New'} <span className="text-gray-400 font-normal text-xs">({gig.reviews || 0})</span></div>
                                    <div className="text-right"><p className="text-sm font-bold text-gray-900">{gig.price} π</p></div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
              <Layers className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No services found in this category.</h3>
              <p className="text-gray-500">Try "Browse All Services" or search for something else.</p>
              <Link href="/services"><Button variant="link" className="text-blue-600 mt-2">Clear Filters</Button></Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Učitavanje...</div>}>
      <SearchContent />
    </Suspense>
  )
}