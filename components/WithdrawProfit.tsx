"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet, ArrowRight } from "lucide-react";

export default function WithdrawProfit() {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
        alert("❌ Unesi validan iznos veći od 0.");
        return;
    }

    if (!confirm(`Da li si siguran da želiš da prebaciš ${numAmount} Pi na svoj lični novčanik?`)) return;

    setLoading(true);

    try {
        const res = await fetch('/api/admin/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: numAmount })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Došlo je do greške.");

        alert(`✅ USPEŠNO PREBAČENO!\n\nTX Hash: ${data.txHash}`);
        setAmount(""); // Čistimo polje nakon uspeha

    } catch (e: any) {
        console.error(e);
        alert("❌ GREŠKA: " + e.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4 mt-6">
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <Wallet className="h-6 w-6"/>
            </div>
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Povuci profit</p>
                <p className="text-sm text-gray-900">Prebaci Pi na lični Wallet</p>
            </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
            <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Unesi iznos (npr. 10)"
                className="border border-gray-300 rounded-xl px-4 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0.01"
                step="0.01"
            />
            <Button 
                onClick={handleWithdraw} 
                disabled={loading || !amount}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 h-auto rounded-xl flex items-center gap-2 transition"
            >
                {loading ? <Loader2 className="animate-spin h-4 w-4"/> : <ArrowRight className="h-4 w-4"/>}
                Isplati
            </Button>
        </div>
    </div>
  );
}