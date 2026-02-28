"use client"

import { useState, useEffect } from "react";
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
  const { user } = useAuth();
  const { t } = useLanguage(); 
  const router = useRouter();

  // Ovo je zajednička funkcija za čišćenje
  const handleCleanup = async (paymentId: string) => {
      alert(`⚙️ Pokrećem čišćenje za ID: ${paymentId}... Sačekaj trenutak.`);
      try {
          await fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId })
          });
          alert("✅ Komande poslate! Stranica se sada osvežava.");
          window.location.reload();
      } catch (e) {
          alert("Greška pri slanju, ali osvežavam svakako.");
          window.location.reload();
      }
  };

  const createPaymentConfig = (isRepair: boolean = false) => {
      return {
          amount: amount,
          memo: isRepair ? "Fixing Error" : `${t('memoPurchase') || "Kupovina"}: ${title}`, 
          metadata: { serviceId: serviceId, seller: sellerUsername },
      };
  };

  const paymentCallbacks = {
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
                  buyerUsername: user?.username,
                  paymentId,
                  txid
              })
          });
          if (!res.ok) throw new Error("Order failed");
          alert(`🎉 ${t('buySuccess') || "Uspešno!"}`);
          router.push('/profile');
          router.refresh();
      },
      onCancel: () => setLoading(false),
      onError: (error: any) => {
          setLoading(false);
          // Ako je greška vezana za pending payment, ignorišemo je ovde jer će je onIncomplete uhvatiti
          console.log("Payment Error:", error);
      },
      // 🔥 OVO JE KLJUČNO MESTO 🔥
      onIncompletePaymentFound: async (payment: any) => {
          const pId = payment.identifier;
          // Automatski pokreće čišćenje bez pitanja
          await handleCleanup(pId);
      }
  };

  const handleBuy = async () => {
    if (!user) return router.push('/auth/login');
    if (user.username === sellerUsername) return alert("Ne možete kupiti svoje.");
    // @ts-ignore
    if (typeof window === "undefined" || !window.Pi) return alert("Otvorite u Pi Browser-u.");

    setLoading(true);
    try {
        // @ts-ignore
        await window.Pi.createPayment(createPaymentConfig(false), paymentCallbacks);
    } catch (error: any) {
        setLoading(false);
        // Ako pukne odmah, verovatno je pending payment.
        console.error("Init Error:", error);
    }
  };

  // Dugme samo za popravku
  const handleForceFix = async () => {
      setLoading(true);
      try {
        // @ts-ignore
        await window.Pi.createPayment(createPaymentConfig(true), paymentCallbacks);
      } catch (e) { console.log(e); setLoading(false); }
  };

  return (
    <div className="space-y-3">
        <Button 
            onClick={handleBuy} 
            disabled={loading}
            className="w-full h-12 text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg rounded-xl"
        >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <ShoppingCart className="mr-2 h-5 w-5"/>}
            {user ? (t('buyBtn') || "Kupi") : (t('loginToBuy') || "Prijavi se")}
        </Button>

        {/* --- DUGME ZA SPAS --- */}
        {user && (
            <button 
                onClick={handleForceFix}
                className="w-full py-2 text-xs font-bold text-gray-400 uppercase tracking-widest border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-red-500 flex items-center justify-center gap-2"
            >
                <Wrench className="w-3 h-3" /> Imate problem sa plaćanjem? Kliknite ovde
            </button>
        )}
    </div>
  );
}
