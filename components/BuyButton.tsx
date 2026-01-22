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
      // 2. PROVERA: Da li je Pi SDK tu?
      // @ts-ignore
      if (typeof window === "undefined" || !window.Pi) {
        alert("Pi SDK nije detektovan. Otvorite u Pi Browseru.");
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

      // 4. CALLBACK FUNKCIJE - OVO JE KLJUČNO ZA TVOJU GREŠKU
      // Pi traži TAČNO ova 4 naziva, ni slovo drugačije.
      const callbacks = {
        
        // A) Spremno za odobrenje (Approve)
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("⏳ APPROVE: Šaljem zahtev za ID:", paymentId);
          try {
             const res = await fetch('/api/payments/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId })
             });
             if (!res.ok) throw new Error("Server nije odobrio plaćanje");
          } catch (e: any) { 
              console.error(e);
              alert("Greška kod odobrenja: " + e.message);
          }
        },
        
        // B) Spremno za završetak (Complete) - OVO TI JE FALILO!
        // Ranije smo ovo zvali 'onCompletion' ili 'onServerApproval', ali Pi traži baš OVO:
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log("🏁 COMPLETE: Završavam transakciju...", txid);
            try {
                const res = await fetch('/api/payments/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId, txid })
                });
                
                if (res.ok) {
                    alert("USPEŠNO PLAĆENO! 🎉");
                    router.push("/"); 
                } else {
                    alert("Greška pri finalizaciji na serveru.");
                }
            } catch (e) {
                console.error(e);
            }
        },

        // C) Otkazano
        onCancel: (paymentId: string) => {
          console.log("Korisnik otkazao");
          setLoading(false);
        },

        // D) Greška
        onError: (error: any, payment: any) => {
          console.error("Pi Greška:", error);
          alert("Greška: " + (error.message || JSON.stringify(error)));
          setLoading(false);
        },
      };

      // 5. POKRETANJE
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
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg py-6 rounded-xl shadow-lg"
    >
      {loading ? <Loader2 className="animate-spin mr-2" /> : <CreditCard className="mr-2" />}
      Kupi za {amount} π
    </Button>
  );
}
