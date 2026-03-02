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

      // === 1. PRVO PROVERAVAMO ZAGLAVLJENE TRANSAKCIJE (SAMO NA KLIK) ===
      // Ovo sprečava "infinite loop". Tražimo dozvolu samo kad korisnik želi da kupi.
      let stuckPaymentFound = false;

      const onIncompletePaymentFound = async (payment: any) => {
          console.log("FIX: Pronađena zaglavljena transakcija:", payment);
          stuckPaymentFound = true;
          try {
              // Šaljemo backendu da poništi
              const res = await fetch('/api/payments/incomplete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ paymentId: payment.identifier }),
              });
              
              const data = await res.json();
              
              if (data.status === 'fixed' || data.success) {
                  // Ako smo popravili, osvežavamo stranu
                  window.location.reload(); 
              }
          } catch (e) {
              console.error("FIX Error:", e);
          }
      };

      // Pozivamo authenticate da bismo ubacili onIncompletePaymentFound
      // Ovo će možda tražiti "Allow" ali SAMO JEDNOM, jer si kliknuo dugme.
      await window.Pi.authenticate(['payments'], onIncompletePaymentFound);

      // Ako je nađena zaglavljena transakcija, onIncompletePaymentFound će uraditi reload.
      // Mi ovde stajemo da ne bi pokrenuli novu kupovinu preko stare.
      if (stuckPaymentFound) {
          return; 
      }

      // === 2. AKO NEMA ZAGLAVLJENIH, IDEMO U KUPOVINU ===
      const paymentData = {
        amount: price,
        memo: `Service: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' },
      };

      await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("Ready for approval:", paymentId);
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
          // Ako je greška "Pending payment", reload će pomoći sledeći put
          if (err?.message && err.message.includes("pending")) {
              alert("Detektovana stara transakcija. Stranica će se osvežiti.");
              window.location.reload();
          } else {
              setError(err?.message || "Error");
          }
        }
      });

    } catch (err: any) {
      setLoading(false);
      console.error("Buy Error:", err);
      // Ignorišemo grešku ako je korisnik odustao od autentifikacije
      if (!err.message?.includes("user cancelled")) {
         setError(err.message || "Greška");
      }
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
