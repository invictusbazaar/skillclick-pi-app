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

  // DEFINIŠEMO OVO KAO ZASEBNU PROMENLJIVU (DA BUDEMO SIGURNI DA POSTOJI)
  const handleIncomplete = function(payment: any) {
      // alert("V14: Čistim zaglavljenu transakciju..."); 
      fetch('/api/payments/incomplete', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ paymentId: payment.identifier })
      });
  };

  const handleBuy = () => { // Nema async ovde, koristimo .then
    if (!safePrice) { alert("V14 STOP: Nema cene."); return; }

    setLoading(true);

    if (typeof window === "undefined" || !window.Pi) {
       alert("Nema Pi Browser-a.");
       setLoading(false);
       return;
    }

    try {
      // 1. INIT
      window.Pi.init({ version: "2.0", sandbox: false });

      // 2. AUTH - STARA ŠKOLA (BEZ VITIČASTIH ZAGRADA)
      // Ovako se radilo u verziji 1.0, i ovo radi na svakom telefonu
      window.Pi.authenticate(['payments'], handleIncomplete).then(function(auth: any) {
          
          // 3. CREATE PAYMENT
          const paymentData = {
            amount: safePrice,
            memo: "Kupovina " + finalId,
            metadata: { 
                listingId: String(finalId), 
                sellerId: String(finalSeller),
                type: 'service_purchase'
            }
          };

          const callbacks = {
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
              if (props.onSuccess) props.onSuccess();
            },
            onCancel: function(paymentId: string) {
              setLoading(false);
            },
            onError: function(error: any, payment: any) {
              setLoading(false);
              var msg = error.message || error;
              if (!JSON.stringify(msg).includes("cancelled")) {
                  alert("V14 GREŠKA: " + msg);
              }
            },
            // DUPLA ZAŠTITA - UBACUJEMO GA I OVDE
            onIncompletePaymentFound: handleIncomplete
          };

          return window.Pi.createPayment(paymentData, callbacks);

      }).catch(function(err: any) {
          setLoading(false);
          alert("V14 AUTH/SYS GREŠKA: " + (err.message || err));
      });

    } catch (err: any) {
      setLoading(false);
      alert("V14 CRITICAL: " + err.message);
    }
  };

  return (
    <Button 
      onClick={handleBuy} 
      disabled={loading} 
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg"
    >
      {loading ? (
        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> VERZIJA 14...</> 
      ) : (
        <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah ({safePrice} π)</>
      )}
    </Button>
  );
}
