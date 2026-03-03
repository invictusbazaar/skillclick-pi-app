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

    // Provera da li je Pi tu
    if (!window.Pi) {
       setError("Pi SDK greška: Nije učitan.");
       return;
    }

    try {
      const paymentData = {
        amount: price,
        memo: `Usluga: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' },
      };

      // === KLJUČNA PROMENA: Funkcije pišemo DIREKTNO ovde, ne u varijablu ===
      await window.Pi.createPayment(paymentData, {
        
        // 1. ODOBRAVANJE (ReadyForServerApproval)
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("Status: Spreman za odobrenje", paymentId);
          await fetch('/api/payments/approve', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paymentId }),
          });
        },

        // 2. ZAVRŠETAK (ServerApproval)
        onServerApproval: async (paymentId: string, txid: string) => {
          console.log("Status: Odobreno", paymentId, txid);
          await fetch('/api/payments/complete', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paymentId, txid }),
          });
          if (onSuccess) onSuccess();
        },

        // 3. OTKAZIVANJE (Cancel)
        onCancel: (paymentId: string) => {
          console.log("Status: Otkazano", paymentId);
          setLoading(false);
          setError("Plaćanje prekinuto od strane korisnika.");
        },

        // 4. GREŠKA (Error)
        onError: (err: any, payment: any) => {
          console.error("Status: Greška", err);
          setLoading(false);
          // Ako je greška "missing callback", ignorišemo je ovde jer je to sistemska
          if (err?.message) setError(`Greška: ${err.message}`);
        },

        // 5. ČISTAČ SMEĆA (IncompletePaymentFound) - OVO JE ONO ŠTO FALI
        onIncompletePaymentFound: async (payment: any) => {
          console.log("!!! ZAGLAVLJENA TRANSAKCIJA !!! ID:", payment.identifier);
          
          try {
              // Šaljemo backendu da poništi (cancel) ili završi (complete)
              await fetch('/api/payments/incomplete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ paymentId: payment.identifier }),
              });
              
              // OBAVEZNO: Reload da se SDK resetuje
              alert("Pronađena je nezavršena transakcija i automatski očišćena. Molimo pokušajte ponovo.");
              window.location.reload();
              
          } catch (e) {
              console.error("Neuspešno čišćenje:", e);
              setError("Greška pri čišćenju stare transakcije.");
          }
        }
      });

    } catch (err: any) {
      setLoading(false);
      console.error("Global Catch:", err);
      if (err.message && !err.message.includes("user cancelled")) {
         setError(`Sistemska greška: ${err.message}`);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center animate-pulse">
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
