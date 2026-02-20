"use client"
import { useState } from "react";

export default function PopraviPocetnu() {
  const [status, setStatus] = useState("Spremno. Klikni na dugme ispod.");

  const ocistiNalog = async () => {
    setStatus("Pokrećem Pi SDK...");
    try {
        // @ts-ignore
        if (!window.Pi) {
            setStatus("❌ Pi SDK nije pronađen. Otvori u Pi Browseru.");
            return;
        }

        // @ts-ignore
        await window.Pi.init({ version: "2.0", sandbox: false });

        const onIncompletePaymentFound = (payment: any) => {
            setStatus(`Pronađeno zapelo plaćanje: ${payment.identifier}. Pokušavam da ga očistim...`);
            fetch('/api/payments/resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    paymentId: payment.identifier,
                    txid: payment.transaction?.txid || "N/A"
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStatus("✅ Očišćeno! Novčanik je odglavljen. Možeš zatvoriti ovo i kupovati.");
                } else {
                    setStatus("❌ Greška na serveru: " + data.error);
                }
            })
            .catch(err => setStatus("❌ Mrežna greška pri komunikaciji sa serverom."));
        };

        // @ts-ignore
        await window.Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
        
        // Ako prođe auth, a ne okine callback odmah, sačekaćemo par sekundi
        setTimeout(() => {
            setStatus(prev => prev.includes("Pronađeno") ? prev : "Sistem je pregledao nalog. Ako nije ispisano 'Očišćeno', pokušaj ponovo.");
        }, 4000);

    } catch (err: any) {
        setStatus("❌ Greška: " + err.message);
    }
  };

  return (
    <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-6">
        <div className="text-center font-bold text-gray-800 bg-white p-4 rounded-xl shadow-sm w-full max-w-md border border-gray-200">
            {status}
        </div>
        <button 
            onClick={ocistiNalog}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-wide"
        >
            Očisti zapelo plaćanje
        </button>
    </div>
  );
}
