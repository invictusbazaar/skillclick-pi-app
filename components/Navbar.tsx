"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation" 
import { useLanguage } from "@/components/LanguageContext"
import { useAuth } from "@/components/AuthContext"
import { 
  ChevronDown, Menu, ShieldCheck, Home, PlusCircle 
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
  const categories = [{ key: "catDesign", slug: "design" }, { key: "catMarketing", slug: "marketing" }, { key: "catWriting", slug: "writing" }, { key: "catVideo", slug: "video" }, { key: "catTech", slug: "tech" }, { key: "catBusiness", slug: "business" }, { key: "catLifestyle", slug: "lifestyle" }];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-[50] shadow-sm flex flex-col font-sans">
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        
        {/* LOGO - LEVO (Vraćen stari izgled) */}
        <Link href="/" className="flex-shrink-0"> 
          <Image 
            src="/skillclick_logo.png" 
            alt="SkillClick" 
            width={220} 
            height={60} 
            className="w-[160px] md:w-[200px] h-auto object-contain" 
            priority 
          />
        </Link>

        {/* DESNA STRANA (Jezik + Meni) */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          
          {/* 🌍 JEZIK (Uvek vidljiv) */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-gray-100 transition-colors outline-none border border-gray-200">
                <span className="text-xl md:text-2xl">{currentLangObj.flag}</span> 
                <span className="hidden md:inline font-bold text-gray-700 text-sm ml-1">{currentLangObj.label}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border-gray-100 shadow-xl z-[100]">
              {Object.entries(languages).map(([key, { label, flag }]) => (
                <DropdownMenuItem key={key} onSelect={() => setLanguage(key)} className="cursor-pointer py-3 font-medium text-base hover:bg-purple-50">
                  <span className="mr-3 text-xl">{flag}</span> {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* DESKTOP LINKOVI (Samo na PC) */}
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

          {/* MOBILNI MENI (Hamburger) */}
          <div className="flex md:hidden">
              <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <DropdownMenuTrigger className="p-2"> <Menu className="w-8 h-8 text-gray-800" /> </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-white border border-gray-200 shadow-2xl z-[9999] rounded-xl p-2 mr-2">
                      <div className="p-3 border-b border-gray-100 mb-2 bg-gray-50 rounded-lg">
                          {user ? (
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
                                      {user.username ? user.username[0].toUpperCase() : "U"}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-gray-800 text-sm">Zdravo,</span>
                                    <span className="font-bold text-purple-600">{user.username}</span>
                                  </div>
                              </div>
                          ) : (
                              <span className="text-gray-500 font-medium">Dobrodošli (Gost)</span>
                          )}
                      </div>
                      
                      <DropdownMenuItem onSelect={() => router.push("/")} className="py-3 font-bold text-base"><Home className="w-5 h-5 mr-3"/> {t('backHome')}</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => router.push("/create")} className="py-3 font-bold text-base text-purple-600"><PlusCircle className="w-5 h-5 mr-3"/> {t('navPostService')}</DropdownMenuItem>
                      
                      {user?.isAdmin && (
                          <DropdownMenuItem onSelect={() => router.push("/admin")} className="py-3 font-bold text-base text-red-600 bg-red-50 rounded-lg mt-2"><ShieldCheck className="w-5 h-5 mr-3"/> Admin Panel</DropdownMenuItem>
                      )}
                      
                      {!user && (
                         <DropdownMenuItem onSelect={() => router.push("/auth/login")} className="py-3 font-bold text-base justify-center bg-gray-900 text-white rounded-lg mt-2">Login</DropdownMenuItem>
                      )}
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>

        </div>
      </div>
      
      {/* KATEGORIJE */}
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
