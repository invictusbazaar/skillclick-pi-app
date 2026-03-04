"use client"

import { useState, useEffect } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    Pi: any;
  }
}

// === TRIK ZA SPREČAVANJE "CALLBACK MISSING" GREŠKE ===
// Definišemo funkcije ovde, van React-a, da budu "neuništive"
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
            if (!error.message?.includes("cancelled")) {
                 alert("GREŠKA: " + (error.message || error));
            }
        }
    };
};

export default function BuyButton({ listingId, price, sellerId, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);

  // === 1. INICIJALIZACIJA ČIM SE STRANICA OTVORI ===
  useEffect(() => {
    const initPi = () => {
        if (window.Pi) {
            try {
                // Pokrećemo ga odmah!
                window.Pi.init({ version: "2.0", sandbox: false });
                setIsSdkReady(true);
                console.log("Pi SDK Inicijalizovan!");
            } catch (err) {
                // Ako je već inicijalizovan, to je ok
                console.log("Pi SDK već radi.");
                setIsSdkReady(true);
            }
        }
    };

    // Probamo odmah
    initPi();
    
    // Za svaki slučaj, proverimo opet za pola sekunde ako kasni
    const timer = setTimeout(initPi, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleBuy = async () => {
    setLoading(true);

    if (!isSdkReady && !window.Pi) {
       alert("Pi sistem se još povezuje... Pokušaj ponovo.");
       setLoading(false);
       return;
    }

    try {
      // Za svaki slučaj probamo init još jednom (ne škodi)
      try { window.Pi.init({ version: "2.0", sandbox: false }); } catch(e) {}

      // 2. PRVO AUTHENTICATE (Obavezno pre plaćanja)
      await window.Pi.authenticate(['payments'], (payment: any) => {
          // Tihi čistač ako nađe smeće
          fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ paymentId: payment.identifier })
          });
      });

      // 3. KREIRANJE PODATAKA
      const paymentData = {
        amount: price,
        memo: `Usluga: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' }
      };

      // 4. KORISTIMO ONE "ČVRSTE" FUNKCIJE
      const callbacks = createCallbacks(onSuccess, setLoading);

      // 5. POZIV ZA KUPOVINU
      await window.Pi.createPayment(paymentData, callbacks);

    } catch (err: any) {
      setLoading(false);
      // Ignorišemo ako korisnik odustane
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
