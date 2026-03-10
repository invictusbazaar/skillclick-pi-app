"use client"

import { useState } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    Pi: any;
  }
}

export default function BuyButton(props: any) {
  const [loading, setLoading] = useState(false);

  // Pametno hvatanje podataka
  const rawPrice = props.price || props.amount;
  const finalId = props.listingId || props.serviceId || props.id;
  const finalSeller = props.sellerId || props.sellerUsername;
  const safePrice = parseFloat(rawPrice) > 0 ? parseFloat(rawPrice) : 0;

  const handleBuy = async () => {
    if (safePrice <= 0) {
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
      // 1. TRAŽIMO DOZVOLU ZA PLAĆANJE TIK PRE SAMOG PLAĆANJA!
      // Ovo garantuje da nema šanse da fali 'payments' scope kada se otvori novčanik.
      await window.Pi.authenticate(['payments'], {
          onIncompletePaymentFound: function(payment: any) {
              console.log("Brisanje stare transakcije...", payment.identifier);
              fetch('/api/payments/incomplete', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId: payment.identifier })
              });
          }
      });

      // 2. KREIRANJE PLAĆANJA SA ISPRAVLJENIM NAZIVIMA CALLBACK-A
      const paymentCallbacks = {
          onReadyForServerApproval: (paymentId: string) => {
              fetch('/api/payments/approve', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId })
              });
          },
          // NAŠA NAJVEĆA POBEDA - PRAVI NAZIV
          onReadyForServerCompletion: (paymentId: string, txid: string) => { 
              fetch('/api/payments/complete', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId, txid })
              });
              if (props.onSuccess) props.onSuccess();
          },
          onCancel: (paymentId: string) => {
              setLoading(false);
          },
          onError: (error: any, payment: any) => {
              setLoading(false);
              if (error && !JSON.stringify(error).includes("cancelled")) {
                  alert("SDK Greška: " + (error.message || error));
              }
          }
      };

      // 3. POKREĆEMO PLAĆANJE
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
      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg disabled:opacity-50"
    >
      {loading ? (
         <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Povezivanje...</>
      ) : (
         <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah ({safePrice || "?"} π)</>
      )}
    </Button>
  );
}
