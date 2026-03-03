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

    if (!window.Pi) {
       setError("Pi SDK nije učitan.");
       return;
    }

    try {
      const paymentData = {
        amount: price,
        memo: `Service: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' },
      };

      // DIREKTNO POZIVANJE - NAJSIGURNIJI NAČIN
      await window.Pi.createPayment(paymentData, {
        
        // --- 1. OBAVEZNA: ODOBRAVANJE ---
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("1. Ready for approval:", paymentId);
          await fetch('/api/payments/approve', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paymentId }),
          });
        },

        // --- 2. OBAVEZNA: ZAVRŠETAK ---
        onServerApproval: async (paymentId: string, txid: string) => {
          console.log("2. Server approved:", paymentId, txid);
          await fetch('/api/payments/complete', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paymentId, txid }),
          });
          if (onSuccess) onSuccess();
        },

        // --- 3. OBAVEZNA: OTKAZIVANJE ---
        onCancel: (paymentId: string) => {
          console.log("3. Cancelled:", paymentId);
          setLoading(false);
          setError("Plaćanje prekinuto.");
        },

        // --- 4. OBAVEZNA: GREŠKA ---
        onError: (err: any, payment: any) => {
          console.error("4. Error:", err);
          setLoading(false);
          // Ako je greška "missing callback", ignorišemo je ovde jer je to sistemska greška
          if (err?.message) setError(err.message);
        },

        // --- 5. KLJUČNA ZA TVOJ PROBLEM: ČIŠĆENJE SMEĆA ---
        onIncompletePaymentFound: async (payment: any) => {
          console.log("!!! ZAGLAVLJENA TRANSAKCIJA PRONAĐENA !!!", payment);
          
          // Šaljemo backendu da je očisti
          try {
              await fetch('/api/payments/incomplete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ paymentId: payment.identifier }),
              });
              
              // OBAVEZNO: Osvežavamo stranicu da SDK zaboravi grešku
              // Ovo je jedini način da se skloni crveni prozor
              window.location.reload();
              
          } catch (e) {
              console.error("Greška pri čišćenju:", e);
          }
        }
      });

    } catch (err: any) {
      setLoading(false);
      console.error("Global Catch:", err);
      // Ako SDK baci grešku pre nego što otvori prozor
      if (err.message && !err.message.includes("user cancelled")) {
         setError(`Greška: ${err.message}`);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
             <p className="text-red-600 text-sm font-bold">{error}</p>
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
