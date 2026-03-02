"use client"

import { useState } from "react"
import { useLanguage } from "@/components/LanguageContext"
import { Loader2, ShoppingCart, AlertTriangle, RefreshCw } from "lucide-react"
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
  const [showFixBtn, setShowFixBtn] = useState(false); // Prikazuje se samo ako detektujemo problem

  // === 1. STANDARDNA KUPOVINA (Čista, bez automatike) ===
  const handleBuy = async () => {
    setLoading(true);
    setError(null);
    setShowFixBtn(false);

    try {
      if (!window.Pi) throw new Error("Pi SDK not loaded");

      const paymentData = {
        amount: price,
        memo: `Service: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' },
      };

      // Šaljemo standardni zahtev
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
          setError(t('payment_cancelled') || "Plaćanje otkazano");
        },
        onError: (err: any, payment: any) => {
          console.error("SDK Error:", err);
          setLoading(false);
          
          // Ako je greška "Pending payment", palimo dugme za popravku
          if (err?.message && (err.message.includes("pending") || err.message.includes("missing"))) {
              setError("Detektovana je zaglavljena transakcija. Klikni na dugme ispod da je obrišeš.");
              setShowFixBtn(true);
          } else {
              setError(err?.message || "Greška pri plaćanju");
          }
        }
      });

    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Greška");
      if (err.message?.includes("pending")) setShowFixBtn(true);
    }
  };

  // === 2. RUČNA POPRAVKA (Pokreće se SAMO na klik) ===
  const handleManualFix = async () => {
      setLoading(true);
      try {
          // Ovde svesno tražimo auth da bismo našli zaglavljenu transakciju
          const scopes = ['payments'];
          const onIncomplete = async (payment: any) => {
              console.log("FIX: Brišem transakciju:", payment);
              await fetch('/api/payments/incomplete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ paymentId: payment.identifier }),
              });
              alert("Transakcija obrisana! Stranica će se osvežiti.");
              window.location.reload();
          };

          await window.Pi.authenticate(scopes, onIncomplete);
          
          // Ako ne nađe ništa, a prošao je auth
          setTimeout(() => {
              setLoading(false);
              alert("Nije pronađena zaglavljena transakcija. Pokušaj ponovo kupovinu.");
              setShowFixBtn(false);
          }, 3000);

      } catch (e) {
          console.error(e);
          setLoading(false);
          alert("Greška pri popravci. Probaj osvežiti Pi Browser.");
      }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
             <p className="text-red-600 text-sm font-bold">{error}</p>
        </div>
      )}
      
      {/* Glavno dugme - isto kao pre */}
      {!showFixBtn && (
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
      )}

      {/* Dugme za popravku - POJAVLJUJE SE SAMO KAD PUKNE KUPOVINA */}
      {showFixBtn && (
          <Button 
            onClick={handleManualFix}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 animate-pulse"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            RESETUJ ZAGLAVLJENU TRANSAKCIJU
          </Button>
      )}
    </div>
  );
}
