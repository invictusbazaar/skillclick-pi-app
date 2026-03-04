"use client"

import { useState } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global { interface Window { Pi: any; } }

export default function BuyButton({ listingId, price, sellerId, onSuccess }: any) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    // 1. PROVERA PODATAKA
    if (!listingId || !price || !sellerId) {
        alert(`VERZIJA 5 - FALE PODACI: Listing: ${listingId}, Cena: ${price}`);
        return;
    }

    setLoading(true);

    if (typeof window === "undefined" || !window.Pi) {
       alert("VERZIJA 5 - Pi Browser nije nađen.");
       setLoading(false);
       return;
    }

    try {
      // 2. INICIJALIZACIJA
      window.Pi.init({ version: "2.0", sandbox: false });

      // 3. AUTHENTICATE (Samo ovde ide onIncompletePaymentFound)
      const auth = await window.Pi.authenticate(['payments'], {
          onIncompletePaymentFound: (payment: any) => {
              console.log("Nezavršena transakcija:", payment);
              fetch('/api/payments/incomplete', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId: payment.identifier })
              });
          }
      });

      // 4. CREATE PAYMENT (TAČNO 4 FUNKCIJE - BEZ VIŠKA)
      // Ovo je ključ. SDK traži samo ove 4 funkcije.
      await window.Pi.createPayment({
        amount: price,
        memo: `Kupovina: ${listingId}`, 
        metadata: { 
            listingId: String(listingId), 
            sellerId: String(sellerId),
            type: 'service_purchase' 
        }
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
        onCancel: (paymentId: string) => {
            setLoading(false);
        },
        onError: (error: any, payment: any) => {
          setLoading(false);
          // Ignorišemo ako korisnik odustane
          if (!JSON.stringify(error).includes("cancelled")) {
              alert("VERZIJA 5 GREŠKA: " + (error.message || error));
          }
        }
      });

    } catch (err: any) {
      setLoading(false);
      if (!err.message?.includes("user cancelled")) {
          // OVO JE ONAJ ALERT KOJI GLEDAMO
          alert("VERZIJA 5 SISTEMSKA: " + err.message);
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
        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> VERZIJA 5...</> 
      ) : (
        <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah ({price} π)</>
      )}
    </Button>
  );
}
