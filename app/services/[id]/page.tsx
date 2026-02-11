"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { 
  ArrowLeft, Clock, PenTool, Car, Wrench, Palette, Code, 
  UserCircle, Star, ShieldCheck, CheckCircle, RefreshCw 
} from 'lucide-react';
import Link from 'next/link';
import BuyButton from '@/components/BuyButton'; 
import ChatSystem from '@/components/ChatSystem'; 

declare global { interface Window { Pi: any; } }

export default function ServiceDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [service, setService] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string>("");

  // Helper za gradient ako nema slike
  const getGradient = (id: string) => {
    if (!id) return "from-indigo-500 to-purple-600";
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = ["from-fuchsia-600 to-pink-600", "from-violet-600 to-indigo-600", "from-blue-600 to-cyan-500", "from-emerald-500 to-teal-600"];
    return gradients[sum % gradients.length];
  };

  // Pametne ikonice ako nema slike
  const getSmartIcon = (svc: any) => {
    const iconClass = "w-16 h-16 text-white/90 drop-shadow-md"; // Smanjena ikonica
    const title = (typeof svc.title === 'string' ? svc.title : (svc.title?.en || "")).toLowerCase();
    const cat = (svc.category || "").toLowerCase();
    if (title.includes('auto') || title.includes('alfa') || title.includes('fiat')) return <Car className={iconClass} />;
    if (title.includes('popravka') || title.includes('servis')) return <Wrench className={iconClass} />;
    if (cat.includes('design')) return <Palette className={iconClass} />;
    if (cat.includes('tech')) return <Code className={iconClass} />;
    return <Code className={iconClass} />;
  };

  // Učitavanje podataka
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            const found = data.find((s: any) => s.id.toString() === id);
            setService(found);
            if (found?.images && found.images.length > 0) setMainImage(found.images[0]);
        }
      })
      .catch(err => console.error("Greška:", err));
  }, [id]);

  if (!service) return <div className="p-20 text-center text-gray-500 text-sm">{t('loading')}</div>;
  
  // Lokalizacija polja (Naslov i Opis)
  const getLocalized = (field: any) => (typeof field === 'string' ? field : field[lang] || field['en'] || "");
  const currentTitle = getLocalized(service.title);
  const currentDesc = getLocalized(service.description);
  const sellerUsername = service.author?.username || service.seller?.username || "User";

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* 1. HEADER (Smanjen i kompaktan) */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 text-sm font-bold hover:text-purple-600">
                <ArrowLeft className="w-4 h-4" /> {t('back')}
            </button>
            <div className="text-xs font-bold text-purple-600 uppercase bg-purple-50 px-2 py-1 rounded-full border border-purple-100">
                {t('cat' + service.category.charAt(0).toUpperCase() + service.category.slice(1)) || service.category}
            </div>
          </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        
        {/* GLAVNI GRID: Levo (Slike/Opis) - Desno (Cena/Buy) */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-start">
          
          {/* --- LEVA STRANA (2/3 širine) --- */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Naslov - Smanjen font */}
            <h1 className="text-2xl font-black text-gray-900 leading-tight">
                {currentTitle}
            </h1>

            {/* Info o prodavcu (Traka) */}
            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                <Link href={`/seller/${sellerUsername}`}>
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm hover:scale-105 transition-transform">
                        {sellerUsername[0]?.toUpperCase() || <UserCircle />}
                    </div>
                </Link>
                <div>
                    <Link href={`/seller/${sellerUsername}`} className="font-bold text-sm text-gray-900 hover:text-purple-600 hover:underline">
                        @{sellerUsername}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex items-center text-amber-500">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="font-bold ml-1">{service.sellerRating?.toFixed(1) || "5.0"}</span>
                        </div>
                        <span>•</span>
                        <span>{t('verifiedSeller')}</span>
                    </div>
                </div>
            </div>

            {/* SLIKA - FIX ZA DRAGANU (aspect-video + object-cover) */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-100">
                {mainImage ? (
                    <img 
                        src={mainImage} 
                        alt={currentTitle} 
                        className="w-full h-full object-cover" // 👈 OVO SEČE SLIKU DA STANE U OKVIR
                    /> 
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getGradient(service.id)} flex items-center justify-center`}>
                        {getSmartIcon(service)}
                    </div>
                )}
            </div>

            {/* OPIS */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-purple-500"/> {t('aboutService')}
                </h3>
                <div className="prose prose-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {currentDesc}
                </div>
            </div>

          </div>

          {/* --- DESNA STRANA (1/3 širine - Sticky) --- */}
          <div className="md:col-span-1 space-y-6 md:sticky md:top-20">
            
            <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('servicePrice')}</span>
                    <span className="text-3xl font-black text-purple-600">{service.price} π</span>
                </div>

                {/* Detalji isporuke */}
                <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm text-gray-700 font-medium bg-gray-50 p-2 rounded-lg">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span>{service.deliveryTime} {t('days')} {t('delivery')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 font-medium px-2">
                        <RefreshCw className="w-4 h-4 text-purple-500" />
                        <span>{service.revisions || 1} {t('revisions')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 font-medium px-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{t('satisfaction')}</span>
                    </div>
                </div>

                {/* Dugme za kupovinu */}
                <BuyButton 
                    amount={parseFloat(service.price)}
                    serviceId={service.id}
                    title={currentTitle}
                    sellerUsername={sellerUsername}
                />
            </div>

            {/* Chat Komponenta */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                 <ChatSystem sellerUsername={sellerUsername} />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
