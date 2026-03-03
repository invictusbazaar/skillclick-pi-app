"use client"

import { useState } from "react"
import { useLanguage } from "@/components/LanguageContext"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    Pi: any;
  }
}

interface BuyButtonProps {
  listingId: string;
  price: number;
  sellerId: string;
  onSuccess?: () => void;
}

export default function BuyButton({ listingId, price, sellerId, onSuccess }: BuyButtonProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);

    if (!window.Pi) {
       alert("Greška: Pi SDK nije učitan.");
       setLoading(false);
       return;
    }

    try {
      const paymentData = {
        amount: price,
        memo: `Service: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' },
      };

      // NAJPROSTIJA MOGUĆA DEFINICIJA - BEZ KOMPLIKACIJA
      await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: function(paymentId: string) {
          fetch('/api/payments/approve', {
             method: 'POST',
             body: JSON.stringify({ paymentId })
          });
        },
        onServerApproval: function(paymentId: string, txid: string) {
          fetch('/api/payments/complete', {
             method: 'POST',
             body: JSON.stringify({ paymentId, txid })
          }).then(() => {
              if (onSuccess) onSuccess();
          });
        },
        onCancel: function(paymentId: string) {
          setLoading(false);
          alert("Otkazano.");
        },
        onError: function(error: any, payment: any) {
          setLoading(false);
          console.error(error);
          alert("Greška: " + (error.message || error));
        },
        // OVO MORA BITI OVDE
        onIncompletePaymentFound: function(payment: any) {
          // ODMAH SALJEMO NA BRISANJE BEZ PITANJA
          fetch('/api/payments/incomplete', {
              method: 'POST',
              body: JSON.stringify({ paymentId: payment.identifier })
          }).then(() => {
              alert("Stara greška očišćena. Osvežavam...");
              window.location.reload();
          });
        }
      });

    } catch (err: any) {
      setLoading(false);
      alert("Sistemska greška: " + err.message);
    }
  };

  return (
      <Button
        onClick={handleBuy}
        disabled={loading}
        className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl"
      >
        {loading ? "Radim..." : "Kupi Odmah"}
      </Button>
  );
}
