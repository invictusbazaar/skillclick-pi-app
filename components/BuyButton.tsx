"use client"

import { useState } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    Pi: any;
  }
}

export default function BuyButton({ listingId, price, sellerId, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleBuy = async () => {
    setLoading(true);
    setStatus("1. Povezivanje...");

    if (!window.Pi) {
       alert("Pi SDK nije učitan. Osveži stranicu.");
       setLoading(false);
       return;
    }

    try {
      // 1. INICIJALIZACIJA
      try { window.Pi.init({ version: "2.0", sandbox: false }); } catch (_) {}

      // 2. AUTENTIFIKACIJA (OVO JE FALILO!)
      // Moramo se prvo "javiti" serveru pre nego što tražimo pare.
      // Koristimo onIncompletePaymentFound ovde da očistimo eventualno smeće usput.
      const auth = await window.Pi.authenticate(['payments'], onIncompletePaymentFound);
      console.log("Korisnik:", auth.user.username);
      
      setStatus("2. Kreiranje zahteva...");

      // 3. PRIPREMA PODATAKA
      const paymentData = {
        amount: price,
        memo: `Usluga: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' }
      };

      // 4. DEFINISANJE POSEBNIH FUNKCIJA (SVE UKLJUČENE)
      const callbacks = {
          onReadyForServerApproval: function(paymentId: string) {
              setStatus("Odobravanje...");
              fetch('/api/payments/approve', {
                 method: 'POST',
                 headers: {'Content-Type': 'application/json'},
                 body: JSON.stringify({ paymentId })
              });
          },
          onServerApproval: function(paymentId: string, txid: string) {
              setStatus("Završavanje...");
              fetch('/api/payments/complete', {
                 method: 'POST',
                 headers: {'Content-Type': 'application/json'},
                 body: JSON.stringify({ paymentId, txid })
              });
              if (onSuccess) onSuccess();
          },
          onCancel: function(paymentId: string) {
              setLoading(false);
              setStatus("");
          },
          onError: function(error: any, payment: any) {
              setLoading(false);
              console.error("Pi Error:", error);
              // Ako SDK prijavi grešku, prikazujemo je, osim ako nije user cancelled
              if (!error.message?.includes("cancelled")) {
                  alert("GREŠKA: " + (error.message || error));
              }
              if (payment) onIncompletePaymentFound(payment);
          },
          // DODATO I OVDE ZA SVAKI SLUČAJ
          onIncompletePaymentFound: function(payment: any) {
              onIncompletePaymentFound(payment);
          }
      };

      // 5. POZIV ZA KUPOVINU
      setStatus("3. Otvaram novčanik...");
      await window.Pi.createPayment(paymentData, callbacks);

    } catch (err: any) {
      setLoading(false);
      // Ako korisnik otkaže u Auth fazi, nije strašno
      if (!err.message?.includes("user cancelled")) {
         alert("Sistemska greška: " + err.message);
      }
    }
  };

  // Pomoćna funkcija za čišćenje (ako zatreba)
  const onIncompletePaymentFound = (payment: any) => {
      console.log("Čistim transakciju:", payment.identifier);
      fetch('/api/payments/incomplete', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ paymentId: payment.identifier })
      });
  };

  return (
    <div className="w-full">
        {/* Mali status tekst da vidiš dokle je stigao */}
        {status && <div className="text-xs text-center text-gray-500 mb-2">{status}</div>}
        
        <Button
          onClick={handleBuy}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg"
        >
          {loading ? (
             <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Molim sačekajte...</>
          ) : (
             <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah</>
          )}
        </Button>
    </div>
  );
}
