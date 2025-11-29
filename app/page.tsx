"use client"

import { useState, useEffect } from "react"
import { Search, MessageSquare, User, Menu, LogIn, UserPlus, Star, Heart, Palette, Code, PenTool, Video, ChevronRight, Layers, Globe, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("") 
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter()

  const categoryLinks = [
    "Graphics & Design",
    "Digital Marketing",
    "Writing & Translation",
    "Video & Animation",
    "Programming & Tech",
    "Business",
    "Lifestyle"
  ];

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "sr", name: "Srpski", flag: "🇷🇸" },
    { code: "zh", name: "中文 (Chinese)", flag: "🇨🇳" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
    { code: "hi", name: "हिन्दी (Hindi)", flag: "🇮🇳" },
    { code: "id", name: "Indonesian", flag: "🇮🇩" },
  ];

  const categoryMap: { [key: string]: string } = {
    "Graphics & Design": "design", "Digital Marketing": "marketing", "Writing & Translation": "writing", "Video & Animation": "video", "Programming & Tech": "programming", "Business": "business", "Lifestyle": "lifestyle"
  };

  const [lang, setLang] = useState<string>("en") 

  const t: any = {
    searchPlaceholder: { en: "Search for services...", sr: "Pretražite usluge..." },
    messages: { en: "Messages", sr: "Poruke" },
    profile: { en: "Profile", sr: "Profil" },
    login: { en: "Login", sr: "Prijavi se" }, 
    register: { en: "Register", sr: "Registruj se" }, 
    offerService: { en: "Post a Service", sr: "Ponudi Uslugu" },
    popularServices: { en: "Popular Services", sr: "Popularne Usluge" },
    slogan: { en: "Find skill, pay with π.", sr: "Pronađite veštinu, platite π-jem." },
    websiteDesign: { en: "Website Design", sr: "Veb Dizajn" },
    logoDesign: { en: "Logo Design", sr: "Logo Dizajn" }
  }

  // MOCK PODACI
  const MOCK_GIGS = [
    { id: 1, title: "Modern Minimalist Logo Design", author: "pixel_art", price: 50, rating: 5.0, reviews: 124, gradient: "from-pink-500 to-rose-500", icon: <Palette className="text-white h-10 w-10" /> },
    { id: 2, title: "Full Stack Web Development", author: "dev_guy", price: 300, rating: 4.9, reviews: 85, gradient: "from-blue-500 to-cyan-500", icon: <Code className="text-white h-10 w-10" /> },
    { id: 3, title: "SEO Blog Writing & Copy", author: "writer_pro", price: 30, rating: 4.8, reviews: 210, gradient: "from-emerald-500 to-teal-500", icon: <PenTool className="text-white h-10 w-10" /> },
    { id: 4, title: "Pro Video Editing & VFX", author: "vid_master", price: 100, rating: 5.0, reviews: 42, gradient: "from-orange-500 to-amber-500", icon: <Video className="text-white h-10 w-10" /> },
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (response.ok) {
          const realData = await response.json();
          if (realData.length > 0) { setServices(realData); } else { setServices(MOCK_GIGS); }
        } else { setServices(MOCK_GIGS); }
      } catch (error) { setServices(MOCK_GIGS); } finally { setLoading(false); }
    };
    fetchServices();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) { router.push(`/services?search=${encodeURIComponent(searchQuery)}`) }
  }
  
  const handleTagClick = (tag: string) => {
    router.push(`/services?search=${encodeURIComponent(tag)}`)
  }

  const getRandomGradient = (id: number) => {
    const gradients = ["from-pink-500 to-rose-500", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-orange-500 to-amber-500", "from-purple-500 to-indigo-500"];
    return gradients[id % gradients.length];
  };

  return (
    <div className="min-h-screen bg-blue-50/50">
      
      {/* UKLONJENA HEADER KOMPONENTA IZ PAGE.TSX */}
      
      <main className="bg-blue-600 text-white py-16 md:py-32 relative overflow-hidden">
         <div className="container mx-auto px-4 relative z-10 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">SkillClick</h1>
            <div className="text-xl md:text-2xl font-medium mb-8 max-w-2xl leading-tight opacity-90 flex items-center justify-center md:justify-start flex-wrap">
                {t.slogan[lang]}
            </div>
            <div className="max-w-2xl relative flex items-center mx-auto md:mx-0">
                <Input type="text" placeholder={t.searchPlaceholder[lang]} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-12 pl-4 rounded-l-md rounded-r-none border-none text-gray-900 focus-visible:ring-0 bg-white" />
                <Button onClick={handleSearch} className="h-12 rounded-l-none rounded-r-md bg-blue-800 hover:bg-blue-900 px-8 text-lg transition-colors"><Search className="h-5 w-5" /></Button>
            </div>
            <div className="mt-6 flex gap-3 text-sm font-semibold opacity-80 justify-center md:justify-start flex-wrap">
                <span>Popular:</span>
                <div className="flex gap-2">
                  <button onClick={() => handleTagClick("Website Design")} className="border border-white/30 rounded-full px-3 py-0.5 cursor-pointer hover:bg-white hover:text-blue-900 transition">Website Design</button>
                  <button onClick={() => handleTagClick("Pi Network")} className="border border-white/30 rounded-full px-3 py-0.5 cursor-pointer hover:bg-white hover:text-blue-900 transition">Pi Network</button>
                  <button onClick={() => handleTagClick("Logo Design")} className="border border-white/30 rounded-full px-3 py-0.5 cursor-pointer hover:bg-white hover:text-blue-900 transition">Logo Design</button>
                </div>
            </div>
         </div>
      </main>

      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold text-gray-800">{t.popularServices[lang]}</h2>
            <Link href="/services" className="text-blue-600 hover:underline font-medium">View All</Link>
        </div>
        {loading ? (<div className="text-center py-10 text-gray-500">Loading services...</div>) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {services.map((gig) => (
                    <div key={gig.id} className="group bg-white rounded-xl border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full flex flex-col relative">
                        <Link href={`/services/${gig.id}`} className="block relative">
                            <div className={`h-28 md:h-40 w-full bg-gradient-to-br ${getRandomGradient(gig.id)} flex items-center justify-center`}>
                                <div className="transform group-hover:scale-110 transition-transform duration-300 text-3xl md:text-4xl">{gig.icon ? gig.icon : (gig.image && gig.image.length < 5 ? gig.image : <Layers className="h-8 w-8 md:h-10 md:w-10 text-white" />)}</div>
                                <div className="absolute top-2 right-2 p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 text-white transition z-20 cursor-pointer"><Heart className="h-3 w-3 md:h-4 md:w-4" /></div>
                            </div>
                        </Link>
                        <div className="p-3 md:p-4 flex flex-col flex-grow">
                            <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2 relative z-20">
                                <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold">{gig.author ? gig.author[0].toUpperCase() : 'U'}</div>
                                <Link href={`/seller/${gig.author}`} className="text-[10px] md:text-xs font-semibold text-gray-900 truncate hover:text-blue-600 hover:underline">{gig.author}</Link>
                            </div>
                            <Link href={`/services/${gig.id}`}><p className="text-gray-900 hover:text-blue-600 font-bold mb-2 md:mb-3 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem] text-xs md:text-sm relative z-20 cursor-pointer leading-tight">{gig.title}</p></Link>
                            <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-2 md:pt-3">
                                <div className="flex items-center text-yellow-500 text-[10px] md:text-xs font-bold gap-1"><Star className="h-3 w-3 fill-current" /> {gig.rating || 'New'} <span className="text-gray-400 font-normal text-xs">({gig.reviews || 0})</span></div>
                                <div className="text-right"><p className="text-xs md:text-sm font-bold text-gray-900">{gig.price} π</p></div>
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