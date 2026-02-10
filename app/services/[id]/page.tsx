"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { ArrowLeft, Clock, PenTool, Car, Wrench, Palette, Code, ExternalLink, UserCircle } from 'lucide-react'; // Dodate ikonice
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

  const getGradient = (id: string) => {
    if (!id) return "from-indigo-500 to-purple-600";
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = ["from-fuchsia-600 to-pink-600", "from-violet-600 to-indigo-600", "from-blue-600 to-cyan-500", "from-emerald-500 to-teal-600"];
    return gradients[sum % gradients.length];
  };

  const getSmartIcon = (svc: any) => {
    const iconClass = "w-24 h-24 text-white/90 drop-shadow-lg";
    const title = (typeof svc.title === 'string' ? svc.title : (svc.title?.en || "")).toLowerCase();
    const cat = (svc.category || "").toLowerCase();
    if (title.includes('auto') || title.includes('alfa') || title.includes('fiat')) return <Car className={iconClass} />;
    if (title.includes('popravka') || title.includes('servis')) return <Wrench className={iconClass} />;
    if (cat.includes('design')) return <Palette className={iconClass} />;
    if (cat.includes('tech')) return <Code className={iconClass} />;
    return <Code className={iconClass} />;
  };

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

  if (!service) return <div className="p-20 text-center text-purple-600 font-bold">...</div>;
  
  const getLocalized = (field: any) => (typeof field === 'string' ? field : field[lang] || field['en'] || "");
  const currentTitle = getLocalized(service.title);
  const sellerUsername = service.author?.username || service.seller?.username || "";

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 py-4 shadow-sm">
          <div className="container mx-auto flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 font-bold hover:text-purple-600"><ArrowLeft className="w-5 h-5" /> {t('back')}</button>
            <div className="text-sm font-bold text-purple-600 uppercase bg-purple-50 px-3 py-1 rounded-full">{service.category}</div>
          </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* 1. SLIKA */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-xl bg-white border border-gray-100 group">
                {mainImage ? (
                    <img src={mainImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/> 
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getGradient(service.id)} flex items-center justify-center`}>{getSmartIcon(service)}</div>
                )}
            </div>
          </div>

          {/* 2. SIDEBAR */}
          <div className="lg:col-span-4 lg:row-span-2 flex flex-col gap-6 lg:sticky lg:top-24">
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5">
                
                {/* ✅ IZMENA: UOČLJIV KARTICA-LINK KA PROFILU */}
                <Link 
                  href={`/seller/${sellerUsername}`} 
                  className="flex items-center gap-3 mb-5 p-3 bg-purple-50 border-2 border-purple-100 hover:border-purple-400 hover:bg-purple-100 rounded-2xl transition-all cursor-pointer group shadow-sm"
                >
                    {/* Avatar sa ikonicom */}
                    <div className="w-12 h-12 bg-white text-purple-600 rounded-xl flex items-center justify-center font-black text-xl shadow-sm border border-purple-100 group-hover:scale-110 transition-transform">
                        {sellerUsername[0]?.toUpperCase() || <UserCircle />}
                    </div>
                    
                    {/* Tekst */}
                    <div className="flex-grow">
                        <p className="text-[10px] text-purple-500 font-bold uppercase tracking-wider mb-0.5">Prodavac</p>
                        <p className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">@{sellerUsername || 'User'}</p>
                    </div>

                    {/* Ikonica strelice desno */}
                    <ExternalLink className="w-5 h-5 text-purple-300 group-hover:text-purple-600" />
                </Link>

                <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-4 leading-tight">{currentTitle}</h1>
                
                <div className="flex items-end justify-between mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Cena</p>
                        <p className="text-3xl font-black text-purple-600 tracking-tighter">{service.price} π</p>
                    </div>
                    <div className="text-right">
                         <div className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm flex items-center gap-1">
                            <Clock className="w-3 h-3"/> {service.deliveryTime} {t('days')}
                         </div>
                    </div>
                </div>

                <BuyButton 
                    amount={parseFloat(service.price)}
                    serviceId={service.id}
                    title={currentTitle}
                    sellerUsername={sellerUsername}
                />
            </div>

            <ChatSystem sellerUsername={sellerUsername} />
          </div>

          {/* 3. OPIS */}
          <div className="lg:col-span-8">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                    <span className="bg-purple-100 p-2 rounded-lg text-purple-600"><PenTool className="w-5 h-5"/></span>
                    {t('aboutService')}
                </h3>
                <div className="prose prose-purple text-gray-600 leading-relaxed whitespace-pre-wrap font-medium text-base">
                    {getLocalized(service.description)}
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}