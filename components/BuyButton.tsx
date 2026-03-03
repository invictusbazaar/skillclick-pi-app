"use client"

import { useState } from "react"
import { Loader2, ShieldCheck, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    Pi: any;
  }
}

export default function BuyButton({ listingId, price, sellerId, onSuccess }: any) {
  const [step, setStep] = useState(1); // 1 = Provera, 2 = Spreman za kupovinu
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState("");

  const addLog = (msg: string) => setLog(prev => prev + "\n" + msg);

  // --- KORAK 1: SAMO PROVERA I ČIŠĆENJE (BEZ KUPOVINE) ---
  const handleCheckAndClean = async () => {
    setLoading(true);
    setLog("Povezivanje sa Pi mrežom...");

    if (!window.Pi) {
        addLog("GREŠKA: Pi SDK nije učitan.");
        setLoading(false);
        return;
    }

    try {
        // Authenticate - Ovo služi SAMO da vidimo da li ima zombi transakcija
        const scopes = ['payments'];
        
        // OVO JE KLJUČ: onIncompletePaymentFound se šalje u AUTHENTICATE, ne u createPayment
        const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
        
        addLog(`Korisnik verifikovan: ${auth.user.username}`);
        addLog("Nisu pronađene stare transakcije. Sistem je čist.");
        setLoading(false);
        setStep(2); // Prelazimo na kupovinu

    } catch (err: any) {
        setLoading(false);
        addLog("Auth Greška: " + err.message);
        // Čak i ako auth pukne, možda je očistio nešto usput
    }
  };

  // --- OVO JE FUNKCIJA KOJA BRIŠE ---
  const onIncompletePaymentFound = async (payment: any) => {
      addLog(`!!! PRONAĐENO SMEĆE !!! ID: ${payment.identifier}`);
      addLog("Šaljem zahtev za brisanje...");
      
      try {
          await fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ paymentId: payment.identifier })
          });
          addLog("✅ USPEŠNO OBRISANO! Osvežavam stranicu...");
          setTimeout(() => window.location.reload(), 1000);
      } catch (e: any) {
          addLog("Greška pri brisanju: " + e.message);
      }
  };

  // --- KORAK 2: PRAVA KUPOVINA ---
  const handleBuy = async () => {
      setLoading(true);
      addLog("Pokrećem kupovinu...");

      try {
          await window.Pi.createPayment({
              amount: price,
              memo: `Service: ${listingId}`,
              metadata: { listingId, sellerId, type: 'service_purchase' }
          }, {
              onReadyForServerApproval: (paymentId: string) => {
                  addLog("Odobravanje...");
                  fetch('/api/payments/approve', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ paymentId })
                  });
              },
              onServerApproval: (paymentId: string, txid: string) => {
                  addLog("Završeno!");
                  fetch('/api/payments/complete', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ paymentId, txid })
                  });
                  if (onSuccess) onSuccess();
              },
              onCancel: () => {
                  setLoading(false);
                  addLog("Korisnik otkazao.");
              },
              onError: (error: any, payment: any) => {
                  setLoading(false);
                  addLog("GREŠKA: " + (error.message || error));
                  if (payment) onIncompletePaymentFound(payment);
              }
          });
      } catch (e: any) {
          setLoading(false);
          addLog("Catch: " + e.message);
      }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* LOG EKRAN */}
      <div className="bg-black text-green-400 p-2 rounded text-xs font-mono h-24 overflow-auto border border-green-700">
          > SYSTEM READY...
          {log.split('\n').map((l, i) => <div key={i}>{l}</div>)}
      </div>

      {step === 1 ? (
          <Button 
            onClick={handleCheckAndClean} 
            disabled={loading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-6 text-lg rounded-xl"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck className="mr-2" /> 1. PROVERI I OČISTI</>}
          </Button>
      ) : (
          <Button 
            onClick={handleBuy} 
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl"
          >
             {loading ? <Loader2 className="animate-spin" /> : <><ShoppingCart className="mr-2" /> 2. KUPI ODMAH</>}
          </Button>
      )}
    </div>
  );
}
