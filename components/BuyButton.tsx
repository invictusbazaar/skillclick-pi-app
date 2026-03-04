"use client"

import { useState } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global { interface Window { Pi: any; } }

export default function BuyButton(props: any) {
  const [loading, setLoading] = useState(false);

  // === PAMETNO PREUZIMANJE PODATAKA ===
  // Prihvatamo i "price" i "amount", i "listingId" i "serviceId"
  const finalPrice = props.price || props.amount;
  const finalListingId = props.listingId || props.serviceId;
  const finalSellerId = props.sellerId || props.sellerUsername;

  const handleBuy = async () => {
    // 1. DEBUG ALERT SA SVIM DETALJIMA (Sklonićemo ga kad proradi)
    if (!finalPrice || !finalListingId || !finalSellerId) {
        alert(`FALE PODACI!\nPrice: ${finalPrice}\nID: ${finalListingId}\nSeller: ${finalSellerId}`);
        return;
    }

    setLoading(true);

    if (typeof window === "undefined" || !window.Pi) {
       alert("Pi Browser nije detektovan.");
       setLoading(false);
       return;
    }

    try {
      // 2. INICIJALIZACIJA
      window.Pi.init({ version: "2.0", sandbox: false });

      // 3. AUTHENTICATE
      const auth = await window.Pi.authenticate(['payments'], {
          onIncompletePaymentFound: (payment: any) => {
              console.log("Nezavršena transakcija:", payment);
              fetch('/api/payments/incomplete', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId: payment.identifier })
              });
          }
      });

      // 4. KREIRANJE PLAĆANJA
      await window.Pi.createPayment({
        amount: parseFloat(finalPrice), // Osiguravamo da je broj
        memo: `Kupovina: ${finalListingId}`, 
        metadata: { 
            listingId: String(finalListingId), 
            sellerId: String(finalSellerId),
            type: 'service_purchase' 
        }
      }, {
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
          if (props.onSuccess) props.onSuccess();
        },
        onCancel: (paymentId: string) => {
            setLoading(false);
        },
        onError: (error: any, payment: any) => {
          setLoading(false);
          if (!JSON.stringify(error).includes("cancelled")) {
              alert("GREŠKA: " + (error.message || error));
          }
        }
      });

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
      disabled={loading} 
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg"
    >
      {loading ? (
        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Povezivanje...</> 
      ) : (
        <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah ({finalPrice} π)</>
      )}
    </Button>
  );
}
