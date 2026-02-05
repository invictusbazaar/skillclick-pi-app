"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, CreditCard } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext"; // ✅ Uvozimo jezik
import { useRouter } from "next/navigation";

interface Props {
  amount: number;
  serviceId: string;
  title: string;
  sellerUsername: string;
}

export default function BuyButton({ amount, serviceId, title, sellerUsername }: Props) {
  const [loading, setLoading] = useState(false);
  const { user } = require("@/components/AuthContext").useAuth(); // Inline require da izbegnemo ciklus ako treba, ili standard import
  const { language } = useLanguage(); 
  const router = useRouter();

  // --- PREVODI ---
  const txt: any = {
    en: { btn: "Buy Now", processing: "Processing...", confirm: "Confirm Purchase", msg: "Are you sure you want to buy this service for", error: "Error", success: "Order created!", login: "Login to Buy" },
    sr: { btn: "Kupi Odmah", processing: "Obrada...", confirm: "Potvrdi Kupovinu", msg: "Da li sigurno želiš da kupiš ovu uslugu za", error: "Greška", success: "Porudžbina kreirana!", login: "Prijavi se za kupovinu" },
    zh: { btn: "立即购买", processing: "处理中...", confirm: "确认购买", msg: "您确定要购买此服务吗", error: "错误", success: "订单已创建！", login: "登录购买" },
    hi: { btn: "Abhi Kharidein", processing: "Process ho raha hai...", confirm: "Kharidari Pushti Karen", msg: "Kya aap is seva ko kharidna chahte hain", error: "Galti", success: "Order ban gaya!", login: "Login karein" },
    tw: { btn: "立即購買", processing: "處理中...", confirm: "確認購買", msg: "您確定要購買此服務嗎", error: "錯誤", success: "訂單已創建！", login: "登錄購買" },
    id: { btn: "Beli Sekarang", processing: "Memproses...", confirm: "Konfirmasi Pembelian", msg: "Anda yakin ingin membeli layanan ini seharga", error: "Error", success: "Pesanan dibuat!", login: "Masuk untuk Membeli" }
  };
  const T = (key: string) => txt[language]?.[key] || txt['en'][key];

  const handleBuy = async () => {
    if (!user) {
        router.push('/auth/login');
        return;
    }

    if (!confirm(`${T('msg')} ${amount} Pi?`)) return;

    setLoading(true);

    // Simulacija plaćanja (ili prava Pi logika ovde)
    try {
        // 1. Kreiraj Order u bazi
        const res = await fetch('/api/orders/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                serviceId,
                amount,
                sellerUsername
            })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");

        alert(`🎉 ${T('success')}`);
        router.push('/profile'); // Vodi na profil da vidi kupovinu

    } catch (error: any) {
        alert(`${T('error')}: ` + error.message);
    } finally {
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
