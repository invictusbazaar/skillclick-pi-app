"use client"

import { useState, useEffect } from "react"
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
  const [isCleaning, setIsCleaning] = useState(true); // Počinjemo sa čišćenjem

  // === AUTOMATSKI ČISTAČ (Pokreće se odmah) ===
  useEffect(() => {
    const cleanStuckPayments = async () => {
      if (!window.Pi) {
          setIsCleaning(false);
          return;
      }

      try {
        // Koristimo authenticate jer on JEDINI prihvata onIncompletePaymentFound
        const scopes = ['payments'];
        await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      } catch (err) {
        // Ignorišemo greške pri authetifikaciji, bitno je samo da smo probali cleanup
        console.log("Cleanup check finished or skipped.");
      } finally {
        setIsCleaning(false); // Spremni smo za kupovinu
      }
    };

    // Callback za zaglavljene transakcije
    const onIncompletePaymentFound = async (payment: any) => {
      console.log("AUTO-CLEAN: Pronađena zaglavljena transakcija:", payment);
      try {
          await fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId: payment.identifier }),
          });
          console.log("AUTO-CLEAN: Transakcija očišćena.");
          // Ako je našao i očistio, osvežavamo stranu da SDK bude 100% čist
          window.location.reload(); 
      } catch (e) {
          console.error("AUTO-CLEAN Error:", e);
      }
    };

    // Pokrećemo čišćenje
    cleanStuckPayments();
  }, []);

  // === LOGIKA KUPOVINE ===
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

      // Ovde šaljemo SAMO 4 osnovna callback-a.
      // Ne šaljemo onIncompletePaymentFound jer smo to rešili gore u useEffect-u.
      await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("Approval ready:", paymentId);
          const res = await fetch('/api/payments/approve', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paymentId }),
          });
          if (!res.ok) throw new Error('Approve failed');
        },
        onServerApproval: async (paymentId: string, txid: string) => {
          console.log("Server completed:", paymentId);
          await fetch('/api/payments/complete', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paymentId, txid }),
          });
          if (onSuccess) onSuccess();
        },
        onCancel: (paymentId: string) => {
          setLoading(false);
          setError(t('payment_cancelled') || "Prekinuto");
        },
        onError: (err: any, payment: any) => {
          console.error("SDK Error:", err);
          setLoading(false);
          // Ako se ipak desi pending error, reload će ga rešiti kroz useEffect
          if (err?.message && err.message.includes("pending")) {
              window.location.reload();
          } else {
              setError(err?.message || "Error");
          }
        }
      });

    } catch (err: any) {
      setLoading(false);
      console.error("Buy Error:", err);
      setError(err.message || "Greška");
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {error && (
        <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
          {error}
        </p>
      )}
      
      <Button
        onClick={handleBuy}
        disabled={loading || isCleaning} // Onemogućeno dok čistač radi (par milisekundi)
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg transition-all active:scale-95"
      >
        {loading || isCleaning ? (
           <>
             <Loader2 className="mr-2 h-5 w-5 animate-spin" />
             {isCleaning ? "Checking..." : t('processing')}
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
