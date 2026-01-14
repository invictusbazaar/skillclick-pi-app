"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Star, Clock, RefreshCcw, CheckCircle } from 'lucide-react';

declare global { interface Window { Pi: any; } }

export default function ServiceDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [service, setService] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string>("");

  // 1. UČITAVANJE OGLASA
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            const found = data.find((s: any) => s.id.toString() === id);
            setService(found);
            // Ako oglas ima slike, postavi prvu kao glavnu
            if (found?.images && found.images.length > 0) {
                setMainImage(found.images[0]);
            }
        }
      })
      .catch(err => console.error("Greška pri učitavanju:", err));
  }, [id]);

  // 2. OBAVEZNO: INICIJALIZACIJA PI MREŽE (ZA DIREKTAN PRISTUP STRANICI)
  useEffect(() => {
      const initPi = async () => {
          if (!window.Pi) return;
          try {
              await window.Pi.init({ version: "2.0", sandbox: false });
          } catch (e) { console.error("Pi Init Error:", e); }
      };
      // Čekamo malo da se skripta učita
      const timer = setTimeout(initPi, 1000);
      return () => clearTimeout(timer);
  }, []);

  // 3. FUNKCIJA ZA PLAĆANJE
  const handlePayment = async () => {
    if (!window.Pi) {
        alert("Pi Browser nije detektovan. Molimo otvorite aplikaciju u Pi Browser-u.");
        return;
    }
    if (!service) return;

    try {
      const paymentData = {
        amount: parseFloat(service.price),
        memo: `SkillClick Order: ${service.title.substring(0, 20)}...`, // Memo mora biti kratak
        metadata: { serviceId: service.id, type: 'service_order' }
      };

      const callbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          // Pozivamo naš backend da odobri plaćanje
          await fetch('/api/payments/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, serviceId: service.id }),
          });
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          // Pozivamo naš backend da završi plaćanje
          await fetch('/api/payments/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid, serviceId: service.id }),
          });
          alert("Plaćanje uspešno! Prodavac je obavešten.");
          router.push('/profile'); // Preusmerimo korisnika na profil
        },
        onCancel: (paymentId: string) => console.log("Plaćanje otkazano", paymentId),
        onError: (error: Error) => {
            console.error("Greška pri plaćanju", error);
            alert("Došlo je do greške: " + error.message);
        },
      };

      await window.Pi.createPayment(paymentData, callbacks);
    } catch (e) {
      console.error("Payment logic failed", e);
    }
  };

  if (!service) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-purple-200 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
    </div>
  );

  // Helper za prikaz naslova na pravom jeziku
  const getLocalized = (field: any) => {
      if (typeof field === 'string') return field;
      return field[lang] || field['en'] || "";
  };

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-gray-500 font-bold hover:text-purple-600 transition-colors">
          <ArrowLeft className="w-5 h-5" /> {t('back')}
        </button>
        
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* --- LEVA STRANA: SLIKE --- */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Glavna slika ili Gradient ako nema slike */}
            <div className="relative w-full aspect-video rounded-[30px] overflow-hidden shadow-2xl bg-gray-100 border border-gray-100">
                {mainImage ? (
                    // Koristimo img tag za eksterne URL-ove da izbegnemo next.config probleme
                    <img 
                        src={mainImage} 
                        alt="Service Preview" 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center text-white/20 text-6xl md:text-8xl font-black select-none">
                        SkillClick
                    </div>
                )}
            </div>
            
            {/* Galerija sličica (Thumbnailovi) */}
            {service.images && service.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {service.images.map((img: string, idx: number) => (
                        <button 
                            key={idx} 
                            onClick={() => setMainImage(img)}
                            className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-purple-600 ring-2 ring-purple-200' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                            <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
            
            {/* Opis (Pomeren ispod slika za bolji flow na mobilnom) */}
            <div className="mt-8">
                <h3 className="text-2xl font-black text-gray-900 mb-4">{t('aboutService')}</h3>
                <div className="prose prose-purple max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {getLocalized(service.description)}
                </div>
            </div>
          </div>

          {/* --- DESNA STRANA: INFO I PLAĆANJE --- */}
          <div className="lg:col-span-5 flex flex-col gap-8 lg:sticky lg:top-24">
            
            {/* Header info */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        {service.category}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                        <Star className="w-4 h-4 fill-current" /> 5.0
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                    {getLocalized(service.title)}
                </h1>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 w-fit pr-6">
                    <div className="w-12 h-12 bg-white text-purple-700 rounded-full flex items-center justify-center font-black text-xl border border-gray-100 shadow-sm">
                        {service.author?.username?.[0].toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Seller</p>
                        <p className="font-bold text-gray-900">@{service.author?.username || 'InvictusUser'}</p>
                    </div>
                </div>
            </div>

            {/* Kartica za plaćanje */}
            <div className="bg-white p-6 md:p-8 rounded-[35px] border border-gray-200 shadow-xl shadow-purple-900/5">
                <div className="flex items-end justify-between mb-8 border-b border-gray-100 pb-6">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase mb-1">{t('servicePrice')}</p>
                        <p className="text-5xl font-black text-purple-600 tracking-tighter">{service.price} π</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-2 text-gray-600 text-sm font-medium mb-1">
                            <Clock className="w-4 h-4" /> {service.deliveryTime || 3} {t('days')}
                        </div>
                        <div className="flex items-center justify-end gap-2 text-gray-600 text-sm font-medium">
                            <RefreshCcw className="w-4 h-4" /> {service.revisions || 'Unlimited'} {t('revisions')}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{t('securePayment')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{t('satisfaction')}</span>
                    </div>
                </div>

                <Button 
                    onClick={handlePayment}
                    className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-white font-black text-lg h-16 rounded-2xl shadow-lg shadow-purple-200 flex items-center justify-center gap-3 transition-transform active:scale-95"
                >
                    <CreditCard className="w-6 h-6" /> {t('hireSeller')} - {service.price} π
                </Button>
                
                <p className="text-center text-xs text-gray-400 mt-4 font-medium">
                    100% Secure Pi Network Transaction
                </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}