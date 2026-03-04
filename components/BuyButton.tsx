"use client"

import { useState } from "react"
import { Loader2, ShoppingCart, Trash2 } from "lucide-react"
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
    if (!safePrice) { alert("V12 STOP: Nema cene."); return; }

    setLoading(true);

    if (typeof window === "undefined" || !window.Pi) {
       alert("Nema Pi Browser-a.");
       setLoading(false);
       return;
    }

    try {
      // KORAK 1: INIT
      window.Pi.init({ version: "2.0", sandbox: false });

      // KORAK 2: AUTH - AGRESIVNO ČIŠĆENJE
      // Ovde hvatamo bilo kakvu zaglavljenu transakciju
      const auth = await window.Pi.authenticate(['payments'], {
          onIncompletePaymentFound: function(payment: any) {
              // ODMAH ŠALJEMO NA BRISANJE
              // alert("V12: Nađeno smeće! Čistim..."); 
              fetch('/api/payments/incomplete', {
                  method: 'POST',
                  body: JSON.stringify({ paymentId: payment.identifier })
              });
              // Ne prekidamo, puštamo da teče dalje
          }
      });

      // KORAK 3: PROVERA AUTENTIFIKACIJE
      // Ako je user i dalje undefined, nemamo šta da tražimo dalje
      if (!auth || !auth.user) {
          alert("V12 GREŠKA: Autentifikacija nije uspela (User undefined). Probaj opet za 5 sekundi.");
          setLoading(false);
          return;
      }

      // KORAK 4: KREIRANJE PLAĆANJA (INLINE)
      // Pišemo funkcije direktno ovde da ne bi bilo zabune
      await window.Pi.createPayment({
        amount: safePrice,
        memo: "Kupovina " + finalId,
        metadata: { 
            listingId: String(finalId), 
            sellerId: String(finalSeller),
            type: 'service_purchase'
        }
      }, {
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
          if (!JSON.stringify(error).includes("cancelled")) {
              alert("V12 GREŠKA: " + (error.message || error));
          }
        }
      });

    } catch (err: any) {
      setLoading(false);
      // Ignorišemo user cancelled
      if (!err.message?.includes("user cancelled")) {
          alert("V12 SISTEMSKA: " + err.message);
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
        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> VERZIJA 12...</> 
      ) : (
        <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah ({safePrice} π)</>
      )}
    </Button>
  );
}
