"use client"

import { useState, useEffect } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global { interface Window { Pi: any; } }

export default function BuyButton(props: any) {
  const [loading, setLoading] = useState(false);

  // 1. UHVATI BILO KOJI PODATAK KOJI DOĐE
  // Ovo pokriva i staru i novu verziju page.tsx
  const rawPrice = props.price || props.amount;
  const rawId = props.listingId || props.serviceId;
  const rawSeller = props.sellerId || props.sellerUsername;

  // 2. SIGURNA KONVERZIJA (Da ne dobijemo NaN grešku)
  const safePrice = parseFloat(rawPrice) > 0 ? parseFloat(rawPrice) : 0;

  // DEBUG ALERT PRILIKOM KLIKA
  const handleDebugAndBuy = async () => {
      // Ako podaci fale, vičemo ODMAH
      if (!safePrice || !rawId || !rawSeller) {
          alert(`VERZIJA 6 - STOP!\nStigli su loši podaci:\nCena: ${rawPrice}\nID: ${rawId}\nProdavac: ${rawSeller}`);
          return;
      }
      
      // Ako su podaci tu, pokrećemo plaćanje
      handleBuy(safePrice, rawId, rawSeller);
  };

  const handleBuy = async (price: number, listingId: any, sellerId: any) => {
    setLoading(true);

    if (typeof window === "undefined" || !window.Pi) {
       alert("VERZIJA 6: Pi Browser nije nađen.");
       setLoading(false);
       return;
    }

    try {
      // INICIJALIZACIJA
      window.Pi.init({ version: "2.0", sandbox: false });

      // AUTHENTICATE (Sa onom specijalnom funkcijom OVDE)
      const auth = await window.Pi.authenticate(['payments'], {
          onIncompletePaymentFound: (payment: any) => {
              fetch('/api/payments/incomplete', {
                  method: 'POST',
                  body: JSON.stringify({ paymentId: payment.identifier })
              });
          }
      });

      // CREATE PAYMENT (ČISTO KAO SUZA)
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
          if (props.onSuccess) props.onSuccess();
        },
        onCancel: (paymentId: string) => setLoading(false),
        onError: (error: any, payment: any) => {
          setLoading(false);
          if (!JSON.stringify(error).includes("cancelled")) {
              alert("VERZIJA 6 GREŠKA: " + (error.message || error));
          }
        }
      });

    } catch (err: any) {
      setLoading(false);
      if (!err.message?.includes("user cancelled")) {
          alert("VERZIJA 6 SISTEMSKA: " + err.message);
      }
    }
  };

  return (
    <Button 
      onClick={handleDebugAndBuy} 
      disabled={loading} 
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg"
    >
      {loading ? (
        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> VERZIJA 6...</> 
      ) : (
        <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah ({safePrice || "?"} π)</>
      )}
    </Button>
  );
}
