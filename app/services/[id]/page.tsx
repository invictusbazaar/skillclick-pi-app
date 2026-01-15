"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Clock, PenTool, Car, Wrench, Palette, Code, RefreshCcw } from 'lucide-react';

declare global { interface Window { Pi: any; } }

export default function ServiceDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [service, setService] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string>("");
  
  // --- Učitavanje podataka ---
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

  // --- Inicijalizacija Pi SDK ---
  useEffect(() => {
      const initPi = async () => {
          if (!window.Pi) return;
          try { 
             await window.Pi.init({ version: "2.0", sandbox: true });
             console.log("✅ Pi SDK Ready");
          } catch (e) { console.error(e); }
      };
      // Pokušavamo odmah
      if (typeof window !== 'undefined' && window.Pi) {
          initPi();
      }
  }, []);

  // --- FUNKCIJA ZA BRISANJE ZAGLAVLJENE SESIJE ---
  const handleReset = () => {
      if(confirm("Ovo će te izlogovati i osvežiti aplikaciju. Da li želiš da nastaviš?")) {
          localStorage.clear();
          window.location.href = "/auth/login"; // Vraća te na login da se prijaviš ispočetka
      }
  };

  const handlePayment = async () => {
    if (!window.Pi) { alert("Nema Pi Browsera."); return; }
    
    // Provera cene
    const amountNum = parseFloat(service?.price);
    if (!amountNum) { alert("Greška: Cena nije učitana."); return; }

    alert(`Pokušavam naplatu: ${amountNum} Pi`);

    try {
      const paymentData = {
        amount: amountNum,
        memo: `Order #${id}`, 
        metadata: { serviceId: id, type: 'service_order' }
      };

      const callbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          // alert("Odobravam..."); 
          await fetch('/api/payments/approve', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paymentId, serviceId: id }),
          });
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          // alert("Završavam...");
          await fetch('/api/payments/complete', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paymentId, txid, serviceId: id }),
          });
          alert("✅ USPEH! Pare su legle!");
          router.push('/'); 
        },
        onCancel: () => alert("Prekinuto."),
        onError: (e: any) => {
            // 👇 OVDE JE KLJUČ: Ako prijavi grešku za scope, kažemo korisniku šta da radi
            const errMsg = e.message || JSON.stringify(e);
            if (errMsg.includes("scope") || errMsg.includes("payments")) {
                alert("⛔ GREŠKA DOZVOLE! Moraš kliknuti dugme 'RESETUJ SESIJU' ispod, pa se ponovo ulogovati.");
            } else {
                alert("Greška: " + errMsg);
            }
        }
      };

      // Pokrećemo plaćanje DIREKTNO. Ako fali scope, onError će nam reći.
      await window.Pi.createPayment(paymentData, callbacks);

    } catch (e: any) { 
        alert("Nije uspelo: " + e.message);
    }
  };

  if (!service) return <div className="p-20 text-center">Učitavanje...</div>;
  const getLocalized = (field: any) => (typeof field === 'string' ? field : field[lang] || field['en'] || "");

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
       {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm sticky top-0 z-40">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 font-bold"><ArrowLeft className="w-5 h-5" /> Nazad</button>
      </div>

      <div className="container mx-auto px-4 py-8">
            {/* ... Slika i opis (skraćeno da stane) ... */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl mb-6">
                <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{getLocalized(service.title)}</h1>
                <p className="text-4xl font-black text-purple-600 mb-6">{service.price} π</p>

                {/* DUGME ZA PLAĆANJE */}
                <Button onClick={handlePayment} className="w-full bg-purple-600 text-white font-bold h-14 rounded-xl shadow-lg mb-4 text-lg">
                    <CreditCard className="w-6 h-6 mr-2" /> ANGAŽUJ (Plati)
                </Button>

                {/* 👇 NOVO DUGME ZA SPASAVANJE SITUACIJE 👇 */}
                <button 
                    onClick={handleReset}
                    className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl border border-red-200 text-sm flex items-center justify-center gap-2 hover:bg-red-100"
                >
                    <RefreshCcw className="w-4 h-4" /> RESETUJ SESIJU (Ako neće da plati)
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">Klikni crveno dugme ako se plaćanje zaglavi na "1. Krećem"</p>
            </div>
      </div>
    </div>
  );
}