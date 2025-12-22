"use client"

import { useState, Suspense, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter, usePathname } from "next/navigation" 
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
  const { language, setLanguage, t } = useLanguage(); 
  const router = useRouter(); 
  const pathname = usePathname();
  
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [clickedLang, setClickedLang] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("User error", e);
            setUser(null);
        }
    } else {
        setUser(null);
    }
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("sessionKey");
    setUser(null);
    // 👇 IZMENA: Vraćamo na "/" (Home) umesto na login da izbegnemo redirect loop na mobilnom
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

  const handleMobileLogout = (e: any) => {
    e.preventDefault();
    setTimeout(() => {
        logout();
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
            href={user ? "/create" : "/auth/login?redirect=/create"} 
            className={`${ghostBtnClass} !text-black !font-extrabold hover:!text-purple-900 text-base`}
          >
             {t('navPostService')}
          </Link>

          {user ? (
            <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-3 cursor-pointer group outline-none">
                            <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm group-hover:border-purple-200 transition-colors">
                                {user.username ? user.username[0].toUpperCase() : "U"}
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-bold text-gray-700 group-hover:text-purple-700 truncate max-w-[120px] leading-tight">
                                    {user.username}
                                </span>
                                {user.role === 'admin' && (
                                    <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-1.5 rounded-full w-fit">ADMIN</span>
                                )}
                            </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white border-gray-100 shadow-lg p-1 z-[100]">
                        <DropdownMenuItem asChild className={desktopItemClass}>
                            <Link href="/profile">
                                <UserIcon className="w-4 h-4" /> {t('navProfile')}
                            </Link>
                        </DropdownMenuItem>
                        
                        {/* PC Admin Panel - Vodi na /profile */}
                        {user.role === 'admin' && (
                            <DropdownMenuItem asChild className={`${desktopItemClass} text-blue-600 hover:text-blue-700 hover:bg-blue-50`}>
                                <Link href="/profile">
                                    <ShieldCheck className="w-4 h-4" /> {t('navAdminPanel')}
                                </Link>
                            </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className={`${desktopItemClass} text-red-600 hover:text-red-700 hover:bg-red-50`}>
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
                
                <DropdownMenuContent align="end" className="w-64 p-2 font-sans bg-white border border-gray-200 shadow-2xl z-[9999] rounded-xl max-h-[85vh] overflow-y-auto">
                    {user && (
                        <>
                            <DropdownMenuLabel className="px-2 py-3 bg-purple-50 rounded-lg mb-2 flex items-center gap-3 mx-1">
                                <div className="w-8 h-8 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center font-bold text-sm">
                                    {user.username[0].toUpperCase()}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-bold text-gray-800 truncate">{user.username}</span>
                                    {user.role === 'admin' && <span className="text-[10px] text-blue-600 font-extrabold">ADMINISTRATOR</span>}
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-100 my-1" />
                        </>
                    )}

                    <DropdownMenuItem onSelect={(e) => handleMobileNav(e, "/")} className={mobileItemClass}>
                        <Home className="w-4 h-4" /> {t('backHome')}
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={(e) => handleMobileNav(e, user ? "/create" : "/auth/login?redirect=/create")} className={`
                        ${mobileItemClass} !text-purple-700 !bg-purple-50/50 !border-purple-100 
                        focus:!bg-purple-100 focus:!text-purple-900
                    `}>
                        <PlusCircle className="w-4 h-4" /> {t('navPostService')}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-gray-100 my-1" />

                    {user ? (
                        <>
                            <DropdownMenuItem onSelect={(e) => handleMobileNav(e, "/profile")} className={mobileItemClass}>
                                <UserIcon className="w-4 h-4" /> {t('navProfile')}
                            </DropdownMenuItem>
                            
                            {/* Mobilni Admin Panel - Vodi na /profile */}
                            {user.role === 'admin' && (
                                <DropdownMenuItem onSelect={(e) => handleMobileNav(e, "/profile")} className={`${mobileItemClass} !text-blue-600 focus:!text-blue-700 focus:!bg-blue-50`}>
                                    <LayoutDashboard className="w-4 h-4" /> {t('navAdminPanel')}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onSelect={handleMobileLogout} className={mobileItemClass}>
                                <LogOut className="w-4 h-4" /> {t('navLogout')}
                            </DropdownMenuItem>
                        </>
                    ) : (
                        <>
                           {/* Mobilni Login - Putanja je /auth/login */}
                           <DropdownMenuItem onSelect={(e) => handleMobileNav(e, "/auth/login")} className={`
                                ${mobileItemClass} !bg-purple-600 !text-white 
                                focus:!bg-purple-700 focus:!text-white
                           `}>
                                <LogIn className="w-4 h-4" /> {t('navLogin')}
                            </DropdownMenuItem>

                            {/* 👇 KLJUČNO: OVO DUGME REŠAVA TVOJ PROBLEM SA 404 NA MOBILNOM */}
                            <DropdownMenuSeparator />
                             <DropdownMenuItem onSelect={handleMobileLogout} className={`${mobileItemClass} text-red-500`}>
                                <LogOut className="w-4 h-4" /> Resetuj/Odjavi se
                            </DropdownMenuItem>
                        </>
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
