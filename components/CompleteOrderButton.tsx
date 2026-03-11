"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";

interface Props {
  orderId: string;
  amount: number;
  sellerWallet: string;
}

export default function CompleteOrderButton({ orderId, amount, sellerWallet }: Props) {
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();
  const { language } = useLanguage();

  const txt: any = {
    en: {
        btn: "Confirm Receipt",
        loading: "Processing...",
        alertNoWallet: "⚠️ The seller has not connected their Pi Wallet yet. Please contact support.",
        confirmMsg: "Do you confirm the job is done? This will transfer funds to the seller.",
        success: "🎉 Success! Funds transferred to seller.",
        error: "Error: "
    },
    sr: {
        btn: "Potvrdi Prijem",
        loading: "Obrada...",
        alertNoWallet: "⚠️ Prodavac još nije povezao svoj Pi Wallet. Kontaktiraj podršku.",
        confirmMsg: "Da li potvrđuješ da je posao završen? Ovo prebacuje novac prodavcu.",
        success: "🎉 Uspešno! Novac je prebačen prodavcu.",
        error: "Greška: "
    },
    hi: {
        btn: "रसीद की पुष्टि करें",
        loading: "प्रसंस्करण...",
        alertNoWallet: "⚠️ विक्रेता ने अभी तक अपना Pi वॉलेट कनेक्ट नहीं किया है। कृपया सहायता से संपर्क करें।",
        confirmMsg: "क्या आप पुष्टि करते हैं कि काम हो गया है? इससे विक्रेता को धन हस्तांतरित हो जाएगा।",
        success: "🎉 सफलता! विक्रेता को धन हस्तांतरित कर दिया गया।",
        error: "त्रुटि: "
    },
    zh: {
        btn: "确认收货",
        loading: "处理中...",
        alertNoWallet: "⚠️ 卖家尚未连接其 Pi 钱包。请联系客服。",
        confirmMsg: "您确认工作已完成吗？这将把资金转给卖家。",
        success: "🎉 成功！资金已转给卖家。",
        error: "错误: "
    },
    tw: {
        btn: "確認收貨",
        loading: "處理中...",
        alertNoWallet: "⚠️ 賣家尚未連接其 Pi 錢包。請聯繫客服。",
        confirmMsg: "您確認工作已完成嗎？這將把資金轉給賣家。",
        success: "🎉 成功！資金已轉給賣家。",
        error: "錯誤: "
    },
    id: {
        btn: "Konfirmasi Penerimaan",
        loading: "Memproses...",
        alertNoWallet: "⚠️ Penjual belum menghubungkan Dompet Pi mereka. Silakan hubungi dukungan.",
        confirmMsg: "Apakah Anda mengonfirmasi bahwa pekerjaan telah selesai? Ini akan mentransfer dana ke penjual.",
        success: "🎉 Sukses! Dana ditransfer ke penjual.",
        error: "Kesalahan: "
    },
    ko: {
        btn: "수령 확인",
        loading: "처리 중...",
        alertNoWallet: "⚠️ 판매자가 아직 Pi 지갑을 연결하지 않았습니다. 고객 지원팀에 문의하세요.",
        confirmMsg: "작업이 완료되었음을 확인하십니까? 판매자에게 자금이 이체됩니다.",
        success: "🎉 성공! 판매자에게 자금이 이체되었습니다.",
        error: "오류: "
    },
    de: {
        btn: "Empfang bestätigen",
        loading: "Verarbeitung...",
        alertNoWallet: "⚠️ Der Verkäufer hat seine Pi-Wallet noch nicht verbunden. Bitte kontaktieren Sie den Support.",
        confirmMsg: "Bestätigen Sie, dass die Arbeit erledigt ist? Dadurch werden Gelder an den Verkäufer überwiesen.",
        success: "🎉 Erfolg! Gelder an den Verkäufer überwiesen.",
        error: "Fehler: "
    },
    ru: {
        btn: "Подтвердить получение",
        loading: "Обработка...",
        alertNoWallet: "⚠️ Продавец еще не подключил свой кошелек Pi. Пожалуйста, обратитесь в поддержку.",
        confirmMsg: "Вы подтверждаете, что работа выполнена? Средства будут переведены продавцу.",
        success: "🎉 Успешно! Средства переведены продавцу.",
        error: "Ошибка: "
    },
    fr: {
        btn: "Confirmer la réception",
        loading: "Traitement...",
        alertNoWallet: "⚠️ Le vendeur n'a pas encore connecté son portefeuille Pi. Veuillez contacter le support.",
        confirmMsg: "Confirmez-vous que le travail est terminé ? Cela transférera les fonds au vendeur.",
        success: "🎉 Succès ! Fonds transférés au vendeur.",
        error: "Erreur : "
    }
  };

  const T = (key: string) => {
    const dict = txt[language] || txt['en'];
    return dict[key] || txt['en'][key];
  };

  const handleClick = async () => {
    setIsAnimating(true);
    setTimeout(() => executeLogic(), 500);
  };

  const executeLogic = async () => {
    setIsAnimating(false);

    console.log("🛒 POKUŠAJ ISPLATE:", { orderId, amount, sellerWallet });

    if (!sellerWallet || sellerWallet.length < 20 || !sellerWallet.startsWith('G')) {
        alert(`${T('alertNoWallet')}\n(Wallet: ${sellerWallet})`);
        return;
    }

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

        const text = await res.text();
        console.log("📩 Odgovor sa servera:", text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error("Server je vratio nevalidan odgovor: " + text);
        }

        if (!res.ok || data.error) {
            throw new Error(data.error || "Nepoznata greška pri isplati.");
        }

        alert(`${T('success')}\nHash: ${data.txHash}`);
        router.refresh(); 

    } catch (error: any) {
        console.error("❌ Greška u CompleteOrderButton:", error);
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
                ? "scale-110 bg-purple-800 text-white ring-4 ring-purple-200"
                : "bg-purple-600 hover:bg-purple-700 text-white hover:scale-105"
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
