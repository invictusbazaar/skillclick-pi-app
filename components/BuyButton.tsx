"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart } from "lucide-react";
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
  const { user } = useAuth();
  const router = useRouter();

  const handleBuy = async () => {
    if (!user) {
        router.push('/auth/login');
        return;
    }
    
    if (user.username === sellerUsername) {
        alert("Ne možete kupiti sopstvenu uslugu.");
        return;
    }

    // @ts-ignore
    if (typeof window === "undefined" || !window.Pi) {
        alert("Pi SDK nije pronađen. Molimo otvorite aplikaciju u Pi Browseru.");
        return;
    }

    if (!confirm(`Da li ste sigurni da želite da kupite ovu uslugu za ${amount} Pi?`)) return;

    setLoading(true);

    try {
        // @ts-ignore
        const payment = await window.Pi.createPayment({
            amount: amount,
            memo: `Kupovina: ${title}`, 
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
                        serviceId, amount, sellerUsername, buyerUsername: user.username, paymentId, txid
                    })
                });

                if (!res.ok) throw new Error("Greška pri čuvanju porudžbine u bazu.");

                alert("🎉 Uspešna kupovina!");
                router.push('/profile');
                router.refresh();
            },
            onCancel: () => {
                setLoading(false);
            },
            onError: (error: any) => {
                setLoading(false);
                console.error("Pi SDK Greška:", error);
            },
            // OVO JE KLJUČ KOJI TI FALI DA BI OBISAO ZAGLAVLJENU TRANSAKCIJU:
            onIncompletePaymentFound: async (payment: any) => {
                try {
                    await fetch('/api/payments/incomplete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ payment })
                    });
                    alert("✅ Sistem je očistio staru zaglavljenu transakciju! Molimo kliknite 'Kupi' ponovo.");
                } catch (err) {
                    console.error("Greška pri čišćenju", err);
                    alert("Nije uspelo čišćenje transakcije.");
                }
                setLoading(false);
            }
        });

    } catch (error: any) {
        console.error("Greška u BuyButton:", error);
        setLoading(false);
    }
  };

  return (
    <Button 
        onClick={handleBuy} 
        disabled={loading}
        className="w-full h-12 text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95 rounded-xl"
    >
        {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> Obrada...</>
        ) : (
            <><ShoppingCart className="mr-2 h-5 w-5"/> {user ? "Kupi Odmah" : "Prijavi se"}</>
        )}
    </Button>
  );
}
