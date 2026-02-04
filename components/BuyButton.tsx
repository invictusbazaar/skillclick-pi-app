"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";

interface BuyButtonProps {
  amount: number;
  serviceId: string;
  title: string;
  sellerUsername: string;
}

export default function BuyButton({ amount, serviceId, title, sellerUsername }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handlePayment = async () => {
    if (!user) {
      alert("Greška: Niste ulogovani.");
      return;
    }

    setLoading(true);

    try {
      // @ts-ignore
      if (typeof window === "undefined" || !window.Pi) {
        alert("Pi SDK nije detektovan. Otvorite u Pi Browseru.");
        setLoading(false);
        return;
      }

      // @ts-ignore
      const Pi = window.Pi;

      const paymentData = {
        amount: amount,
        memo: `Kupovina: ${title.substring(0, 20)}...`,
        metadata: { 
            type: "service_purchase", 
            serviceId: serviceId, 
            buyer: user.username 
        },
      };

      const callbacks = {
        // 1. APPROVE KORAK (Ovo je falilo i zato se vrtelo!)
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("⏳ APPROVE: Šaljem zahtev za ID:", paymentId);
          try {
             const res = await fetch('/api/payments/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId })
             });
             
             if (!res.ok) {
                 const err = await res.json();
                 throw new Error(err.error || "Server nije odobrio plaćanje");
             }
             console.log("✅ Server odobrio, Pi nastavlja...");
          } catch (e: any) { 
              console.error(e);
              alert("Greška kod odobrenja: " + e.message);
              setLoading(false); 
          }
        },
        
        // 2. COMPLETE KORAK (Upis u bazu)
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log("🏁 COMPLETE: Upisujem u bazu...", txid);
            try {
                const res = await fetch('/api/payments/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        paymentId, 
                        txid,
                        amount,
                        serviceId,
                        sellerUsername,
                        buyerUsername: user.username
                    })
                });
                
                if (res.ok) {
                    alert("USPEŠNO KUPLJENO! 🎉");
                    router.push("/"); 
                } else {
                    const err = await res.json();
                    alert("Plaćeno, ali greška baze: " + err.error);
                }
            } catch (e: any) {
                console.error(e);
                alert("Greška konekcije: " + e.message);
            }
        },

        onCancel: (paymentId: string) => {
          console.log("Korisnik otkazao");
          setLoading(false);
        },

        onError: (error: any, payment: any) => {
          console.error("Pi Greška:", error);
          // alert("Greška: " + (error.message || JSON.stringify(error)));
          setLoading(false);
        },
      };

      await Pi.createPayment(paymentData, callbacks);

    } catch (e: any) {
      console.error("Glavna greška:", e);
      alert("Fatalna greška: " + e.message);
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={loading}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg py-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
    >
      {loading ? <Loader2 className="animate-spin mr-2" /> : <CreditCard className="mr-2" />}
      Kupi za {amount} π
    </Button>
  );
}