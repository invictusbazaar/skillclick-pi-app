"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Wrench } from "lucide-react";
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
  const [fixing, setFixing] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage(); 
  const router = useRouter();

  const txt: any = {
    en: { btn: "Buy Now", processing: "Processing...", msg: "Are you sure you want to buy this service for", error: "Error", success: "Order created successfully!", login: "Login to Buy", selfBuy: "You cannot buy your own service." },
    sr: { btn: "Kupi Odmah", processing: "Obrada...", msg: "Da li sigurno želiš da kupiš ovu uslugu za", error: "Greška", success: "Uspešna kupovina! Idi na profil.", login: "Prijavi se za kupovinu", selfBuy: "Ne možeš kupiti svoju uslugu." },
  };
  const T = (key: string) => txt[language]?.[key] || txt['en'][key];

  // NORMALAN PROCES KUPOVINE
  const handleBuy = async () => {
    if (!user) return router.push('/auth/login');
    if (user.username === sellerUsername) return alert(T('selfBuy'));
    
    // @ts-ignore
    if (typeof window === "undefined" || !window.Pi) return alert("Pi SDK not found.");
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
                    body: JSON.stringify({ serviceId, amount, sellerUsername, buyerUsername: user.username, paymentId, txid })
                });
                if (!res.ok) throw new Error("Greška pri čuvanju porudžbine.");
                alert(`🎉 ${T('success')}`);
                router.push('/profile');
                router.refresh();
            },
            onCancel: () => setLoading(false),
            onError: (error: any) => {
                setLoading(false);
                alert("Plaćanje nije uspelo. Ako ti piše 'Pending payment', klikni na dugme 'Odglavi transakciju' ispod.");
            }
        });
    } catch (error: any) {
        alert(`${T('error')}: ` + error.message);
        setLoading(false);
    }
  };

  // FUNKCIJA ZA ČIŠĆENJE ZAGLAVLJENIH TRANSAKCIJA
  const handleFixPending = async () => {
    setFixing(true);
    try {
        // @ts-ignore
        await window.Pi.authenticate(['payments'], async (payment: any) => {
            alert(`Pronađeno plaćanje ID: ${payment.identifier}. Šaljem zahtev serveru za brisanje...`);
            
            const res = await fetch('/api/payments/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId: payment.identifier })
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                // SADA ĆEMO KONAČNO VIDETI PRAVU GREŠKU!
                alert(`❌ Server greška: ${data.error}`);
            } else {
                alert("✅ Transakcija je USPEŠNO OBRISANA. Sada možeš da kupiš oglas.");
            }
        });
    } catch (err: any) {
        alert("Greška SDK: " + err.message);
    }
    setFixing(false);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
        <Button 
            onClick={handleBuy} 
            disabled={loading || fixing}
            className="w-full h-12 text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 transition-all rounded-xl"
        >
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> {T('processing')}</> : <><ShoppingCart className="mr-2 h-5 w-5"/> {user ? T('btn') : T('login')}</>}
        </Button>

        {user && (
            <Button 
                onClick={handleFixPending} 
                disabled={loading || fixing}
                variant="outline"
                className="w-full text-red-500 border-red-200 hover:bg-red-50 transition-all rounded-xl"
            >
                {fixing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wrench className="mr-2 h-4 w-4"/>}
                Odglavi transakciju
            </Button>
        )}
    </div>
  );
}
