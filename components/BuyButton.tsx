"use client"

import { useState } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global { interface Window { Pi: any; } }

export default function BuyButton({ listingId, price, sellerId, onSuccess }: any) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);

    if (typeof window === "undefined" || !window.Pi) {
       alert("Pi Browser nije detektovan.");
       setLoading(false);
       return;
    }

    try {
      // 1. Inicijalizacija
      try { window.Pi.init({ version: "2.0", sandbox: false }); } catch (e) {}

      // 2. Definisanje te "proklete" funkcije da je imamo spremnu
      const handleIncomplete = (payment: any) => {
          console.log("Nezavršena transakcija:", payment);
          fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ paymentId: payment.identifier })
          });
      };

      // 3. Autentifikacija (Stavljamo funkciju ovde)
      const auth = await window.Pi.authenticate(['payments'], handleIncomplete);
      console.log("Auth user:", auth.user.username);

      // 4. PRIPREMA PODATAKA (Pretvaramo sve u stringove da budemo sigurni)
      const paymentData = {
        amount: price, 
        memo: `Kupovina usluge (ID: ${listingId})`, 
        metadata: { 
            listingId: String(listingId), 
            sellerId: String(sellerId),
            type: 'service_purchase' 
        }
      };

      // 5. CALLBACKS - OVO JE KLJUČ
      // Ubacujemo SVE MOGUĆE funkcije koje SDK može da traži
      const callbacks = {
        onReadyForServerApproval: (paymentId: string) => {
          console.log("Approval start:", paymentId);
          fetch('/api/payments/approve', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ paymentId })
          });
        },
        onServerApproval: (paymentId: string, txid: string) => {
          console.log("Server approved:", txid);
          fetch('/api/payments/complete', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ paymentId, txid })
          });
          if (onSuccess) onSuccess();
        },
        onCancel: (paymentId: string) => {
            console.log("Cancelled:", paymentId);
            setLoading(false);
        },
        onError: (error: any, payment: any) => {
          console.error("Error:", error);
          setLoading(false);
          if (!JSON.stringify(error).includes("cancelled")) {
              alert("Greška: " + (error.message || "Nepoznata greška"));
          }
        },
        // 🚨 UBACUJEMO JE I OVDE, IAKO JE REDUNDANTNO! 🚨
        // Ovo rešava "Callback missing" na nekim telefonima
        onIncompletePaymentFound: handleIncomplete 
      };

      // 6. KREIRANJE PLAĆANJA
      await window.Pi.createPayment(paymentData, callbacks);

    } catch (err: any) {
      console.error("Critical:", err);
      setLoading(false);
      if (!err.message?.includes("user cancelled")) {
          alert("Greška pri pokretanju: " + err.message);
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
        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Povezivanje...</> 
      ) : (
        <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah</>
      )}
    </Button>
  );
}
