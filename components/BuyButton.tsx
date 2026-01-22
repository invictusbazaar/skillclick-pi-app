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
      alert("❌ GREŠKA: Niste ulogovani. Molimo ulogujte se.");
      return;
    }

    // 2. Provera da li kupuješ od samog sebe (ISKLJUČI OVO // AKO HOĆEŠ DA KUPIŠ SVOJE)
    /*
    if (user.username === sellerUsername) {
       alert("🚫 Ne možete kupiti sopstvenu uslugu.");
       return;
    }
    */

    setLoading(true);

    try {
      // 3. PROVERA: Da li je Pi SDK učitan?
      // @ts-ignore
      if (typeof window === "undefined" || !window.Pi) {
        alert("⚠️ Pi Browser nije detektovan! Ovorite aplikaciju preko Pi Browser-a.");
        setLoading(false);
        return;
      }

      // @ts-ignore
      const Pi = window.Pi;

      // 4. Podaci za plaćanje
      const paymentData = {
        amount: amount,
        memo: `SkillClick: ${title.substring(0, 20)}...`,
        metadata: { 
            type: "service_purchase", 
            serviceId: serviceId, 
            buyer: user.username 
        },
      };

      // 5. Callbacks
      const callbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("⏳ Šaljem zahtev za odobrenje (Approve)... ID:", paymentId);
          try {
             const res = await fetch('/api/payments/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId })
             });
             
             if (!res.ok) {
                 const errTxt = await res.text();
                 alert("❌ Server ODBIO plaćanje: " + errTxt);
                 setLoading(false);
             } else {
                 console.log("✅ Server odobrio plaćanje!");
             }
          } catch (e: any) { 
              console.error(e);
              alert("❌ Greška u komunikaciji sa serverom (Approve): " + e.message);
              setLoading(false);
          }
        },
        
        onServerApproval: async (paymentId: string) => {
          console.log("✅ Pi mreža primila odobrenje. Čekam potpis korisnika...");
        },

        onCompletion: async (paymentId: string, txid: string) => {
            console.log("🏁 Završavam transakciju (Complete)...");
            try {
                const res = await fetch('/api/payments/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId, txid })
                });
                
                if (res.ok) {
                    alert("🎉 USPEŠNO PLAĆENO! Hvala na kupovini.");
                    router.push("/"); 
                } else {
                    alert("⚠️ Plaćanje prošlo, ali nije upisano u bazu.");
                }
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
          // Prikazujemo tačnu grešku korisniku da znamo šta nije u redu
          alert("❌ PI GREŠKA: " + (error.message || JSON.stringify(error)));
          setLoading(false);
        },
      };

      // 6. POKRETANJE
      await Pi.createPayment(paymentData, callbacks);

    } catch (e: any) {
      console.error("Glavna greška:", e);
      alert("❌ Fatalna greška pri pokretanju: " + e.message);
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={loading}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg py-6 rounded-xl shadow-lg active:scale-95 transition-transform"
    >
      {loading ? <Loader2 className="animate-spin mr-2" /> : <CreditCard className="mr-2" />}
      Kupi za {amount} π
    </Button>
  );
}
