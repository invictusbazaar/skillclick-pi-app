"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation" 
import { useLanguage } from "@/components/LanguageContext"
import { useAuth } from "@/components/AuthContext"
import { 
  ChevronDown, Menu, ShieldCheck, Home, PlusCircle, User 
} from "lucide-react"
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

function NavbarContent() {
  const { user } = useAuth(); 
  const { language, setLanguage, t } = useLanguage(); 
  const router = useRouter(); 
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  // State za animacije (koji element se trenutno "pali")
  const [animatingLang, setAnimatingLang] = useState<string | null>(null);
  const [animatingLink, setAnimatingLink] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  
  const languages: Record<string, { label: string; flag: string }> = {
    en: { label: "English", flag: "🇺🇸" },
    sr: { label: "Srpski", flag: "🇷🇸" },
    hi: { label: "Hindi", flag: "🇮🇳" },
    zh: { label: "Chinese", flag: "🇨🇳" },
    tw: { label: "Chinese (Trad)", flag: "🇹🇼" },
    id: { label: "Indonesia", flag: "🇮🇩" }
  };
  const currentLangObj = languages[language] || languages['en'];
  
  const categories = [
    { key: "catDesign", slug: "design" }, 
    { key: "catMarketing", slug: "marketing" }, 
    { key: "catWriting", slug: "writing" }, 
    { key: "catVideo", slug: "video" }, 
    { key: "catTech", slug: "tech" }, 
    { key: "catBusiness", slug: "business" }, 
    { key: "catLifestyle", slug: "lifestyle" }
  ];

  // 1. EFEKAT ZA JEZIKE
  const handleLanguageClick = (e: Event, key: string) => {
    e.preventDefault();
    setAnimatingLang(key);
    setTimeout(() => {
        setLanguage(key);
        setAnimatingLang(null);
        setIsLangMenuOpen(false);
    }, 400);
  };

  // 2. EFEKAT ZA MOBILNI MENI (Isti kao za jezike)
  const handleMobileClick = (e: Event, path: string) => {
    e.preventDefault();
    setAnimatingLink(path); // Palimo ljubičastu boju
    setTimeout(() => {
        router.push(path);
        setAnimatingLink(null);
        setIsMobileMenuOpen(false);
    }, 400);
  };

  // Helper funkcija za stil mobilnog linka
  const getMobileLinkStyle = (path: string) => `
    cursor-pointer py-3 mb-1 font-bold text-sm rounded-xl transition-all duration-300 flex items-center
    ${animatingLink === path 
        ? "bg-purple-900 text-white scale-105 shadow-lg z-10" // TAMNO LJUBIČASTA KAD SE KLIKNE
        : "text-gray-600 hover:bg-gray-100" 
    }
  `;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-[50] shadow-sm flex flex-col font-sans">
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        
        {/* LOGO - Pomeren ulevo */}
        <Link href="/" className="flex-shrink-0 ml-[-100px]"> 
          <Image 
            src="/skillclick_logo.png" 
            alt="SkillClick" 
            width={440} 
            height={120} 
            className="w-[320px] md:w-[400px] h-auto object-contain" 
            priority 
          />
        </Link>

        {/* DESNA STRANA */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          
          {/* 🌍 JEZIK (SMANJEN FONT) */}
          <DropdownMenu open={isLangMenuOpen} onOpenChange={setIsLangMenuOpen}>
            <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-900 transition-all duration-300 outline-none border border-purple-200 active:scale-95">
                {/* Smanjen font zastavice i teksta */}
                <span className="text-lg md:text-xl">{currentLangObj.flag}</span> 
                <span className="hidden md:inline font-bold text-xs ml-1">{currentLangObj.label}</span>
                <ChevronDown className="w-3 h-3 text-purple-700" />
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-48 bg-white border-purple-100 shadow-2xl z-[100] p-2 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
              {Object.entries(languages).map(([key, { label, flag }]) => (
                <DropdownMenuItem 
                    key={key} 
                    onSelect={(e) => handleLanguageClick(e, key)}
                    // Smanjen font (text-sm) i tamno ljubičasta boja (bg-purple-900)
                    className={`cursor-pointer py-2 mb-1 font-bold text-sm rounded-xl border transition-all duration-300 flex items-center ${animatingLang === key ? "bg-purple-900 text-white scale-105 shadow-lg border-purple-900 z-10" : "text-gray-700 bg-purple-50/50 hover:bg-purple-100 hover:text-purple-900 border-transparent hover:border-purple-200"}`}
                >
                  <span className="mr-3 text-xl">{flag}</span> {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* DESKTOP LINKOVI */}
          <div className="hidden md:flex items-center gap-4">
             <Link href="/create" className="text-sm font-bold text-gray-600 hover:text-purple-600 flex items-center gap-2">
                <PlusCircle className="w-5 h-5" /> {t('navPostService')}
             </Link>
             
             {user?.isAdmin && (
                <Link href="/admin">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold gap-2 shadow-md">
                        <ShieldCheck className="w-4 h-4" /> ADMIN
                    </Button>
                </Link>
             )}
             
             {user ? (
                <Link href="/profile">
                    <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-md cursor-pointer hover:bg-purple-200 transition">
                        {user.username ? user.username[0].toUpperCase() : "U"}
                    </div>
                </Link>
             ) : (
                <Link href="/auth/login"><Button variant="outline" className="font-bold border-2">Login</Button></Link>
             )}
          </div>

          {/* MOBILNI MENI - HAMBURGER (SA EFEKTIMA I SMANJENIM FONTOM) */}
          <div className="flex md:hidden">
              <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <DropdownMenuTrigger className="p-2 transition-transform active:scale-95"> <Menu className="w-7 h-7 text-gray-800" /> </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 bg-white border border-gray-200 shadow-2xl z-[9999] rounded-xl p-2 mr-2">
                      
                      {/* Zaglavlje menija */}
                      <div className="p-3 border-b border-gray-100 mb-2 bg-gray-50 rounded-lg">
                          {user ? (
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">
                                      {user.username ? user.username[0].toUpperCase() : "U"}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-gray-800 text-xs">Zdravo,</span>
                                    <span className="font-bold text-purple-600 text-sm">{user.username}</span>
                                  </div>
                              </div>
                          ) : (
                              <span className="text-gray-500 font-bold text-sm">Dobrodošli (Gost)</span>
                          )}
                      </div>

                      {/* STAVKE MENIJA SA EFEKTOM */}
                      {user && (
                        <DropdownMenuItem 
                            onSelect={(e) => handleMobileClick(e, "/profile")} 
                            className={getMobileLinkStyle("/profile")}
                        >
                            <User className="w-4 h-4 mr-3" /> {t('navProfile')}
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem 
                            onSelect={(e) => handleMobileClick(e, "/")} 
                            className={getMobileLinkStyle("/")}
                      >
                            <Home className="w-4 h-4 mr-3"/> {t('backHome')}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                            onSelect={(e) => handleMobileClick(e, "/create")} 
                            className={getMobileLinkStyle("/create")}
                      >
                            <PlusCircle className="w-4 h-4 mr-3"/> {t('navPostService')}
                      </DropdownMenuItem>
                      
                      {user?.isAdmin && (
                          <DropdownMenuItem 
                                onSelect={(e) => handleMobileClick(e, "/admin")} 
                                className={`py-3 mb-1 font-bold text-sm rounded-xl flex items-center ${animatingLink === "/admin" ? "bg-red-700 text-white scale-105" : "text-red-600 bg-red-50 hover:bg-red-100"}`}
                          >
                                <ShieldCheck className="w-4 h-4 mr-3"/> Admin Panel
                          </DropdownMenuItem>
                      )}
                      
                      {!user && (
                         <DropdownMenuItem 
                            onSelect={(e) => handleMobileClick(e, "/auth/login")} 
                            className={`justify-center py-3 mb-1 font-bold text-sm rounded-xl flex items-center mt-2 ${animatingLink === "/auth/login" ? "bg-black text-white scale-105" : "bg-gray-900 text-white hover:bg-gray-800"}`}
                         >
                            Login
                         </DropdownMenuItem>
                      )}
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>

        </div>
      </div>
      
      {/* KATEGORIJE - BEZ PROMENA */}
      <div className="block border-t border-gray-100 bg-white/95 backdrop-blur-md shadow-sm">
         <div className="container mx-auto px-4">
            <div className="flex items-center gap-6 overflow-x-auto py-3 scrollbar-hide no-scrollbar">
                {categories.map((cat) => (
                    <Link key={cat.slug} href={`/?category=${encodeURIComponent(cat.slug)}`} className={`whitespace-nowrap flex-shrink-0 text-xs md:text-sm font-bold uppercase tracking-wide transition-colors ${activeCategory === cat.slug ? "text-purple-600 border-b-2 border-purple-600 pb-1" : "text-gray-500 hover:text-purple-500"}`}>
                      {t(cat.key)} 
                    </Link>
                ))}
            </div>
         </div>
      </div>
    </nav>
  )
}

export default function Navbar() {
  return ( <Suspense fallback={<div className="h-16 bg-white"></div>}> <NavbarContent /> </Suspense> )
}
