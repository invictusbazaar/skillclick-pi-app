"use client"

import { useState } from "react"
import { useLanguage } from "@/components/LanguageContext"
import { Loader2, ShoppingCart, Trash2, AlertTriangle } from "lucide-react"
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
  
  // Da li da prikažemo dugme za hitno čišćenje?
  const [showEmergencyFix, setShowEmergencyFix] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    setError(null);
    setShowEmergencyFix(false);

    if (!window.Pi) {
       setError("Pi SDK nije spreman.");
       setLoading(false);
       return;
    }

    try {
      const paymentData = {
        amount: price,
        memo: `Service: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' },
      };

      await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: async (paymentId: string) => {
           // Ovo sad nije bitno, samo da prođe
           await fetch('/api/payments/approve', { method: 'POST', body: JSON.stringify({ paymentId }) });
        },
        onServerApproval: async (paymentId: string, txid: string) => {
           await fetch('/api/payments/complete', { method: 'POST', body: JSON.stringify({ paymentId, txid }) });
           if (onSuccess) onSuccess();
        },
        onCancel: () => {
          setLoading(false); 
          setError("Otkazano.");
        },
        onError: (err: any, payment: any) => {
          setLoading(false);
          // Bilo koja greška sada pali "Emergency Mode"
          console.error("SDK Error:", err);
          setError("Sistem je blokiran starom transakcijom.");
          setShowEmergencyFix(true);
        },
        onIncompletePaymentFound: async (payment: any) => {
           // Ako ovo okine, super, brišemo odmah
           await forceCleanup(payment.identifier);
        }
      });

    } catch (err: any) {
      setLoading(false);
      console.error("Catch Error:", err);
      // Ako pukne ovde, znači da je SDK baš zaglavljen
      setError("Detektovana blokada novčanika.");
      setShowEmergencyFix(true);
    }
  };

  // --- NUKLEARNA OPCIJA: Čišćenje bez ID-a ---
  const handleEmergencyFix = async () => {
      if (!confirm("Ovo će pokušati da nasilno očisti zaglavljenu transakciju. Nastavi?")) return;

      setLoading(true);
      setError("Pokušavam nasilno čišćenje...");

      try {
        // Trik: Pozivamo authenticate da bi dobili pristup, a onda namerno ne radimo ništa
        // Često samo ovaj poziv "odglavi" Pi Browser
        const auth = await window.Pi.authenticate(['payments'], async (payment: any) => {
            if (payment && payment.identifier) {
                await forceCleanup(payment.identifier);
            } else {
                alert("Nisam našao transakciju u Auth modu. Pokušavam reload...");
                window.location.reload();
            }
        });
        
        // Ako auth ne vrati ništa, a i dalje ne radi, šaljemo korisnika na /fix stranu (ako je imaš)
        // ili samo reloadujemo
        setTimeout(() => window.location.reload(), 2000);

      } catch (e: any) {
          alert("Nije uspelo. Poslednja šansa: Pi Browser -> Settings -> Clear Cache.");
          setLoading(false);
      }
  };

  const forceCleanup = async (paymentId: string) => {
      try {
          await fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
          });
          alert("USPEH! Blokada uklonjena.");
          window.location.reload();
      } catch (e) {
          alert("Greška pri brisanju, ali pokušavam dalje.");
      }
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
             <p className="text-red-600 text-sm font-bold">{error}</p>
        </div>
      )}

      {showEmergencyFix ? (
          <Button
            onClick={handleEmergencyFix}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg animate-pulse"
          >
            <AlertTriangle className="mr-2 h-6 w-6" />
            NASILNO ODGLAVI NOVČANIK
          </Button>
      ) : (
          <Button
            onClick={handleBuy}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg"
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><ShoppingCart className="mr-2 h-5 w-5" /> {t('buyNow')}</>}
          </Button>
      )}
    </div>
  );
}
