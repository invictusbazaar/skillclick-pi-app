"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { ArrowLeft, Clock, PenTool, Car, Wrench, Palette, Code } from 'lucide-react';
import BuyButton from '@/components/BuyButton'; // ✅ UBACUJEMO NOVO DUGME

// Definicija za TypeScript
declare global { interface Window { Pi: any; } }

export default function ServiceDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [service, setService] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string>("");

  // Pomoćne funkcije za izgled
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

  // Učitavanje podataka o servisu
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

  if (!service) return <div className="p-20 text-center text-purple-600 font-bold">Učitavanje...</div>;
  
  const getLocalized = (field: any) => (typeof field === 'string' ? field : field[lang] || field['en'] || "");
  const currentTitle = getLocalized(service.title);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 py-4 shadow-sm">
          <div className="container mx-auto flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 font-bold hover:text-purple-600"><ArrowLeft className="w-5 h-5" /> {t('back')}</button>
            <div className="text-sm font-bold text-purple-600 uppercase">{service.category}</div>
          </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Leva strana: Slika i opis */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-xl bg-white border border-gray-100">
                {mainImage ? <img src={mainImage} className="w-full h-full object-cover"/> : <div className={`w-full h-full bg-gradient-to-br ${getGradient(service.id)} flex items-center justify-center`}>{getSmartIcon(service)}</div>}
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2"><span className="bg-purple-100 p-2 rounded-lg text-purple-600"><PenTool className="w-5 h-5"/></span>{t('aboutService')}</h3>
                <div className="prose prose-purple text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">{getLocalized(service.description)}</div>
            </div>
          </div>

          {/* Desna strana: Kartica za kupovinu */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-indigo-500 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-purple-200">{service.author?.username?.[0].toUpperCase() || 'U'}</div>
                    <div><p className="text-xs text-gray-400 font-bold uppercase">Seller</p><p className="font-bold text-gray-900 text-lg">@{service.author?.username || 'User'}</p></div>
                </div>

                <h1 className="text-2xl font-extrabold text-gray-900 mb-4 leading-tight">{currentTitle}</h1>
                <div className="flex items-end justify-between mb-6">
                    <p className="text-4xl font-black text-purple-600 tracking-tighter">{service.price} π</p>
                    <div className="text-right text-xs font-bold text-gray-500 space-y-1">
                         <div><Clock className="w-3 h-3 inline mr-1"/> {service.deliveryTime} {t('days')}</div>
                    </div>
                </div>

                {/* ✅ OVDE KORISTIMO NOVO DUGME ZA PLAĆANJE */}
                <BuyButton 
                    amount={parseFloat(service.price)}
                    serviceId={service.id}
                    title={currentTitle}
                    sellerUsername={service.author?.username || ""}
                />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}