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
  const [showFixBtn, setShowFixBtn] = useState(false);

  // === 1. STANDARDNA KUPOVINA ===
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
          
          // Ako je greška Pending ili Missing callback, pali dugme
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
      console.error("Catch Error:", err);
      // Prikazujemo originalnu grešku
      setError(err.message || "Greška");
      
      // === OVDE JE BILA GREŠKA, SAD JE ISPRAVLJENO ===
      // Sada palimo dugme i za "callback functions are missing"
      if (err.message && (err.message.includes("pending") || err.message.includes("missing") || err.message.includes("callback"))) {
          setShowFixBtn(true);
      }
    }
  };

  // === 2. DUGME ZA SPAS (RUČNA POPRAVKA) ===
  const handleManualFix = async () => {
      setLoading(true);
      try {
          const scopes = ['payments'];
          const onIncomplete = async (payment: any) => {
              console.log("FIX: Brišem transakciju:", payment);
              await fetch('/api/payments/incomplete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ paymentId: payment.identifier }),
              });
              alert("Uspešno očišćeno! Stranica će se osvežiti.");
              window.location.reload();
          };

          // Ovo forsira Pi SDK da nam da zaglavljenu transakciju
          await window.Pi.authenticate(scopes, onIncomplete);
          
          setTimeout(() => {
              setLoading(false);
              // Ako prođe authenticate a ne nađe ništa, znači da je možda već očišćeno
              alert("Provera završena. Pokušaj ponovo kupovinu.");
              setShowFixBtn(false); 
          }, 3000);

      } catch (e: any) {
          console.error(e);
          setLoading(false);
          alert("Greška: " + e.message);
      }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
             <p className="text-red-600 text-sm font-bold break-words">{error}</p>
        </div>
      )}
      
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

      {/* CRVENO DUGME KOJE ČEKAMO */}
      {showFixBtn && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <p className="text-xs text-center text-gray-500 mb-2">
                Sistem je detektovao problem. Klikni ispod za reset:
            </p>
            <Button 
                onClick={handleManualFix}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 shadow-red-200 shadow-lg animate-pulse"
            >
                <RefreshCw className="mr-2 h-5 w-5" />
                RESETUJ TRANSAKCIJU
            </Button>
          </div>
      )}
    </div>
  );
}
