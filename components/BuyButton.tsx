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

  // === 1. DEFINIŠEMO FUNKCIJE UNAPRED ===
  
  // Funkcija za čišćenje zaglavljenih plaćanja
  const handleIncompletePayment = async (payment: any) => {
    console.log("FIX: Detektovano nezavršeno plaćanje:", payment);
    
    try {
      // Šaljemo backendu da poništi
      const res = await fetch('/api/payments/incomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: payment.identifier, payment }),
      });
      
      const data = await res.json();
      
      if (data.status === 'cancelled_or_refunded' || data.status === 'fixed') {
          console.log("FIX: Uspešno poništeno. Osvežavam stranicu...");
          // Forsiramo reload da Pi SDK "zaboravi" grešku
          window.location.reload(); 
          return;
      }
    } catch (e) {
      console.error("FIX Error:", e);
    }
  };

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

      // === 2. EKSPLICITNO KREIRAMO CALLBACK OBJEKAT ===
      // Ovo osigurava da SDK tačno vidi svaku funkciju
      const paymentCallbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("onReadyForServerApproval", paymentId);
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
          console.log("onServerApproval", paymentId, txid);
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
          console.log("onCancel", paymentId);
          setLoading(false);
          setError(t('payment_cancelled') || "Payment cancelled");
        },
        onError: (error: any, payment: any) => {
          console.error('Payment error:', error);
          setLoading(false);
          if (error?.message) setError(error.message);
        },
        onIncompletePaymentFound: (payment: any) => {
           // Pozivamo našu funkciju definisanu gore
           return handleIncompletePayment(payment);
        }
      };

      // Pokrećemo plaćanje
      await window.Pi.createPayment(paymentData, paymentCallbacks);

    } catch (err: any) {
      setLoading(false);
      console.error("Global Buy Error:", err);
      // Prikazujemo grešku korisniku
      setError(err.message || "Error occurred");
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
             <p className="text-red-600 text-sm font-medium mb-1">{t('error')}: {error}</p>
             {error.includes("missing") && (
                 <p className="text-xs text-red-500">Pokušavam automatski popravak...</p>
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
