"use client"

import { useState } from "react";
import { Star, Loader2, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageContext";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  myUsername: string;
  targetRole: "Buyer" | "Seller"; 
}

export default function ReviewModal({ orderId, myUsername, targetRole }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { language } = useLanguage();
  const router = useRouter();

  const txt: any = {
    en: { btn: "Leave Review", title: `Rate the ${targetRole}`, placeholder: "Describe your experience...", submit: "Submit Review", success: "Thanks for your feedback!", close: "Close" },
    sr: { btn: "Ostavi Ocenu", title: `Ocenite ${targetRole === 'Buyer' ? 'Kupca' : 'Prodavca'}`, placeholder: "Opišite vaše iskustvo...", submit: "Pošalji Ocenu", success: "Hvala na oceni!", close: "Zatvori" },
    zh: { btn: "评价用户", title: `评价 ${targetRole === 'Buyer' ? '买家' : '卖家'}`, placeholder: "描述您的体验...", submit: "提交评价", success: "感谢您的反馈！", close: "关闭" },
    hi: { btn: "Review Dein", title: "Rate karein", placeholder: "Apna anubhav likhein...", submit: "Bhejein", success: "Dhanyavad!", close: "Band karein" },
    tw: { btn: "評價用戶", title: `評價 ${targetRole === 'Buyer' ? '買家' : '賣家'}`, placeholder: "描述您的體驗...", submit: "提交評價", success: "感謝您的反饋！", close: "關閉" },
    id: { btn: "Beri Ulasan", title: "Nilai Pengguna", placeholder: "Tulis pengalaman Anda...", submit: "Kirim", success: "Terima kasih!", close: "Tutup" }
  };
  const T = (key: string) => txt[language]?.[key] || txt['en'][key];

  const handleSubmit = async () => {
    if (rating === 0) return alert("Molim vas izaberite broj zvezdica!");
    setLoading(true);

    try {
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId,
                rating,
                comment,
                authorUsername: myUsername
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Greška");
        }

        alert(T('success'));
        setIsOpen(false);
        router.refresh(); 

    } catch (e: any) {
        alert("Greška: " + e.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline" 
        size="sm" 
        className="gap-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50 bg-white"
      >
        <Star className="w-4 h-4 fill-yellow-400" /> {T('btn')}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                
                <div className="bg-yellow-50 p-4 border-b border-yellow-100 flex justify-between items-center">
                    <h3 className="font-bold text-yellow-800 text-lg flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-600 text-yellow-600"/> 
                        {T('title')}
                    </h3>
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-yellow-100 rounded-full text-yellow-800 transition">
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center gap-6">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                                key={star}
                                className={`w-10 h-10 cursor-pointer transition-all duration-200 ${
                                    star <= (hoverRating || rating) 
                                    ? "fill-yellow-400 text-yellow-400 scale-110 drop-shadow-sm" 
                                    : "text-gray-200 hover:text-gray-300"
                                }`}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        {rating > 0 ? `${rating} / 5` : "Izaberi ocenu"}
                    </p>

                    <div className="w-full relative">
                        <MessageSquare className="absolute top-3 left-3 w-5 h-5 text-gray-400"/>
                        <textarea 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={T('placeholder')}
                            className="w-full pl-10 p-3 min-h-[100px] rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none resize-none bg-gray-50 font-medium text-gray-900"
                        />
                    </div>

                    <Button 
                        onClick={handleSubmit} 
                        disabled={loading || rating === 0}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl h-12 text-lg shadow-lg shadow-yellow-200"
                    >
                        {loading ? <Loader2 className="animate-spin"/> : T('submit')}
                    </Button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}
