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

    if (!window.Pi) {
       alert("Pi SDK nije spreman. Osveži stranicu.");
       setLoading(false);
       return;
    }

    try {
      // 1. Inicijalizacija
      try { window.Pi.init({ version: "2.0", sandbox: false }); } catch (_) {}

      // 2. PRIPREMA PODATAKA
      const paymentData = {
        amount: price,
        memo: `Usluga: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' }
      };

      // 3. DEFINISANJE POSEBNIH FUNKCIJA (Obaveznih 4)
      // Pi SDK zahteva TAČNO ova 4 imena. Ako jedno fali, izbaciće tvoju grešku.
      
      const onReadyForServerApproval = function(paymentId: string) {
          // alert("Faza 1: Odobravanje..."); // Otkometariši za debug
          fetch('/api/payments/approve', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ paymentId })
          });
      };

      const onServerApproval = function(paymentId: string, txid: string) {
          // alert("Faza 2: Gotovo!");
          fetch('/api/payments/complete', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ paymentId, txid })
          });
          if (onSuccess) onSuccess();
      };

      const onCancel = function(paymentId: string) {
          setLoading(false);
          // alert("Otkazano");
      };

      const onError = function(error: any, payment: any) {
          setLoading(false);
          console.error("Pi Error:", error);
          alert("GREŠKA: " + (error.message || error));
      };

      // 4. PAKOVANJE U OBJEKAT (Ovo je ključno!)
      const callbacks = {
          onReadyForServerApproval: onReadyForServerApproval,
          onServerApproval: onServerApproval,
          onCancel: onCancel,
          onError: onError
      };

      // PROVERA PRE SLANJA (Da budemo 100% sigurni)
      if (!callbacks.onReadyForServerApproval || !callbacks.onServerApproval || !callbacks.onCancel || !callbacks.onError) {
          alert("CRITICAL: Neka funkcija fali pre slanja!");
          setLoading(false);
          return;
      }

      // 5. POZIV
      await window.Pi.createPayment(paymentData, callbacks);

    } catch (err: any) {
      setLoading(false);
      alert("Sistemska greška: " + err.message);
    }
  };

  return (
    <Button
      onClick={handleBuy}
      disabled={loading}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg"
    >
      {loading ? (
         <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Molim sačekajte...</>
      ) : (
         <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah</>
      )}
    </Button>
  );
}
