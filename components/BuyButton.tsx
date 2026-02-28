"use client"

import { useState, useEffect } from "react";
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
  const { t } = useLanguage(); 
  const router = useRouter();

  // 🔥 FIX: Automatska provera zaglavljenih transakcija pri učitavanju
  useEffect(() => {
    // @ts-ignore
    if (typeof window !== "undefined" && window.Pi) {
        // @ts-ignore
        window.Pi.authenticate(['payments'], onIncompletePaymentFound);
    }
  }, []);

  const onIncompletePaymentFound = async (payment: any) => {
      console.log("⚠️ DETEKTOVANA ZAGLAVLJENA TRANSAKCIJA:", payment.identifier);
      
      try {
          await fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId: payment.identifier })
          });
          
          // @ts-ignore
          if (payment.transaction) {
              // Ako transakcija postoji lokalno, pokušajmo da je završimo i na klijentu
              // ali backend je glavni autoritet.
          }
          
          console.log("✅ Komanda za čišćenje poslata.");
          // Opcionalno: osveži stranicu da SDK 'shvati' promenu
          // window.location.reload(); 
      } catch (err) {
          console.error("Greška pri čišćenju transakcije:", err);
      }
  };

  const handleBuy = async () => {
    if (!user) {
        router.push('/auth/login');
        return;
    }
    
    if (user.username === sellerUsername) {
        alert(t('buySelfError') || "Ne možete kupiti sopstvenu uslugu.");
        return;
    }

    // @ts-ignore
    if (typeof window === "undefined" || !window.Pi) {
        alert("Pi SDK nije pronađen. Molimo otvorite u Pi Browser-u.");
        return;
    }

    if (!confirm(`${t('confirmBuyMsg') || "Da li ste sigurni da želite da kupite ovo za"} ${amount} Pi?`)) return;

    setLoading(true);

    try {
        // @ts-ignore
        const payment = await window.Pi.createPayment({
            amount: amount,
            memo: `${t('memoPurchase') || "Kupovina"}: ${title}`, 
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
                        serviceId,
                        amount,
                        sellerUsername,
                        buyerUsername: user.username,
                        paymentId,
                        txid
                    })
                });

                if (!res.ok) throw new Error("Greška pri čuvanju porudžbine na našem serveru.");

                alert(`🎉 ${t('buySuccess') || "Uspešno!"}`);
                router.push('/profile');
                router.refresh();
            },
            onCancel: (paymentId: string) => {
                setLoading(false);
                console.log("Plaćanje otkazano.", paymentId);
            },
            onError: (error: any, payment: any) => {
                setLoading(false);
                console.error("Pi SDK Greška pri plaćanju:", error, payment);
                
                // Ako je greška "Pending payment", pokušaj ponovo triggerovati čišćenje
                if (error.toString().includes("pending payment")) {
                    alert("Postoji transakcija na čekanju. Sistem pokušava da je reši...");
                    // @ts-ignore
                    window.Pi.authenticate(['payments'], onIncompletePaymentFound);
                }
            }
            // NAPOMENA: onIncompletePaymentFound je uklonjen odavde jer tu ne radi
        });

    } catch (error: any) {
        console.error("Pi.createPayment uhvaćena greška:", error);
        setLoading(false);
        if (error.toString().includes("pending payment")) {
             alert("Sistem je detektovao zaglavljenu transakciju. Osvežite stranicu za minut.");
             // @ts-ignore
             window.Pi.authenticate(['payments'], onIncompletePaymentFound);
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
            <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> {t('processing') || "Obrada..."}</>
        ) : (
            <><ShoppingCart className="mr-2 h-5 w-5"/> {user ? (t('buyBtn') || "Kupi") : (t('loginToBuy') || "Prijavi se za kupovinu")}</>
        )}
    </Button>
  );
}
