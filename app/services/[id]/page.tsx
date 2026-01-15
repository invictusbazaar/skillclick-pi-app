"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Clock, PenTool, Car, Wrench, Palette, Code, Video, Briefcase } from 'lucide-react';

// Definišemo Pi tipove da TypeScript ne viče
declare global { interface Window { Pi: any; } }

export default function ServiceDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [service, setService] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [piReady, setPiReady] = useState(false);

  // --- BOJE I IKONE ---
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

  // Učitavanje oglasa
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

  // --- INICIJALIZACIJA PI SDK ---
  useEffect(() => {
      const initPi = async () => {
          if (!window.Pi) return;
          try { 
              await window.Pi.init({ version: "2.0", sandbox: true });
              console.log("✅ Pi SDK Initialized");
              setPiReady(true);
          } catch (e) { console.error("Pi Init Error:", e); }
      };

      const interval = setInterval(() => {
          if (window.Pi && !piReady) { initPi(); clearInterval(interval); }
      }, 500);
      return () => clearInterval(interval);
  }, [piReady]);

  // --- GLAVNA FUNKCIJA ZA PLAĆANJE (SA INTEGRISANOM DOZVOLOM) ---
  const handlePayment = async () => {
    if (!window.Pi) { alert("Greška: Pi Browser nije detektovan."); return; }
    if (!service) return;

    const amountNum = parseFloat(service.price);
    if (isNaN(amountNum)) { alert("Greška: Cena nije validna."); return; }

    alert(`Pokušavam naplatu: ${amountNum} Pi`);

    try {
      // 👇 1. PRVO I OBAVEZNO: Tražimo dozvolu "payments" DIREKTNO OVDE
      const scopes = ['username', 'payments'];
      
      // Ovo će naterati Pi Browser da proveri dozvole. Ako ih nema, pitaće korisnika.
      await window.Pi.authenticate(scopes, (payment: any) => {
          console.log("Nedovršeno plaćanje:", payment);
      });

      // 👇 2. TEK SAD KREIRAMO PLAĆANJE
      const paymentData = {
        amount: amountNum,
        memo: `Order: ${service.title.substring(0, 15)}...`, 
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
          alert("✅ Plaćanje uspešno! Novac je prebačen.");
          router.push('/'); 
        },
        onCancel: () => alert("Plaćanje otkazano."),
        onError: (e: any) => {
            console.error(e);
            alert(`Greška: ${e.message || e}`);
        }
      };

      await window.Pi.createPayment(paymentData, callbacks);

    } catch (e: any) { 
        console.error("Payment Error:", e);
        // Ako je greška i dalje vezana za scope, ispiši je jasno
        alert("Greška pri pokretanju: " + e.message);
    }
  };

  if (!service) return <div className="p-20 text-center text-purple-600 font-bold">Učitavanje...</div>;
  const getLocalized = (field: any) => (typeof field === 'string' ? field : field[lang] || field['en'] || "");

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 py-4 shadow-sm">
          <div className="container mx-auto flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 font-bold hover:text-purple-600"><ArrowLeft className="w-5 h-5" /> {t('back')}</button>
            <div className="text-sm font-bold text-purple-600 uppercase">{service.category}</div>
          </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-xl bg-white border border-gray-100">
                {mainImage ? <img src={mainImage} className="w-full h-full object-cover"/> : <div className={`w-full h-full bg-gradient-to-br ${getGradient(service.id)} flex items-center justify-center`}>{getSmartIcon(service)}</div>}
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2"><span className="bg-purple-100 p-2 rounded-lg text-purple-600"><PenTool className="w-5 h-5"/></span>{t('aboutService')}</h3>
                <div className="prose prose-purple text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">{getLocalized(service.description)}</div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-indigo-500 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-purple-200">{service.author?.username?.[0].toUpperCase() || 'U'}</div>
                    <div><p className="text-xs text-gray-400 font-bold uppercase">Seller</p><p className="font-bold text-gray-900 text-lg">@{service.author?.username || 'User'}</p></div>
                </div>

                <h1 className="text-2xl font-extrabold text-gray-900 mb-4 leading-tight">{getLocalized(service.title)}</h1>
                <div className="flex items-end justify-between mb-6">
                    <p className="text-4xl font-black text-purple-600 tracking-tighter">{service.price} π</p>
                    <div className="text-right text-xs font-bold text-gray-500 space-y-1">
                         <div><Clock className="w-3 h-3 inline mr-1"/> {service.deliveryTime} {t('days')}</div>
                    </div>
                </div>

                <Button onClick={handlePayment} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-purple-200 flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <CreditCard className="w-5 h-5" /> {t('hireSeller')}
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
