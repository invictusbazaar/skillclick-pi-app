"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart } from "lucide-react";
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
  const { user } = useAuth();
  const { language } = useLanguage(); 
  const router = useRouter();

  const txt: any = {
    en: { btn: "Buy Now", processing: "Processing...", confirm: "Confirm Purchase", msg: "Are you sure you want to buy this service for", error: "Error", success: "Order created successfully!", login: "Login to Buy", selfBuy: "You cannot buy your own service.", payError: "Payment failed or cancelled.", cleaned: "System cleared your stuck transaction. Please click buy again." },
    sr: { btn: "Kupi Odmah", processing: "Obrada...", confirm: "Potvrdi Kupovinu", msg: "Da li sigurno želiš da kupiš ovu uslugu za", error: "Greška", success: "Uspešna kupovina! Idi na profil.", login: "Prijavi se za kupovinu", selfBuy: "Ne možeš kupiti svoju uslugu.", payError: "Plaćanje nije uspelo ili je otkazano.", cleaned: "Sistem je očistio zapelu transakciju. Molim te, klikni ponovo na kupovinu." },
    // ... ostali jezici ostaju isti
  };
  const T = (key: string) => txt[language]?.[key] || txt['en'][key];

  const handleBuy = async () => {
    if (!user) {
        router.push('/auth/login');
        return;
    }
    
    if (user.username === sellerUsername) {
        alert(T('selfBuy'));
        return;
    }

    // @ts-ignore
    if (typeof window === "undefined" || !window.Pi) {
        alert("Pi SDK not found. Please open in Pi Browser.");
        return;
    }

    if (!confirm(`${T('msg')} ${amount} Pi?`)) return;

    setLoading(true);

    try {
        // 1. POKRETANJE PI PLAĆANJA
        // @ts-ignore
        const payment = await window.Pi.createPayment({
            amount: amount,
            memo: `Kupovina: ${title}`,
            metadata: { serviceId: serviceId, seller: sellerUsername }
        }, {
            onReadyForServerApproval: async (paymentId: string) => {
                // Obaveštavamo tvoj server da odobri plaćanje
                await fetch('/api/payments/approve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId })
                });
            },
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                // 2. KREIRANJE PORUDŽBINE U BAZI
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

                alert(`🎉 ${T('success')}`);
                router.push('/profile');
                router.refresh();
            },
            onCancel: () => {
                setLoading(false);
                console.log("Plaćanje otkazano.");
            },
            onError: (error: any) => {
                setLoading(false);
                alert(`${T('payError')}: ` + error.message);
            },
            // 🚀 DODATO: Presretanje zapelog plaćanja direktno na dugmetu
            onIncompletePaymentFound: async (payment: any) => {
                console.log("⚠️ Pronađeno zapelo plaćanje pri pokušaju kupovine:", payment);
                try {
                    await fetch('/api/payments/resolve', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            paymentId: payment.identifier, 
                            txid: payment.transaction?.txid || "N/A" 
                        })
                    });
                    alert(T('cleaned'));
                } catch (err) {
                    console.error("Greška pri čišćenju zapelog plaćanja:", err);
                } finally {
                    setLoading(false);
                }
            }
        });

    } catch (error: any) {
        alert(`${T('error')}: ` + error.message);
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
            <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> {T('processing')}</>
        ) : (
            <><ShoppingCart className="mr-2 h-5 w-5"/> {user ? T('btn') : T('login')}</>
        )}
    </Button>
  );
}
