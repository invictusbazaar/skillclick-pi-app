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
    // 1. Provera podataka
    if (!safePrice || !finalId || !finalSeller) {
        alert("VERZIJA 8 STOP: Fale podaci.");
        return;
    }

    setLoading(true);

    if (typeof window === "undefined" || !window.Pi) {
       alert("Nema Pi Browser-a.");
       setLoading(false);
       return;
    }

    try {
      // 2. Inicijalizacija
      window.Pi.init({ version: "2.0", sandbox: false });

      // 3. DEFINIŠEMO Callbackove ZASEBNO (Stari način)
      // Ovo radimo da bismo bili 100% sigurni da objekat postoji pre slanja
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
              // Ignorisi cancel gresku
              if (!JSON.stringify(error).includes("cancelled")) {
                  alert("V8 GREŠKA: " + (error.message || error));
              }
          }
      };

      // 4. AUTHENTICATE (Starija sintaksa - funkcija direktno, ne objekat)
      // Možda tvoj telefon ne voli objekat ovde
      await window.Pi.authenticate(['payments'], function(payment: any) {
          fetch('/api/payments/incomplete', {
              method: 'POST',
              body: JSON.stringify({ paymentId: payment.identifier })
          });
      });

      // DEBUG: Proveravamo da li React vidi funkcije
      // alert("V8 INFO: Šaljem funkcije: " + Object.keys(myCallbacks).join(", "));

      // 5. CREATE PAYMENT
      await window.Pi.createPayment({
        amount: safePrice,
        memo: "Kupovina " + finalId,
        metadata: { 
            listingId: String(finalId), 
            sellerId: String(finalSeller) 
        }
      }, myCallbacks); // Šaljemo onaj objekat od malopre

    } catch (err: any) {
      setLoading(false);
      if (!err.message?.includes("user cancelled")) {
          alert("VERZIJA 8 SISTEMSKA: " + err.message);
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
        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> VERZIJA 8...</> 
      ) : (
        <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah ({safePrice} π)</>
      )}
    </Button>
  );
}
