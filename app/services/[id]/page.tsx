"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, CreditCard, Star, Clock, RefreshCcw, CheckCircle, 
  MessageCircle, Send, ThumbsUp, User,
  Wrench, Car, Code, PenTool, Palette, Video, Briefcase, Coffee
} from 'lucide-react';

declare global { interface Window { Pi: any; } }

export default function ServiceDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [service, setService] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [reviewText, setReviewText] = useState("");

  // --- 1. BOJE (GRADIENT) - FIKSNA PO ID-u ---
  const getGradient = (id: string) => {
    if (!id) return "from-indigo-500 to-purple-600";
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      "from-fuchsia-600 to-pink-600", 
      "from-violet-600 to-indigo-600", 
      "from-blue-600 to-cyan-500", 
      "from-emerald-500 to-teal-600",
      "from-orange-500 to-red-600",
      "from-purple-600 to-blue-600"
    ];
    return gradients[sum % gradients.length];
  };

  // --- 2. PAMETNE IKONE (POPRAVLJENO) ---
  // Sada PRVO proverava naslov (Alfa, Servis...), pa tek onda kategoriju!
  const getSmartIcon = (svc: any) => {
    const iconClass = "w-24 h-24 text-white/90 drop-shadow-lg";
    
    const title = (typeof svc.title === 'string' ? svc.title : (svc.title?.en || "")).toLowerCase();
    const cat = (svc.category || "").toLowerCase();

    // 1. Prioritet: Ključne reči u naslovu (Fix za Alfu i Servis)
    if (title.includes('auto') || title.includes('alfa') || title.includes('fiat')) return <Car className={iconClass} />;
    if (title.includes('popravka') || title.includes('servis') || title.includes('repair')) return <Wrench className={iconClass} />;
    
    // 2. Prioritet: Kategorija
    if (cat.includes('design') || cat.includes('dizajn')) return <Palette className={iconClass} />;
    if (cat.includes('writing') || cat.includes('pisanje')) return <PenTool className={iconClass} />;
    if (cat.includes('tech') || cat.includes('programiranje') || cat.includes('kod')) return <Code className={iconClass} />;
    if (cat.includes('video') || cat.includes('animacija')) return <Video className={iconClass} />;
    if (cat.includes('business') || cat.includes('biznis')) return <Briefcase className={iconClass} />;
    if (cat.includes('life') || cat.includes('život')) return <Coffee className={iconClass} />;
    
    return <Code className={iconClass} />; // Default
  };

  // Učitavanje oglasa
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            const found = data.find((s: any) => s.id.toString() === id);
            setService(found);
            // Ako postoje slike, prva ide u glavni prozor
            if (found?.images && found.images.length > 0) {
                setMainImage(found.images[0]);
            }
        }
      })
      .catch(err => console.error("Greška:", err));
  }, [id]);

  // Pi Init
  useEffect(() => {
      const initPi = async () => {
          if (!window.Pi) return;
          try { await window.Pi.init({ version: "2.0", sandbox: false }); } 
          catch (e) { console.error(e); }
      };
      setTimeout(initPi, 1000);
  }, []);

  const handlePayment = async () => {
    if (!window.Pi) { alert("Otvorite u Pi Browser-u."); return; }
    if (!service) return;
    try {
      const paymentData = {
        amount: parseFloat(service.price),
        memo: `SkillClick: ${service.title.substring(0, 20)}...`, 
        metadata: { serviceId: service.id, type: 'service_order' }
      };
      const callbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          await fetch('/api/payments/approve', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paymentId, serviceId: service.id }),
          });
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          await fetch('/api/payments/complete', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paymentId, txid, serviceId: service.id }),
          });
          alert("Plaćanje uspešno!");
          router.push('/profile');
        },
        onCancel: () => console.log("Otkazano"),
        onError: (e: any) => console.error(e),
      };
      await window.Pi.createPayment(paymentData, callbacks);
    } catch (e) { console.error(e); }
  };

  const handleContact = () => {
      alert("Slanje poruke prodavcu: " + (service?.author?.username || "User"));
  };

  if (!service) return <div className="p-20 text-center">Učitavanje...</div>;

  const getLocalized = (field: any) => {
      if (typeof field === 'string') return field;
      return field[lang] || field['en'] || "";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* HEADER / NAVIGATION */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 py-4 shadow-sm">
          <div className="container mx-auto flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 font-bold hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-5 h-5" /> {t('back')}
            </button>
            <div className="text-sm font-bold text-purple-600 uppercase tracking-wider">
                {service.category}
            </div>
          </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* --- LEVA STRANA: SLIKE & OPIS --- */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* GLAVNA SLIKA ILI GRADIENT */}
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-xl bg-white border border-gray-100 group">
                {mainImage ? (
                    // Ako ima slike, prikazujemo nju
                    <img 
                        src={mainImage} 
                        alt="Service Preview" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    // Ako nema slike, prikazujemo BOJU i IKONU
                    <div className={`w-full h-full bg-gradient-to-br ${getGradient(service.id)} flex items-center justify-center`}>
                        {getSmartIcon(service)}
                    </div>
                )}
            </div>
            
            {/* TRAKA SA SLIČICAMA (Samo ako ima više od 1 slike) */}
            {service.images && service.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {service.images.map((img: string, idx: number) => (
                        <button 
                            key={idx} 
                            onClick={() => setMainImage(img)}
                            className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-purple-600 ring-2 ring-purple-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                            <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
            
            {/* OPIS USLUGE */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <span className="bg-purple-100 p-2 rounded-lg text-purple-600"><PenTool className="w-5 h-5"/></span>
                    {t('aboutService')}
                </h3>
                <div className="prose prose-purple max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                    {getLocalized(service.description)}
                </div>
            </div>

            {/* RECENZIJE */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm mt-4">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                     <span className="bg-amber-100 p-2 rounded-lg text-amber-600"><Star className="w-5 h-5"/></span>
                     {t('reviewsTitle')} (0)
                </h3>
                
                <div className="flex gap-4 mb-8">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500"/>
                    </div>
                    <div className="flex-grow relative">
                        <Input 
                            placeholder={t('writeReview')} 
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className="bg-gray-50 border-none h-12 rounded-xl pr-12 focus:ring-2 ring-purple-200"
                        />
                        <button className="absolute right-2 top-2 p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="text-center py-8 text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    {t('noReviews')}
                </div>
            </div>
          </div>

          {/* --- DESNA STRANA --- */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-indigo-500 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-purple-200">
                        {service.author?.username?.[0].toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Seller</p>
                        <p className="font-bold text-gray-900 text-lg">@{service.author?.username || 'InvictusUser'}</p>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-1">
                             <Star className="w-3 h-3 fill-current" /> 5.0 <span className="text-gray-400">(New)</span>
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-extrabold text-gray-900 mb-4 leading-tight">
                    {getLocalized(service.title)}
                </h1>

                <div className="flex items-end justify-between mb-6">
                    <p className="text-4xl font-black text-purple-600 tracking-tighter">{service.price} π</p>
                    <div className="text-right text-xs font-bold text-gray-500 space-y-1">
                         <div className="flex items-center justify-end gap-1"><Clock className="w-3 h-3"/> {service.deliveryTime} {t('days')}</div>
                         <div className="flex items-center justify-end gap-1"><RefreshCcw className="w-3 h-3"/> {service.revisions}</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button onClick={handlePayment} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transition-transform active:scale-95">
                        <CreditCard className="w-5 h-5" /> {t('hireSeller')}
                    </Button>
                    <Button onClick={handleContact} variant="outline" className="w-full border-2 border-gray-200 hover:border-purple-200 hover:bg-purple-50 text-gray-700 font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-colors">
                        <MessageCircle className="w-5 h-5" /> {t('contactSeller')}
                    </Button>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}