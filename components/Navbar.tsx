"use client"

import { useState, Suspense, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, usePathname } from "next/navigation" 
import { useLanguage } from "@/components/LanguageContext"
import { 
  LogOut, ChevronDown, User as UserIcon, Menu, PlusCircle, ShieldCheck, LayoutDashboard, Home, LogIn 
} from "lucide-react"
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from "@/components/ui/dropdown-menu"

// Stilovi
const ghostBtnClass = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 hover:bg-purple-50 hover:text-purple-600 text-gray-600 font-bold gap-2";
const iconBtnClass = "h-10 w-10 rounded-full p-0 hover:bg-purple-50 inline-flex items-center justify-center transition-colors";

function NavbarContent() {
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { language, setLanguage, t } = useLanguage(); 
  const pathname = usePathname();
  
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [clickedLang, setClickedLang] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  useEffect(() => {
    setIsMounted(true);
    // Čitanje korisnika
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            setUser(null);
        }
    }
  }, [pathname]);

  // --- HARD LOGOUT (Za Pi Browser) ---
  const handleForceLogout = () => {
    // 1. Brišemo localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("sessionKey");
    localStorage.clear();

    // 2. Brišemo kolačiće "ručno"
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // 3. HARD RELOAD na početnu stranu (ne na login, da ne bi ušao u petlju)
    window.location.href = "/";
  };

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
  
  // Stil za mobilne linkove (PI BROWSER FRIENDLY)
  const mobileLinkClass = `
    flex items-center gap-3 w-full py-4 px-4 mb-2 font-bold text-gray-800 rounded-xl border-2 border-gray-100 
    bg-white shadow-sm active:scale-95 transition-all duration-200 decoration-0 no-underline
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

  if (!isMounted) return <div className="h-20 bg-white"></div>;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-[50] shadow-sm flex flex-col font-sans">
      
      <div className="container mx-auto px-4 h-20 flex items-center justify-between relative z-[60]">
        
        {/* LOGO */}
        <div className={`flex-shrink-0 absolute left-0 md:left-[90px] top-1/2 -translate-y-1/2 z-[70] -ml-[116px] md:-ml-[220px] mt-[-2px] md:mt-[-4px] pointer-events-none`}>
           <Link href="/" className="pointer-events-auto block"> 
              <Image src="/skillclick_logo.png" alt="SkillClick Logo" width={600} height={150} className="w-[360px] md:w-[400px] h-auto object-contain object-left" priority />
           </Link>
        </div>

        {/* --- DESKTOP MENI (PC - Standardan) --- */}
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

          <Link href={user ? "/create" : "/auth/login?redirect=/create"} className={`${ghostBtnClass} !text-black !font-extrabold hover:!text-purple-900 text-base`}>
             {t('navPostService')}
          </Link>

          {user ? (
            <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-3 cursor-pointer group outline-none">
                            <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm group-hover:border-purple-200 transition-colors">
                                {user.username ? user.username[0].toUpperCase() : "U"}
                            </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white border-gray-100 shadow-lg p-1 z-[100]">
                        <DropdownMenuItem asChild>
                            <Link href="/profile" className={desktopItemClass}>
                                <UserIcon className="w-4 h-4" /> {t('navProfile')}
                            </Link>
                        </DropdownMenuItem>
                        
                        {user.role === 'admin' && (
                            <DropdownMenuItem asChild>
                                <Link href="/profile" className={`${desktopItemClass} text-blue-600`}>
                                    <ShieldCheck className="w-4 h-4" /> {t('navAdminPanel')}
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleForceLogout} className={`${desktopItemClass} text-red-600`}>
                            <LogOut className="w-4 h-4" /> {t('navLogout')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          ) : (
             <div className="flex items-center gap-3">
                <Link href="/auth/login" className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md h-10 px-6 rounded-md inline-flex items-center justify-center text-sm transition-colors">
                    {t('navLogin')}
                </Link>
             </div>
          )}
        </div>

        {/* --- MOBILNI MENI (PI BROWSER MODE) --- */}
        <div className="flex md:hidden items-center gap-2 ml-auto relative z-[80]">
            <DropdownMenu open={isMobileLangOpen} onOpenChange={setIsMobileLangOpen}>
                <DropdownMenuTrigger className={iconBtnClass}>
                    <span className="text-xl">{currentLangObj.flag}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-[9999] p-2 bg-white border border-gray-100 shadow-xl rounded-xl">
                  {Object.entries(languages).map(([key, { label, flag }]) => (
                     <DropdownMenuItem key={key} onSelect={(e) => handleMobileLanguageChange(e, key)} className="py-3 px-3 font-bold text-lg">
                        <span className="mr-3">{flag}</span> {label}
                     </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <DropdownMenuTrigger className={iconBtnClass}>
                     <Menu className="w-7 h-7 text-gray-700" />
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-[90vw] p-4 font-sans bg-white border border-gray-200 shadow-2xl z-[99999] rounded-2xl max-h-[85vh] overflow-y-auto mt-2 mr-2">
                    
                    {user && (
                        <div className="mb-4 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md">
                                {user.username ? user.username[0].toUpperCase() : "U"}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-800 text-lg">{user.username}</span>
                                {user.role === 'admin' && <span className="text-xs text-blue-600 font-black bg-blue-100 px-2 py-0.5 rounded-full w-fit">ADMIN</span>}
                            </div>
                        </div>
                    )}

                    {/* --- KLJUČNI DEO: OBIČNI HTML LINKOVI --- */}
                    {/* Next.js <Link> ovde PRAVI PROBLEM u Pi Browseru. Koristimo <a> tagove za Hard Reload. */}

                    <a href="/" className={mobileLinkClass}>
                        <Home className="w-5 h-5 text-gray-500" /> {t('backHome')}
                    </a>

                    <a href="/create" className={`${mobileLinkClass} !bg-purple-50 !border-purple-100 !text-purple-700`}>
                        <PlusCircle className="w-5 h-5" /> {t('navPostService')}
                    </a>
                    
                    <div className="h-px bg-gray-100 my-3"></div>

                    {user ? (
                        <>
                            <a href="/profile" className={mobileLinkClass}>
                                <UserIcon className="w-5 h-5 text-gray-500" /> {t('navProfile')}
                            </a>

                            {user.role === 'admin' && (
                                <a href="/profile" className={`${mobileLinkClass} !text-blue-600 !bg-blue-50/50 !border-blue-100`}>
                                    <ShieldCheck className="w-5 h-5" /> {t('navAdminPanel')}
                                </a>
                            )}
                            
                            {/* OVO DUGME SADA MORA DA RADI - Briše sve i refreshuje */}
                            <button 
                                onClick={handleForceLogout} 
                                className={`${mobileLinkClass} !bg-red-50 !border-red-100 !text-red-600 justify-center mt-4`}
                            >
                                <LogOut className="w-5 h-5" /> {t('navLogout')}
                            </button>
                        </>
                    ) : (
                        <>
                           {/* Login hard link */}
                           <a href="/auth/login" className={`${mobileLinkClass} !bg-purple-600 !text-white !border-purple-600 justify-center shadow-lg mt-2`}>
                                <LogIn className="w-5 h-5 mr-2" /> {t('navLogin')}
                           </a>
                        </>
                    )}

                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      
      {/* Kategorije */}
      <div className="block border-t border-transparent relative z-[90]">
         <div className="container mx-auto px-4">
            <div className="flex items-center gap-6 md:gap-6 overflow-x-auto py-1 md:justify-between [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-400/60 [&::-webkit-scrollbar-thumb]:rounded-full">
                {categories.map((cat) => (
                    <Link key={cat.slug} href={`/?category=${encodeURIComponent(cat.slug)}`} className="whitespace-nowrap flex-shrink-0 rounded-md px-2 font-bold text-[13px] text-gray-500 hover:text-purple-600 py-2">
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
  return (
    <Suspense fallback={<div className="h-20 bg-white"></div>}>
      <NavbarContent />
    </Suspense>
  )
}
