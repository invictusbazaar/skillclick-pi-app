"use client"

import { useState, useEffect } from 'react';
import { User, Mail, DollarSign, LogOut, Trash2, Plus, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

export default function ProfilePage() {
  // TVOJI PODACI (Vlasnik)
  const user = {
    username: "Invictus Bazaar", 
    email: "invictusbazaar@gmail.com", 
    piBalance: "150.00",
    companyLogo: "/logo bazar.png",
    location: "Novi Sad, Serbia"
  };

  // --- LOGIKA ZA OGLASE ---
  const [myServices, setMyServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Učitavanje oglasa sa API-ja
  useEffect(() => {
    const fetchMyServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (response.ok) {
          const allServices = await response.json();
          // Filtriramo samo oglase gde je autor "Invictus Bazaar"
          const myGigs = allServices.filter((s: any) => s.author === user.username);
          setMyServices(myGigs);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyServices();
  }, []);

  // Funkcija za brisanje (samo vizuelno za sada)
  const handleDeleteService = (id: number) => {
    if(confirm("Are you sure you want to delete this gig?")) {
        setMyServices(myServices.filter(s => s.id !== id));
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-blue-50/30">
      
      <div className="max-w-5xl mx-auto">
        
        {/* --- HEADER PROFILA --- */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
          <img
            src={user.companyLogo}
            alt="Invictus Bazaar Logo"
            className="w-32 h-32 object-contain bg-white rounded-full border-4 border-blue-50 p-2"
          />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
            <p className="text-blue-600 font-medium mb-2">Owner & Platform Creator</p>
            <div className="flex items-center justify-center md:justify-start text-gray-500 text-sm gap-4">
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {user.location}</span>
                <span className="flex items-center"><Mail className="w-4 h-4 mr-1" /> {user.email}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
             <Link href="/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                    <Plus className="w-4 h-4 mr-2" /> Post New Gig
                </Button>
             </Link>
             <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" /> Log Out
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* LEVO: INFO KARTICE */}
            <div className="space-y-6">
                {/* Wallet */}
                <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-blue-100 text-sm font-medium uppercase tracking-wider">
                        <DollarSign className="w-4 h-4 mr-1" /> Pi Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-extrabold flex items-baseline gap-1">
                            {user.piBalance} <span className="text-xl font-light">π</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* DESNO: MOJI OGLASI (KARTICE SE VRAĆAJU!) */}
            <div className="md:col-span-2">
                <h2 className="text-xl font-bold text-gray-900 mb-4">My Active Gigs ({myServices.length})</h2>

                <div className="space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-500 py-10">Loading your gigs...</p>
                    ) : myServices.length > 0 ? (
                        myServices.map((service) => (
                            <Card key={service.id} className="group hover:border-blue-400 transition-all duration-200 overflow-hidden">
                                <CardContent className="p-0 flex flex-col sm:flex-row">
                                    {/* Slika Oglasa */}
                                    <div className="h-32 sm:h-auto sm:w-40 bg-blue-50 flex items-center justify-center text-4xl border-r border-gray-100">
                                        {service.image || (service.category === 'design' ? '🎨' : '⚡')}
                                    </div>
                                    
                                    {/* Detalji */}
                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{service.title}</h3>
                                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">
                                                    {service.price} π
                                                </span>
                                            </div>
                                            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{service.description}</p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                                            <span className="text-xs font-semibold text-gray-400 uppercase">{service.category}</span>
                                            <div className="flex gap-2">
                                                <Link href={`/services/${service.id}`}>
                                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">View</Button>
                                                </Link>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteService(service.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                            <p className="text-gray-500 mb-4">You haven't posted any services yet.</p>
                            <Link href="/create">
                                <Button>Start Selling Now</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}