"use client"

import { useState } from "react"
import { Loader2, ShieldCheck, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    Pi: any;
  }
}

export default function BuyButton({ listingId, price, sellerId, onSuccess }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState("");

  const addLog = (msg: string) => setLog(prev => prev + "\n" + msg);

  // --- KORAK 1: PROBUDI SDK I PROVERI ---
  const handleCheckAndClean = async () => {
    setLoading(true);
    setLog("Startujem...");

    if (!window.Pi) {
        addLog("CRVENO: Pi Skripta nije učitana u layout.tsx!");
        setLoading(false);
        return;
    }

    try {
        // === OVO JE FALILO: INICIJALIZACIJA ===
        addLog("Inicijalizujem Pi SDK (v2.0)...");
        try {
            // Pokušavamo da inicijalizujemo. Ako je već inicijalizovan, ovo može baciti grešku, pa hvatamo.
            window.Pi.init({ version: "2.0", sandbox: false }); 
            // NAPOMENA: Ako testiraš u Sandboxu, stavi sandbox: true gore ^
        } catch (initErr) {
            console.log("Init info (možda već pokrenut):", initErr);
        }

        // === SADA ZOVEMO AUTHENTICATE SA TIMEOUT-om ===
        addLog("Povezivanje sa korisnikom...");
        
        // Trik: Ako authenticate ne odgovori za 10 sekundi, prekidamo ga da ne vrti zauvek
        const authPromise = window.Pi.authenticate(['payments'], onIncompletePaymentFound);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout: Pi Browser ne odgovara.")), 15000)
        );

        const auth: any = await Promise.race([authPromise, timeoutPromise]);
        
        addLog(`✅ Povezano! Korisnik: ${auth.user.username}`);
        addLog("Sistem je spreman. Možete kupiti.");
        setLoading(false);
        setStep(2); // Otključavamo dugme za kupovinu

    } catch (err: any) {
        setLoading(false);
        addLog("GREŠKA PRI POVEZIVANJU: " + err.message);
        addLog("Savet: Proveri da li je ovaj URL dodat u Pi Developer Portal.");
    }
  };

  // --- ČISTAČ ---
  const onIncompletePaymentFound = async (payment: any) => {
      addLog(`⚠️ PRONAĐENO SMEĆE: ${payment.identifier}`);
      
      try {
          await fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ paymentId: payment.identifier })
          });
          addLog("🗑️ Obrisano! Osvežavam...");
          setTimeout(() => window.location.reload(), 1000);
      } catch (e: any) {
          addLog("Greška pri brisanju: " + e.message);
      }
  };

  // --- KORAK 2: KUPOVINA ---
  const handleBuy = async () => {
      setLoading(true);
      addLog("Kreiram plaćanje...");

      try {
          await window.Pi.createPayment({
              amount: price,
              memo: `Usluga: ${listingId}`,
              metadata: { listingId, sellerId, type: 'service_purchase' }
          }, {
              onReadyForServerApproval: (paymentId: string) => {
                  addLog("1/2 Odobravanje...");
                  fetch('/api/payments/approve', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ paymentId })
                  });
              },
              onServerApproval: (paymentId: string, txid: string) => {
                  addLog("2/2 Završeno!");
                  fetch('/api/payments/complete', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ paymentId, txid })
                  });
                  if (onSuccess) onSuccess();
              },
              onCancel: () => {
                  setLoading(false);
                  addLog("Otkazano.");
              },
              onError: (error: any, payment: any) => {
                  setLoading(false);
                  addLog("GREŠKA: " + (error.message || error));
                  if (payment) onIncompletePaymentFound(payment);
              }
          });
      } catch (e: any) {
          setLoading(false);
          addLog("Catch Greška: " + e.message);
      }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* LOG EKRAN */}
      <div className="bg-black text-green-400 p-3 rounded text-xs font-mono h-32 overflow-auto border border-green-700 shadow-inner">
          {log ? log.split('\n').map((l, i) => <div key={i} className="mb-1">{l}</div>) : "> Čekam komandu..."}
      </div>

      {step === 1 ? (
          <Button 
            onClick={handleCheckAndClean} 
            disabled={loading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <><ShieldCheck className="mr-2" /> 1. POVEŽI SE</>}
          </Button>
      ) : (
          <Button 
            onClick={handleBuy} 
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg animate-pulse"
          >
             {loading ? <Loader2 className="animate-spin mr-2" /> : <><ShoppingCart className="mr-2" /> 2. KUPI ODMAH</>}
          </Button>
      )}
    </div>
  );
}
