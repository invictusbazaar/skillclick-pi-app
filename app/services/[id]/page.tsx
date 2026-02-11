"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { 
  ArrowLeft, Clock, PenTool, Car, Wrench, Palette, Code, 
  UserCircle, Star, ShieldCheck, CheckCircle, RefreshCw, Briefcase, Video, Monitor 
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

  // Mapiranje kategorija (za prevod)
  const getTranslatedCategory = (catFromDb: string) => {
      if (!catFromDb) return "";
      const lower = catFromDb.toLowerCase();
      if (lower.includes('design')) return t('catDesign');
      if (lower.includes('market')) return t('catMarketing');
      if (lower.includes('writ')) return t('catWriting');
      if (lower.includes('video')) return t('catVideo');
      if (lower.includes('tech') || lower.includes('program')) return t('catTech');
      if (lower.includes('business')) return t('catBusiness');
      if (lower.includes('life')) return t('catLifestyle');
      return catFromDb;
  };

  const getGradient = (id: string) => {
    if (!id) return "from-indigo-500 to-purple-600";
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = ["from-fuchsia-600 to-pink-600", "from-violet-600 to-indigo-600", "from-blue-600 to-cyan-500", "from-emerald-500 to-teal-600"];
    return gradients[sum % gradients.length];
  };

  const getSmartIcon = (svc: any) => {
    const iconClass = "w-12 h-12 text-white/90 drop-shadow-md"; 
    const title = (typeof svc.title === 'string' ? svc.title : (svc.title?.en || "")).toLowerCase();
    const cat = (svc.category || "").toLowerCase();

    if (title.includes('auto') || title.includes('alfa')) return <Car className={iconClass} />;
    if (title.includes('popravka') || title.includes('servis')) return <Wrench className={iconClass} />;
    
    if (cat.includes('design')) return <Palette className={iconClass} />;
    if (cat.includes('tech')) return <Code className={iconClass} />;
    if (cat.includes('market')) return <Monitor className={iconClass} />;
    if (cat.includes('video')) return <Video className={iconClass} />;
    
    return <Briefcase className={iconClass} />;
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

  if (!service) return <div className="p-20 text-center text-gray-500 text-sm">{t('loading')}</div>;
  
  const getLocalized = (field: any) => (typeof field === 'string' ? field : field[lang] || field['en'] || "");
  const currentTitle = getLocalized(service.title);
  const currentDesc = getLocalized(service.description);
  const sellerUsername = service.author?.username || service.seller?.username || "";

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm py-2">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 text-xs font-bold hover:text-purple-600 uppercase">
                <ArrowLeft className="w-4 h-4" /> {t('back')}
            </button>
            <div className="text-[10px] font-bold text-purple-600 uppercase bg-purple-50 px-2 py-1 rounded-full border border-purple-100">
                {getTranslatedCategory(service.category)}
            </div>
          </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* --- LEVA STRANA (Slike/Opis) --- */}
          <div className="md:col-span-2 space-y-4">
            
            <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                {currentTitle}
            </h1>

            <div className="flex items-center gap-3 py-2 border-b border-gray-200">
                <Link href={`/seller/${sellerUsername}`}>
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm border border-white shadow-sm">
                        {sellerUsername && sellerUsername[0] ? sellerUsername[0].toUpperCase() : <UserCircle />}
                    </div>
                </Link>
                <div className="flex items-center gap-2">
                    <Link href={`/seller/${sellerUsername}`} className="font-bold text-sm text-gray-800 hover:text-purple-600 hover:underline">
                        @{sellerUsername || "User"}
                    </Link>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center text-amber-500 text-xs">
                        <Star className="w-3 h-3 fill-current mr-1" />
                        <span className="font-bold">{service.sellerRating?.toFixed(1) || "5.0"}</span>
                    </div>
                </div>
            </div>

            {/* SLIKA - Fiksna visina */}
            <div className="relative w-full h-52 rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-100">
                {mainImage ? (
                    <img src={mainImage} alt={currentTitle} className="w-full h-full object-cover" /> 
                ) : (
                    <div className={`w-full h-full bg-gradient-to-r ${getGradient(service.id)} flex items-center justify-center`}>
                        <div className="flex flex-col items-center gap-2">
                             {getSmartIcon(service)}
                             <span className="text-white/80 text-xs font-bold uppercase tracking-widest">
                                {getTranslatedCategory(service.category)}
                             </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <PenTool className="w-4 h-4 text-purple-500"/> {t('aboutService')}
                </h3>
                <div className="prose prose-sm text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
                    {currentDesc}
                </div>
            </div>

          </div>

          {/* --- DESNA STRANA --- */}
          {/* UKLONJENO sve što može da izazove skakanje (sticky, h-fit) */}
          <div className="md:col-span-1 space-y-4">
            
            <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('servicePrice')}</span>
                    <span className="text-2xl font-black text-purple-600">{service.price} π</span>
                </div>

                <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-gray-700 font-bold bg-gray-50 p-2 rounded-lg">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span>{service.deliveryTime} {t('days')} {t('delivery')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 px-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>{t('satisfaction')}</span>
                    </div>
                </div>

                <BuyButton 
                    amount={parseFloat(service.price)}
                    serviceId={service.id}
                    title={currentTitle}
                    sellerUsername={sellerUsername}
                />
            </div>

            {/* CHAT - Prikazujemo samo ako ima prodavca */}
            {sellerUsername && (
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                     <ChatSystem sellerUsername={sellerUsername} />
                </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
