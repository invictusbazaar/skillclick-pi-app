"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  amount: number;
  sellerWallet: string; // Adresa prodavca
}

export default function CompleteOrderButton({ orderId, amount, sellerWallet }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    // Provera da li prodavac ima wallet
    if (!sellerWallet || !sellerWallet.startsWith('G')) {
        alert("Prodavac još nije povezao svoj novčanik. Molimo kontaktirajte podršku.");
        return;
    }

    if (!confirm("Da li potvrđuješ da je usluga izvršena? Ovo će automatski prebaciti novac prodavcu.")) return;

    setLoading(true);

    try {
        // Pozivamo istu API rutu koju koristiš i ti u Admin panelu
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
        router.refresh(); // Osveži stranicu da se vidi novi status

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
        className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
    >
        {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Procesuiranje...</>
        ) : (
            <><ThumbsUp className="mr-2 h-4 w-4"/> Potvrdi Prijem & Isplati</>
        )}
    </Button>
  );
}