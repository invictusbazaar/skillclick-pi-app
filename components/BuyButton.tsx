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

  // --- KORAK 1: PROBUDI SDK I PROVERI (OVO TI RADI!) ---
  const handleCheckAndClean = async () => {
    setLoading(true);
    setLog("Startujem...");

    if (!window.Pi) {
        addLog("CRVENO: Pi Skripta nije učitana!");
        setLoading(false);
        return;
    }

    try {
        addLog("Inicijalizacija...");
        try { window.Pi.init({ version: "2.0", sandbox: false }); } catch (e) {}

        addLog("Autentifikacija...");
        const auth = await window.Pi.authenticate(['payments'], onIncompletePaymentFound);
        
        addLog(`✅ Povezano! Korisnik: ${auth.user.username}`);
        setLoading(false);
        setStep(2); // Prelazimo na kupovinu

    } catch (err: any) {
        setLoading(false);
        addLog("Greška pri povezivanju: " + err.message);
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

  // --- KORAK 2: KUPOVINA (POPRAVLJENO) ---
  const handleBuy = async () => {
      setLoading(true);
      addLog("Pripremam podatke...");

      const paymentData = {
          amount: price,
          memo: `Usluga: ${listingId}`,
          metadata: { listingId, sellerId, type: 'service_purchase' }
      };

      // === PROMENA: PAKUJEMO FUNKCIJE U VARIJABLU ===
      // Ovako SDK mora da ih vidi jer su definisane pre poziva
      const paymentCallbacks = {
          onReadyForServerApproval: function(paymentId: string) {
              addLog("Status: Odobravanje...");
              fetch('/api/payments/approve', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId })
              });
          },
          onServerApproval: function(paymentId: string, txid: string) {
              addLog("Status: ZAVRŠENO!");
              fetch('/api/payments/complete', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId, txid })
              });
              if (onSuccess) onSuccess();
          },
          onCancel: function(paymentId: string) {
              setLoading(false);
              addLog("Status: Otkazano.");
          },
          onError: function(error: any, payment: any) {
              setLoading(false);
              addLog("GREŠKA: " + (error.message || error));
              if (payment) onIncompletePaymentFound(payment);
          },
          onIncompletePaymentFound: function(payment: any) {
              onIncompletePaymentFound(payment);
          }
      };

      try {
          addLog("Otvaram novčanik...");
          // Šaljemo zapakovane funkcije
          await window.Pi.createPayment(paymentData, paymentCallbacks);
      } catch (e: any) {
          setLoading(false);
          addLog("Catch Greška: " + e.message);
      }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* LOG EKRAN */}
      <div className="bg-black text-green-400 p-3 rounded text-xs font-mono h-32 overflow-auto border border-green-700 shadow-inner">
          {log ? log.split('\n').map((l, i) => <div key={i} className="mb-1">{l}</div>) : "> Čekam..."}
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
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg"
          >
             {loading ? <Loader2 className="animate-spin mr-2" /> : <><ShoppingCart className="mr-2" /> 2. KUPI ODMAH</>}
          </Button>
      )}
    </div>
  );
}
