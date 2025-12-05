"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation" 
import { useAuth } from "@/components/AuthContext"
import { useLanguage } from "@/components/LanguageContext"
import { Button } from "@/components/ui/button"
import { 
  LogOut, ChevronDown, User as UserIcon, Menu, PlusCircle
} from "lucide-react"
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from "@/components/ui/dropdown-menu"

function NavbarContent() {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const router = useRouter(); 
  
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);
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

  const categories = [
    { name: "Graphics & Design", slug: "design" },
    { name: "Digital Marketing", slug: "marketing" },
    { name: "Writing & Translation", slug: "writing" },
    { name: "Video & Animation", slug: "video" },
    { name: "Programming & Tech", slug: "tech" },
    { name: "Business", slug: "business" },
    { name: "Lifestyle", slug: "lifestyle" }
  ];

  const clickEffect = "active:scale-90 transition-transform duration-200 ease-in-out inline-block";
  const desktopItemClass = "w-full cursor-pointer text-gray-700 font-bold py-3 text-sm flex items-center gap-3 transition-all duration-300 ease-out rounded-md outline-none border border-transparent hover:border-purple-200 hover:bg-purple-50 hover:text-purple-900 focus:border-purple-200 focus:bg-purple-50 focus:text-purple-900 active:scale-95 px-2";
  
  const mobileItemClass = `
    py-3 px-3 mb-1 font-bold cursor-pointer rounded-xl border-2 border-transparent transition-all duration-300
    text-gray-700 flex items-center gap-3 w-full
    
    data-[highlighted]:bg-purple-100 
    data-[highlighted]:text-purple-700
    data-[highlighted]:border-purple-200

    focus:bg-purple-100 
    focus:text-purple-700
    focus:border-purple-200
    
    active:scale-95
  `;

  const noFocusRing = "outline-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none border-none";

  const handleMobileLanguageChange = (e: any, key: string) => {
    e.preventDefault(); 
    setTimeout(() => {
        setLanguage(key);           
        setIsMobileLangOpen(false); 
    }, 400); 
  };

  const handleMobileNav = (e: any, path: string) => {
    e.preventDefault();
    setTimeout(() => {
        router.push(path);
        setIsMobileMenuOpen(false);
    }, 400);
  };

  const handleMobileLogout = (e: any) => {
    e.preventDefault();
    setTimeout(() => {
        logout();
        setIsMobileMenuOpen(false);
    }, 400);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-[100] shadow-sm flex flex-col font-sans">
      
      {/* GORNJI DEO */}
      <div className="container mx-auto px-4 h-20 flex items-center justify-between relative z-[110]">
        
        {/* LOGO */}
        {/* IZMENA: z-[120] (visoko, ali ispod kategorija koje su 130) */}
        <div className={`flex-shrink-0 absolute left-0 md:left-[90px] top-1/2 -translate-y-1/2 z-[120] -ml-[156px] md:-ml-[220px] mt-2 md:mt-[11px] pointer-events-none`}>
           <Link href="/" className="pointer-events-auto block"> 
              <Image src="/skillclick_logo.png" alt="SkillClick Logo" width={600} height={150} className="w-[450px] md:w-[400px] h-auto object-contain object-left" priority />
           </Link>
        </div>

        {/* --- DESKTOP MENI --- */}
        <div className="hidden md:flex items-center gap-4 ml-auto z-[80]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`flex items-center gap-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full px-3 py-2 ${clickEffect} ${noFocusRing}`}>
                <span className="font-bold text-xs">{languages[language]?.flag} {languages[language]?.label.split(' ')[0]}</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-gray-100 shadow-lg p-1 z-[200]">
              {Object.entries(languages).map(([key, { label, flag }]) => (
                <DropdownMenuItem key={key} onClick={() => setLanguage(key)} className={desktopItemClass}>
                  <span className="mr-3 text-xl">{flag}</span> {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href={user ? "/create" : "/register?redirect=/create"}>
            <Button variant="ghost" className={`text-gray-600 font-bold text-sm h-10 px-4 hover:text-purple-600 hover:bg-purple-50 ${clickEffect} ${noFocusRing}`}>
                Post a Service
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
                <Link href="/profile" className={`flex items-center gap-3 cursor-pointer group ${clickEffect}`}>
                  <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm group-hover:border-purple-200 transition-colors">{user.username[0].toUpperCase()}</div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-purple-700 truncate max-w-[120px]">{user.username}</span>
                </Link>
                <Button onClick={logout} variant="ghost" className={`text-gray-500 hover:text-purple-700 hover:bg-purple-50 p-2 h-10 w-10 rounded-full ${clickEffect} ${noFocusRing}`}><LogOut className="w-5 h-5" /></Button>
            </div>
          ) : (
             <div className="flex items-center gap-3">
                <Link href="/login"><Button variant="ghost" className={`font-bold text-sm text-gray-600 hover:text-purple-700 hover:bg-purple-50 h-10 px-6 ${clickEffect} ${noFocusRing}`}>Login</Button></Link>
                <Link href="/register"><Button className={`bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md h-10 px-6 ${clickEffect} ${noFocusRing}`}>Join</Button></Link>
             </div>
          )}
        </div>

        {/* --- MOBILNI MENI --- */}
        <div className="flex md:hidden items-center gap-2 ml-auto z-[102]">
            
            {/* JEZIK */}
            <DropdownMenu open={isMobileLangOpen} onOpenChange={setIsMobileLangOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                    <span className="text-xl">{languages[language]?.flag}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-[9999] p-2 bg-white border border-gray-100 shadow-xl rounded-xl">
                  {Object.entries(languages).map(([key, { label, flag }]) => (
                    <DropdownMenuItem 
                        key={key} 
                        onSelect={(e) => handleMobileLanguageChange(e, key)}
                        className={mobileItemClass}
                    >
                      <span className="mr-3 text-xl">{flag}</span> {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* HAMBURGER */}
            <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-700">
                        <Menu className="w-7 h-7" />
                    </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-64 p-2 font-sans bg-white border border-gray-200 shadow-2xl z-[9999] rounded-xl">
                    {user && (
                        <>
                            <DropdownMenuLabel className="px-2 py-3 bg-purple-50 rounded-lg mb-2 flex items-center gap-3 mx-1">
                                <div className="w-8 h-8 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center font-bold text-sm">
                                    {user.username[0].toUpperCase()}
                                </div>
                                <span className="font-bold text-gray-800 truncate">{user.username}</span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-100 my-1" />
                        </>
                    )}

                    <DropdownMenuItem 
                        onSelect={(e) => handleMobileNav(e, user ? "/create" : "/register?redirect=/create")}
                        className={`${mobileItemClass} text-purple-700 border-purple-100 bg-purple-50/50`}
                    >
                        <PlusCircle className="w-4 h-4" /> Post a Service
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-gray-100 my-1" />

                    {user ? (
                        <>
                            <DropdownMenuItem 
                                onSelect={(e) => handleMobileNav(e, "/profile")}
                                className={mobileItemClass}
                            >
                                <UserIcon className="w-4 h-4" /> Moj Profil
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                onSelect={handleMobileLogout}
                                className={mobileItemClass}
                            >
                                <LogOut className="w-4 h-4" /> Odjavi se
                            </DropdownMenuItem>
                        </>
                    ) : (
                        <>
                           <DropdownMenuItem 
                                onSelect={(e) => handleMobileNav(e, "/login")}
                                className={mobileItemClass}
                           >
                                Login
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onSelect={(e) => handleMobileNav(e, "/register")}
                                className={`${mobileItemClass} bg-purple-600 text-white hover:bg-purple-700 hover:text-white data-[highlighted]:bg-purple-700 data-[highlighted]:text-white`}
                            >
                                Registruj se
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

      </div>

      {/* --- KATEGORIJE TRAKA --- */}
      {/* IZMENA: z-[130] da bude IZNAD loga. Promenjen border u transparent. */}
      <div className="block border-t border-transparent relative z-[130]">
         <div className="container mx-auto px-4">
            <div className="flex items-center gap-6 md:gap-0 overflow-x-auto py-3 md:justify-between [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-400/60 [&::-webkit-scrollbar-thumb]:rounded-full">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.name;
                  return (
                    <Link 
                      key={cat.slug} 
                      href={`/?category=${encodeURIComponent(cat.name)}`}
                      className={`
                        whitespace-nowrap flex-shrink-0 rounded-md px-2 font-bold text-[13px] md:text-[14px] border-b-2 transition-all pb-1 ${clickEffect}
                        ${isActive 
                           ? "text-purple-600 border-purple-600 bg-purple-50/50" 
                           : "text-gray-500 border-transparent hover:text-purple-600 hover:border-purple-600"
                        }
                      `}
                    >
                      {cat.name}
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