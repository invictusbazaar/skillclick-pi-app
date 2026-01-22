"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, CreditCard } from "lucide-react";
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
    // 1. Provera da li je korisnik ulogovan
    if (!user) {
      alert("Moraš biti ulogovan da bi kupio uslugu.");
      router.push("/auth/login");
      return;
    }

    // 2. Provera da ne kupuješ od samog sebe (ISKLJUČENO ZBOG TESTIRANJA)
    /*
    if (user.username === sellerUsername) {
      alert("Ne možeš kupiti svoju uslugu!");
      return;
    }
    */

    setLoading(true);

    try {
      // --- PC SIMULACIJA PLAĆANJA ---
      // Ako nema Pi Browsera (znači na kompjuteru smo), simuliramo uspeh
      // @ts-ignore
      if (typeof window === "undefined" || !window.Pi) {
        console.log("🖥️ PC SIMULACIJA: Pokrećem lažno plaćanje...");
        
        setTimeout(async () => {
            // Simuliramo poziv ka tvojim API rutama da vidimo da li one rade
            try {
                // 1. Simuliraj Approve
                await fetch('/api/payments/approve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId: "simulated-payment-id-123" })
                });

                // 2. Simuliraj Complete
                await fetch('/api/payments/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId: "simulated-payment-id-123", txid: "simulated-txid-abc" })
                });

                alert("SIMULACIJA: Uspešno plaćeno! (Ovo je samo test na PC-u)");
                router.push("/orders"); // Prebacujemo na narudžbine (kad napravimo tu stranu)
            } catch (err) {
                console.error("Greška u simulaciji:", err);
                alert("Greška u simulaciji API poziva.");
            } finally {
                setLoading(false);
            }
        }, 2000);
        return;
      }

      // --- PRAVO PI PLAĆANJE (Samo u Pi Browseru) ---
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
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("⏳ Tražim odobrenje za:", paymentId);
          try {
              const res = await fetch('/api/payments/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId })
              });
              if (!res.ok) throw new Error("Server nije odobrio plaćanje");
          } catch (err) {
              console.error(err);
              alert("Greška pri odobravanju plaćanja.");
          }
        },
        
        onServerApproval: async (paymentId: string) => {
          console.log("✅ Server je odobrio. Čekam potpis korisnika...");
        },

        onCompletion: async (paymentId: string, txid: string) => {
            console.log("🏁 Završavam transakciju:", txid);
            try {
                const res = await fetch('/api/payments/complete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ paymentId, txid })
                });
                
                if (res.ok) {
                    alert("Uspešno plaćeno! 🎉");
                    // router.push("/orders"); 
                } else {
                    alert("Plaćanje prošlo, ali greška pri potvrdi na serveru.");
                }
            } catch (err) {
                console.error(err);
            }
        },

        onCancel: (paymentId: string) => {
          console.log("🚫 Otkazano");
          setLoading(false);
        },

        onError: (error: any, payment: any) => {
          console.error("❌ Greška:", error);
          alert("Došlo je do greške: " + error.message);
          setLoading(false);
        },
      };

      await Pi.createPayment(paymentData, callbacks);

    } catch (e: any) {
      console.error(e);
      alert("Greška pri pokretanju plaćanja.");
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={loading}
      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg py-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
    >
      {loading ? (
        <>
            <Loader2 className="animate-spin mr-2 h-6 w-6" /> Procesiranje...
        </>
      ) : (
        <>
            <CreditCard className="mr-2 h-6 w-6" /> Kupi za {amount} π
        </>
      )}
    </Button>
  );
}
