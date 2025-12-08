"use client"

import { useState, useEffect } from 'react';
import { 
  User, Mail, MapPin, LogOut, Settings, 
  ShieldCheck, LayoutDashboard, Users, Layers, 
  TrendingUp, CreditCard, Bell, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock statistika
  const stats = {
    earnings: "1,250.00",
    totalUsers: 142,
    activeGigs: 38,
    pendingReports: 2
  };

  useEffect(() => {
    // Provera da li je korisnik ulogovan
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    } else {
        router.push("/auth/login"); 
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
    setTimeout(() => window.location.reload(), 100);
  };

  if (loading) return null; 

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans relative pb-20">
      
      {/* --- DEKORATIVNA POZADINA --- */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900 via-indigo-900 to-[#f8f9fc] -z-10" />
      <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10" />
      <div className="absolute top-40 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl -z-10" />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* --- 1. PROFILNA KARTICA --- */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-900/10 border border-white/50 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-8 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Ukrasna linija gore */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500"></div>

            {/* Avatar */}
            <div className="relative shrink-0">
                <div className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-4xl md:text-5xl font-extrabold text-purple-600">
                        {user?.username?.[0]?.toUpperCase() || "U"}
                    </span>
                </div>
                {user?.role === 'admin' && (
                    <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-1.5 rounded-full border-4 border-white shadow-md" title="Admin">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                        {user?.username || "Korisnik"}
                    </h1>
                    {user?.role === 'admin' && (
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase rounded-full shadow-md shadow-blue-500/30 tracking-wider">
                            Master Admin
                        </span>
                    )}
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                        <Mail className="w-4 h-4 text-purple-500" /> {user?.email}
                    </span>
                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                        <MapPin className="w-4 h-4 text-purple-500" /> Novi Sad, Serbia
                    </span>
                </div>
            </div>

            {/* 👇 IZMENJENO DUGME ZA ODJAVU */}
            <Button 
                onClick={handleLogout}
                variant="outline" 
                className="border-gray-200 text-gray-600 hover:bg-purple-600 hover:text-white hover:border-purple-600 rounded-xl px-5 h-11 font-bold shadow-sm transition-all"
            >
                <LogOut className="w-4 h-4 mr-2" /> Odjavi se
            </Button>
        </div>

        {/* --- 2. ADMIN KOMANDE (Samo za tebe) --- */}
        {user?.role === 'admin' && (
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-lg font-bold text-white/90 flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5" /> Admin Kontrola
                    </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Kartica: Korisnici */}
                    <Link href="/admin/users" className="group">
                        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-purple-900/5 border border-purple-100 hover:border-purple-300 hover:shadow-purple-500/10 transition-all duration-300 flex items-center justify-between relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">Upravljanje Korisnicima</h3>
                                    <p className="text-sm text-gray-500">Banuj, briši i pregledaj naloge</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                <ChevronRight className="w-5 h-5" />
                            </div>
                        </div>
                    </Link>

                    {/* Kartica: Oglasi */}
                    <Link href="/admin/services" className="group">
                        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-purple-900/5 border border-indigo-100 hover:border-indigo-300 hover:shadow-indigo-500/10 transition-all duration-300 flex items-center justify-between relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-700 transition-colors">Upravljanje Oglasima</h3>
                                    <p className="text-sm text-gray-500">Moderacija sadržaja i usluga</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <ChevronRight className="w-5 h-5" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        )}

        {/* --- 3. STATISTIKA --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {/* Zarada */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Ukupna Zarada</p>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-3xl font-extrabold mb-1">{user?.role === 'admin' ? stats.earnings : "0.00"} π</h3>
                <p className="text-xs text-gray-400">+12% u odnosu na prošli mesec</p>
            </div>

            {/* Aktivni Oglasi */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Aktivni Oglasi</p>
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Layers className="w-4 h-4" /></div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{user?.role === 'admin' ? stats.activeGigs : "0"}</h3>
                <p className="text-xs text-green-600 font-medium">Sve funkcioniše savršeno</p>
            </div>

            {/* Korisnici / Poruke */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{user?.role === 'admin' ? "Ukupno Korisnika" : "Moje Porudžbine"}</p>
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Users className="w-4 h-4" /></div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{user?.role === 'admin' ? stats.totalUsers : "0"}</h3>
                <p className="text-xs text-gray-400">Aktivna zajednica raste</p>
            </div>
        </div>

        {/* --- 4. OPCIJE NALOGA --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Podešavanja Naloga</h3>
            <div className="space-y-1">
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors text-left group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                            <Settings className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-gray-900">Izmeni Profil</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors text-left group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-gray-900">Pi Wallet Podešavanja</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors text-left group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                            <Bell className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-gray-900">Obaveštenja</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-red-500 w-2 h-2 rounded-full"></span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                </button>
            </div>
        </div>

      </main>
    </div>
  );
}