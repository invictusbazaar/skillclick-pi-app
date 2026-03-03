"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    Pi: any;
  }
}

export default function BuyButton({ listingId, price, sellerId, onSuccess }: any) {
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  // OVA FUNKCIJA JE KLJUČ. ONA BRIŠE SMEĆE.
  const handleCleanup = async (paymentId: string) => {
      addLog(`🚨 PRONAĐEN ZAGLAVLJEN ID: ${paymentId}`);
      addLog("⏳ Šaljem zahtev za brisanje...");
      
      try {
          const res = await fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ paymentId })
          });
          const data = await res.json();
          addLog(`✅ REZULTAT BRISANJA: ${JSON.stringify(data)}`);
          alert("TRANSAKCIJA OBRISANA! Sada osveži stranicu i probaj kupovinu.");
          window.location.reload();
      } catch (e: any) {
          addLog(`❌ GREŠKA PRI BRISANJU: ${e.message}`);
      }
  };

  const startTrap = async () => {
    setLoading(true);
    setLog(["Započinjem lov na zaglavljenu transakciju..."]);

    if (!window.Pi) {
        addLog("Pi SDK nije detektovan.");
        return;
    }

    try {
        // 1. Inicijalizacija
        try { window.Pi.init({ version: "2.0", sandbox: false }); } catch(e) {}
        
        // 2. Definišemo callbacks PRE poziva
        const callbacks = {
            onReadyForServerApproval: (paymentId: string) => { 
                addLog(`Ignorišem approval: ${paymentId}`); 
            },
            onServerApproval: (paymentId: string, txid: string) => { 
                addLog(`Ignorišem complete: ${paymentId}`); 
            },
            onCancel: (paymentId: string) => { 
                addLog(`Cancel trigger: ${paymentId}`); 
                setLoading(false);
            },
            onError: (error: any, payment: any) => {
                addLog(`⚠️ ERROR OKINUO: ${error.message}`);
                // AKO NAM OVDJE DA PAYMENT OBJEKAT, BRIŠEMO GA
                if (payment) {
                    handleCleanup(payment.identifier);
                } else {
                    addLog("Nema payment objekta u grešci. Čekam onIncomplete...");
                }
                setLoading(false);
            },
            // OVO JE ONO ŠTO NAM TREBA
            onIncompletePaymentFound: (payment: any) => {
                handleCleanup(payment.identifier);
            }
        };

        addLog("💣 Pokrećem lažnu transakciju da isprovociram grešku...");
        
        // Pokrećemo sa minimalnim iznosom samo da aktiviramo SDK
        await window.Pi.createPayment({
            amount: 0.1, 
            memo: "DEBUG TRAP",
            metadata: { type: "debug" }
        }, callbacks);

    } catch (err: any) {
        setLoading(false);
        addLog(`CATCH GREŠKA: ${err.message}`);
        
        // AKO JE GREŠKA "CALLBACK MISSING", PROBAJ OVO:
        if (err.message.includes("callback")) {
            addLog("⚠️ SDK se žali na callbackove. Pokušavam alternativni metod preko AUTH...");
            try {
                await window.Pi.authenticate(['payments'], (payment: any) => {
                    handleCleanup(payment.identifier);
                });
            } catch (authErr) {
                addLog("Ni Auth nije uspeo.");
            }
        }
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="bg-black text-green-400 p-4 rounded text-xs font-mono h-48 overflow-auto border-2 border-green-600">
          {log.length === 0 ? "> SPREMAN ZA ČIŠĆENJE..." : log.map((l, i) => <div key={i}>{l}</div>)}
      </div>

      <Button 
        onClick={startTrap}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-xl rounded-xl animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.5)]"
      >
        {loading ? "LOVIM GREŠKU..." : "🚨 POKRENI ČIŠĆENJE 🚨"}
      </Button>
    </div>
  );
}
