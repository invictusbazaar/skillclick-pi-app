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

      const callbacks = {
        // 1. ODOBRAVANJE
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("onReadyForServerApproval", paymentId);
          try {
            const res = await fetch('/api/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Approval failed');
          } catch (err) {
            console.error('Approval error:', err);
            throw err; 
          }
        },

        // 2. POTVRDA ZAVRŠETKA
        onServerApproval: async (paymentId: string, txid: string) => {
          console.log("onServerApproval", paymentId, txid);
          try {
            // Opciono: Možemo pozvati complete rutu ovde za svaki slučaj
            await fetch('/api/payments/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid }),
            });
          } catch (err) {
            console.error("Server approval confirmation error", err);
          }
        },

        // 3. OTKAZIVANJE
        onCancel: (paymentId: string) => {
          console.log("onCancel", paymentId);
          setLoading(false);
          setError(t('payment_cancelled') || "Payment cancelled");
        },

        // 4. GREŠKA
        onError: (error: any, payment: any) => {
          console.error('Payment error:', error);
          setLoading(false);
          // Ignorišemo grešku ako je korisnik samo zatvorio prozor
          if (error?.message && !error.message.includes("closed")) {
             setError(error.message || t('error'));
          }
        },

        // 5. KLJUČNO ZA TVOJ PROBLEM (Incomplete Payment)
        // Ovo mora biti OVDE da bi rešilo grešku "callback missing" i "pending payment"
        onIncompletePaymentFound: async (payment: any) => {
            console.log("Found incomplete payment (INSIDE CREATE):", payment);
            
            try {
                // Šaljemo na backend da proverimo status
                const res = await fetch('/api/payments/incomplete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId: payment.identifier, payment }),
                });
                
                const data = await res.json();

                // Ako backend kaže da je refundirano/otkazano, mi "poništavamo" lokalno
                // vraćanjem errora ili samo logovanjem, čime SDK zna da smo obradili.
                if (data.status === 'cancelled_or_refunded' || data.status === 'fixed') {
                    console.log("Stara transakcija očišćena. Molimo pokušajte ponovo.");
                    setLoading(false);
                    // Ovde možemo ili reloadovati stranu ili samo reći korisniku da proba opet
                    // jer je zaglavljena transakcija sada "rešena" na backendu.
                    return; 
                }
                
                // Ako treba da se nastavi
                if (data.status === 'resume') {
                     console.log("Resuming flow...");
                }
            } catch (e) {
                console.error("Error handling incomplete payment", e);
            }
        }
      };

      // Pokrećemo plaćanje sa SVIM callback-ovima
      await window.Pi.createPayment(paymentData, callbacks);

    } catch (err: any) {
      setLoading(false);
      console.error("Global Buy Error:", err);
      // Ako je greška "Already have pending payment", onIncompletePaymentFound gore će se okinuti
      if (!err.message?.includes("user cancelled")) {
          setError(err.message || "Error occurred");
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {error && (
        <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-200">
          {error}
        </p>
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
