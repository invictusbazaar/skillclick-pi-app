"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button"; // Proveri da li je ova putanja tacna kod tebe
import { Loader2, Send, CheckCircle, AlertTriangle } from "lucide-react";

interface ReleaseProps {
  amount: number;       
  sellerWallet: string; // ✅ PROMENJENO: Usaglašeno sa Admin stranicom (bilo je sellerAddress)
  orderId: string;       
}

export default function ReleaseFundsButton({ amount, sellerWallet, orderId }: ReleaseProps) {
  const [loading, setLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const handleRelease = async () => {
    // Provera da li postoji wallet adresa pre slanja
    if (!sellerWallet) {
        alert("❌ Greška: Prodavac nema unetu Pi Wallet adresu/Username!");
        return;
    }

    const confirmMsg = `POTVRDA ISPLATE:\n\nUkupno: ${amount} Pi\nProdavcu ide (95%): ${(amount * 0.95).toFixed(2)} Pi\nTebi ostaje (5%): ${(amount * 0.05).toFixed(2)} Pi\n\nPrimalac: ${sellerWallet}\n\nDa li želiš da izvršiš isplatu?`;
    
    if(!confirm(confirmMsg)) return;

    setLoading(true);

    try {
        const res = await fetch('/api/payout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: amount,
                sellerWalletAddress: sellerWallet, // Šaljemo podatak koji backend očekuje
                orderId: orderId
            })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Došlo je do greške.");

        alert(`✅ USPEŠNO ISPLAĆENO!\n\nTX Hash: ${data.txHash || 'N/A'}\nProdavac je dobio: ${data.paidAmount} Pi`);
        setIsPaid(true);

    } catch (e: any) {
        console.error(e);
        alert("❌ GREŠKA PRI ISPLATI: " + e.message);
    } finally {
        setLoading(false);
    }
  };

  if (isPaid) {
      return (
          <Button disabled className="bg-green-100 text-green-700 border border-green-200 font-bold h-8 text-xs">
              <CheckCircle className="mr-2 h-3 w-3" /> Isplaćeno
          </Button>
      );
  }

  return (
    <Button 
        onClick={handleRelease} 
        disabled={loading}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-xs px-3 shadow-sm transition-all"
    >
        {loading ? (
            <><Loader2 className="animate-spin mr-2 h-3 w-3"/> ...</>
        ) : (
            <><Send className="mr-2 h-3 w-3"/> Isplati (95%)</>
        )}
    </Button>
  );
}