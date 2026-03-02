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
      if (!window.Pi) {
        throw new Error("Pi SDK not loaded");
      }

      const paymentData = {
        amount: price,
        memo: `Service: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' },
      };

      // === KOREKCIJA: SAMO STANDARDNI CALLBACK-OVI ===
      // Izbacili smo onIncompletePaymentFound jer on NE SME biti ovde.
      // To je pravilo grešku "callback functions are missing".
      const callbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("Ready for approval:", paymentId);
          try {
            const res = await fetch('/api/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            if (!res.ok) throw new Error('Approval failed');
          } catch (err) {
            console.error('Approval error:', err);
            throw err; 
          }
        },
        onServerApproval: async (paymentId: string, txid: string) => {
          console.log("Server approved:", paymentId);
          try {
            await fetch('/api/payments/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid }),
            });
            if (onSuccess) onSuccess();
          } catch (err) {
            console.error("Complete error", err);
          }
        },
        onCancel: (paymentId: string) => {
          console.log("Cancelled:", paymentId);
          setLoading(false);
          setError(t('payment_cancelled') || "Payment cancelled");
        },
        onError: (error: any, payment: any) => {
          console.error("Payment Error:", error);
          setLoading(false);
          // Ovde hvatamo pravi tekst greške
          setError(error?.message || "Error occurred");
        },
      };

      // Pokrećemo plaćanje
      await window.Pi.createPayment(paymentData, callbacks);

    } catch (err: any) {
      setLoading(false);
      console.error("Global Buy Error:", err);
      setError(err.message || "Error occurred");
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
             <p className="text-red-600 text-sm font-bold mb-1">
               {/* Ignorišemo t('error') da ne bi pisalo 'Error loading profile data' */}
               Greška: {error}
             </p>
             {error.includes("pending") && (
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => window.location.reload()}
                   className="mt-2 border-red-300 text-red-600 hover:bg-red-100"
                 >
                   Osveži aplikaciju (Refresh)
                 </Button>
             )}
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
