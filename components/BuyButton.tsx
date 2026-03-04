"use client"

import { useState } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global { interface Window { Pi: any; } }

export default function BuyButton(props: any) {
  const [loading, setLoading] = useState(false);

  const finalPrice = props.price || props.amount;
  const finalId = props.listingId || props.serviceId;
  const finalSeller = props.sellerId || props.sellerUsername;
  const safePrice = parseFloat(finalPrice) > 0 ? parseFloat(finalPrice) : 0;

  const handleBuy = async () => {
    if (!safePrice) { alert("V13 STOP: Nema cene."); return; }

    setLoading(true);

    if (typeof window === "undefined" || !window.Pi) {
       alert("Nema Pi Browser-a.");
       setLoading(false);
       return;
    }

    try {
      // 1. INIT
      window.Pi.init({ version: "2.0", sandbox: false });

      // 2. AUTH - OVDE JE PROMENA
      // Pokušavamo da se autentifikujemo, ali NEĆEMO STATI ako vrati undefined
      let userUsername = "Nepoznat";
      
      try {
          const auth = await window.Pi.authenticate(['payments'], {
              onIncompletePaymentFound: function(payment: any) {
                  // Ako nađemo zaglavljeno, odmah javljamo
                  alert("V13: NAĐENA ZAGLAVLJENA TRANSAKCIJA! Brišem je...");
                  fetch('/api/payments/incomplete', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ paymentId: payment.identifier })
                  });
              }
          });
          
          if (auth && auth.user) {
              userUsername = auth.user.username;
          } else {
              console.log("Auth je undefined, ali nastavljamo dalje jer znamo da si ulogovan.");
          }
      } catch (e) {
          console.error("Auth greška (ignorišem):", e);
      }

      // 3. CREATE PAYMENT - IDEMO SILOM
      // Čak i ako je auth pao, probamo da otvorimo plaćanje
      // alert("V13: Pokrećem plaćanje za korisnika: " + userUsername);

      const callbacks = {
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
              // Ignorišemo grešku prekidnja
              if (!JSON.stringify(error).includes("cancelled")) {
                  alert("V13 GREŠKA: " + (error.message || error));
              }
          }
      };

      await window.Pi.createPayment({
        amount: safePrice,
        memo: "Kupovina " + finalId,
        metadata: { 
            listingId: String(finalId), 
            sellerId: String(finalSeller),
            type: 'service_purchase' 
        }
      }, callbacks);

    } catch (err: any) {
      setLoading(false);
      // Ako ovde pukne, to je stvarna sistemska greška
      if (!err.message?.includes("user cancelled")) {
          alert("V13 SISTEMSKA: " + err.message);
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
        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> VERZIJA 13...</> 
      ) : (
        <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah ({safePrice} π)</>
      )}
    </Button>
  );
}
