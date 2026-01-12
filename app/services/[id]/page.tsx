"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Star } from 'lucide-react';

export default function ServiceDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [service, setService] = useState<any>(null);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        const found = data.find((s: any) => s.id === id);
        setService(found);
      });
  }, [id]);

  // 👇 FUNKCIJA ZA PI PLAĆANJE 👇
  const handlePayment = async () => {
    if (!window.Pi || !service) return;

    try {
      const paymentData = {
        amount: parseFloat(service.price),
        memo: `SkillClick: ${service.title}`,
        metadata: { serviceId: service.id }
      };

      const callbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          await fetch('/api/payments/approve', {
            method: 'POST',
            body: JSON.stringify({ paymentId }),
          });
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          await fetch('/api/payments/complete', {
            method: 'POST',
            body: JSON.stringify({ paymentId, txid }),
          });
          alert("Plaćanje uspešno!");
        },
        onCancel: (paymentId: string) => console.log("Otkazano", paymentId),
        onError: (error: Error) => console.error("Greška", error),
      };

      await window.Pi.createPayment(paymentData, callbacks);
    } catch (e) {
      console.error("Payment failed", e);
    }
  };

  if (!service) return <div className="p-20 text-center font-bold">Učitavanje oglasa...</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-purple-600 font-black hover:underline">
          <ArrowLeft className="w-6 h-6" /> {t('backBtn')}
        </button>
        
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* DIZAJN KARTICE KAO NA POČETNOJ */}
          <div className="h-[300px] md:h-[500px] bg-gradient-to-br from-indigo-600 to-fuchsia-600 rounded-[40px] flex items-center justify-center shadow-2xl text-white/20 text-7xl font-black">
              SkillClick
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-black text-2xl border-2 border-purple-200 shadow-sm">
                    {service.author?.username?.[0].toUpperCase() || 'U'}
                </div>
                <div>
                    <p className="font-black text-gray-900 text-xl tracking-tight">@{service.author?.username || 'user'}</p>
                    <div className="flex items-center gap-1.5 text-amber-500">
                        <Star className="w-4 h-4 fill-current" /> <span className="text-gray-500 font-bold text-sm">5.0 Ocena</span>
                    </div>
                </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                {typeof service.title === 'object' ? (service.title[lang] || service.title['en']) : service.title}
            </h1>
            
            <p className="text-gray-600 text-xl mb-12 leading-relaxed font-medium">
                {typeof service.description === 'object' ? (service.description[lang] || service.description['en']) : service.description}
            </p>

            <div className="bg-gray-50 p-10 rounded-[35px] border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Ukupna Cena</p>
                    <p className="text-5xl font-black text-purple-700 tracking-tighter">{service.price} π</p>
                </div>
                <Button 
                    onClick={handlePayment}
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-black text-xl px-12 py-9 rounded-2xl shadow-xl shadow-purple-200 flex items-center gap-4 transition-transform active:scale-95"
                >
                    <CreditCard className="w-7 h-7" /> PLATI SA PI
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}