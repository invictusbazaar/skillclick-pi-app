"use client"

import { useState } from "react"
import { useLanguage } from "@/components/LanguageContext"
import { Loader2, ShoppingCart, Wrench } from "lucide-react"
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
  const [needsFix, setNeedsFix] = useState(false);

  // --- LOGIKA ZA KUPOVINU ---
  const handleBuy = async () => {
    setLoading(true);
    setError(null);
    setNeedsFix(false);

    if (!window.Pi) {
       setError("Pi SDK nije učitan.");
       setLoading(false);
       return;
    }

    try {
      const paymentData = {
        amount: price,
        memo: `Usluga: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' },
      };

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
        onCancel: () => {
          setLoading(false);
          setError("Plaćanje prekinuto.");
        },
        onError: (err: any) => {
          setLoading(false);
          const msg = err?.message || "";
          // Hvatamo grešku
          if (msg.includes("callback functions are missing") || msg.includes("pending")) {
              setError("Zaglavljena transakcija.");
              setNeedsFix(true);
          } else {
              setError(`Greška: ${msg}`);
          }
        },
        onIncompletePaymentFound: async (payment: any) => {
           // Pokušaj automatskog čišćenja
           await runCleanup(payment);
        }
      });

    } catch (err: any) {
      setLoading(false);
      const msg = err.message || "";
      if (msg.includes("callback") || msg.includes("pending")) {
          setError("Potrebno čišćenje.");
          setNeedsFix(true);
      } else {
          setError(`Sistemska greška: ${msg}`);
      }
    }
  };

  // --- LOGIKA ZA POPRAVKU (KLJUČNO) ---
  const handleFix = async () => {
      setLoading(true);
      try {
          await window.Pi.authenticate(['payments'], async (payment: any) => {
              await runCleanup(payment);
          });
      } catch (e: any) {
          console.log("Auth cancelled or finished", e);
          setLoading(false);
      }
  };

  const runCleanup = async (payment: any) => {
      try {
          const res = await fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId: payment.identifier }),
          });

          // DETALJNA DIJAGNOSTIKA GREŠKE
          if (!res.ok) {
              const text = await res.text();
              alert(`SERVER ERROR: ${res.status} (${res.statusText})\nOpis: ${text.substring(0, 100)}`);
              return;
          }

          const data = await res.json();
          if (data.error) {
              alert(`BACKEND GREŠKA: ${data.error}`);
          } else {
              alert("✅ USPEH! Transakcija je obrisana. Stranica se osvežava.");
              window.location.reload();
          }

      } catch (e: any) {
          alert(`NETWORK GREŠKA: ${e.message}`);
      }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
             <p className="text-red-600 text-sm font-bold">{error}</p>
        </div>
      )}

      {needsFix ? (
          <Button onClick={handleFix} className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg rounded-xl animate-pulse">
            <Wrench className="mr-2 h-5 w-5" />
            POPRAVI ODMAH
          </Button>
      ) : (
          <Button onClick={handleBuy} disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white py-6 text-lg rounded-xl shadow-lg">
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><ShoppingCart className="mr-2 h-5 w-5" /> {t('buyNow')}</>}
          </Button>
      )}
    </div>
  );
}
