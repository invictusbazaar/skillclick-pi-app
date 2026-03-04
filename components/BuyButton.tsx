"use client"

import { useState } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    Pi: any;
  }
}

export default function BuyButton({ listingId, price, sellerId, onSuccess }: any) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);

    if (!window.Pi) {
       alert("Pi SDK nije spreman. Osveži stranicu.");
       setLoading(false);
       return;
    }

    try {
      // 1. Inicijalizacija
      try { window.Pi.init({ version: "2.0", sandbox: false }); } catch (_) {}

      const paymentData = {
        amount: price,
        memo: `Usluga: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' }
      };

      // 2. Definišemo callback-ove UNAPRED (Ovo sprečava "Callback missing" grešku)
      const callbacks = {
        onReadyForServerApproval: (paymentId: string) => {
          fetch('/api/payments/approve', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ paymentId })
          });
        },
        onServerApproval: (paymentId: string, txid: string) => {
          fetch('/api/payments/complete', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ paymentId, txid })
          });
          if (onSuccess) onSuccess();
        },
        onCancel: (paymentId: string) => {
          setLoading(false);
        },
        onError: (error: any, payment: any) => {
          setLoading(false);
          console.error("Greška:", error);
          
          // Ako je greška "missing callback", ignorišemo je, jer onIncompletePaymentFound rešava stvar
          if (error.message && !error.message.includes("callback")) {
              alert("Greška: " + error.message);
          }
        },
        // OVO JE OBAVEZNO: Ako SDK ipak nađe neku staru mrvicu
        onIncompletePaymentFound: (payment: any) => {
            console.log("Pronađena stara transakcija, čistim...", payment);
            fetch('/api/payments/incomplete', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ paymentId: payment.identifier })
            }).then(() => {
                // Tiho osvežimo stranicu ili samo pustimo korisnika da proba opet
                console.log("Očišćeno.");
            });
        }
      };

      // 3. Pokrećemo plaćanje
      await window.Pi.createPayment(paymentData, callbacks);

    } catch (err: any) {
      setLoading(false);
      // Ako korisnik otkaže, nije greška
      if (!err.message?.includes("user cancelled")) {
          alert("Sistemska greška: " + err.message);
      }
    }
  };

  return (
    <Button
      onClick={handleBuy}
      disabled={loading}
      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg"
    >
      {loading ? (
         <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Procesuiranje...</>
      ) : (
         <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah</>
      )}
    </Button>
  );
}
