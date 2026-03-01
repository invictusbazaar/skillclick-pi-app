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

  const txt: Record<string, any> = {
    en: { btn: "Buy Now", processing: "Processing...", confirm: "Confirm Purchase", msg: "Are you sure you want to buy this service for", error: "Error", success: "Order created successfully!", login: "Login to Buy", selfBuy: "You cannot buy your own service.", payError: "Payment failed or cancelled." },
    sr: { btn: "Kupi Odmah", processing: "Obrada...", confirm: "Potvrdi Kupovinu", msg: "Da li sigurno želiš da kupiš ovu uslugu za", error: "Greška", success: "Uspešna kupovina! Idi na profil.", login: "Prijavi se za kupovinu", selfBuy: "Ne možeš kupiti svoju uslugu.", payError: "Plaćanje nije uspelo ili je otkazano." },
  };

  const T = (key: string) => {
    const langCode = language === 'sr' ? 'sr' : 'en';
    return txt[langCode][key] || txt['en'][key];
  };

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
        // @ts-ignore
        await window.Pi.createPayment({
            amount: amount,
            memo: `Kupovina: ${title}`,
            metadata: { serviceId: serviceId, seller: sellerUsername }
        }, {
            onReadyForServerApproval: async (paymentId: string) => {
                try {
                    const response = await fetch('/api/payments/approve', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentId })
                    });
                    
                    if (!response.ok) {
                        throw new Error("Server approval failed");
                    }
                } catch (err) {
                    throw err; 
                }
            },
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                try {
                    const res = await fetch('/api/payments/complete', { 
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

                    if (!res.ok) throw new Error("Server completion failed");

                    alert(`🎉 ${T('success')}`);
                    router.push('/profile');
                    router.refresh();
                } catch (err) {
                    throw err;
                }
            },
            onCancel: () => {
                setLoading(false);
            },
            onError: (error: any) => {
                setLoading(false);
                alert(`${T('payError')}`);
            },
            onIncompletePaymentFound: async (payment: any) => {
                try {
                    await fetch('/api/payments/incomplete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ payment })
                    });
                    // Opciono: automatski otkazati nekompletirano plaćanje da se odglavi SDK
                } catch (err) {
                    // Silent fail
                }
                setLoading(false);
            }
        });

    } catch (error: any) {
        setLoading(false);
        alert(`${T('error')}: ${error.message}`);
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
