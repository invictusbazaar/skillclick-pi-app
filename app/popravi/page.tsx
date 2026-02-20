"use client"
import { useState } from "react";

export default function PopraviPocetnu() {
  const [status, setStatus] = useState("Spremno. Klikni na dugme ispod.");

  const ocistiNalog = async () => {
    setStatus("Inicijalizacija i provociranje SDK-a...");
    try {
        // @ts-ignore
        if (!window.Pi) {
            setStatus("❌ Pi SDK nije pronađen.");
            return;
        }

        // @ts-ignore
        await window.Pi.init({ version: "2.0", sandbox: false });

        setStatus("Pokušavam da pokrenem test kupovinu da isprovociram grešku...");

        // Pokrećemo lažnu kupovinu da nateramo SDK da izbaci "pending payment" i okine funkciju
        // @ts-ignore
        await window.Pi.createPayment({
            amount: 0.01,
            memo: "Sistemsko ciscenje",
            metadata: { type: "cleanup" }
        }, {
            onReadyForServerApproval: (paymentId: string) => {
                setStatus("Nema zapelih plaćanja! Odustani od ove test kupovine u Pi prozoru.");
            },
            onReadyForServerCompletion: (paymentId: string, txid: string) => {
                setStatus("Završeno test plaćanje.");
            },
            onCancel: () => setStatus("Otkazano test plaćanje."),
            onError: (error: any) => {
                setStatus("❌ Greška: " + error.message);
            },
            onIncompletePaymentFound: (payment: any) => {
                setStatus(`🎯 UHVAĆEN! Čistim transakciju: ${payment.identifier}...`);
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
                        setStatus("✅ OČIŠĆENO! Novčanik je potpuno odglavljen. Možeš da nastaviš rad.");
                    } else {
                        setStatus("❌ Greška na serveru pri čišćenju: " + data.error);
                    }
                })
                .catch(err => setStatus("❌ Mrežna greška."));
            }
        });

    } catch (err: any) {
        setStatus("❌ Greška: " + err.message);
    }
  };

  return (
    <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-6">
        <div className="text-center font-bold text-gray-800 bg-white p-4 rounded-xl shadow-sm w-full max-w-md border border-gray-200 min-h-[100px] flex items-center justify-center">
            {status}
        </div>
        <button 
            onClick={ocistiNalog}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-wide"
        >
            ISPROVOCIRAJ I OČISTI
        </button>
    </div>
  );
}
