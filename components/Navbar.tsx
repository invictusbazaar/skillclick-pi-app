"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation" 
import { useLanguage } from "@/components/LanguageContext"
import { useAuth } from "@/components/AuthContext" // ✅ NOVI CONTEXT
import { 
  ChevronDown, User as UserIcon, Menu, PlusCircle, ShieldCheck, Home 
} from "lucide-react"
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const ghostBtnClass = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-purple-50 hover:text-purple-600 text-gray-600 font-bold gap-2 h-10 px-4 py-2";
const iconBtnClass = "h-10 w-10 rounded-full p-0 hover:bg-purple-50 inline-flex items-center justify-center transition-colors";
const mobileItemClass = "py-3 px-3 mb-1 font-bold cursor-pointer rounded-xl border-2 border-transparent transition-all duration-300 text-gray-700 flex items-center gap-3 w-full outline-none focus:!bg-purple-100 focus:!text-purple-900";

function NavbarContent() {
  const { user } = useAuth(); // ✅ Uzimamo usera iz simulacije
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

  const handleMobileNav = (e: any, path: string) => {
    e.preventDefault();
    setTimeout(() => { router.push(path); setIsMobileMenuOpen(false); }, 300);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-[50] shadow-sm flex flex-col font-sans">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between relative z-[60]">
        
        <div className="flex-shrink-0 absolute left-0 md:left-[90px] top-1/2 -translate-y-1/2 z-[70] -ml-[116px] md:-ml-[220px]">
           <Link href="/" className="block"> 
              <Image src="/skillclick_logo.png" alt="Logo" width={600} height={150} className="w-[360px] md:w-[400px] h-auto object-contain object-left" priority />
           </Link>
        </div>

        {/* --- DESKTOP --- */}
        <div className="hidden md:flex items-center gap-4 ml-auto relative z-[80]">
          <DropdownMenu>
            <DropdownMenuTrigger className={`${ghostBtnClass} rounded-full`}>
                <span className="font-bold text-xs">{currentLangObj.flag} {currentLangObj.label.split(' ')[0]}</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-gray-100 shadow-lg">
              {Object.entries(languages).map(([key, { label, flag }]) => (
                <DropdownMenuItem key={key} onSelect={() => setLanguage(key)} className="cursor-pointer py-3 font-bold">
                  <span className="mr-3 text-xl">{flag}</span> {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/create" className={`${ghostBtnClass} !text-black !font-extrabold hover:!text-purple-900`}>{t('navPostService')}</Link>

          {/* ✅ ADMIN DUGME (Prikazuje se ako simulacija radi) */}
          {user?.isAdmin && (
            <Link href="/admin">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 rounded-lg flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> ADMIN PANEL
                </Button>
            </Link>
          )}

          {user && (
            <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
               <Link href="/profile">
                  <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
                      {user.username ? user.username[0].toUpperCase() : "U"}
                  </div>
               </Link>
            </div>
          )}
        </div>

        {/* --- MOBILNI --- */}
        <div className="flex md:hidden items-center gap-2 ml-auto relative z-[80]">
            <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <DropdownMenuTrigger className={iconBtnClass}> <Menu className="w-7 h-7 text-gray-700" /> </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 bg-white border border-gray-200 shadow-2xl z-[9999] rounded-xl">
                    
                    {user?.isAdmin && (
                        <DropdownMenuItem onSelect={(e) => handleMobileNav(e, "/admin")} className={`${mobileItemClass} !bg-red-50 !text-red-600`}>
                            <ShieldCheck className="w-4 h-4" /> ADMIN PANEL
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onSelect={(e) => handleMobileNav(e, "/")} className={mobileItemClass}>
                        <Home className="w-4 h-4" /> {t('backHome')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={(e) => handleMobileNav(e, "/create")} className={`${mobileItemClass} !text-white !bg-purple-600`}>
                        <PlusCircle className="w-4 h-4" /> {t('navPostService')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      
      <div className="block border-t border-transparent relative z-[90]">
         <div className="container mx-auto px-4">
            <div className="flex items-center gap-6 overflow-x-auto py-1 [&::-webkit-scrollbar]:h-0">
                {categories.map((cat) => (
                    <Link key={cat.slug} href={`/?category=${encodeURIComponent(cat.slug)}`} className={`whitespace-nowrap flex-shrink-0 rounded-md px-2 font-bold text-[13px] border-b-2 transition-all pb-1 ${activeCategory === cat.slug ? "text-purple-600 border-purple-600" : "text-gray-500 border-transparent"}`}>
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