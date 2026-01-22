"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button"; // Tvoje UI dugme
import { Loader2, ShoppingCart, CreditCard } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";

interface BuyButtonProps {
  amount: number;
  serviceId: string; // Treba nam ID oglasa da znamo šta kupuje
  title: string;     // Ime oglasa za "Memo"
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

    // 2. Provera da ne kupuješ od samog sebe
    if (user.username === sellerUsername) {
      alert("Ne možeš kupiti svoju uslugu!");
      return;
    }

    setLoading(true);

    try {
      // @ts-ignore
      if (typeof window === "undefined" || !window.Pi) {
        alert("Plaćanje je moguće samo unutar Pi Browser-a (na mobilnom).");
        setLoading(false);
        return;
      }

      // @ts-ignore
      const Pi = window.Pi;

      // 3. Podaci za Pi mrežu
      const paymentData = {
        amount: amount,
        memo: `Kupovina: ${title.substring(0, 20)}...`, // Kratak opis
        metadata: { 
            type: "service_purchase", 
            serviceId: serviceId, 
            buyer: user.username 
        },
      };

      // 4. Callback funkcije (Šta se dešava kad klikneš)
      const callbacks = {
        
        // KORAK A: Pi mreža je spremna, traži odobrenje od tvog servera
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
        
        // KORAK B: Pi mreža je odobrila, sada korisnik potpisuje
        onServerApproval: async (paymentId: string) => {
          console.log("✅ Server je odobrio. Čekam potpis korisnika...");
        },

        // KORAK C: Korisnik je platio, šaljemo potvrdu serveru da završi
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
                    router.push("/orders"); // Prebaci ga na listu narudžbina
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

      // Pokretanje procesa
      await Pi.createPayment(paymentData, callbacks);

    } catch (e: any) {
      console.error(e);
      alert("Greška pri pokretanju plaćanja.");
    } finally {
      // setLoading(false); // Ostavljamo loading dok se ne završi ili otkaže
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