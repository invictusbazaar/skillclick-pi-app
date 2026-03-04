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
    if (!safePrice) {
        alert("VERZIJA 10 STOP: Nema cene.");
        return;
    }

    setLoading(true);

    if (typeof window === "undefined" || !window.Pi) {
       alert("Nema Pi Browser-a.");
       setLoading(false);
       return;
    }

    try {
      window.Pi.init({ version: "2.0", sandbox: false });

      // 2. Authenticate (Sa incomplete handlerom)
      const user = await window.Pi.authenticate(['payments'], {
          onIncompletePaymentFound: function(payment: any) {
              fetch('/api/payments/incomplete', {
                  method: 'POST',
                  body: JSON.stringify({ paymentId: payment.identifier })
              });
          }
      });

      console.log("User:", user.username);

      // 3. PRIPREMA CALLBACK-OVA (Samo 4 osnovna)
      const callbacks = {
          onReadyForServerApproval: function(paymentId: string) {
              // alert("V10: Odobravam..."); // Debug
              fetch('/api/payments/approve', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId: paymentId })
              });
          },
          onServerApproval: function(paymentId: string, txid: string) {
              // alert("V10: Gotovo!"); // Debug
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
              var msg = error.message || error;
              if (!JSON.stringify(msg).includes("cancelled")) {
                  alert("V10 GREŠKA: " + msg);
              }
          }
      };

      // 4. KREIRANJE PLAĆANJA - BEZ METADATA PODATAKA!
      // Šaljemo samo ono najnužnije da vidimo da li će proći
      // alert("V10: Pokrećem createPayment za " + safePrice);
      
      await window.Pi.createPayment({
        amount: safePrice,
        memo: "Usluga " + finalId // Samo osnovni opis
        // IZBACILI SMO METADATA DA VIDIMO DA LI ONA PRAVI PROBLEM
      }, callbacks);

    } catch (err: any) {
      setLoading(false);
      if (!err.message?.includes("user cancelled")) {
          alert("VERZIJA 10 SISTEMSKA: " + err.message);
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
        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> VERZIJA 10...</> 
      ) : (
        <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah ({safePrice} π)</>
      )}
    </Button>
  );
}
