"use client"
import { useState } from "react";

export default function PopraviPocetnu() {
  const [status, setStatus] = useState("Spremno. Klikni na dugme.");

  const ocistiNalog = async () => {
    setStatus("Inicijalizacija...");
    try {
        // @ts-ignore
        if (!window.Pi) return setStatus("❌ Pi SDK nije pronađen.");
        // @ts-ignore
        await window.Pi.init({ version: "2.0", sandbox: false });

        // @ts-ignore
        await window.Pi.createPayment({
            amount: 0.01,
            memo: "Dijagnostika",
            metadata: { type: "test" }
        }, {
            onReadyForServerApproval: () => setStatus("Nema zapelih! Odustani u Pi prozoru."),
            onReadyForServerCompletion: () => setStatus("Završeno."),
            onCancel: () => setStatus("Otkazano."),
            onError: (error: any) => setStatus("❌ Greška pri testu: " + error.message),
            onIncompletePaymentFound: (payment: any) => {
                const pid = payment.identifier;
                setStatus(`Pronađen zaglavljen ID:\n${pid}\n\nŠaljem zahtev serveru...`);
                
                fetch('/api/payments/resolve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId: pid })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setStatus(`✅ USPEH! Novčanik je odglavljen.\nAkcija: ${data.action}`);
                    } else {
                        // Ispisujemo direktnu grešku sa servera
                        setStatus(`❌ SERVER ODBIO!\nRazlog: ${data.error}`);
                    }
                })
                .catch(err => setStatus(`❌ Mrežna greška: ${err.message}`));
            }
        });
    } catch (err: any) {
        setStatus("❌ Fatalna greška: " + err.message);
    }
  };

  return (
    <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-6">
        <div className="text-center font-bold text-gray-800 bg-white p-6 rounded-xl shadow-sm w-full max-w-md border border-gray-200 whitespace-pre-wrap break-all">
            {status}
        </div>
        <button 
            onClick={ocistiNalog}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-wide"
        >
            DIJAGNOSTIKA I ČIŠĆENJE
        </button>
    </div>
  );
}
