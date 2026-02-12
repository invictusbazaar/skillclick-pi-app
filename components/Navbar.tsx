"use client"

import { useState, Suspense, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation" 
import { useLanguage } from "@/components/LanguageContext"
import { useAuth } from "@/components/AuthContext"
import { 
  ChevronDown, Menu, ShieldCheck, Home, PlusCircle, User, Bell 
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
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const fetchNotifications = async () => {
    if (!user?.username) return;
    try {
        const res = await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user.username })
        });
        const data = await res.json();
        if (data.notifications) {
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        }
    } catch (error) {
        console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id: string, link: string | null) => {
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      
      await fetch('/api/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: id })
      });

      if (link) {
          router.push(link);
          setIsNotifOpen(false);
      }
  };

  const handleLanguageClick = (e: Event, key: string) => {
    e.preventDefault();
    setAnimatingLang(key);
    setTimeout(() => {
        setLanguage(key);
        setAnimatingLang(null);
        setIsLangMenuOpen(false);
    }, 400);
  };

  const handleMobileClick = (e: Event, path: string) => {
    e.preventDefault();
    setAnimatingLink(path); 
    setTimeout(() => {
        router.push(path);
        setAnimatingLink(null);
        setIsMobileMenuOpen(false);
    }, 400);
  };

  const getMobileLinkStyle = (path: string) => `
    cursor-pointer py-3 mb-1 font-bold text-sm rounded-xl transition-all duration-300 flex items-center
    ${animatingLink === path 
        ? "bg-purple-900 text-white scale-105 shadow-lg z-10" 
        : "text-gray-600 hover:bg-gray-100" 
    }
  `;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-[50] shadow-sm flex flex-col font-sans overflow-hidden">
      <div className="container mx-auto px-2 md:px-4 h-16 md:h-20 flex items-center relative">
        
        {/* LOGO - POMEREN JOS LEVO */}
        {/* Ranije: ml-[-20px] -> Sada: ml-[-70px] (mobile) */}
        {/* Ranije: ml-[-100px] -> Sada: ml-[-150px] (desktop) */}
        <Link href="/" className="flex-shrink-0 ml-[-70px] md:ml-[-150px] z-0"> 
          <Image 
            src="/skillclick_logo.png" 
            alt="SkillClick" 
            width={440} 
            height={120} 
            className="w-[280px] sm:w-[320px] md:w-[400px] h-auto object-contain" 
            priority 
          />
        </Link>

        {/* DESNA STRANA */}
        <div className="absolute right-2 md:static md:ml-auto flex items-center gap-1 sm:gap-2 md:gap-4 z-50 bg-white/30 backdrop-blur-[2px] rounded-full p-1 border border-white/50 shadow-sm">
          
          <DropdownMenu open={isLangMenuOpen} onOpenChange={setIsLangMenuOpen}>
            <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 rounded-full bg-white/80 hover:bg-purple-50 text-purple-900 transition-all duration-300 outline-none border border-purple-200 active:scale-95 shadow-sm">
                <span className="text-lg md:text-xl">{currentLangObj.flag}</span> 
                <span className="hidden md:inline font-bold text-xs ml-1">{currentLangObj.label}</span>
                <ChevronDown className="w-3 h-3 text-purple-700" />
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-48 bg-white border-purple-100 shadow-2xl z-[100] p-2 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
              {Object.entries(languages).map(([key, { label, flag }]) => (
                <DropdownMenuItem 
                    key={key} 
                    onSelect={(e) => handleLanguageClick(e, key)}
                    className={`cursor-pointer py-2 mb-1 font-bold text-sm rounded-xl border transition-all duration-300 flex items-center ${animatingLang === key ? "bg-purple-900 text-white scale-105 shadow-lg border-purple-900 z-10" : "text-gray-700 bg-purple-50/50 hover:bg-purple-100 hover:text-purple-900 border-transparent hover:border-purple-200"}`}
                >
                  <span className="mr-3 text-xl">{flag}</span> {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user && (
             <DropdownMenu open={isNotifOpen} onOpenChange={setIsNotifOpen}>
                <DropdownMenuTrigger className="relative p-1.5 md:p-2 rounded-full bg-white/80 hover:bg-gray-100 transition outline-none border border-gray-100 shadow-sm">
                    <Bell className={`w-5 h-5 md:w-6 md:h-6 ${unreadCount > 0 ? "text-purple-600 fill-purple-100" : "text-gray-500"}`} />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 md:top-1 md:right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-red-600 text-white text-[9px] md:text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                            {unreadCount}
                        </span>
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 md:w-80 bg-white border-gray-200 shadow-xl rounded-xl p-0 overflow-hidden z-[100]">
                    <div className="bg-purple-50 p-3 border-b border-purple-100 font-bold text-gray-700 text-sm flex justify-between items-center">
                        <span>{t('notificationsTitle')}</span>
                        {unreadCount > 0 && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{unreadCount} {t('new')}</span>}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">{t('noNotifications')} 🔕</div>
                        ) : (
                            notifications.map((notif) => (
                                <DropdownMenuItem 
                                    key={notif.id} 
                                    className={`p-3 border-b border-gray-50 cursor-pointer flex items-start gap-3 ${notif.isRead ? 'bg-white' : 'bg-blue-50/50'}`}
                                    onSelect={() => markAsRead(notif.id, notif.link)}
                                >
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.isRead ? 'bg-gray-300' : 'bg-purple-600'}`} />
                                    <div className="flex-1">
                                        <p className={`text-sm ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>{notif.message}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </DropdownMenuItem>
                            ))
                        )}
                    </div>
                </DropdownMenuContent>
             </DropdownMenu>
          )}

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

          <div className="flex md:hidden">
              <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <DropdownMenuTrigger className="p-1.5 transition-transform active:scale-95 bg-white/80 rounded-full border border-gray-100 shadow-sm"> <Menu className="w-6 h-6 text-gray-800" /> </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 bg-white border border-gray-200 shadow-2xl z-[9999] rounded-xl p-2 mr-2">
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
