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
    // 1. Provera logovanja
    if (!user) {
      alert("Greška: Niste ulogovani.");
      return;
    }

    setLoading(true);

    try {
      // 2. PROVERA: Da li Pi SDK postoji?
      // @ts-ignore
      if (typeof window === "undefined" || !window.Pi) {
        alert("CRTIČNA GREŠKA: Pi SDK nije učitan! Proveri internet ili layout.tsx.");
        setLoading(false);
        return;
      }

      // @ts-ignore
      const Pi = window.Pi;

      // 3. Podaci za plaćanje
      const paymentData = {
        amount: amount,
        memo: `Kupovina: ${title.substring(0, 20)}...`,
        metadata: { 
            type: "service_purchase", 
            serviceId: serviceId, 
            buyer: user.username 
        },
      };

      // 4. Callback funkcije (Komunikacija sa tvojim API-jem)
      const callbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("⏳ Tražim odobrenje servera za ID:", paymentId);
          try {
             const res = await fetch('/api/payments/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId })
             });
             
             if (!res.ok) {
                 const errTxt = await res.text();
                 alert("Server nije odobrio: " + errTxt);
             }
          } catch (e: any) { 
              console.error(e);
              alert("Mrežna greška kod odobrenja: " + e.message);
          }
        },
        
        onServerApproval: async (paymentId: string) => {
          console.log("✅ Server odobrio. Čekam korisnika...");
        },

        onCompletion: async (paymentId: string, txid: string) => {
            console.log("🏁 Završavam transakciju...");
            try {
                await fetch('/api/payments/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId, txid })
                });
                alert("USPEŠNO PLAĆENO! 🎉");
                router.push("/"); // Vraća na početnu
            } catch (e) {
                console.error(e);
            }
        },

        onCancel: (paymentId: string) => {
          console.log("Korisnik otkazao");
          setLoading(false);
        },

        onError: (error: any, payment: any) => {
          console.error("Pi Greška:", error);
          alert("Greška tokom plaćanja: " + (error.message || error));
          setLoading(false);
        },
      };

      // 5. POKRETANJE
      await Pi.createPayment(paymentData, callbacks);

    } catch (e: any) {
      console.error("Glavna greška:", e);
      alert("Nije uspelo pokretanje Pi.createPayment: " + e.message);
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={loading}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg py-6 rounded-xl shadow-lg"
    >
      {loading ? <Loader2 className="animate-spin mr-2" /> : <CreditCard className="mr-2" />}
      Kupi za {amount} π
    </Button>
  );
}
