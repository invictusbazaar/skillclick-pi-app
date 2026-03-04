"use client"

import { useState } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global { interface Window { Pi: any; } }

export default function BuyButton(props: any) {
  const [loading, setLoading] = useState(false);

  // Podaci
  const finalPrice = props.price || props.amount;
  const finalId = props.listingId || props.serviceId;
  const finalSeller = props.sellerId || props.sellerUsername;
  const safePrice = parseFloat(finalPrice) > 0 ? parseFloat(finalPrice) : 0;

  const handleBuy = async () => {
    // 1. Provera
    if (!safePrice) { alert("V11 STOP: Nema cene."); return; }

    setLoading(true);

    if (typeof window === "undefined" || !window.Pi) {
       alert("Nema Pi Browser-a.");
       setLoading(false);
       return;
    }

    try {
      // KORAK 1: INIT
      // alert("1. Pokrećem Init..."); // Otkomentariši ako treba, ali smara
      window.Pi.init({ version: "2.0", sandbox: false });

      // KORAK 2: AUTH
      const user = await window.Pi.authenticate(['payments'], {
          onIncompletePaymentFound: function(payment: any) {
               console.log("Incomplete found");
               // Ovde ne radimo fetch da ne komplikujemo debug
          }
      });

      // POKAŽI DA JE AUTH PROŠAO
      alert("2. AUTH OK: " + user.username);

      // KORAK 3: DEFINISANJE POVRATNIH FUNKCIJA
      const myCallbacks = {
          onReadyForServerApproval: function(paymentId: string) {
              fetch('/api/payments/approve', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId: paymentId })
              });
          },
          onServerApproval: function(paymentId: string, txid: string) {
              fetch('/api/payments/complete', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId: paymentId, txid: txid })
              });
              if (props.onSuccess) props.onSuccess();
          },
          onCancel: function(paymentId: string) {
              setLoading(false);
          },
          onError: function(error: any, payment: any) {
              setLoading(false);
              if (!JSON.stringify(error).includes("cancelled")) {
                  alert("V11 SDK GREŠKA: " + (error.message || error));
              }
          }
      };

      // KORAK 4: PROVERA FUNKCIJA (DETEKTIV)
      // Ovde ćemo videti da li funkcije uopšte postoje pre slanja!
      const keys = Object.keys(myCallbacks);
      alert("3. ŠALJEMO: " + keys.join(", "));

      // KORAK 5: KREIRANJE PLAĆANJA
      await window.Pi.createPayment({
        amount: safePrice,
        memo: "Kupovina " + finalId,
        metadata: { type: 'service' } // Minimalni metadata
      }, myCallbacks);

    } catch (err: any) {
      setLoading(false);
      // Ako pukne pre SDK greške
      alert("V11 SISTEMSKA: " + err.message);
    }
  };

  return (
    <Button 
      onClick={handleBuy} 
      disabled={loading} 
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg"
    >
      {loading ? (
        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> VERZIJA 11...</> 
      ) : (
        <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah ({safePrice} π)</>
      )}
    </Button>
  );
}
