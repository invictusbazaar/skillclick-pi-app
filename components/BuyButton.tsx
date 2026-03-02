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

  // === 1. STANDARDNA KUPOVINA (Bez "pametovanja", samo osnovno) ===
  const handleBuy = async () => {
    setLoading(true);
    setError(null);

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
          setError("Plaćanje prekinuto.");
        },
        onError: (err: any, payment: any) => {
          console.error("SDK Error:", err);
          setLoading(false);
          // Ovde samo javljamo grešku. Reset dugme je uvek dole dostupno.
          setError(err?.message || "Došlo je do greške.");
        }
      });

    } catch (err: any) {
      setLoading(false);
      console.error("Catch Error:", err);
      setError(err.message || "Nepoznata greška.");
    }
  };

  // === 2. AGRESIVNO RESETOVANJE (Ovo je promenjeno!) ===
  const handleManualFix = async () => {
      if(!confirm("Pokrećem prisilno čišćenje zaglavljene transakcije. Da li ste sigurni?")) return;
      
      setLoading(true);
      setError(null);
      
      try {
          // KORISTIMO createPayment KAO MAMAC
          // Ovo je jedini način da nateramo SDK da izbaci "incomplete payment" ako authenticate ne radi
          const dummyData = {
              amount: 1, 
              memo: "CLEANUP_STUCK_PAYMENT", 
              metadata: { type: 'cleanup' } 
          };

          await window.Pi.createPayment(dummyData, {
              // OVE 4 FUNKCIJE SU TU SAMO DA ZADOVOLJE FORMU
              onReadyForServerApproval: async () => {},
              onServerApproval: async () => {},
              onCancel: () => { setLoading(false); },
              onError: (err: any) => { 
                  setLoading(false);
                  console.log("Cleanup error (očekivano):", err);
                  // Ako ni ovo ne upali, verovatno je problem u Pi Browser kešu
                  if(err.message?.includes("missing")) {
                      alert("Pokušaj ponovo Reset. SDK se buni.");
                  }
              },
              
              // === OVO JE ONO ŠTO NAM TREBA ===
              onIncompletePaymentFound: async (payment: any) => {
                  console.log("UPECANO! Brišem transakciju:", payment);
                  
                  try {
                      const res = await fetch('/api/payments/incomplete', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ paymentId: payment.identifier }),
                      });
                      
                      const data = await res.json();
                      console.log("Backend odgovor:", data);

                      alert("TRANSAKCIJA OBRISANA! Aplikacija se restartuje.");
                      window.location.reload();
                  } catch (e) {
                      console.error("Greška pri brisanju:", e);
                      alert("Greška pri kontaktu servera. Proveri internet.");
                  }
              }
          });

      } catch (e: any) {
          console.error("Fix greška:", e);
          setLoading(false);
          // Ako baci grešku "Already have pending payment", to znači da onIncompletePaymentFound
          // nije okinuo kako treba. Ali probajmo ovako.
          if(e.message?.includes("pending")) {
              alert("SDK kaže da postoji pending payment, ali nam ga ne daje. Probaj da restartuješ telefon.");
          } else {
              setError("Greška: " + e.message);
          }
      }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center animate-in fade-in">
             <p className="text-red-600 text-sm font-bold break-words">{error}</p>
             <p className="text-xs text-red-500 mt-1">Klikni na dugme RESETUJ ispod.</p>
        </div>
      )}
      
      {/* GLAVNO DUGME */}
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

      {/* DUGME ZA SPAS - UVEK VIDLJIVO */}
      <div className="mt-4 border-t pt-4 flex flex-col items-center">
        <p className="text-xs text-gray-400 mb-2">Imate problem sa plaćanjem?</p>
        <Button 
            onClick={handleManualFix}
            variant="destructive"
            size="sm"
            className="w-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 border border-red-200"
        >
            <Wrench className="mr-2 h-4 w-4" />
            RESETUJ ZAGLAVLJENU TRANSAKCIJU
        </Button>
      </div>
    </div>
  );
}
