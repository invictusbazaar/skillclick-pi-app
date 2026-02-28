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
  const [syncing, setSyncing] = useState(false); // Novo stanje za tihu popravku
  const { user } = useAuth();
  const { t, language } = useLanguage(); 
  const router = useRouter();

  const txt: any = {
    en: { btn: "Buy Now", processing: "Processing...", syncing: "Syncing System...", confirm: "Confirm Purchase", msg: "Are you sure you want to buy this service for", error: "Error", success: "Order created successfully!", login: "Login to Buy", selfBuy: "You cannot buy your own service.", payError: "Payment failed.", syncDone: "System synced. Please try buying again." },
    sr: { btn: "Kupi Odmah", processing: "Obrada...", syncing: "Sinhronizacija...", confirm: "Potvrdi Kupovinu", msg: "Da li sigurno želiš da kupiš ovu uslugu za", error: "Greška", success: "Uspešna kupovina! Idi na profil.", login: "Prijavi se za kupovinu", selfBuy: "Ne možeš kupiti svoju uslugu.", payError: "Plaćanje nije uspelo.", syncDone: "Sistem osvežen. Pokušaj ponovo." },
  };
  const T = (key: string) => txt[language]?.[key] || txt['en'][key];

  // 🔥 NEVIDLJIVI ČISTAČ
  const runSilentFix = async () => {
    setSyncing(true);
    console.log("🔧 Pokrećem tihu popravku...");
    
    // @ts-ignore
    if (window.Pi) {
        try {
            // @ts-ignore
            await window.Pi.authenticate(['payments'], async (payment: any) => {
                console.log("Pronadjena zaglavljena transakcija:", payment.identifier);
                await fetch('/api/payments/incomplete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId: payment.identifier })
                });
                console.log("✅ Očišćeno.");
            });
        } catch (e) {
            console.error("Silent fix error:", e);
        }
    }
    
    setTimeout(() => {
        setSyncing(false);
        setLoading(false);
        alert(T('syncDone'));
        window.location.reload(); // Kratko osvežavanje da SDK bude 100% čist
    }, 2000);
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
        alert("Pi SDK not found.");
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
                if (!res.ok) throw new Error("Server Error");
                alert(`🎉 ${T('success')}`);
                router.push('/profile');
                router.refresh();
            },
            onCancel: () => { setLoading(false); },
            onError: (error: any) => {
                // 🔥 AUTO-HEAL LOGIKA
                const msg = error.message || error.toString();
                if (msg.toLowerCase().includes("pending")) {
                    console.log("⚠️ Detektovan pending bug. Pokrećem fix...");
                    runSilentFix(); // <--- OVDE SE DEŠAVA MAGIJA
                } else {
                    setLoading(false);
                    alert(`${T('payError')}: ${msg}`);
                }
            },
            onIncompletePaymentFound: async (payment: any) => {
                // I ovde hvatamo ako SDK sam prijavi
                await fetch('/api/payments/incomplete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId: payment.identifier })
                });
                runSilentFix();
            }
        });

    } catch (error: any) {
        // I ovde hvatamo grešku pri inicijalizaciji
        if (error.message && error.message.toLowerCase().includes("pending")) {
             runSilentFix();
        } else {
             setLoading(false);
             alert(`${T('error')}: ${error.message}`);
        }
    }
  };

  return (
    <Button 
        onClick={handleBuy} 
        disabled={loading || syncing}
        className="w-full h-12 text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95 rounded-xl"
    >
        {syncing ? (
             <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> {T('syncing')}</>
        ) : loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> {T('processing')}</>
        ) : (
            <><ShoppingCart className="mr-2 h-5 w-5"/> {user ? T('btn') : T('login')}</>
        )}
    </Button>
  );
}
