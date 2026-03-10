"use client"

import { useState } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthContext"
// ✅ UVOZIMO TVOJ SISTEM ZA JEZIKE
import { useLanguage } from "@/components/LanguageContext"

declare global {
  interface Window {
    Pi: any;
  }
}

export default function BuyButton(props: any) {
  const [loading, setLoading] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  
  // ✅ AKTIVIRAMO PREVODE
  const { t } = useLanguage();

  const rawPrice = props.price || props.amount;
  const finalId = props.listingId || props.serviceId || props.id;
  const finalSeller = props.sellerId || props.sellerUsername;
  const safePrice = parseFloat(rawPrice) > 0 ? parseFloat(rawPrice) : 0;

  const handleBuy = async () => {
    if (authLoading) {
        alert(t('loading')); // Prati jezik (Učitavanje...)
        return;
    }

    if (!user) {
        alert(t('loginReq') || "Morate se prijaviti."); // Prati jezik
        return;
    }

    if (safePrice <= 0) {
        alert(t('error') || "Sistemska greška: Cena nije validna.");
        return;
    }

    setLoading(true);

    if (typeof window === "undefined" || !window.Pi) {
       alert(t('piBrowserError') || "Pi mreža nije detektovana."); // Prati jezik
       setLoading(false);
       return;
    }

    try {
      await window.Pi.authenticate(['payments'], {
          onIncompletePaymentFound: function(payment: any) {
              fetch('/api/payments/incomplete', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId: payment.identifier })
              });
          }
      });

      const paymentCallbacks = {
          onReadyForServerApproval: (paymentId: string) => {
              fetch('/api/payments/approve', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId })
              });
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => { 
              try {
                  const response = await fetch('/api/payments/complete', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ 
                          paymentId, 
                          txid, 
                          buyerUsername: user.username 
                      }) 
                  });
                  
                  const data = await response.json(); // ✅ ČITAMO TAJNI ODGOVOR BAZE
                  setLoading(false); 
                  
                  if (response.ok) {
                      // AKO BAZA PRIJAVI GREŠKU, SADA ĆEMO JE VIDETI!
                      if (data.error_log) {
                          alert("GREŠKA U BAZI (Slikaj mi ovo): " + data.error_log);
                      } else {
                          // ✅ USPEH - BEZ onog "upisano u profil"
                          alert(t('paymentSuccess') || "Payment successful!");
                          if (props.onSuccess) props.onSuccess();
                      }
                  } else {
                      alert(t('error') || "Problem sa serverom.");
                  }
              } catch (error) {
                  setLoading(false);
                  alert(t('error') || "Greška u komunikaciji.");
              }
          },
          onCancel: (paymentId: string) => {
              setLoading(false);
          },
          onError: (error: any, payment: any) => {
              setLoading(false);
              if (error && !JSON.stringify(error).includes("cancelled")) {
                  alert("SDK Error: " + (error.message || error));
              }
          }
      };

      await window.Pi.createPayment({
        amount: safePrice, 
        memo: `Usluga: ${finalId}`, 
        metadata: { 
            listingId: String(finalId), 
            sellerId: String(finalSeller), 
            type: 'service_purchase' 
        }
      }, paymentCallbacks);

    } catch (err: any) {
      setLoading(false);
      if (!err.message?.includes("user cancelled")) {
          alert("Error: " + err.message);
      }
    }
  };

  return (
    <Button
      onClick={handleBuy}
      disabled={loading || authLoading} 
      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg disabled:opacity-50"
    >
      {loading || authLoading ? (
         <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('processing')}</>
      ) : (
         <><ShoppingCart className="mr-2 h-5 w-5" /> {t('buyNow')} ({safePrice || "?"} π)</>
      )}
    </Button>
  );
}