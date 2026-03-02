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

  // === FIX ZA ZAGLAVLJENE TRANSAKCIJE (Ilijin Problem) ===
  const handleIncompletePayment = async (payment: any) => {
    console.log("Found incomplete payment:", payment);
    
    try {
        // Pitamo backend šta da radimo sa ovom transakcijom
        const res = await fetch('/api/payments/incomplete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId: payment.identifier, payment }),
        });
        
        const data = await res.json();

        // AKO je refundirano ili otkazano -> IGNORIŠI staru i dozvoli novu kupovinu!
        if (data.status === 'cancelled_or_refunded' || data.status === 'fixed') {
            console.log("Stara transakcija očišćena, spremno za novu.");
            return; // Izlazimo, ne nastavljamo staru, čime "otključavamo" dugme
        }

        // Ako je stvarno nezavršena, probaj da završiš
        if (data.status === 'resume' && payment.status) {
             // Ovde bi išla logika za nastavak, ali za sad samo logujemo
             console.log("Resuming incomplete payment logic...");
        }

    } catch (e) {
        console.error("Error handling incomplete payment", e);
    }
  };

  const handleBuy = async () => {
    setLoading(true);
    setError(null);

    try {
      const scopes = ['payments'];
      
      // Definišemo callback za incomplete payment
      const onIncompletePaymentFound = handleIncompletePayment; 

      const paymentData = {
        amount: price,
        memo: `Service: ${listingId}`, // Kratak memo
        metadata: { listingId, sellerId, type: 'service_purchase' },
      };

      const callbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          try {
            const res = await fetch('/api/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Approval failed');
            
            // Backend odobrio, Pi SDK nastavlja
          } catch (err) {
            console.error('Approval error:', err);
            throw err; 
          }
        },
        onServerApproval: async (paymentId: string, txid: string) => {
            console.log("Server approved, payment ID:", paymentId);
            // Ovde možemo pozvati /complete rutu ako Pi SDK to ne uradi automatski,
            // ali obično onCompletion callback to rešava.
        },
        onCancel: (paymentId: string) => {
          setLoading(false);
          // Ne ispisujemo grešku korisniku ako je sam odustao
        },
        onError: (error: any, payment: any) => {
          setLoading(false);
          console.error('Payment error:', error);
          setError(t('error') || "Error occurred");
        },
      };

      // Pokrećemo plaćanje
      if (window.Pi) {
          await window.Pi.createPayment(paymentData, callbacks);
      } else {
          setError("Pi SDK not loaded");
          setLoading(false);
      }

      // Napomena: createPayment je async, ali se često ne resolve-uje dok se flow ne završi.
      // Resetovanje loading-a se radi u callback-ovima.

    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Error");
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
      
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
