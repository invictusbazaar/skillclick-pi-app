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
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.Pi) throw new Error("Pi SDK not loaded");

      const paymentData = {
        amount: price,
        memo: `Service: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' },
      };

      // Standardni poziv sa 4 obavezna callback-a
      await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: async (paymentId: string) => {
          await fetch('/api/payments/approve', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paymentId }),
          });
        },
        onServerApproval: async (paymentId: string, txid: string) => {
          await fetch('/api/payments/complete', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paymentId, txid }),
          });
          if (onSuccess) onSuccess();
        },
        onCancel: (paymentId: string) => {
          setLoading(false);
          setError("Plaćanje prekinuto.");
        },
        onError: (err: any, payment: any) => {
          console.error("SDK Error:", err);
          setLoading(false);
          // Prikazujemo tačnu grešku koju SDK vrati
          setError(err?.message || "Došlo je do greške.");
        }
      });

    } catch (err: any) {
      setLoading(false);
      console.error("Catch Error:", err);
      setError(err.message || "Nepoznata greška.");
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
             <p className="text-red-600 text-sm font-bold break-words">{error}</p>
        </div>
      )}
      
      <Button
        onClick={handleBuy}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg transition-all active:scale-95"
      >
        {loading ? (
           <>
             <Loader2 className="mr-2 h-5 w-5 animate-spin" />
             {t('processing')}
           </>
        ) : (
           <>
             <ShoppingCart className="mr-2 h-5 w-5" />
             {t('buyNow')}
           </>
        )}
      </Button>
    </div>
  );
}
