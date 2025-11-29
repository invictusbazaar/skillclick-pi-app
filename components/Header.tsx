"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, LogIn, UserPlus, LogOut, User, MessageSquare, Briefcase, Globe } from 'lucide-react';
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

// FIX: PRIMAMO 'sessionKeyProp' UMESTO 'key'
export default function Header({ sessionKeyProp }: { sessionKeyProp: string | null | undefined }) {
    const { lang, changeLanguage, languagesList } = useLanguage(); 
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

    // FIX: Koristimo sessionKeyProp za re-render
    useEffect(() => {
        checkLoginStatus(); 
    }, [sessionKeyProp]); 

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('sessionKey'); // Brisemo ključ na logout
        }
        setIsLoggedIn(false);
        setMenuOpen(false);
        router.push('/auth/login');
    };

    const MobileMenu = () => (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-md md:hidden z-40 p-4 space-y-2">
            {/* ... Sadržaj menija ... */}
        </div>
    );

    return (
        <header className="border-b border-blue-100 bg-blue-50/50 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between relative">
                <Link href="/"><img src="/skillclick_logo.png" alt="SkillClick" width={140} height={30} className="object-contain" /></Link>
                
                <nav className="flex items-center gap-4">
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className={buttonStyle + " flex items-center gap-1"}>
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

                    <Link href="/services" className="hidden md:block">
                        <Button variant="outline" className={buttonStyle}>Explore</Button>
                    </Link>
                    
                    <Link href="/auth/register" className="hidden md:block">
                        <Button variant="outline" className={buttonStyle}>Become a Seller</Button>
                    </Link>
                    
                    <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-600">
                        <Menu className="h-5 w-5" />
                    </Button>

                    {isLoggedIn ? (
                        // PRIKAZ KADA JE ULOGOVAN
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
                        // PRIKAZ KADA NIJE ULOGOVAN
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