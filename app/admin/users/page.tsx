"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Ban, ShieldCheck, ShieldAlert, Trash2, Search, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 👇 ISPRAVLJENO: Ostao je samo TVOJ ADMIN NALOG, ostali su obrisani
const MOCK_USERS = [
  { id: 1, username: "ilijabrdar", email: "iliajbrdar.777@gmail.com", role: "admin", status: "active" }
];

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState("");

  // 👇 NOVO: Stanje za vizuelni efekat na mobilnom
  const [isBackActive, setIsBackActive] = useState(false);

  // 👇 NOVO: Pametna funkcija za Nazad
  const handleBack = () => {
    // Proveravamo širinu ekrana da vidimo da li je mobilni
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
        // MOBILNI: Aktiviraj boju, sačekaj 0.5s, pa idi nazad
        setIsBackActive(true);
        setTimeout(() => {
            router.back();
        }, 500);
    } else {
        // PC: Idi nazad odmah (hover rešava boju)
        router.back();
    }
  }

  const handleBan = (id: number) => {
    if (confirm("Da li sigurno želiš da BANUJEŠ ovog korisnika?")) {
        setUsers(users.map(user => 
            user.id === id ? { ...user, status: 'banned' } : user
        ));
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Trajno obrisati korisnika?")) {
        setUsers(users.filter(user => user.id !== id));
    }
  };

  const getGradient = (id: number) => {
    const gradients = [
      "from-fuchsia-500 to-pink-600",
      "from-violet-500 to-purple-600",
      "from-blue-500 to-indigo-600",
      "from-emerald-400 to-teal-500"
    ];
    return gradients[(id - 1) % gradients.length];
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* HEADER SA GLASS EFEKTOM */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
             
             {/* 👇 NOVO DUGME NAZAD */}
             <button 
                onClick={handleBack}
                className={`
                    flex items-center gap-2 font-bold transition-all duration-200 outline-none
                    /* PC Hover efekat */
                    hover:text-purple-600 hover:scale-105
                    /* Mobilni aktivni efekat (kad je isBackActive true) */
                    ${isBackActive ? "text-purple-600 scale-95" : "text-gray-600"}
                `}
                style={{ WebkitTapHighlightColor: "transparent" }}
             >
                <ArrowLeft className={`w-5 h-5 transition-transform ${isBackActive ? '-translate-x-1' : ''}`} />
                <span>Nazad</span>
             </button>

             <div className="border-l border-gray-300 h-6 mx-2 hidden md:block"></div>

             <div>
                <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">Korisnici</h1>
                <p className="text-xs text-gray-500 font-medium">Admin Kontrola</p>
             </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* SEARCH BAR */}
        <div className="bg-white p-2 rounded-2xl shadow-xl shadow-purple-900/5 border border-gray-100 mb-8 flex items-center gap-3 relative">
            <div className="pl-3 text-gray-400"><Search className="w-5 h-5" /></div>
            <Input 
                placeholder="Pretraži korisnike po imenu ili emailu..." 
                className="border-none shadow-none text-lg focus-visible:ring-0 h-12 bg-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* LISTA KORISNIKA */}
        <div className="grid grid-cols-1 gap-4">
            {filteredUsers.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    Nema pronađenih korisnika.
                </div>
            ) : (
                filteredUsers.map((user) => (
                    <div key={user.id} className="group bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-purple-100 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        
                        {/* LEVI DEO */}
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradient(user.id)} flex items-center justify-center text-white shadow-md shadow-purple-200 group-hover:scale-105 transition-transform`}>
                                <span className="text-xl font-bold">{user.username[0].toUpperCase()}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-gray-900">{user.username}</h3>
                                    {user.role === 'admin' && (
                                        <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-purple-200 flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" /> ADMIN
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                    <Mail className="w-3 h-3" /> {user.email}
                                </div>
                            </div>
                        </div>

                        {/* SREDNJI DEO */}
                        <div className="flex items-center gap-2">
                             {user.status === 'banned' ? (
                                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-bold border border-red-100 flex items-center gap-1">
                                    <Ban className="w-3 h-3" /> BANNED
                                </span>
                             ) : user.status === 'reported' ? (
                                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-xs font-bold border border-orange-100 flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3" /> REPORTED
                                </span>
                             ) : (
                                <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-xs font-bold border border-green-100 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> ACTIVE
                                </span>
                             )}
                        </div>

                        {/* DESNI DEO */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-gray-100 pt-3 md:pt-0 mt-2 md:mt-0">
                            {user.role !== 'admin' && user.status !== 'banned' && (
                                <Button 
                                    onClick={() => handleBan(user.id)}
                                    variant="outline" 
                                    className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-10 px-4 font-bold"
                                >
                                    <Ban className="w-4 h-4 mr-2" /> Banuj
                                </Button>
                            )}
                            {user.role !== 'admin' && (
                                 <Button 
                                    onClick={() => handleDelete(user.id)}
                                    variant="ghost" 
                                    size="icon"
                                    className="rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            )}
                        </div>

                    </div>
                ))
            )}
        </div>

      </main>
    </div>
  );
}