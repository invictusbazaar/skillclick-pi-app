"use client"

import { useState } from 'react';
import { User, Mail, DollarSign, LogOut, Settings, BarChart3, Users, Package, ShieldCheck, MapPin, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext'; // UVOZIMO HOOK

export default function ProfilePage() {
  const { t } = useLanguage(); // KORISTIMO PREVODE

  const owner = {
    name: "Invictus Bazaar",
    role: "Platform Owner & Admin",
    email: "invictusbazaar@gmail.com",
    location: "Novi Sad, Serbia",
    logo: "/invictus-logo.png", 
    totalEarnings: "1,250.00",
    totalUsers: 142, 
    activeGigs: 28
  };

  const buttonStyleOutline = "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md px-4 py-1 h-9 transition-all text-sm font-medium";
  const buttonStyleSolid = "bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-1 h-9 transition-all text-sm font-medium shadow-lg shadow-blue-200";

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
                <div className="w-40 h-40 bg-white rounded-full border-4 border-blue-50 flex items-center justify-center shadow-sm overflow-hidden p-0">
                    <img src={owner.logo} alt="Invictus Bazaar" className="w-full h-full object-cover scale-[1.75]" />
                </div>
                <div className="absolute bottom-2 right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-md z-10"><ShieldCheck className="w-5 h-5" /></div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{owner.name}</h1>
                <p className="text-blue-600 font-semibold text-lg mb-3">{owner.role}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {owner.location}</span>
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {owner.email}</span>
                </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[160px]">
                <Button variant="outline" className={buttonStyleOutline}><Settings className="w-4 h-4 mr-2" /> {t.settings}</Button>
                <Button className={buttonStyleSolid}><LogOut className="w-4 h-4 mr-2" /> {t.logout}</Button>
            </div>
        </div>

        {/* DASHBOARD (PREVEDENO) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-lg relative overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div><p className="text-blue-100 text-sm font-medium uppercase tracking-wider">{t.totalRevenue}</p><h3 className="text-3xl font-bold mt-1">{owner.totalEarnings} π</h3></div>
                        <div className="p-2 bg-white/20 rounded-lg"><DollarSign className="w-6 h-6 text-white" /></div>
                    </div>
                </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div><p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{t.activeUsers}</p><h3 className="text-3xl font-bold text-gray-900 mt-1">{owner.totalUsers}</h3></div>
                        <div className="p-2 bg-purple-100 rounded-lg"><Users className="w-6 h-6 text-purple-600" /></div>
                    </div>
                </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div><p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{t.totalGigs}</p><h3 className="text-3xl font-bold text-gray-900 mt-1">{owner.activeGigs}</h3></div>
                        <div className="p-2 bg-orange-100 rounded-lg"><Package className="w-6 h-6 text-orange-600" /></div>
                    </div>
                </CardContent>
            </Card>
        </div>
        
        {/* UPRAVLJANJE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader><CardTitle className="text-lg">{t.platformMgmt}</CardTitle></CardHeader>
                <CardContent className="grid gap-3">
                    <Link href="/create"><Button className={`w-full justify-start ${buttonStyleSolid}`}><Plus className="w-4 h-4 mr-2" /> {t.postOfficial}</Button></Link>
                    <Link href="/services"><Button variant="outline" className={`w-full justify-start ${buttonStyleOutline}`}><Search className="w-4 h-4 mr-2" /> {t.browseAll}</Button></Link>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="text-lg">{t.supportInbox}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs">MK</div>
                        <div className="flex-1"><p className="text-sm font-bold text-gray-900">Marko K.</p><p className="text-xs text-gray-500 truncate">How do I withdraw?</p></div>
                        <Button size="sm" variant="ghost" className="text-blue-600 h-8 hover:bg-blue-50 hover:text-blue-700">{t.reply}</Button>
                    </div>
                    <div className="text-center pt-2"><Link href="/messages" className="text-sm text-blue-600 hover:underline">{t.viewAllMessages}</Link></div>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}