"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send, CheckCircle } from "lucide-react";

interface ReleaseProps {
  amount: number;       
  sellerWallet: string; 
  orderId: string;       
}

export default function ReleaseFundsButton({ amount, sellerWallet, orderId }: ReleaseProps) {
  const [loading, setLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const handleRelease = async () => {
    // Provera: Da li adresa počinje sa G? (Sada čita direktno iz baze!)
    if (!sellerWallet || !sellerWallet.startsWith('G')) {
        alert(`❌ STOP: U bazi ne postoji ispravna Wallet adresa za ovog prodavca.\n\nPodatak u bazi: ${sellerWallet}`);
        return;
    }

    const confirmMsg = `POTVRDA ISPLATE:\n\nPrimalac: ${sellerWallet.substring(0,6)}...${sellerWallet.substring(sellerWallet.length-4)}\nIznos: ${(amount * 0.95).toFixed(2)} Pi\n\nDa li želiš da izvršiš isplatu?`;
    
    if(!confirm(confirmMsg)) return;

    setLoading(true);

    try {
        const res = await fetch('/api/payout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: amount,
                sellerWalletAddress: sellerWallet, // Šaljemo adresu iz baze
                orderId: orderId
            })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Došlo je do greške.");

        alert(`✅ USPEŠNO ISPLAĆENO!\n\nTX Hash: ${data.txHash}\n(Sačuvaj ovaj Hash kao dokaz)`);
        setIsPaid(true);

    } catch (e: any) {
        console.error(e);
        alert("❌ GREŠKA: " + e.message);
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
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-xs px-3"
    >
        {loading ? <Loader2 className="animate-spin mr-2 h-3 w-3"/> : <Send className="mr-2 h-3 w-3"/>}
        Isplati (95%)
    </Button>
  );
}
