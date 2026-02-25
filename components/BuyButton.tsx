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
  const { t } = useLanguage(); 
  const router = useRouter();

  const handleBuy = async () => {
    if (!user) {
        router.push('/auth/login');
        return;
    }
    
    if (user.username === sellerUsername) {
        alert(t('buySelfError') || "You cannot buy your own service.");
        return;
    }

    // @ts-ignore
    if (typeof window === "undefined" || !window.Pi) {
        alert("Pi SDK not found. Please open in Pi Browser.");
        return;
    }

    if (!confirm(`${t('confirmBuyMsg') || "Are you sure you want to buy this service for"} ${amount} Pi?`)) return;

    setLoading(true);

    try {
        // 1. POKRETANJE PI PLAĆANJA 
        // @ts-ignore
        const payment = await window.Pi.createPayment({
            amount: amount,
            memo: `${t('memoPurchase') || "Purchase"}: ${title}`, 
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

                alert(`🎉 ${t('buySuccess') || "Success!"}`);
                router.push('/profile');
                router.refresh();
            },
            onCancel: () => {
                setLoading(false);
                console.log("Plaćanje otkazano.");
            },
            onError: (error: any) => {
                setLoading(false);
                alert(`${t('errorPrefix') || "Error: "} ` + error.message);
            },
            onIncompletePaymentFound: async (payment: any) => {
                console.log("Pronađeno zaostalo plaćanje, čistim...");
                try {
                    await fetch('/api/payments/incomplete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ payment })
                    });
                    alert(t('incompletePaymentFixed'));
                } catch (err) {
                    console.error("Greška pri čišćenju", err);
                }
                setLoading(false);
            }
        });

    } catch (error: any) {
        alert(`${t('errorPrefix') || "Error: "} ` + error.message);
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
            <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> {t('processing') || "..."}</>
        ) : (
            <><ShoppingCart className="mr-2 h-5 w-5"/> {user ? (t('buyBtn') || "Buy") : (t('loginToBuy') || "Login")}</>
        )}
    </Button>
  );
}