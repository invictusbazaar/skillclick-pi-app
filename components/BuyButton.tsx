"use client"

import { useState, useEffect } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    Pi: any;
  }
}

// === TRIK: DEFINIŠEMO FUNKCIJE OVDE (VAN KOMPONENTE) ===
// Ovako ih React ne može "sakriti" od Pi SDK-a.
const createCallbacks = (onSuccess: any, setLoading: any) => {
    return {
        onReadyForServerApproval: (paymentId: string) => {
            fetch('/api/payments/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId })
            });
        },
        onServerApproval: (paymentId: string, txid: string) => {
            fetch('/api/payments/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid })
            });
            if (onSuccess) onSuccess();
        },
        onCancel: (paymentId: string) => {
            setLoading(false);
        },
        onError: (error: any, payment: any) => {
            setLoading(false);
            console.error("Pi Error:", error);
            // Ignorišemo greške ako je korisnik samo odustao
            if (!error.message?.includes("cancelled")) {
                 alert("GREŠKA: " + (error.message || error));
            }
        }
    };
};

export default function BuyButton({ listingId, price, sellerId, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);

  // === 1. AUTOMATSKA INICIJALIZACIJA ===
  // Ovo rešava grešku "SDK not initialized"
  useEffect(() => {
    const initPi = () => {
        if (window.Pi) {
            try {
                window.Pi.init({ version: "2.0", sandbox: false });
                setIsSdkReady(true);
                console.log("✅ Pi SDK Startovan");
            } catch (err) {
                // Ako je već upaljen, samo kažemo da je spreman
                setIsSdkReady(true);
            }
        }
    };

    initPi();
    // Provera opet za svaki slučaj
    setTimeout(initPi, 1000);
  }, []);

  const handleBuy = async () => {
    setLoading(true);

    if (!isSdkReady && !window.Pi) {
       alert("Sistem se povezuje... Sačekaj trenutak.");
       setLoading(false);
       return;
    }

    try {
      // 2. AUTHENTICATE (Obavezno pre plaćanja)
      await window.Pi.authenticate(['payments'], (payment: any) => {
          // Ako usput nađemo neku staru grešku, brišemo je tiho
          fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ paymentId: payment.identifier })
          });
      });

      // 3. PODACI
      const paymentData = {
        amount: price,
        memo: `Usluga: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' }
      };

      // 4. UZIMAMO SIGURNE FUNKCIJE
      const callbacks = createCallbacks(onSuccess, setLoading);

      // 5. KREIRAMO PLAĆANJE
      await window.Pi.createPayment(paymentData, callbacks);

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
         <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Molim sačekajte...</>
      ) : (
         <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah</>
      )}
    </Button>
  );
}
