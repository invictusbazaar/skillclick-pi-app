"use client"

import { useState } from 'react';
import { User, Mail, DollarSign, LogOut, Settings, BarChart3, Users, Package, ShieldCheck, MapPin, Plus, Search, Save, X } from 'lucide-react'; // Dodati Save i X
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Dodat Input
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  
  // STANJE ZA UREĐIVANJE
  const [isEditing, setIsEditing] = useState(false);

  // PODACI O VLASNIKU (Sada su u State-u da bi mogli da se menjaju)
  const [owner, setOwner] = useState({
    name: "Invictus Bazaar",
    role: "Platform Owner & Admin",
    email: "invictusbazaar@gmail.com",
    location: "Novi Sad, Serbia",
    logo: "/invictus-logo.png", 
    totalEarnings: "1,250.00",
    totalUsers: 142, 
    activeGigs: 28
  });

  // FUNKCIJA ZA ODJAVU
  const handleLogout = () => {
      // Ovde bi išla prava logika za brisanje sesije
      alert("Logging out...");
      setTimeout(() => {
          router.push('/auth/login');
      }, 1000);
  };

  // FUNKCIJA ZA ČUVANJE PODEŠAVANJA
  const handleSave = () => {
      setIsEditing(false);
      // Ovde bi išao API poziv za čuvanje u bazu
      alert("Settings saved!");
  };

  // STIL ZA DUGMAD
  const buttonStyleOutline = "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md px-4 py-1 h-9 transition-all text-sm font-medium";
  const buttonStyleSolid = "bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-1 h-9 transition-all text-sm font-medium shadow-lg shadow-blue-200";

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gray-50">
      
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER VLASNIKA --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
                <div className="w-40 h-40 bg-white rounded-full border-4 border-blue-50 flex items-center justify-center shadow-sm overflow-hidden p-0">
                    <img 
                        src={owner.logo} 
                        alt="Invictus Bazaar" 
                        className="w-full h-full object-cover scale-[1.75]" 
                    />
                </div>
                <div className="absolute bottom-2 right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-md z-10" title="Verified Owner">
                    <ShieldCheck className="w-5 h-5" />
                </div>
            </div>
            
            <div className="flex-1 text-center md:text-left w-full">
                {isEditing ? (
                    // REŽIM UREĐIVANJA
                    <div className="space-y-3 max-w-md mx-auto md:mx-0">
                        <Input 
                            value={owner.name} 
                            onChange={(e) => setOwner({...owner, name: e.target.value})} 
                            className="font-bold text-xl"
                            placeholder="Company Name"
                        />
                        <Input 
                            value={owner.role} 
                            onChange={(e) => setOwner({...owner, role: e.target.value})} 
                            placeholder="Role"
                        />
                        <Input 
                            value={owner.location} 
                            onChange={(e) => setOwner({...owner, location: e.target.value})} 
                            placeholder="Location"
                        />
                         <Input 
                            value={owner.email} 
                            onChange={(e) => setOwner({...owner, email: e.target.value})} 
                            placeholder="Email"
                        />
                        <div className="flex gap-2 mt-2">
                            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white w-full"><Save className="w-4 h-4 mr-2"/> Save</Button>
                            <Button onClick={() => setIsEditing(false)} variant="outline" className="w-full"><X className="w-4 h-4 mr-2"/> Cancel</Button>
                        </div>
                    </div>
                ) : (
                    // REŽIM PRIKAZA (NORMALNO)
                    <>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{owner.name}</h1>
                        <p className="text-blue-600 font-semibold text-lg mb-3">{owner.role}</p>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {owner.location}</span>
                            <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {owner.email}</span>
                        </div>
                    </>
                )}
            </div>

            {!isEditing && (
                <div className="flex flex-col gap-3 min-w-[160px]">
                    {/* DUGME SETTINGS - AKTIVIRA EDIT MODE */}
                    <Button variant="outline" className={buttonStyleOutline} onClick={() => setIsEditing(true)}>
                        <Settings className="w-4 h-4 mr-2" /> Settings
                    </Button>
                    
                    {/* DUGME LOG OUT - RADI! */}
                    <Button className={buttonStyleSolid} onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" /> Log Out
                    </Button>
                </div>
            )}
        </div>

        {/* --- STATISTIKA (OSTALO ISTO) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div><p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Total Revenue</p><h3 className="text-3xl font-bold mt-1">{owner.totalEarnings} π</h3></div>
                        <div className="p-2 bg-white/20 rounded-lg"><DollarSign className="w-6 h-6 text-white" /></div>
                    </div>
                    <div className="text-xs text-blue-200 bg-white/10 inline-block px-2 py-1 rounded">+12% from last month</div>
                </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div><p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Active Users</p><h3 className="text-3xl font-bold text-gray-900 mt-1">{owner.totalUsers}</h3></div>
                        <div className="p-2 bg-purple-100 rounded-lg"><Users className="w-6 h-6 text-purple-600" /></div>
                    </div>
                    <div className="text-xs text-green-600 font-medium flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Growing steadily</div>
                </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div><p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Gigs</p><h3 className="text-3xl font-bold text-gray-900 mt-1">{owner.activeGigs}</h3></div>
                        <div className="p-2 bg-orange-100 rounded-lg"><Package className="w-6 h-6 text-orange-600" /></div>
                    </div>
                    <div className="text-xs text-gray-400"> across 7 categories</div>
                </CardContent>
            </Card>
        </div>

        {/* --- UPRAVLJANJE --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader><CardTitle className="text-lg">Platform Management</CardTitle><CardDescription>Quick actions for the owner.</CardDescription></CardHeader>
                <CardContent className="grid gap-3">
                    <Link href="/create"><Button className={`w-full justify-start ${buttonStyleSolid}`}><Plus className="w-4 h-4 mr-2" /> Post Official Gig</Button></Link>
                    <Link href="/services"><Button variant="outline" className={`w-full justify-start ${buttonStyleOutline}`}><Search className="w-4 h-4 mr-2" /> Browse All Gigs</Button></Link>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="text-lg">Support Inbox</CardTitle><CardDescription>Recent messages from users.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs">MK</div>
                        <div className="flex-1"><p className="text-sm font-bold text-gray-900">Marko K.</p><p className="text-xs text-gray-500 truncate">How do I withdraw my Pi?</p></div>
                        <Button size="sm" variant="ghost" className="text-blue-600 h-8 hover:bg-blue-50 hover:text-blue-700">Reply</Button>
                    </div>
                    <div className="text-center pt-2"><Link href="/messages" className="text-sm text-blue-600 hover:underline">View all messages</Link></div>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}