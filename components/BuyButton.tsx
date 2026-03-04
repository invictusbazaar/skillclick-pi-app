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

    if (typeof window === "undefined" || !window.Pi) {
       alert("Pi mreža nije detektovana. Osveži stranicu.");
       setLoading(false);
       return;
    }

    try {
      // 1. Inicijalizacija
      window.Pi.init({ version: "2.0", sandbox: false });

      // 2. ISPRAVLJENA AUTENTIFIKACIJA
      // Ovde šaljemo DIREKTNO funkciju, a ne objekat sa funkcijom!
      await window.Pi.authenticate(['payments'], function(payment: any) {
          console.log("Nezavršena transakcija pronađena:", payment.identifier);
          fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ paymentId: payment.identifier })
          });
      });

      // 3. KREIRANJE PLAĆANJA (Direktno unutar poziva)
      await window.Pi.createPayment({
        amount: price,
        memo: `Usluga: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' }
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
          if (onSuccess) onSuccess();
        },
        onCancel: function(paymentId: string) {
          setLoading(false);
        },
        onError: function(error: any, payment: any) {
          setLoading(false);
          if (error && !JSON.stringify(error).includes("cancelled")) {
              alert("Sistemska greška: " + (error.message || error));
          }
        }
      });

    } catch (err: any) {
      setLoading(false);
      if (!err.message?.includes("user cancelled")) {
          alert("Greška: " + err.message);
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
         <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Povezivanje...</>
      ) : (
         <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah</>
      )}
    </Button>
  );
}
