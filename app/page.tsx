"use client"

import { useState, useEffect } from "react"
import { Search, MessageSquare, User, Menu, LogIn, UserPlus, Star, Heart, Palette, Code, PenTool, Video, ChevronRight, Layers, Globe, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    explore: { en: "Explore", sr: "Istraži" },
    becomeSeller: { en: "Become a Seller", sr: "Postani Prodavac" },
    slogan: { en: "Find skill, pay with π.", sr: "Pronađite veštinu, platite π-jem." }
  }

  // MOCK PODACI
  const MOCK_GIGS = [
    { id: 1, title: "Modern Minimalist Logo Design", author: "pixel_art", price: 50, rating: 5.0, reviews: 124, gradient: "from-pink-500 to-rose-500", icon: <Palette className="text-white h-8 w-8 md:h-10 md:w-10" /> },
    { id: 2, title: "Full Stack Web Development", author: "dev_guy", price: 300, rating: 4.9, reviews: 85, gradient: "from-blue-500 to-cyan-500", icon: <Code className="text-white h-8 w-8 md:h-10 md:w-10" /> },
    { id: 3, title: "SEO Blog Writing & Copy", author: "writer_pro", price: 30, rating: 4.8, reviews: 210, gradient: "from-emerald-500 to-teal-500", icon: <PenTool className="text-white h-8 w-8 md:h-10 md:w-10" /> },
    { id: 4, title: "Pro Video Editing & VFX", author: "vid_master", price: 100, rating: 5.0, reviews: 42, gradient: "from-orange-500 to-amber-500", icon: <Video className="text-white h-8 w-8 md:h-10 md:w-10" /> },
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

  const buttonStyle = "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md px-4 py-1 h-9 transition-all text-sm font-medium";

  return (
    <div className="min-h-screen bg-blue-50/50">
      
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border relative"> 
        <div className="container mx-auto px-4 py-1 flex items-center justify-between"> 
          
          <Link href="/" className="flex items-center">
            <img src="/skillclick_logo.png" alt="SkillClick Logo" width={140} height={30} style={{ objectFit: 'contain' }} className="object-contain" />
          </Link>

          <div className="flex items-center gap-3">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className={buttonStyle + " flex items-center gap-1"}>
                        <Globe className="h-4 w-4" /> {languages.find(l => l.code === lang)?.code.toUpperCase()}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-blue-200 shadow-lg">
                    {languages.map((l) => (
                        <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)} className="cursor-pointer hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium"><span className="mr-2">{l.flag}</span> {l.name}</DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
             </DropdownMenu>

             <Link href="/services"><Button variant="outline" className={`hidden md:flex ${buttonStyle}`}>{t.explore[lang]}</Button></Link>
             <Link href="/auth/register"><Button variant="outline" className={`hidden md:flex ${buttonStyle}`}>{t.becomeSeller[lang]}</Button></Link>
             
             {/* DUGME ZA MENI */}
             <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-600"><Menu className="h-6 w-6" /></Button>

             {isLoggedIn ? (
                <div className="hidden md:flex gap-3 ml-2"><Link href="/messages"><Button variant="ghost" className="h-8 px-2 text-xs text-gray-600 hover:text-blue-600"><MessageSquare className="h-4 w-4 mr-1" />{t.messages[lang]}</Button></Link><Link href="/profile"><Button variant="ghost" className="h-8 px-2 text-xs text-gray-600 hover:text-blue-600"><User className="h-4 w-4 mr-1" />{t.profile[lang]}</Button></Link></div>
             ) : (
                <div className="hidden md:flex gap-3 items-center ml-2"><Link href="/auth/login"><Button variant="outline" className={buttonStyle}><LogIn className="h-4 w-4 mr-1" />{t.login[lang]}</Button></Link><Link href="/auth/register"><Button variant="outline" className={buttonStyle}><UserPlus className="h-4 w-4 mr-1" />{t.register[lang]}</Button></Link></div>
             )}
          </div>
        </div>

        <div className="border-t border-blue-100 hidden md:block bg-blue-50/50">
            <div className="container mx-auto px-4">
                <ul className="flex justify-between py-2 text-sm font-medium">
                    {categoryLinks.map((cat, index) => (
                        <li key={index}><Link href={`/services?category=${categoryMap[cat] || 'all'}`} className="cursor-pointer text-black border-b-2 border-transparent hover:text-blue-700 hover:border-blue-700 pb-1 transition-all">{cat}</Link></li>
                    ))}
                </ul>
            </div>
        </div>

        {/* --- FIX: MOBILNI MENI JE SADA UNUTAR HEADER-A --- */}
        {menuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-border shadow-xl z-50 h-[calc(100vh-60px)] overflow-y-auto">
                <div className="container mx-auto px-4 py-4 flex flex-col gap-6">
                
                <div className="flex flex-col gap-3 border-b border-gray-100 pb-6">
                    {!isLoggedIn ? (
                        <>
                            <Link href="/auth/login" onClick={() => setMenuOpen(false)}><Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 text-base">{t.login[lang]}</Button></Link>
                            <Link href="/auth/register" onClick={() => setMenuOpen(false)}><Button variant="outline" className="w-full border-blue-600 text-blue-600 h-10 text-base">{t.register[lang]}</Button></Link>
                        </>
                    ) : (
                        <>
                            <Link href="/messages" onClick={() => setMenuOpen(false)}><Button variant="ghost" size="sm" className="w-full justify-start text-lg font-medium"><MessageSquare className="h-5 w-5 mr-3" />{t.messages[lang]}</Button></Link>
                            <Link href="/profile" onClick={() => setMenuOpen(false)}><Button variant="ghost" size="sm" className="w-full justify-start text-lg font-medium"><User className="h-5 w-5 mr-3" />{t.profile[lang]}</Button></Link>
                        </>
                    )}
                    <div className="flex flex-col gap-2 mt-2 text-gray-600 font-medium pl-2">
                        <Link href="/services" onClick={() => setMenuOpen(false)} className="py-2 border-b border-gray-50">{t.explore[lang]}</Link>
                        <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="py-2">{t.becomeSeller[lang]}</Link>
                        <Link href="/create" onClick={() => setMenuOpen(false)} className="py-2 text-blue-600 font-bold">{t.offerService[lang]}</Link>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-gray-900 mb-3 px-2 text-lg">Categories</h3>
                    <div className="flex flex-col gap-1">
                        {categoryLinks.map((cat, index) => (
                            <Link key={index} href={`/services?category=${categoryMap[cat] || 'all'}`} onClick={() => setMenuOpen(false)}>
                                <div className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-md text-gray-700 text-base">
                                    {cat}
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
                </div>
            </div>
        )}
      </header>

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
                            <div className={`h-28 md:h-40 w-full bg-gradient-to-br ${getRandomGradient(gig.id)} flex items-center justify-center relative`}>
                                <div className="transform group-hover:scale-110 transition-transform duration-300 text-white text-3xl md:text-4xl">{gig.icon ? gig.icon : (gig.image && gig.image.length < 5 ? gig.image : <Layers className="h-8 w-8 md:h-10 md:w-10 text-white" />)}</div>
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