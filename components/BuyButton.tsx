"use client"

import { useState } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthContext"

declare global {
  interface Window {
    Pi: any;
  }
}

export default function BuyButton(props: any) {
  const [loading, setLoading] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  // Pametno hvatanje podataka
  const rawPrice = props.price || props.amount;
  const finalId = props.listingId || props.serviceId || props.id;
  const finalSeller = props.sellerId || props.sellerUsername;
  const safePrice = parseFloat(rawPrice) > 0 ? parseFloat(rawPrice) : 0;

  const handleBuy = async () => {
    if (authLoading) {
        alert("Aplikacija se još uvek povezuje sa Pi Mrežom. Molimo sačekajte par sekundi.");
        return;
    }

    if (!user) {
        alert("Niste prijavljeni. Molimo osvežite stranicu kako bi vas Pi Browser prepoznao.");
        return;
    }

    if (safePrice <= 0) {
        alert("Sistemska greška: Cena nije validna.");
        return;
    }

    setLoading(true);

    if (typeof window === "undefined" || !window.Pi) {
       alert("Pi mreža nije detektovana. Da li koristite Pi Browser?");
       setLoading(false);
       return;
    }

    try {
      // 1. TRAŽIMO DOZVOLU ZA PLAĆANJE (Agresivni mod pre samog plaćanja)
      await window.Pi.authenticate(['payments'], {
          onIncompletePaymentFound: function(payment: any) {
              console.log("Brisanje stare transakcije...", payment.identifier);
              fetch('/api/payments/incomplete', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId: payment.identifier })
              });
          }
      });

      // 2. KREIRANJE PLAĆANJA
      const paymentCallbacks = {
          onReadyForServerApproval: (paymentId: string) => {
              fetch('/api/payments/approve', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId })
              });
          },
          // 🛑 ISPRAVLJEN NAZIV FUNKCIJE 🛑
          onReadyForServerCompletion: async (paymentId: string, txid: string) => { 
              try {
                  const response = await fetch('/api/payments/complete', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      // ✅ ŠALJEMO TVOJE IME U BAZU
                      body: JSON.stringify({ 
                          paymentId, 
                          txid, 
                          buyerUsername: user.username 
                      }) 
                  });
                  
                  // 🛑 OVO ZAUSTAVLJA VRTENJE DUGMETA 🛑
                  setLoading(false); 
                  
                  if (response.ok) {
                      alert("Uspešno plaćeno i upisano u profil!");
                      if (props.onSuccess) props.onSuccess();
                  } else {
                      alert("Plaćanje uspešno, ali postoji problem sa profilom.");
                  }
              } catch (error) {
                  setLoading(false);
                  alert("Greška pri komunikaciji sa serverom nakon plaćanja.");
              }
          },
          onCancel: (paymentId: string) => {
              setLoading(false);
          },
          onError: (error: any, payment: any) => {
              setLoading(false);
              if (error && !JSON.stringify(error).includes("cancelled")) {
                  alert("SDK Greška: " + (error.message || error));
              }
          }
      };

      // 3. POKREĆEMO PLAĆANJE
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
          alert("Sistemska greška: " + err.message);
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
         <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Povezivanje...</>
      ) : (
         <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah ({safePrice || "?"} π)</>
      )}
    </Button>
  );
}
