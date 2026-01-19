"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation" 
import { useLanguage } from "@/components/LanguageContext"
import { useAuth } from "@/components/AuthContext" // ✅ KORISTIMO NOVI CONTEXT
import { 
  ChevronDown, User as UserIcon, Menu, PlusCircle, ShieldCheck, Home 
} from "lucide-react"
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

// Stilovi
const ghostBtnClass = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 hover:bg-purple-50 hover:text-purple-600 text-gray-600 font-bold gap-2";
const iconBtnClass = "h-10 w-10 rounded-full p-0 hover:bg-purple-50 inline-flex items-center justify-center transition-colors";

function NavbarContent() {
  // ✅ Uzimamo podatke direktno iz AuthContext-a
  const { user } = useAuth();
  
  const { language, setLanguage, t } = useLanguage(); 
  const router = useRouter(); 
  
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [clickedLang, setClickedLang] = useState<string | null>(null);

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

  const desktopItemClass = "w-full cursor-pointer text-gray-700 font-bold py-3 text-sm flex items-center gap-3 transition-all duration-300 ease-out rounded-md outline-none border border-transparent hover:border-purple-200 hover:bg-purple-50 hover:text-purple-900 focus:border-purple-200 focus:bg-purple-50 focus:text-purple-900 active:scale-95 px-2";
  
  const mobileItemClass = `
    py-3 px-3 mb-1 font-bold cursor-pointer rounded-xl border-2 border-transparent transition-all duration-300
    text-gray-700 flex items-center gap-3 w-full outline-none
    focus:!bg-purple-100 focus:!text-purple-900 focus:!border-purple-200
    data-[highlighted]:!bg-purple-100 data-[highlighted]:!text-purple-900
    active:scale-95
  `;

  const handleMobileLanguageChange = (e: any, key: string) => {
    e.preventDefault(); 
    setClickedLang(key);
    setTimeout(() => {
        setLanguage(key);           
        setIsMobileLangOpen(false); 
        setClickedLang(null); 
    }, 300); 
  };

  const handleMobileNav = (e: any, path: string) => {
    e.preventDefault();
    setTimeout(() => {
        router.push(path);
        setIsMobileMenuOpen(false);
    }, 300);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-[50] shadow-sm flex flex-col font-sans">
      
      <div className="container mx-auto px-4 h-20 flex items-center justify-between relative z-[60]">
        
        {/* LOGO */}
        <div className={`flex-shrink-0 absolute left-0 md:left-[90px] top-1/2 -translate-y-1/2 z-[70] -ml-[116px] md:-ml-[220px] mt-[-2px] md:mt-[-4px] pointer-events-none`}>
           <Link href="/" className="pointer-events-auto block"> 
              <Image src="/skillclick_logo.png" alt="SkillClick Logo" width={600} height={150} className="w-[360px] md:w-[400px] h-auto object-contain object-left" priority />
           </Link>
        </div>

        {/* --- DESKTOP MENI --- */}
        <div className="hidden md:flex items-center gap-4 ml-auto relative z-[80]">
          
          <DropdownMenu>
            <DropdownMenuTrigger className={`${ghostBtnClass} rounded-full`}>
                <span className="font-bold text-xs">{currentLangObj.flag} {currentLangObj.label.split(' ')[0]}</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56 bg-white border-gray-100 shadow-lg p-1 z-[100] max-h-[80vh] overflow-y-auto">
              {Object.entries(languages).map(([key, { label, flag }]) => (
                <DropdownMenuItem key={key} onSelect={() => setLanguage(key)} className={desktopItemClass}>
                  <span className="mr-3 text-xl">{flag}</span> {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link 
            href="/create" 
            className={`${ghostBtnClass} !text-black !font-extrabold hover:!text-purple-900 text-base`}
          >
             {t('navPostService')}
          </Link>

          {/* ✅ ADMIN DUGME (Samo za tebe) */}
          {user?.isAdmin && (
            <Link href="/admin">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md rounded-lg flex items-center gap-2 animate-pulse">
                    <ShieldCheck className="w-4 h-4" /> ADMIN PANEL
                </Button>
            </Link>
          )}

          {/* Profil Ikona (Prikazuje se kad si ulogovan, bez Login dugmeta) */}
          {user && (
            <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-3 cursor-pointer group outline-none">
                            <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm group-hover:border-purple-200 transition-colors">
                                {user.username ? user.username[0].toUpperCase() : "U"}
                            </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white border-gray-100 shadow-lg p-1 z-[100]">
                        <DropdownMenuItem asChild className={desktopItemClass}>
                            <Link href="/profile">
                                <UserIcon className="w-4 h-4" /> {t('navProfile')}
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          )}
          
          {/* NEMA LOGIN DUGMETA - Automatski ide preko Pi Browsera */}
        </div>

        {/* --- MOBILNI MENI --- */}
        <div className="flex md:hidden items-center gap-2 ml-auto relative z-[80]">
            <DropdownMenu open={isMobileLangOpen} onOpenChange={setIsMobileLangOpen}>
                <DropdownMenuTrigger className={iconBtnClass}>
                    <span className="text-xl">{currentLangObj.flag}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-[9999] p-2 bg-white border border-gray-100 shadow-xl rounded-xl max-h-[80vh] overflow-y-auto">
                  {Object.entries(languages).map(([key, { label, flag }]) => {
                    const isClicked = clickedLang === key;
                    return (
                        <DropdownMenuItem 
                            key={key} 
                            onSelect={(e) => handleMobileLanguageChange(e, key)}
                            className={`
                                ${mobileItemClass}
                                ${isClicked 
                                    ? "!bg-purple-100 !text-purple-900 !border-purple-200 scale-95" 
                                    : "border-transparent"
                                }
                            `}
                        >
                        <span className="mr-3 text-xl">{flag}</span> {label}
                        </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <DropdownMenuTrigger className={iconBtnClass}>
                     <Menu className="w-7 h-7 text-gray-700" />
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-64 p-2 font-sans bg-white border border-gray-200 shadow-2xl z-[9999] rounded-xl">
                    
                    {/* ✅ ADMIN LINK I U MOBILNOM MENIJU */}
                    {user?.isAdmin && (
                        <DropdownMenuItem onSelect={(e) => handleMobileNav(e, "/admin")} className={`${mobileItemClass} !bg-red-50 !text-red-600 !border-red-100`}>
                            <ShieldCheck className="w-4 h-4" /> ADMIN PANEL
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onSelect={(e) => handleMobileNav(e, "/")} className={mobileItemClass}>
                        <Home className="w-4 h-4" /> {t('backHome')}
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={(e) => handleMobileNav(e, "/create")} className={`
                        ${mobileItemClass} !text-white !bg-purple-600 focus:!bg-purple-700
                    `}>
                        <PlusCircle className="w-4 h-4" /> {t('navPostService')}
                    </DropdownMenuItem>
                    
                    {/* Profil link za mobilni */}
                    {user && (
                        <DropdownMenuItem onSelect={(e) => handleMobileNav(e, "/profile")} className={mobileItemClass}>
                             <UserIcon className="w-4 h-4" /> {t('navProfile')}
                        </DropdownMenuItem>
                    )}

                </DropdownMenuContent>
            </DropdownMenu>
        </div>

      </div>

      {/* --- KATEGORIJE TRAKA --- */}
      <div className="block border-t border-transparent relative z-[90]">
         <div className="container mx-auto px-4">
            <div className="flex items-center gap-6 md:gap-6 overflow-x-auto py-1 md:justify-between [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-400/60 [&::-webkit-scrollbar-thumb]:rounded-full">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.slug;
                  return (
                    <Link 
                      key={cat.slug} 
                      href={`/?category=${encodeURIComponent(cat.slug)}`}
                      className={`
                        whitespace-nowrap flex-shrink-0 rounded-md px-2 font-bold text-[13px] md:text-[14px] border-b-2 transition-all pb-1 hover:text-purple-600 hover:border-purple-600
                        ${isActive 
                           ? "text-purple-600 border-purple-600 bg-purple-50/50" 
                           : "text-gray-500 border-transparent"
                        }
                      `}
                    >
                      {t(cat.key)} 
                    </Link>
                  );
                })}
            </div>
         </div>
      </div>
    </nav>
  )
}

export default function Navbar() {
  return (
    <Suspense fallback={<div className="h-20 bg-white"></div>}>
      <NavbarContent />
    </Suspense>
  )
}
