"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation" 
import { useLanguage } from "@/components/LanguageContext"
import { useAuth } from "@/components/AuthContext"
import { 
  ChevronDown, Menu, PlusCircle, ShieldCheck, Home 
} from "lucide-react"
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const ghostBtnClass = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-purple-50 hover:text-purple-600 text-gray-600 font-bold gap-2 h-10 px-4 py-2";

function NavbarContent() {
  const { user } = useAuth(); // Ovde čitamo da li si ulogovan
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
      <div className="container mx-auto px-4 h-20 flex items-center justify-between relative z-[60]">
        
        {/* LOGO */}
        <div className="flex-shrink-0 relative z-[70]">
           <Link href="/" className="block"> 
              <Image src="/skillclick_logo.png" alt="Logo" width={180} height={50} className="w-[180px] h-auto object-contain" priority />
           </Link>
        </div>

        {/* --- DESKTOP MENI --- */}
        <div className="hidden md:flex items-center gap-4 ml-auto relative z-[80]">
          
          {/* JEZIK (Mora se videti uvek) */}
          <DropdownMenu>
            <DropdownMenuTrigger className={`${ghostBtnClass} rounded-full border border-gray-100`}>
                <span className="font-bold text-xs">{currentLangObj.flag} {currentLangObj.label.split(' ')[0]}</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-gray-100 shadow-lg z-[100]">
              {Object.entries(languages).map(([key, { label, flag }]) => (
                <DropdownMenuItem key={key} onSelect={() => setLanguage(key)} className="cursor-pointer py-3 font-bold hover:bg-gray-50">
                  <span className="mr-3 text-xl">{flag}</span> {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/create" className={`${ghostBtnClass} !text-black !font-extrabold hover:!text-purple-900`}>{t('navPostService')}</Link>

          {/* ADMIN DUGME (Samo ako si ulogovan kao admin) */}
          {user?.isAdmin && (
            <Link href="/admin">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 rounded-lg flex items-center gap-2 shadow-md">
                    <ShieldCheck className="w-4 h-4" /> ADMIN PANEL
                </Button>
            </Link>
          )}

          {/* PROFIL SLIKA (Samo ako si ulogovan) */}
          {user ? (
               <Link href="/profile">
                  <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm ring-2 ring-purple-50">
                      {user.username ? user.username[0].toUpperCase() : "U"}
                  </div>
               </Link>
          ) : (
            <div className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Gost</div>
          )}
        </div>

        {/* --- MOBILNI MENI --- */}
        <div className="flex md:hidden items-center gap-2 ml-auto">
            <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <DropdownMenuTrigger className="p-2"> <Menu className="w-7 h-7 text-gray-700" /> </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white border border-gray-200 shadow-2xl z-[9999]">
                    <DropdownMenuItem onSelect={() => router.push("/")} className="py-3 font-bold"><Home className="w-4 h-4 mr-2"/> {t('backHome')}</DropdownMenuItem>
                    {user?.isAdmin && (
                        <DropdownMenuItem onSelect={() => router.push("/admin")} className="py-3 font-bold text-red-600 bg-red-50"><ShieldCheck className="w-4 h-4 mr-2"/> Admin Panel</DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      
      {/* KATEGORIJE */}
      <div className="block border-t border-gray-100 bg-white/50 backdrop-blur-sm">
         <div className="container mx-auto px-4">
            <div className="flex items-center gap-6 overflow-x-auto py-2 scrollbar-hide">
                {categories.map((cat) => (
                    <Link key={cat.slug} href={`/?category=${encodeURIComponent(cat.slug)}`} className={`whitespace-nowrap flex-shrink-0 text-[13px] font-bold ${activeCategory === cat.slug ? "text-purple-600" : "text-gray-500"}`}>
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
  return ( <Suspense fallback={<div className="h-20 bg-white"></div>}> <NavbarContent /> </Suspense> )
}