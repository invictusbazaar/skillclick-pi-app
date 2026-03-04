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
      window.Pi.init({ version: "2.0", sandbox: false });

      // 1. Autentifikacija (Korektan format funkcije)
      await window.Pi.authenticate(['payments'], function(payment: any) {
          fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ paymentId: payment.identifier })
          });
      });

      // 2. Kreiranje plaćanja (Inline funkcije)
      await window.Pi.createPayment({
        amount: price,
        memo: `Kupovina: ${listingId}`, 
        metadata: { listingId, sellerId }
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
          if (onSuccess) onSuccess();
        },
        onCancel: (paymentId: string) => setLoading(false),
        onError: (error: any) => {
          setLoading(false);
          if (!JSON.stringify(error).includes("cancelled")) {
              alert("Greška: " + (error.message || "Plaćanje nije uspelo"));
          }
        }
      });
    } catch (err: any) {
      setLoading(false);
      if (!err.message?.includes("user cancelled")) alert("Greška: " + err.message);
    }
  };

  return (
    <Button onClick={handleBuy} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg">
      {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sačekajte...</> : <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah</>}
    </Button>
  );
}
