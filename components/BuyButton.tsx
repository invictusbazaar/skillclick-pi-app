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

  // Rečnik termina
  const txt: Record<string, any> = {
    en: { btn: "Buy Now", processing: "Processing...", confirm: "Confirm Purchase", msg: "Are you sure you want to buy this service for", error: "Error", success: "Order created successfully!", login: "Login to Buy", selfBuy: "You cannot buy your own service.", payError: "Payment failed." },
    sr: { btn: "Kupi Odmah", processing: "Obrada...", confirm: "Potvrdi Kupovinu", msg: "Da li sigurno želiš da kupiš ovu uslugu za", error: "Greška", success: "Uspešna kupovina! Idi na profil.", login: "Prijavi se za kupovinu", selfBuy: "Ne možeš kupiti svoju uslugu.", payError: "Plaćanje nije uspelo." },
  };

  // Dinamički odabir jezika (rešava problem osvežavanja teksta)
  const currentLang = (language && language.startsWith('sr')) ? 'sr' : 'en';
  const t = txt[currentLang];

  const handleBuy = async () => {
    if (!user) {
        router.push('/auth/login');
        return;
    }
    
    if (user.username === sellerUsername) {
        alert(t.selfBuy);
        return;
    }

    // @ts-ignore
    if (typeof window === "undefined" || !window.Pi) {
        alert("Pi SDK not found.");
        return;
    }

    // Osiguravamo da je amount broj
    const finalAmount = Number(amount);

    if (!confirm(`${t.msg} ${finalAmount} Pi?`)) return;

    setLoading(true);

    try {
        // @ts-ignore
        await window.Pi.createPayment({
            amount: finalAmount,
            memo: `Kupovina: ${title.substring(0, 20)}...`,
            metadata: { serviceId, type: "service_purchase" } 
        }, {
            onReadyForServerApproval: async (paymentId: string) => {
                // Ovde SDK čeka. Ako fetch pukne, MORAMO baciti grešku da SDK prekine.
                try {
                    const response = await fetch('/api/payments/approve', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentId })
                    });
                    
                    if (!response.ok) {
                        const errData = await response.json().catch(() => ({}));
                        throw new Error(errData.error || "Server approval failed");
                    }
                } catch (err: any) {
                    console.error("Approval Error:", err);
                    throw err; // OVO JE KLJUČNO: Baca grešku nazad u SDK da prekine spinner
                }
            },
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                try {
                    const res = await fetch('/api/payments/complete', { 
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            serviceId,
                            amount: finalAmount,
                            sellerUsername,
                            buyerUsername: user.username,
                            paymentId,
                            txid
                        })
                    });

                    if (!res.ok) throw new Error("Server completion failed");

                    alert(`🎉 ${t.success}`);
                    router.push('/profile');
                    router.refresh();
                } catch (err: any) {
                    console.error("Completion Error:", err);
                    throw err;
                }
            },
            onCancel: () => {
                setLoading(false);
            },
            onError: (error: any) => {
                setLoading(false);
                alert(`${t.payError} (${error.message || error})`);
            }
        });

    } catch (error: any) {
        setLoading(false);
        if (!error.message?.includes("cancelled")) {
            alert(`${t.error}: ${error.message}`);
        }
    }
  };

  return (
    <Button 
        onClick={handleBuy} 
        disabled={loading}
        className="w-full h-12 text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95 rounded-xl"
    >
        {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> {t.processing}</>
        ) : (
            <><ShoppingCart className="mr-2 h-5 w-5"/> {user ? t.btn : t.login}</>
        )}
    </Button>
  );
}
