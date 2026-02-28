"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Wrench } from "lucide-react"; // Dodat Wrench za fix ikonicu
import { useLanguage } from "@/components/LanguageContext"; 
import { useAuth } from "@/components/AuthContext"; 
import { useRouter } from "next/navigation";

interface Props {
  amount: number;
  serviceId: string;
  title: string;
  sellerUsername: string;
}

export default function BuyButton({ amount, serviceId, title, sellerUsername }: Props) {
  const [loading, setLoading] = useState(false);
  const [fixMode, setFixMode] = useState(false); // Novi mod za popravku
  const { user } = useAuth();
  const { t } = useLanguage(); 
  const router = useRouter();

  // Funkcija za čišćenje zaglavljenih transakcija
  const cleanStuckPayments = () => {
      console.log("🧹 Pokrećem čišćenje transakcija...");
      // @ts-ignore
      if (typeof window !== "undefined" && window.Pi) {
          // @ts-ignore
          window.Pi.authenticate(['payments'], onIncompletePaymentFound);
      }
  };

  // Ovo je ključna funkcija koju Pi SDK poziva kad nađe đubre
  const onIncompletePaymentFound = async (payment: any) => {
      console.log("⚠️ PRONAĐENA ZAGLAVLJENA TRANSAKCIJA:", payment.identifier);
      
      try {
          // Šaljemo backendu da je otkaže (cancel)
          await fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId: payment.identifier })
          });
          
          alert(`🔧 Transakcija ${payment.identifier.slice(0, 5)}... je očišćena! Probaj ponovo.`);
          window.location.reload(); 
      } catch (err) {
          console.error("Greška pri čišćenju:", err);
      }
  };

  // Probaj da očistiš odmah pri učitavanju komponente
  useEffect(() => {
      // cleanStuckPayments(); // Opcionalno: može se aktivirati odmah
  }, []);

  const handleBuy = async () => {
    if (!user) {
        router.push('/auth/login');
        return;
    }
    
    if (user.username === sellerUsername) {
        alert(t('buySelfError') || "Ne možete kupiti sopstvenu uslugu.");
        return;
    }

    // @ts-ignore
    if (typeof window === "undefined" || !window.Pi) {
        alert("Pi SDK nije pronađen.");
        return;
    }

    if (!confirm(`${t('confirmBuyMsg') || "Da li ste sigurni da želite da kupite ovo za"} ${amount} Pi?`)) return;

    setLoading(true);

    try {
        // @ts-ignore
        const payment = await window.Pi.createPayment({
            amount: amount,
            memo: `${t('memoPurchase') || "Kupovina"}: ${title}`, 
            metadata: { serviceId: serviceId, seller: sellerUsername }
        }, {
            onReadyForServerApproval: async (paymentId: string) => {
                await fetch('/api/payments/approve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId })
                });
            },
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                const res = await fetch('/api/orders', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        serviceId,
                        amount,
                        sellerUsername,
                        buyerUsername: user.username,
                        paymentId,
                        txid
                    })
                });

                if (!res.ok) throw new Error("Greška pri čuvanju porudžbine.");

                alert(`🎉 ${t('buySuccess') || "Uspešno!"}`);
                router.push('/profile');
                router.refresh();
            },
            onCancel: (paymentId: string) => {
                setLoading(false);
                console.log("Plaćanje otkazano.", paymentId);
            },
            onError: (error: any, payment: any) => {
                setLoading(false);
                console.error("Greška:", error);
                
                const errString = error.toString().toLowerCase();
                // Ako je greška "Pending payment", nudimo fix
                if (errString.includes("pending payment") || errString.includes("already have a pending")) {
                    alert("⚠️ Detektovana zaglavljena transakcija! Klikni na dugme 'POPRAVI' koje se pojavilo, pa probaj ponovo.");
                    setFixMode(true);
                } else {
                    alert("Došlo je do greške: " + error.message);
                }
            }
        });

    } catch (error: any) {
        console.error("Pi.createPayment catch:", error);
        setLoading(false);
        if (error.toString().toLowerCase().includes("pending")) {
             alert("⚠️ Detektovana zaglavljena transakcija! Klikni na dugme 'POPRAVI'.");
             setFixMode(true);
        }
    }
  };

  if (fixMode) {
      return (
        <Button 
            onClick={cleanStuckPayments}
            className="w-full h-12 text-lg font-bold bg-red-600 hover:bg-red-700 text-white animate-pulse rounded-xl"
        >
            <Wrench className="mr-2 h-5 w-5"/> POPRAVI ZAGLAVLJENU TRANSAKCIJU
        </Button>
      )
  }

  return (
    <Button 
        onClick={handleBuy} 
        disabled={loading}
        className="w-full h-12 text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95 rounded-xl"
    >
        {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> {t('processing') || "Obrada..."}</>
        ) : (
            <><ShoppingCart className="mr-2 h-5 w-5"/> {user ? (t('buyBtn') || "Kupi") : (t('loginToBuy') || "Prijavi se za kupovinu")}</>
        )}
    </Button>
  );
}
