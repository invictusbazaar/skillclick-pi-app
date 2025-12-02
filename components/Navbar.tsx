"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthContext"
import { useLanguage } from "@/components/LanguageContext"
import { Button } from "@/components/ui/button"
import { 
  LogOut, Globe, ChevronDown, Menu, X, PlusCircle, User as UserIcon, LayoutDashboard, LogIn
} from "lucide-react"
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  // ✅ DODATE SENKE (shadow-sm) I IVICE (border)
  // Sada svaka stavka izgleda kao malo polje/dugme
  const dropdownItemClass = `
    w-full cursor-pointer text-gray-700 font-bold py-3 text-sm flex items-center gap-3 
    transition-all duration-500 ease-out rounded-md outline-none
    border border-gray-50 shadow-sm mb-1
    hover:bg-purple-100 hover:text-purple-700 hover:shadow-md hover:border-purple-200
    focus:bg-purple-100 focus:text-purple-700 focus:shadow-md focus:border-purple-200
    active:bg-purple-100 active:text-purple-700 active:scale-90
    data-[highlighted]:bg-purple-100 data-[highlighted]:text-purple-700
  `;

  const noFocusRing = "outline-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none border-none";

  const handleWithDelay = (e: Event | React.MouseEvent, action: () => void, setOpen: (val: boolean) => void) => {
    e.preventDefault();
    setTimeout(() => {
      action();
      setOpen(false);
    }, 600);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-[100] shadow-sm flex flex-col font-sans">
      
      <style jsx global>{`
        .purple-scrollbar::-webkit-scrollbar {
          height: 3px;
        }
        .purple-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .purple-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d8b4fe;
          border-radius: 10px;
        }
      `}</style>

      {/* --- GORNJI RED --- */}
      <div className="container mx-auto px-4 h-20 flex items-center justify-between relative">
        
        {/* LOGO */}
        <div className={`flex-shrink-0 absolute left-0 top-1/2 -translate-y-1/2 z-[40] -ml-[156px] md:-ml-[220px] mt-2 md:mt-[11px] pointer-events-none active:scale-95 transition-transform`}>
           <Link href="/" className="block pointer-events-auto"> 
              <Image 
                  src="/skillclick_logo.png" 
                  alt="SkillClick Logo" 
                  width={600} 
                  height={150} 
                  className="w-[450px] md:w-[600px] h-auto object-contain object-left"
                  priority 
              />
           </Link>
        </div>

        {/* DESNA STRANA (PC) */}
        <div className="hidden md:flex items-center gap-6 ml-auto z-[80]">
          
          {/* 1. JEZIK */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`flex items-center gap-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full px-3 py-2 ${clickEffect} ${noFocusRing}`}>
                <span className="font-bold text-xs">
                  {languages[language]?.flag} {languages[language]?.label.split(' ')[0]}
                </span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-gray-100 shadow-xl p-2 z-[200]">
              {Object.entries(languages).map(([key, { label, flag }]) => (
                <DropdownMenuItem 
                    key={key} 
                    onClick={() => setLanguage(key)} 
                    className={dropdownItemClass}
                >
                  <span className="mr-3 text-xl">{flag}</span> {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 2. BECOME A SELLER */}
          {!user && (
            <Button variant="ghost" className={`text-gray-600 font-bold text-sm hover:text-purple-600 hover:bg-purple-50 h-10 px-6 ${clickEffect} ${noFocusRing}`}>
              Become a Seller
            </Button>
          )}

          {/* 3. AUTH */}
          {user ? (
            <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
                <Link href="/profile" className={`flex items-center gap-3 cursor-pointer group ${clickEffect}`}>
                  <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm group-hover:border-purple-200 transition-colors">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-purple-700 truncate max-w-[120px]">
                    {user.username}
                  </span>
                </Link>
                <Button 
                    onClick={logout} 
                    variant="ghost" 
                    className={`text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 h-10 w-10 rounded-full ${clickEffect} ${noFocusRing}`}
                    title="Odjavi se"
                >
                    <LogOut className="w-5 h-5" />
                </Button>
            </div>
          ) : (
             <div className="flex items-center gap-3">
                <Button 
                    variant="ghost" 
                    onClick={() => login("GuestUser")} 
                    className={`font-bold text-sm text-gray-600 hover:text-purple-700 hover:bg-purple-50 h-10 px-6 ${clickEffect} ${noFocusRing}`}
                >
                    Login
                </Button>
                <Button 
                    onClick={() => login("GuestUser")} 
                    className={`bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md h-10 px-6 ${clickEffect} ${noFocusRing}`}
                >
                    Join
                </Button>
             </div>
          )}
        </div>

        {/* --- MOBILNI HEADER DUGMADI --- */}
        <div className="flex md:hidden items-center gap-2 ml-auto relative z-[80]">
           
           {/* Jezik Mobilni */}
           <DropdownMenu open={isLangOpen} onOpenChange={setIsLangOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className={`rounded-full w-9 h-9 bg-white/80 backdrop-blur-sm ${clickEffect} ${noFocusRing}`}>
                <span className="text-xl leading-none">{languages[language]?.flag}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border-gray-100 shadow-xl mr-2 p-2 z-[200]">
              {Object.entries(languages).map(([key, { label, flag }]) => (
                <DropdownMenuItem 
                    key={key} 
                    onSelect={(e) => handleWithDelay(e, () => setLanguage(key), setIsLangOpen)}
                    className={dropdownItemClass}
                >
                  <span className="mr-3 text-xl">{flag}</span> {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

           {/* Hamburger */}
           <DropdownMenu open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <DropdownMenuTrigger asChild>
                <button className={`p-2 text-gray-600 bg-white/80 backdrop-blur-sm rounded-lg ${clickEffect} ${noFocusRing}`}>
                    <Menu className="w-8 h-8" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white border-gray-100 shadow-2xl mr-1 p-3 z-[200] rounded-xl">
                {user ? (
                    <>
                        <div className="px-3 py-3 flex items-center gap-3 mb-2 border-b border-gray-100">
                            <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                                {user.username[0].toUpperCase()}
                            </div>
                            <span className="font-bold text-gray-800 text-lg">{user.username}</span>
                        </div>
                        <DropdownMenuItem className={dropdownItemClass}><UserIcon className="w-4 h-4"/> Profil</DropdownMenuItem>
                        <DropdownMenuItem className={dropdownItemClass}><LayoutDashboard className="w-4 h-4"/> Dashboard</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-100 my-2"/>
                        <DropdownMenuItem onSelect={(e) => handleWithDelay(e, logout, setIsMobileOpen)} className={`${dropdownItemClass} text-red-500 hover:text-red-600 hover:bg-red-50`}>
                            <LogOut className="w-4 h-4"/> Odjavi se
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <DropdownMenuItem onSelect={(e) => handleWithDelay(e, () => login("GuestUser"), setIsMobileOpen)} className={dropdownItemClass}>
                            <LogIn className="w-4 h-4" /> Login
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => handleWithDelay(e, () => login("GuestUser"), setIsMobileOpen)} className={dropdownItemClass}>
                            <PlusCircle className="w-4 h-4" /> Join
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-100 my-2" />
                        <DropdownMenuItem asChild>
                           <Link href="/seller/register" className={`${dropdownItemClass} shadow-md border-purple-100`}>
                             <PlusCircle className="w-4 h-4 text-green-500" /> Become a Seller
                           </Link>
                        </DropdownMenuItem>
                    </>
                )}
              </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </div>

      {/* --- DONJI RED: KATEGORIJE --- */}
      <div className="block border-t border-gray-100 relative z-[50]">
         <div className="container mx-auto px-4">
            <div className="flex items-center gap-6 md:gap-0 overflow-x-auto purple-scrollbar py-3 md:justify-between">
                {categories.map((cat) => (
                  <Link 
                    key={cat.slug} href={`/services?cat=${cat.slug}`}
                    className={`whitespace-nowrap flex-shrink-0 text-gray-500 hover:text-purple-600 active:text-purple-700 active:bg-purple-100 rounded-md px-2 font-bold text-[13px] md:text-[14px] border-b-2 border-transparent hover:border-purple-600 transition-all pb-1 ${clickEffect}`}
                  >
                    {cat.name}
                  </Link>
                ))}
            </div>
         </div>
      </div>
    </nav>
  )
}