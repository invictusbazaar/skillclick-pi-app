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
  const [isReady, setIsReady] = useState(false);

  // 1. INICIJALIZACIJA (Kopirano iz Fixera)
  useEffect(() => {
    const initSdk = () => {
        if (window.Pi) {
            try {
                window.Pi.init({ version: "2.0", sandbox: false });
                setIsReady(true);
            } catch (err) {
                // Ako je vec inicijalizovan, to je ok
                setIsReady(true);
            }
        }
    };
    initSdk();
    setTimeout(initSdk, 1000); // Provera opet za svaki slučaj
  }, []);

  const handleBuy = async () => {
    setLoading(true);

    if (!window.Pi) {
       alert("Osveži stranicu.");
       setLoading(false);
       return;
    }

    try {
      // 2. AUTHENTICATE
      await window.Pi.authenticate(['payments'], (payment: any) => {
          // OVO NIJE DOVOLJNO SAMO OVDE...
          console.log("Incomplete found in auth:", payment);
      });

      // 3. CREATE PAYMENT
      await window.Pi.createPayment({
        amount: price,
        memo: `Usluga: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' }
      }, {
        // --- OBAVEZNE FUNKCIJE ---
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
        onCancel: (paymentId: string) => {
          setLoading(false);
        },
        onError: (error: any, payment: any) => {
          setLoading(false);
          if (!error.message?.includes("cancelled")) {
              alert("GREŠKA: " + (error.message || error));
          }
        },
        // --- KLJUČNO: DODAJEMO OVO I OVDE! ---
        // Bez ovoga ti izbacuje "Callback missing"
        onIncompletePaymentFound: (payment: any) => {
            console.log("Incomplete found in payment loop:", payment);
            fetch('/api/payments/incomplete', {
                method: 'POST',
                body: JSON.stringify({ paymentId: payment.identifier })
            });
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
