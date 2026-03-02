"use client"

import { useState } from "react"
import { useLanguage } from "@/components/LanguageContext"
import { Loader2, ShoppingCart, RefreshCw } from "lucide-react"
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

      // Podaci za plaćanje
      const paymentData = {
        amount: price,
        memo: `Service: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' },
      };

      // Pozivamo createPayment sa INLINE funkcijama da izbegnemo bilo kakvu grešku sa objektima
      await window.Pi.createPayment(paymentData, {
        // 1. OBAVEZNO: Spreman za odobrenje
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("Ready for approval:", paymentId);
          const res = await fetch('/api/payments/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
          if (!res.ok) throw new Error('Approval failed');
        },

        // 2. OBAVEZNO: Odobreno od servera
        onServerApproval: async (paymentId: string, txid: string) => {
          console.log("Server approved:", paymentId);
          await fetch('/api/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
          });
          if (onSuccess) onSuccess();
        },

        // 3. OBAVEZNO: Otkazano
        onCancel: (paymentId: string) => {
          console.log("Cancelled:", paymentId);
          setLoading(false);
          setError(t('payment_cancelled') || "Payment cancelled");
        },

        // 4. OBAVEZNO: Greška
        onError: (error: any, payment: any) => {
          console.error("Payment Error:", error);
          setLoading(false);
          // Prikazujemo pravu poruku
          setError(error?.message || "Unknown error");
        },

        // 5. KLJUČNO: Rešavanje zaglavljene transakcije
        onIncompletePaymentFound: async (payment: any) => {
            console.log("STUCK PAYMENT FOUND:", payment);
            try {
                // Šaljemo backendu da je poništi
                const res = await fetch('/api/payments/incomplete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId: payment.identifier, payment }),
                });
                
                const data = await res.json();
                
                if (data.status === 'cancelled_or_refunded' || data.status === 'fixed') {
                    // Osvežavamo stranicu da bi korisnik mogao ponovo da kupi
                    window.location.reload();
                } else {
                    // Ako ne uspemo da popravimo, javljamo grešku
                    setError("Found incomplete payment but failed to fix automatically.");
                }
            } catch (e) {
                console.error("Fix failed", e);
            }
        }
      });

    } catch (err: any) {
      setLoading(false);
      console.error("Global Buy Error:", err);
      // Ako SDK i dalje zeza, ispisujemo tačnu grešku
      setError(err.message || "Error occurred");
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
             <p className="text-red-600 text-sm font-bold mb-1">
               {/* Koristimo hardkodovanu reč "Greška" ako prevod zeza */}
               Greška: {error}
             </p>
             {error.includes("missing") && (
                 <p className="text-xs text-gray-600 mt-1">
                   Pi SDK ne prepoznaje callback. Pokušajte da osvežite celu aplikaciju.
                 </p>
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
