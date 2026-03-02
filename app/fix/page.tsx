"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wrench, CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Forsiramo učitavanje Pi SDK-a ako nije tu
declare global {
  interface Window {
    Pi: any;
  }
}

export default function FixPage() {
  const [status, setStatus] = useState("Spreman za analizu.")
  const [loading, setLoading] = useState(false)
  const [fixed, setFixed] = useState(false)

  // Osiguravamo da je SDK tu
  useEffect(() => {
    if (!window.Pi) {
      const script = document.createElement('script');
      script.src = "https://sdk.minepi.com/pi-sdk.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const runFix = async () => {
    setLoading(true);
    setStatus("Povezujem se sa Pi Wallet-om...");
    setFixed(false);

    try {
      if (!window.Pi) {
         setStatus("Pi SDK se još učitava, sačekaj sekund pa probaj ponovo.");
         setLoading(false);
         return;
      }

      // Ova funkcija se poziva automatski AKO Pi nađe zaglavljenu transakciju
      const onIncompletePaymentFound = async (payment: any) => {
          setStatus(`PRONAĐENO SMEĆE! ID: ${payment.identifier.slice(0, 5)}... Brišem...`);
          
          try {
              // Šaljemo na tvoj backend da uradi cancel
              const res = await fetch('/api/payments/incomplete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ paymentId: payment.identifier }),
              });

              if (res.ok) {
                  setStatus("✅ USPEŠNO OBRISANO! Tvoj novčanik je čist.");
                  setFixed(true);
              } else {
                  setStatus("❌ Backend greška pri brisanju.");
              }
          } catch (err) {
              setStatus("❌ Greška u komunikaciji sa serverom.");
          }
      };

      // Pokrećemo authenticate - OVO JE JEDINI NAČIN DA SE OČISTI
      // Ovo će tražiti "Allow" od tebe.
      await window.Pi.authenticate(['payments'], onIncompletePaymentFound).then((auth: any) => {
          // Ako kod dođe dovde, a onIncompletePaymentFound se NIJE aktivirao,
          // to znači da nema zaglavljenih transakcija.
          if (!fixed) { 
            setStatus("✨ Nisu pronađene zaglavljene transakcije. Sve je čisto!");
          }
      });

    } catch (err: any) {
      console.error(err);
      setStatus(`Greška: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-purple-600" />
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-2">Alat za Popravku</h1>
        <p className="text-gray-500 mb-6 text-sm">
            Ovaj alat služi za ručno brisanje zaglavljenih "Pending" transakcija koje blokiraju kupovinu.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 min-h-[60px] flex items-center justify-center">
            <p className={`font-medium ${fixed ? "text-green-600" : "text-gray-700"}`}>
                {status}
            </p>
        </div>

        <Button 
            onClick={runFix} 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg mb-4"
        >
            {loading ? "Analiziram..." : "POKRENI ČIŠĆENJE"}
        </Button>

        <Link href="/">
            <Button variant="outline" className="w-full border-gray-300">
                <ArrowLeft className="w-4 h-4 mr-2" /> Nazad na Aplikaciju
            </Button>
        </Link>
      </div>
    </div>
  )
}