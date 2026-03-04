"use client"

import { useState } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global { interface Window { Pi: any; } }

export default function BuyButton(props: any) {
  const [loading, setLoading] = useState(false);

  // 1. HVATAMO PODATKE (Rade super, videli smo na slici!)
  const rawPrice = props.price || props.amount;
  const rawId = props.listingId || props.serviceId;
  const rawSeller = props.sellerId || props.sellerUsername;

  // 2. PRIPREMA BROJA (Sigurica)
  const safePrice = parseFloat(rawPrice) > 0 ? parseFloat(rawPrice) : 0;

  const handleBuy = async () => {
    // Ako nema cene, stopiramo (ali na slici je bilo 10, tako da ovo prolazi)
    if (!safePrice || !rawId || !rawSeller) {
        alert(`VERZIJA 7 - STOP! Fale podaci.`);
        return;
    }

    setLoading(true);

    if (typeof window === "undefined" || !window.Pi) {
       alert("Pi Browser nije nađen.");
       setLoading(false);
       return;
    }

    try {
      window.Pi.init({ version: "2.0", sandbox: false });

      // DEFINIŠEMO FUNKCIJU ZA NEZAVRŠENA PLAĆANJA
      const handleIncomplete = (payment: any) => {
          fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ paymentId: payment.identifier })
          });
      };

      // 3. AUTHENTICATE
      await window.Pi.authenticate(['payments'], {
          onIncompletePaymentFound: handleIncomplete
      });

      // 4. CREATE PAYMENT - UBACUJEMO SVIH 5 FUNKCIJA!
      // Tvoj telefon traži ovu petu, i sad ćemo mu je dati.
      await window.Pi.createPayment({
        amount: safePrice, 
        memo: `Kupovina: ${rawId}`, 
        metadata: { 
            listingId: String(rawId), 
            sellerId: String(rawSeller),
            type: 'service_purchase' 
        }
      }, {
        onReadyForServerApproval: (paymentId: string) => {
          fetch('/api/payments/approve', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ paymentId })
          });
        },
        onServerApproval: (paymentId: string, txid: string) => {
          fetch('/api/payments/complete', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ paymentId, txid })
          });
          if (props.onSuccess) props.onSuccess();
        },
        onCancel: (paymentId: string) => setLoading(false),
        onError: (error: any, payment: any) => {
          setLoading(false);
          if (!JSON.stringify(error).includes("cancelled")) {
              alert("VERZIJA 7 GREŠKA: " + (error.message || error));
          }
        },
        // 🚨 OVO JE FALILO TVOM TELEFONU U VERZIJI 6 🚨
        onIncompletePaymentFound: handleIncomplete
      });

    } catch (err: any) {
      setLoading(false);
      if (!err.message?.includes("user cancelled")) {
          alert("VERZIJA 7 SISTEMSKA: " + err.message);
      }
    }
  };

  return (
    <Button 
      onClick={handleBuy} 
      disabled={loading} 
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg"
    >
      {loading ? (
        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> VERZIJA 7...</> 
      ) : (
        <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah ({safePrice || "?"} π)</>
      )}
    </Button>
  );
}
