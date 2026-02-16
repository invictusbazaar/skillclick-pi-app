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
    en: { btn: "Buy Now", processing: "Processing...", confirm: "Confirm Purchase", msg: "Are you sure you want to buy this service for", error: "Error", success: "Order created successfully!", login: "Login to Buy", selfBuy: "You cannot buy your own service." },
    sr: { btn: "Kupi Odmah", processing: "Obrada...", confirm: "Potvrdi Kupovinu", msg: "Da li sigurno želiš da kupiš ovu uslugu za", error: "Greška", success: "Uspešna kupovina! Idi na profil.", login: "Prijavi se za kupovinu", selfBuy: "Ne možeš kupiti svoju uslugu." },
    zh: { btn: "立即购买", processing: "处理中...", confirm: "确认购买", msg: "您确定要购买此服务吗", error: "错误", success: "订单创建成功！", login: "登录购买", selfBuy: "您不能购买自己的服务。" },
    hi: { btn: "Abhi Kharidein", processing: "Process ho raha hai...", confirm: "Kharidari Pushti Karen", msg: "Kya aap is seva ko kharidna chahte hain", error: "Galti", success: "Order safal!", login: "Login karein", selfBuy: "Apni seva nahi kharid sakte." },
    tw: { btn: "立即購買", processing: "處理中...", confirm: "確認購買", msg: "您確定要購買此服務嗎", error: "錯誤", success: "訂單創建成功！", login: "登錄購買", selfBuy: "您不能購買自己的服務。" },
    id: { btn: "Beli Sekarang", processing: "Memproses...", confirm: "Konfirmasi Pembelian", msg: "Anda yakin ingin membeli layanan ini seharga", error: "Error", success: "Pesanan berhasil!", login: "Masuk untuk Membeli", selfBuy: "Anda tidak dapat membeli layanan sendiri." }
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

    if (!confirm(`${T('msg')} ${amount} Pi?`)) return;

    setLoading(true);

    // Provera da li se aplikacija pokreće unutar Pi Browsera
    // @ts-ignore
    if (typeof window !== "undefined" && window.Pi) {
        try {
            // @ts-ignore
            const Pi = window.Pi;
            
            Pi.createPayment({
                amount: amount,
                memo: `Usluga: ${title}`,
                metadata: { serviceId, sellerUsername, buyerUsername: user.username },
            }, {
                onReadyForServerApproval: async (paymentId: string) => {
                    // 1. Aplikacija traži od tvog servera odobrenje za početak transakcije
                    const res = await fetch('/api/payments/approve', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentId })
                    });
                    if (!res.ok) throw new Error("Server nije odobrio transakciju.");
                },
                onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                    // 2. Aplikacija obaveštava tvoj server da je uplata prošla i da upiše u bazu
                    const res = await fetch('/api/payments/complete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentId, txid, serviceId, amount, sellerUsername, buyerUsername: user.username })
                    });
                    if (!res.ok) throw new Error("Greška pri završetku transakcije.");
                    
                    alert(`🎉 ${T('success')}`);
                    setLoading(false);
                    router.push('/profile');
                    router.refresh();
                },
                onCancel: (paymentId: string) => {
                    setLoading(false);
                },
                onError: (error: any, payment: any) => {
                    setLoading(false);
                    alert(`${T('error')}: ` + error.message);
                }
            });
        } catch (error: any) {
            setLoading(false);
            alert(`${T('error')}: ` + error.message);
        }
    } else {
        // FALLBACK ZA PC: Ako testiraš sa kompjutera gde nema Pi novčanika, 
        // zadržavamo stari način kako bi i dalje mogao da proveravaš dizajn.
        try {
            const res = await fetch('/api/orders', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceId, amount, sellerUsername, buyerUsername: user.username })
            });
            
            if (!res.ok) throw new Error("Došlo je do greške.");
            alert(`🎉 Test kupovina uspešna (PC režim)`);
            router.push('/profile'); 
            router.refresh();
        } catch (error: any) {
            alert(`${T('error')}: ` + error.message);
        } finally {
            setLoading(false);
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
            <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> {T('processing')}</>
        ) : (
            <><ShoppingCart className="mr-2 h-5 w-5"/> {user ? T('btn') : T('login')}</>
        )}
    </Button>
  );
}
