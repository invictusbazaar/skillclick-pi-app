"use client"

import { useState, useEffect } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    Pi: any;
  }
}

export default function BuyButton({ listingId, price, sellerId, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  // 1. INICIJALIZACIJA (ODMAH PRI UČITAVANJU)
  // Ovo sprečava grešku "SDK not initialized"
  useEffect(() => {
    const initSdk = () => {
        if (window.Pi) {
            try {
                window.Pi.init({ version: "2.0", sandbox: false });
                console.log("SDK Inicijalizovan pri startu.");
                setSdkReady(true);
            } catch (err) {
                // Ako je već inicijalizovan, to je super
                console.log("SDK već radi.");
                setSdkReady(true);
            }
        }
    };

    // Probaj odmah
    initSdk();
    // Probaj opet za 1 sekundu (ako script kasni)
    const timer = setTimeout(initSdk, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleBuy = async () => {
    setLoading(true);

    if (!window.Pi) {
       alert("Osveži stranicu, Pi mreža nije učitana.");
       setLoading(false);
       return;
    }

    try {
      // Za svaki slučaj probamo init opet (ne boli glava od viška)
      try { window.Pi.init({ version: "2.0", sandbox: false }); } catch (_) {}

      // 2. AUTHENTICATE (Mora pre plaćanja)
      await window.Pi.authenticate(['payments'], (payment: any) => {
          // Tihi čistač
          fetch('/api/payments/incomplete', {
              method: 'POST',
              body: JSON.stringify({ paymentId: payment.identifier })
          });
      });

      // 3. CREATE PAYMENT (SA INLINE FUNKCIJAMA)
      // Ovo sprečava grešku "Callback functions missing"
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
          if (!error.message?.includes("cancelled")) {
              alert("GREŠKA: " + (error.message || error));
          }
        }
      });

    } catch (err: any) {
      setLoading(false);
      if (!err.message?.includes("user cancelled")) {
          alert("Sistemska greška: " + err.message);
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
