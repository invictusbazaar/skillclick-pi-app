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
  const [needsFix, setNeedsFix] = useState(false); // Novi status za popravku

  // 1. FUNKCIJA ZA KUPOVINU
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

      // Pokušavamo kupovinu
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
          
          // Ako je greška ona poznata, nudimo popravku
          if (msg.includes("callback functions are missing") || msg.includes("pending")) {
              setError("Detektovana zaglavljena transakcija.");
              setNeedsFix(true); // OVO PALI DUGME ZA POPRAVKU
          } else {
              setError(`Greška: ${msg}`);
          }
        },
        onIncompletePaymentFound: async (payment: any) => {
           // Ovo možda ne okine ako SDK blokira ranije, zato imamo handleFix
           await runCleanup(payment);
        }
      });

    } catch (err: any) {
      setLoading(false);
      const msg = err.message || "";
      console.error("Buy Error:", err);
      
      if (msg.includes("callback functions are missing") || msg.includes("pending")) {
          setError("Sistem je detektovao staru grešku.");
          setNeedsFix(true);
      } else {
          setError(`Sistemska greška: ${msg}`);
      }
    }
  };

  // 2. POSEBNA FUNKCIJA ZA POPRAVKU (Koristi authenticate umesto createPayment)
  const handleFix = async () => {
      setLoading(true);
      setError("Pokrećem čišćenje... Molim sačekajte.");
      
      try {
          // authenticate je jedini način da se očisti ako createPayment ne radi
          await window.Pi.authenticate(['payments'], async (payment: any) => {
              await runCleanup(payment);
          });
          
          // Ako authenticate prođe a ne nađe ništa (retko), osvežavamo
          setTimeout(() => {
              window.location.reload();
          }, 3000);

      } catch (e: any) {
          setLoading(false);
          // Često authenticate baci grešku ako korisnik odustane, ali ako nađe payment, onIncompletePaymentFound će se pozvati
          console.log("Fix attempt finished:", e);
      }
  };

  // 3. ZAJEDNIČKA LOGIKA ZA BRISANJE
  const runCleanup = async (payment: any) => {
      console.log("Brisanje transakcije:", payment.identifier);
      try {
          await fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId: payment.identifier }),
          });
          alert("Uspešno očišćeno! Stranica će se osvežiti.");
          window.location.reload();
      } catch (e) {
          alert("Greška pri komunikaciji sa serverom, ali pokušavam reload.");
          window.location.reload();
      }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
             <p className="text-red-600 text-sm font-bold">{error}</p>
        </div>
      )}

      {/* DUGME ZA POPRAVKU - Prikazuje se samo kad treba */}
      {needsFix ? (
          <Button
            onClick={handleFix}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg animate-pulse"
          >
            <Wrench className="mr-2 h-5 w-5" />
            POPRAVI ZAGLAVLJENU TRANSAKCIJU
          </Button>
      ) : (
          /* STANDARDNO DUGME */
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
    </div>
  );
}
