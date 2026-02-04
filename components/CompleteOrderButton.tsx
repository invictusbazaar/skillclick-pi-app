"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  amount: number;
  sellerWallet: string;
}

export default function CompleteOrderButton({ orderId, amount, sellerWallet }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    // 1. Provera: Da li prodavac ima unet wallet?
    if (!sellerWallet || !sellerWallet.startsWith('G')) {
        alert("⚠️ Prodavac još nije povezao svoj Pi Wallet za isplatu. Molimo te sačekaj ili kontaktiraj podršku.");
        return;
    }

    // 2. Potvrda korisnika
    if (!confirm("Da li potvrđuješ da je posao završen? Ovo će automatski prebaciti novac prodavcu.")) return;

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

        if (!res.ok) throw new Error(data.error || "Greška pri isplati");

        alert("🎉 Uspešno! Novac je prebačen prodavcu.");
        router.refresh(); // Osvežava stranicu da pokaže novi status (Isplaćeno)

    } catch (error: any) {
        alert("Greška: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Button 
        onClick={handleComplete} 
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs font-bold shadow-sm"
    >
        {loading ? (
            <><Loader2 className="mr-2 h-3 w-3 animate-spin"/> ...</>
        ) : (
            <><ThumbsUp className="mr-2 h-3 w-3"/> Potvrdi Prijem</>
        )}
    </Button>
  );
}