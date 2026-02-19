"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

interface DisputeProps {
  orderId: string;
  amount: number;
}

export default function AdminDisputeButtons({ orderId, amount }: DisputeProps) {
  const [loadingAction, setLoadingAction] = useState<"refund" | "release" | null>(null);

  const handleAction = async (actionType: "refund" | "release") => {
    const isRefund = actionType === "refund";
    const confirmMsg = isRefund 
        ? `🚨 REFUNDACIJA KUPCU 🚨\n\nKupcu će biti vraćeno punih ${amount} Pi.\nDa li ste sigurni?`
        : `✅ ISPLATA PRODAVCU ✅\n\nProdavcu će biti uplaćeno ${(amount * 0.95).toFixed(2)} Pi (95%).\nDa li ste sigurni?`;

    if (!confirm(confirmMsg)) return;

    setLoadingAction(actionType);

    try {
        const res = await fetch('/api/admin/resolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, actionType })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Greška pri obradi!");

        alert(`✅ TRANSAKCIJA USPEŠNA!\n\nStatus: ${data.status}\nTX Hash: ${data.txHash}`);
        
        // Osvežavamo stranicu da sklonimo dugmiće
        window.location.reload(); 
    } catch (e: any) {
        console.error(e);
        alert("❌ GREŠKA: " + e.message);
    } finally {
        setLoadingAction(null);
    }
  };

  return (
    <div className="flex gap-2 justify-end w-full mt-2">
        <Button 
            onClick={() => handleAction("refund")} 
            disabled={loadingAction !== null}
            variant="outline"
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border-red-200 text-xs font-bold h-8"
        >
            {loadingAction === "refund" ? <Loader2 className="animate-spin mr-1 h-3 w-3"/> : <AlertCircle className="mr-1 h-3 w-3"/>}
            Refundiraj
        </Button>
        <Button 
            onClick={() => handleAction("release")} 
            disabled={loadingAction !== null}
            variant="outline"
            className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 border-green-200 text-xs font-bold h-8"
        >
            {loadingAction === "release" ? <Loader2 className="animate-spin mr-1 h-3 w-3"/> : <AlertCircle className="mr-1 h-3 w-3"/>}
            Oslobodi
        </Button>
    </div>
  );
}