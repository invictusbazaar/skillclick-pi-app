"use client"

import { useState } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthContext" 

declare global {
  interface Window {
    Pi: any;
  }
}

// VRAĆAMO PROPS: ANY DA MOŽEMO DA UHVATIMO ŠTA GOD STRANICA POŠALJE
export default function BuyButton(props: any) {
  const [loading, setLoading] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  // ✅ PAMETNO HVATANJE PODATAKA:
  // Ako stranica pošalje 'price', uzima to. Ako pošalje 'amount', uzima to.
  const rawPrice = props.price || props.amount;
  const finalId = props.listingId || props.serviceId || props.id;
  const finalSeller = props.sellerId || props.sellerUsername;
  
  // Pretvaramo u siguran broj (da ne bi bilo NaN ili prazno)
  const safePrice = parseFloat(rawPrice) > 0 ? parseFloat(rawPrice) : 0;

  const handleBuy = async () => {
    // 1. Provere
    if (authLoading) {
        alert("Aplikacija se još uvek povezuje sa Pi Mrežom. Molimo sačekajte par sekundi.");
        return;
    }

    if (!user) {
        alert("Niste prijavljeni. Molimo osvežite stranicu kako bi vas Pi Browser prepoznao.");
        return;
    }

    // SADA PROVERAVAMO SAFEPRICE
    if (safePrice <= 0) {
        alert("Sistemska greška: Cena nije validna ili nije prosleđena dugmetu.");
        return;
    }

    setLoading(true);

    if (typeof window === "undefined" || !window.Pi) {
       alert("Pi mreža nije detektovana. Da li koristite Pi Browser?");
       setLoading(false);
       return;
    }

    try {
      const paymentCallbacks = {
          onReadyForServerApproval: (paymentId: string) => {
              console.log("Faza 1: Odobravanje", paymentId);
              fetch('/api/payments/approve', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId })
              });
          },
          // PRAVI NAZIV - NAŠA NAJVEĆA POBEDA
          onReadyForServerCompletion: (paymentId: string, txid: string) => { 
              console.log("Faza 2: Završeno", txid);
              fetch('/api/payments/complete', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId, txid })
              });
              if (props.onSuccess) props.onSuccess();
          },
          onCancel: (paymentId: string) => {
              console.log("Otkazano", paymentId);
              setLoading(false);
          },
          onError: (error: any, payment: any) => {
              console.error("Greška pri plaćanju:", error);
              setLoading(false);
              if (error && !JSON.stringify(error).includes("cancelled")) {
                  alert("SDK Greška: " + (error.message || error));
              }
          }
      };

      console.log("Pokrećem plaćanje za iznos:", safePrice);

      // 3. Pokretanje plaćanja (koristimo safePrice)
      await window.Pi.createPayment({
        amount: safePrice, 
        memo: `Usluga: ${finalId}`, 
        metadata: { 
            listingId: String(finalId), 
            sellerId: String(finalSeller), 
            type: 'service_purchase' 
        }
      }, paymentCallbacks);

    } catch (err: any) {
      console.error("Critical Error:", err);
      setLoading(false);
      if (!err.message?.includes("user cancelled")) {
          alert("Sistemska greška: " + err.message);
      }
    }
  };

  return (
    <Button
      onClick={handleBuy}
      disabled={loading || authLoading} 
      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg disabled:opacity-50"
    >
      {loading || authLoading ? (
         <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Povezivanje...</>
      ) : (
         <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah ({safePrice || "?"} π)</>
      )}
    </Button>
  );
}
