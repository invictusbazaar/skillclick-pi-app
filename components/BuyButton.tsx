"use client"

import { useState } from "react"
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

// Definišemo da window ima Pi objekat
declare global {
  interface Window {
    Pi: any;
  }
}

export default function BuyButton({ listingId, price, sellerId, onSuccess }: any) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    // 1. Odmah blokiramo dugme
    setLoading(true);

    // 2. Provera da li Pi postoji
    if (typeof window === "undefined" || !window.Pi) {
       alert("Pi mreža nije detektovana. Osveži stranicu.");
       setLoading(false);
       return;
    }

    try {
      // 3. Inicijalizacija (Bez try-catcha, neka pukne ako ne valja)
      // Koristimo najosnovniju inicijalizaciju
      window.Pi.init({ version: "2.0", sandbox: false });

      // 4. Autentifikacija
      // Ovde NE STAVLJAMO incomplete handler, da ne zbunjujemo SDK
      const auth = await window.Pi.authenticate(['payments'], {
          onIncompletePaymentFound: (payment: any) => {
              // Samo logujemo, ne prekidamo proces
              console.log("Nezavršena transakcija:", payment);
              fetch('/api/payments/incomplete', {
                  method: 'POST',
                  body: JSON.stringify({ paymentId: payment.identifier })
              });
          }
      });

      console.log("Korisnik verifikovan:", auth.user.username);

      // 5. DEFINISANJE POVRATNIH FUNKCIJA (CALLBACKS)
      // Ovo je ključ. Pravimo const objekat TAČNO kako SDK traži.
      const paymentCallbacks = {
          onReadyForServerApproval: (paymentId: string) => {
              console.log("Faza 1: Odobravanje", paymentId);
              fetch('/api/payments/approve', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId })
              });
          },
          onServerApproval: (paymentId: string, txid: string) => {
              console.log("Faza 2: Završeno", txid);
              fetch('/api/payments/complete', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ paymentId, txid })
              });
              if (onSuccess) onSuccess();
          },
          onCancel: (paymentId: string) => {
              console.log("Otkazano", paymentId);
              setLoading(false);
          },
          onError: (error: any, payment: any) => {
              console.error("Greška:", error);
              setLoading(false);
              // Filtriramo grešku "user cancelled" da ne plašimo korisnika
              if (error && !JSON.stringify(error).includes("cancelled")) {
                  alert("Sistemska greška: " + (error.message || error));
              }
          }
      };

      // 6. KREIRANJE PLAĆANJA
      // Prosleđujemo objekat koji smo upravo napravili
      await window.Pi.createPayment({
        amount: price,
        memo: `Usluga: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' }
      }, paymentCallbacks);

    } catch (err: any) {
      console.error("Critical Error:", err);
      setLoading(false);
      // Ako korisnik otkaže, to nije greška za alert
      if (!err.message?.includes("user cancelled")) {
          alert("Greška pri pokretanju: " + err.message);
      }
    }
  };

  return (
    <Button
      onClick={handleBuy}
      disabled={loading}
      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg"
    >
      {loading ? (
         <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Povezivanje...</>
      ) : (
         <><ShoppingCart className="mr-2 h-5 w-5" /> Kupi Odmah</>
      )}
    </Button>
  );
}
