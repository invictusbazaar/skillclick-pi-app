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

export default function BuyButton({ listingId, price, sellerId, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

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

    if (!price || price <= 0) {
        alert("Sistemska greška: Cena nije validna.");
        return;
    }

    setLoading(true);

    if (typeof window === "undefined" || !window.Pi) {
       alert("Pi mreža nije detektovana. Da li koristite Pi Browser?");
       setLoading(false);
       return;
    }

    try {
      // ✅ 2. OVO JE ISPRAVLJEN OBJEKAT (Pravi naziv za kompletiranje)
      const paymentCallbacks = {
          onReadyForServerApproval: (paymentId: string) => {
              console.log("Faza 1: Odobravanje", paymentId);
              fetch('/api/payments/approve', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId })
              });
          },
          // 🚨 OVO JE BILA GREŠKA. SADA JE ISPRAVNO!
          onReadyForServerCompletion: (paymentId: string, txid: string) => { 
              console.log("Faza 2: Završeno", txid);
              fetch('/api/payments/complete', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId, txid })
              });
              if (onSuccess) onSuccess();
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

      console.log("Pokrećem plaćanje za iznos:", price);

      // 3. Pokretanje plaćanja
      await window.Pi.createPayment({
        amount: parseFloat(price), 
        memo: `Usluga: ${listingId}`, 
        metadata: { 
            listingId: String(listingId), 
            sellerId: String(sellerId), 
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
         <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah ({price} π)</>
      )}
    </Button>
  );
}
