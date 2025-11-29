"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, Suspense, useEffect } from "react"
import { Search, Star, Heart, ArrowLeft, MessageSquare, User, Menu, LogIn, UserPlus, Palette, Code, PenTool, Video, Layers, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

// MOCK SERVICES (Fallback)
const MOCK_SERVICES = [
  { id: 1, title: "Modern Minimalist Logo Design", author: "pixel_art", price: 50, rating: 5.0, reviews: 124, category: "Design", gradient: "from-pink-500 to-rose-500", icon: <Palette className="text-white h-10 w-10" /> },
  // ...
];

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const initialQuery = searchParams.get("search") || ""
  const initialCategory = searchParams.get("category") || ""

  const [services, setServices] = useState<any[]>([]); 
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

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

  // 1. UČITAVANJE PODATAKA
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (response.ok) {
          const realData = await response.json();
          const combined = [...realData, ...MOCK_SERVICES];
          const unique = combined.filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i);
          setServices(unique);
        } else { setServices(MOCK_SERVICES); }
      } catch (error) { setServices(MOCK_SERVICES); } finally { setLoading(false); }
    };
    fetchServices();
  }, []);

  // 2. FILTRIRANJE
  useEffect(() => {
    let result = [...services];

    if (initialCategory) {
        const cat = initialCategory.toLowerCase();
        result = result.filter(s => s.category.toLowerCase().includes(cat));
    }
    
    const activeQuery = query || initialQuery;
    if (activeQuery) {
        const q = activeQuery.toLowerCase();
        result = result.filter(s => 
            s.title.toLowerCase().includes(q) || 
            (s.description && s.description.toLowerCase().includes(q)) ||
            s.category.toLowerCase().includes(q) ||
            (s.author && s.author.toLowerCase().includes(q)) 
        );
    }

    if (minPrice) result = result.filter(s => s.price >= parseFloat(minPrice));
    if (maxPrice) result = result.filter(s => s.price <= parseFloat(maxPrice));

    if (sortBy === "price_low") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_high") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);

    setFilteredServices(result);
  }, [services, initialCategory, query, initialQuery, minPrice, maxPrice, sortBy]);

  const handleSearch = () => { router.push(`/services?search=${encodeURIComponent(query)}`) }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { handleSearch(); }
  };

  const getRandomGradient = (id: number) => {
    const gradients = ["from-pink-500 to-rose-500", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-orange-500 to-amber-500", "from-purple-500 to-indigo-500"];
    return gradients[id % gradients.length];
  };

  const buttonStyle = "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md px-4 py-1 h-9 transition-all text-sm font-medium";

  return (
    <div className="min-h-screen bg-blue-50/50">
      
      {/* UKLONJEN REDUNDANTNI HEADER IZ OVOG FAJLA */}

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <Link href="/" className="text-sm text-blue-600 hover:underline mb-2 inline-block flex items-center font-medium"><ArrowLeft className="w-4 h-4 mr-1"/> {t.back[lang]}</Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                    {initialCategory ? `Category: ${initialCategory.replace(/-/g, ' ').toUpperCase()}` : (query ? `Results for: "${query}"` : "Browse All Services")}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Found {filteredServices.length} services</p>
                </div>
                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-grow md:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyPress} className="pl-10 bg-white border-blue-200 focus-visible:ring-blue-600" placeholder={lang === "en" ? "Search services..." : "Pretraži..."} />
                    </div>
                    <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white">{t.search[lang]}</Button>
                </div>
            </div>

            {/* FILTER TRAKA */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-gray-600 text-sm font-medium"><Filter className="h-4 w-4" /> Filters:</div>
                    <div className="flex items-center gap-2">
                        <Input type="number" placeholder="Min π" className="w-20 h-9 text-sm border-gray-300 focus-visible:ring-blue-600" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                        <span className="text-gray-400">-</span>
                        <Input type="number" placeholder="Max π" className="w-20 h-9 text-sm border-gray-300 focus-visible:ring-blue-600" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm text-gray-500">Sort by:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[180px] h-9 text-sm border-gray-300 focus:ring-blue-600"><SelectValue placeholder="Recommended" /></SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                            <SelectItem value="recommended">Recommended</SelectItem>
                            <SelectItem value="price_low">Price: Low to High</SelectItem>
                            <SelectItem value="price_high">Price: High to Low</SelectItem>
                            <SelectItem value="rating">Top Rated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

          {/* REZULTATI */}
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredServices.map((gig) => (
                    <div key={gig.id} className="group bg-white rounded-xl border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col relative">
                        <Link href={`/services/${gig.id}`} className="block relative">
                            <div className={`h-40 w-full bg-gradient-to-br ${getRandomGradient(gig.id)} flex items-center justify-center relative`}>
                                <div className="transform group-hover:scale-110 transition-transform duration-300 text-white text-5xl">{gig.icon ? gig.icon : (gig.image && gig.image.length < 5 ? gig.image : <Layers className="h-10 w-10 text-white" />)}</div>
                                <button className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 text-white transition z-20"><Heart className="h-4 w-4" /></button>
                            </div>
                        </Link>
                        <div className="p-4 flex flex-col flex-grow">
                            <div className="flex items-center gap-2 mb-2 relative z-20">
                                <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">{gig.author ? gig.author[0].toUpperCase() : 'U'}</div>
                                <Link href={`/seller/${gig.author}`} className="text-xs font-semibold text-gray-700 truncate hover:text-blue-600 hover:underline">{gig.author || "Unknown"}</Link>
                            </div>
                            <Link href={`/services/${gig.id}`}><p className="text-gray-900 hover:text-blue-600 font-bold mb-3 line-clamp-2 min-h-[3rem] text-sm relative z-20 cursor-pointer">{gig.title}</p></Link>
                            <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
                                <div className="flex items-center text-yellow-500 text-sm font-bold gap-1"><Star className="h-4 w-4 fill-current" /> {gig.rating || 'New'} <span className="text-gray-400 font-normal text-xs">({gig.reviews || 0})</span></div>
                                <div className="text-right"><p className="text-sm font-bold text-gray-900">{gig.price} π</p></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
              <Layers className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No services found.</h3>
              <p className="text-gray-500">Try adjusting your filters or search term.</p>
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