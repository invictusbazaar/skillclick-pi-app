"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ThumbsUp, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext"; // ✅ Uvozimo jezik

interface Props {
  orderId: string;
  amount: number;
  sellerWallet: string;
}

export default function CompleteOrderButton({ orderId, amount, sellerWallet }: Props) {
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false); // ✅ State za animaciju
  const router = useRouter();
  const { language } = useLanguage(); // ✅ Koristimo jezik iz konteksta

  // --- PREVODI ZA DUGME I PORUKE ---
  const txt: any = {
    en: {
        btn: "Confirm Receipt",
        loading: "Processing...",
        alertNoWallet: "⚠️ The seller has not connected their Pi Wallet yet. Please wait or contact support.",
        confirmMsg: "Do you confirm the job is done? This will transfer funds to the seller.",
        success: "🎉 Success! Funds transferred to seller.",
        error: "Error: "
    },
    sr: {
        btn: "Potvrdi Prijem",
        loading: "Obrada...",
        alertNoWallet: "⚠️ Prodavac još nije povezao svoj Pi Wallet za isplatu. Molimo te sačekaj ili kontaktiraj podršku.",
        confirmMsg: "Da li potvrđuješ da je posao završen? Ovo će automatski prebaciti novac prodavcu.",
        success: "🎉 Uspešno! Novac je prebačen prodavcu.",
        error: "Greška: "
    },
    zh: {
        btn: "确认收货",
        loading: "处理中...",
        alertNoWallet: "⚠️ 卖家尚未连接 Pi 钱包。请稍候或联系支持。",
        confirmMsg: "您确认工作已完成吗？这将把资金转给卖家。",
        success: "🎉 成功！资金已转给卖家。",
        error: "错误: "
    },
    hi: {
        btn: "Prapti ki Pushti Karen",
        loading: "Process ho raha hai...",
        alertNoWallet: "⚠️ Seller ne abhi tak Pi Wallet connect nahi kiya hai.",
        confirmMsg: "Kya aap confirm karte hain ki kaam pura ho gaya hai?",
        success: "🎉 Safal! Paise seller ko bhej diye gaye.",
        error: "Galti: "
    },
    tw: {
        btn: "確認收貨",
        loading: "處理中...",
        alertNoWallet: "⚠️ 賣家尚未連接 Pi 錢包。請稍候或聯繫支持。",
        confirmMsg: "您確認工作已完成嗎？這將把資金轉給賣家。",
        success: "🎉 成功！資金已轉給賣家。",
        error: "錯誤: "
    },
    id: {
        btn: "Konfirmasi Penerimaan",
        loading: "Memproses...",
        alertNoWallet: "⚠️ Penjual belum menghubungkan Dompet Pi.",
        confirmMsg: "Apakah Anda mengonfirmasi pekerjaan selesai?",
        success: "🎉 Berhasil! Dana ditransfer ke penjual.",
        error: "Kesalahan: "
    }
  };

  // Helper za prevod (fallback na engleski)
  const T = (key: string) => {
    const dict = txt[language] || txt['en'];
    return dict[key] || txt['en'][key];
  };

  const handleClick = async () => {
    // 1. POKREĆEMO ANIMACIJU (Kao na jeziku)
    setIsAnimating(true);

    // Čekamo 500ms da se efekat vidi pre nego što bilo šta uradimo
    setTimeout(() => {
        executeLogic();
    }, 500);
  };

  const executeLogic = async () => {
    // Gasimo animaciju
    setIsAnimating(false);

    // 2. Provera Walleta
    if (!sellerWallet || !sellerWallet.startsWith('G')) {
        alert(T('alertNoWallet'));
        return;
    }

    // 3. Potvrda korisnika (Browser Dialog)
    if (!confirm(T('confirmMsg'))) return;

    setLoading(true);

    try {
        const res = await fetch('/api/payout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: amount,
                sellerWalletAddress: sellerWallet,
                orderId: orderId
            })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error");

        alert(T('success'));
        router.refresh(); 

    } catch (error: any) {
        alert(T('error') + error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Button 
        onClick={handleClick} 
        disabled={loading}
        className={`
            h-9 text-xs font-bold shadow-md transition-all duration-300 transform
            ${isAnimating 
                ? "scale-110 bg-purple-800 text-white ring-4 ring-purple-200"  // EFEKAT NA KLIK
                : "bg-purple-600 hover:bg-purple-700 text-white hover:scale-105" // OBIČNO STANJE
            }
        `}
    >
        {loading ? (
            <><Loader2 className="mr-2 h-3 w-3 animate-spin"/> {T('loading')}</>
        ) : (
            <><ThumbsUp className="mr-2 h-3 w-3"/> {T('btn')}</>
        )}
    </Button>
  );
}