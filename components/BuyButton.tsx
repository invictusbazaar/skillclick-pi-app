"use client"

import { useState } from "react"
import { useLanguage } from "@/components/LanguageContext"
import { Loader2, ShoppingCart, Wrench, Trash2 } from "lucide-react"
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
  
  // Ovde čuvamo ID zaglavljene transakcije kad je uhvatimo
  const [stuckPaymentId, setStuckPaymentId] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string>("");

  const log = (msg: string) => {
      console.log(msg);
      setDebugLog(prev => prev + "\n" + msg);
  }

  const handleBuy = async () => {
    setLoading(true);
    setError(null);
    setDebugLog(""); // Reset loga

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

      log("Pokrećem createPayment...");

      await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: async (paymentId: string) => {
          log(`Approval: ${paymentId}`);
          await fetch('/api/payments/approve', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paymentId }),
          });
        },
        onServerApproval: async (paymentId: string, txid: string) => {
          log(`Server Approved: ${paymentId}`);
          await fetch('/api/payments/complete', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paymentId, txid }),
          });
          if (onSuccess) onSuccess();
        },
        onCancel: () => {
          setLoading(false);
          setError("Prekinuto.");
        },
        onError: (err: any, payment: any) => {
          setLoading(false);
          log(`Error: ${err?.message}`);
          
          // POKUŠAJ DA UHVATIMO ID IZ GREŠKE
          if (payment && payment.identifier) {
              log(`Uhvaćen ID iz error-a: ${payment.identifier}`);
              setStuckPaymentId(payment.identifier);
              setError("Detektovana zaglavljena transakcija.");
          } 
          else if (err?.message && (err.message.includes("callback") || err.message.includes("pending"))) {
              // Ako nemamo ID, a greška je tu, to je problem.
              // Ali onIncompletePaymentFound bi trebao da okine.
              setError("Zaglavljena transakcija. Čekam podatke...");
          } else {
              setError(`Greška: ${err.message}`);
          }
        },
        onIncompletePaymentFound: async (payment: any) => {
           log(`!!! PRONAĐENO SMEĆE !!! ID: ${payment.identifier}`);
           // Čim nađemo smeće, sačuvamo ID i nudimo dugme za brisanje
           setStuckPaymentId(payment.identifier);
           setLoading(false);
           setError("Pronađena stara transakcija koju treba obrisati.");
        }
      });

    } catch (err: any) {
      setLoading(false);
      log(`Catch Error: ${err.message}`);
      if (err.message.includes("callback") || err.message.includes("pending")) {
          setError("Greška: Postoji nezavršena transakcija.");
          // Ovde ne možemo dobiti ID direktno ako onIncompletePaymentFound ne okine
      }
    }
  };

  // --- NOVA FUNKCIJA ZA POPRAVKU (Bez authenticate) ---
  const handleFix = async () => {
      if (!stuckPaymentId) {
          alert("Nisam uspeo da uhvatim ID transakcije. Probaj ponovo 'Kupi' da je detektujem.");
          return;
      }

      setLoading(true);
      log(`Šaljem zahtev za brisanje ID: ${stuckPaymentId}`);

      try {
          const res = await fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId: stuckPaymentId }),
          });

          const data = await res.json();
          log(`Server odgovor: ${JSON.stringify(data)}`);

          if (data.status === 'fixed') {
              alert(`✅ USPEH! Obrisano metodom: ${data.method}. \nSada ću osvežiti stranicu.`);
              window.location.reload();
          } else {
              alert(`❌ NIJE USPELO: ${data.message}`);
              setLoading(false);
          }

      } catch (e: any) {
          log(`Network fail: ${e.message}`);
          alert("Greška u mreži. Proveri internet.");
          setLoading(false);
      }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* ERROR BOX SA LOGOVIMA */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
             <p className="text-red-600 text-sm font-bold text-center mb-2">{error}</p>
             {/* Prikazujemo log da vidiš šta se dešava */}
             <pre className="text-xs text-gray-500 overflow-auto max-h-20 bg-gray-100 p-1 rounded">
                 {debugLog}
             </pre>
        </div>
      )}

      {/* DUGME SE MENJA AKO IMAMO UHVAĆEN ID */}
      {stuckPaymentId ? (
          <Button
            onClick={handleFix}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg animate-pulse"
          >
            <Trash2 className="mr-2 h-5 w-5" />
            OBRIŠI ZAGLAVLJENU (ID: ...{stuckPaymentId.slice(-4)})
          </Button>
      ) : (
          <Button
            onClick={handleBuy}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg"
          >
            {loading ? (
                 <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
                 <><ShoppingCart className="mr-2 h-5 w-5" /> {t('buyNow')}</>
            )}
          </Button>
      )}
    </div>
  );
}
