"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, LogIn, UserPlus, LogOut, User, MessageSquare, Briefcase, Globe, Plus, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from './LanguageContext'; 
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

const buttonStyle = "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md px-4 py-1 h-9 transition-all text-sm font-medium";

export default function Header({ sessionKeyProp }: { sessionKeyProp: string | null | undefined }) {
    const { lang, changeLanguage, languagesList, t } = useLanguage(); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('User');
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();

    const checkLoginStatus = () => {
        if (typeof window !== 'undefined') {
            const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
            const userEmail = localStorage.getItem('userEmail');
            
            if (loggedIn) {
                setIsLoggedIn(true);
                if (userEmail) {
                    setUsername(userEmail.split('@')[0]);
                } else {
                    setUsername('Profile'); 
                }
            } else {
                setIsLoggedIn(false);
                setUsername('User');
            }
        }
    };

    useEffect(() => {
        checkLoginStatus(); 
    }, [sessionKeyProp]); 

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('sessionKey'); 
        }
        setIsLoggedIn(false);
        setMenuOpen(false);
        router.push('/auth/login');
    };

    // --- POPRAVLJENI MOBILE MENU ZA RENDER ---
    const MobileMenu = () => (
        <div className="absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl z-50 h-[calc(100vh-60px)] overflow-y-auto">
            <div className="p-4 space-y-4">
                
                {/* 1. LOGIN/LOGOUT & STATUS DUGMAD (FIXED) */}
                <div className="flex flex-col gap-3 border-b border-gray-100 pb-4">
                    {isLoggedIn ? (
                        <>
                            {/* PRIKAZ ULOGOVANOG KORISNIKA */}
                            <Link href="/profile" onClick={() => setMenuOpen(false)}>
                                <div className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded-md">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">{username[0].toUpperCase()}</div>
                                    <span className="font-bold text-gray-800">{username} ({t.profile})</span>
                                </div>
                            </Link>
                            
                            <Link href="/messages" onClick={() => setMenuOpen(false)}><Button variant="ghost" className="w-full justify-start"><MessageSquare className="h-4 w-4 mr-2" /> {t.messages}</Button></Link>
                            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4 mr-2" /> {t.logout}</Button>
                            <Link href="/create" onClick={() => setMenuOpen(false)}><Button className="w-full bg-blue-600 mt-2">{t.postService}</Button></Link>
                        </>
                    ) : (
                        // PRIKAZ KADA NIJE ULOGOVAN
                        <>
                            <Link href="/auth/login" onClick={() => setMenuOpen(false)}><Button className="w-full bg-blue-600 mb-2">{t.login}</Button></Link>
                            <Link href="/auth/register" onClick={() => setMenuOpen(false)}><Button variant="outline" className="w-full">{t.register}</Button></Link>
                        </>
                    )}
                </div>

                {/* 2. GLAVNI LINKOVI & KATEGORIJE (FIXED) */}
                <div className="space-y-2">
                    <h4 className="text-gray-900 font-bold text-sm">Navigation</h4>
                    
                    <Link href="/services" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 hover:text-blue-600 flex items-center"><Briefcase className="w-4 h-4 mr-2 inline" /> {t.explore}</Link>
                    
                    {/* FIX: DODATO "BECOME A SELLER" DUGME U MOBILNI MENI */}
                    <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="block py-2 text-blue-600 hover:text-blue-700 flex items-center">
                        <UserPlus className="w-4 h-4 mr-2 inline" /> {t.becomeSeller}
                    </Link>

                    <Link href="/create" onClick={() => setMenuOpen(false)} className="block py-2 text-blue-600 hover:text-blue-700 flex items-center"><Plus className="w-4 h-4 mr-2 inline" /> {t.postService}</Link>
                </div>
            </div>
        </div>
    );

    return (
        <header className="border-b border-blue-100 bg-blue-50/50 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between relative">
                <Link href="/"><img src="/skillclick_logo.png" alt="SkillClick" width={140} height={30} className="object-contain" /></Link>
                
                <nav className="flex items-center gap-4">
                    
                    {/* JEZIK (Dropdown) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" onClick={() => {}} className={buttonStyle + " flex items-center gap-1"}>
                                <Globe className="h-4 w-4" /> {lang.toUpperCase()}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border border-blue-200 shadow-lg">
                            {languagesList.map((l: any) => (
                                <DropdownMenuItem 
                                    key={l.code} 
                                    onClick={() => changeLanguage(l.code)}
                                    className="cursor-pointer hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium focus:bg-blue-50 focus:text-blue-700" 
                                >
                                    <span className="mr-2">{l.flag}</span> {l.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* DESKTOP DUGMAD */}
                    <Link href="/services" className="hidden md:block">
                        <Button variant="outline" className={buttonStyle}>Explore</Button>
                    </Link>
                    
                    <Link href="/auth/register" className="hidden md:block">
                        <Button variant="outline" className={buttonStyle}>Become a Seller</Button>
                    </Link>
                    
                    {/* DUGME HAMBURGER */}
                    <Button variant="ghost" size="icon" onClick={() => setMenuOpen(prev => !prev)} className="md:hidden text-gray-600">
                        <Menu className="h-5 w-5" />
                    </Button>

                    {isLoggedIn ? (
                        // PRIKAZ KADA JE ULOGOVAN (Desktop)
                        <div className="hidden md:flex items-center gap-3">
                            <Link href="/messages">
                                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-600 hover:bg-blue-100 p-0">
                                    <MessageSquare className="h-5 w-5" />
                                </Button>
                            </Link>
                            
                            <Link href="/profile">
                                <Button variant="outline" className={`${buttonStyle} flex items-center gap-1 bg-blue-50`}>
                                    <User className="h-4 w-4" /> {username}
                                </Button>
                            </Link>
                            <Button onClick={handleLogout} variant="outline" className={buttonStyle}>
                                <LogOut className="h-4 w-4" /> Log Out
                            </Button>
                        </div>
                    ) : (
                        // PRIKAZ KADA NIJE ULOGOVAN (Desktop)
                        <div className="hidden md:flex gap-3 items-center ml-2">
                            <Link href="/auth/login"><Button variant="outline" className={buttonStyle}><LogIn className="h-4 w-4 mr-1" /> Login</Button></Link>
                            <Link href="/auth/register"><Button variant="outline" className={buttonStyle}><UserPlus className="h-4 w-4 mr-1" /> Register</Button></Link>
                        </div>
                    )}
                    
                </nav>
            </div>
            {menuOpen && <MobileMenu />}
        </header>
    );
}