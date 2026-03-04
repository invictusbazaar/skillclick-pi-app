"use client"

import { useState } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    Pi: any;
  }
}

export default function BuyButton({ listingId, price, sellerId, onSuccess }: any) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);

    if (!window.Pi) {
       alert("Sistem se još učitava. Pokušaj ponovo.");
       setLoading(false);
       return;
    }

    try {
      // 1. Sigurna inicijalizacija
      try { window.Pi.init({ version: "2.0", sandbox: false }); } catch (_) {}

      // 2. Auth (Osvežavamo sesiju za plaćanje)
      // Ovo možda traži auth ponovo, ali je neophodno da bi payment znao ko plaća
      await window.Pi.authenticate(['payments'], (payment: any) => {
          // Tiho čišćenje ako ima smeća
          fetch('/api/payments/incomplete', {
              method: 'POST',
              body: JSON.stringify({ paymentId: payment.identifier })
          });
      });

      // 3. KREIRANJE PLAĆANJA SA "INLINE" FUNKCIJAMA
      // Pišemo ih direktno ovde da ih SDK 100% vidi
      await window.Pi.createPayment({
        amount: price,
        memo: `Usluga: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' }
      }, {
        // --- KLJUČNA PROMENA: FUNKCIJE SU DIREKTNO OVDE ---
        onReadyForServerApproval: function(paymentId: string) {
          fetch('/api/payments/approve', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ paymentId })
          });
        },
        onServerApproval: function(paymentId: string, txid: string) {
          fetch('/api/payments/complete', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ paymentId, txid })
          });
          if (onSuccess) onSuccess();
        },
        onCancel: function(paymentId: string) {
          setLoading(false);
        },
        onError: function(error: any, payment: any) {
          setLoading(false);
          // Ignorišemo user cancelled, sve ostalo prijavljujemo
          if (!error.message?.includes("cancelled")) {
              alert("GREŠKA: " + (error.message || error));
          }
        }
      });

    } catch (err: any) {
      setLoading(false);
      if (!err.message?.includes("user cancelled")) {
          alert("Sistemska greška: " + err.message);
      }
    }
  };

  return (
    <Button
      onClick={handleBuy}
      disabled={loading}
      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg"
    >
      {loading ? (
         <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Molim sačekajte...</>
      ) : (
         <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah</>
      )}
    </Button>
  );
}
