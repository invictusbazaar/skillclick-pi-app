"use client"

import { useState } from "react"
import { useLanguage } from "@/components/LanguageContext" // Ako ovo pravi problem, sklonićemo ga
import { Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    Pi: any;
  }
}

interface BuyButtonProps {
  listingId: string;
  price: number;
  sellerId: string;
  onSuccess?: () => void;
}

export default function BuyButton({ listingId, price, sellerId, onSuccess }: BuyButtonProps) {
  const { t } = useLanguage(); 
  const [loading, setLoading] = useState(false);
  const [debugMsg, setDebugMsg] = useState(""); // Za prikaz poruka na ekranu

  const handleBuy = async () => {
    setLoading(true);
    setDebugMsg("Inicijalizacija...");

    if (!window.Pi) {
       alert("Pi SDK nije učitan!");
       setLoading(false);
       return;
    }

    try {
      const paymentData = {
        amount: price,
        memo: `Service: ${listingId}`, 
        metadata: { listingId, sellerId, type: 'service_purchase' },
      };

      // === DEFINIŠEMO FUNKCIJE UNAPRED (DA BUDEMO SIGURNI) ===
      const myCallbacks = {
        onReadyForServerApproval: function(paymentId: string) {
          setDebugMsg("1. Ready Approval...");
          fetch('/api/payments/approve', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ paymentId })
          });
        },
        onServerApproval: function(paymentId: string, txid: string) {
          setDebugMsg("2. Server Approved!");
          fetch('/api/payments/complete', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ paymentId, txid })
          }).then(() => {
              if (onSuccess) onSuccess();
          });
        },
        onCancel: function(paymentId: string) {
          setLoading(false);
          setDebugMsg("Otkazano od strane korisnika.");
        },
        onError: function(error: any, payment: any) {
          setLoading(false);
          console.error("SDK Error:", error);
          
          // AKO JE GREŠKA 'CALLBACK MISSING', OVO ĆE NAM REĆI ZAŠTO
          const msg = error.message || error;
          setDebugMsg("GREŠKA: " + msg);
          
          if (msg.includes("callback") || msg.includes("pending")) {
             alert("Detektovana stara transakcija. Pokušavam da očistim...");
             // Ako imamo payment objekat, odmah čistimo
             if (payment && payment.identifier) {
                 forceCleanup(payment.identifier);
             }
          }
        },
        onIncompletePaymentFound: function(payment: any) {
          setDebugMsg("!!! PRONAĐENO SMEĆE !!!");
          // ODMAH ČISTIMO
          forceCleanup(payment.identifier);
        }
      };

      // === PROVERA PRE SLANJA ===
      // Ovo će nam reći da li React dobro vidi funkcije
      console.log("Provera callback objekta:", myCallbacks);
      
      // === POZIV SDK-A ===
      setDebugMsg("Šaljem zahtev Pi mreži...");
      
      // Ovde prosleđujemo onaj objekat koji smo gore napravili
      await window.Pi.createPayment(paymentData, myCallbacks);

    } catch (err: any) {
      setLoading(false);
      console.error("Critical Catch:", err);
      setDebugMsg("CRITICAL: " + err.message);
      
      // Ako pukne odmah, to je često znak da SDK "pamti" staro stanje
      // Pokušavamo blind cleanup
      if (err.message.includes("callback")) {
         if (confirm("Sistem prijavljuje grešku. Da li da pokušamo nasilno čišćenje?")) {
             runBlindCleanup();
         }
      }
    }
  };

  // Pomoćna funkcija za čišćenje
  const forceCleanup = async (paymentId: string) => {
      try {
          setDebugMsg("Brišem ID: " + paymentId);
          await fetch('/api/payments/incomplete', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ paymentId })
          });
          alert("Uspešno očišćeno! Stranica se osvežava.");
          window.location.reload();
      } catch (e) {
          alert("Greška pri brisanju.");
      }
  };

  // Nasilno čišćenje kad nemamo ID (Preko Authenticate)
  const runBlindCleanup = async () => {
      try {
          const auth = await window.Pi.authenticate(['payments'], async (payment: any) => {
              if (payment && payment.identifier) {
                  forceCleanup(payment.identifier);
              } else {
                  alert("Nema vidljivih transakcija. Resetujte podatke aplikacije u podešavanjima telefona.");
              }
          });
      } catch (e) {
          alert("Neuspešan pristup novčaniku.");
      }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* PRIKAZ DEBUGA DA VIDIŠ ŠTA SE DEŠAVA */}
      {debugMsg && (
          <div className="bg-yellow-100 p-2 text-xs text-black font-mono border border-yellow-300 rounded">
              LOG: {debugMsg}
          </div>
      )}

      <Button
        onClick={handleBuy}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl"
      >
        {loading ? "Radim..." : "Kupi Odmah (v3 FINAL)"}
      </Button>
    </div>
  );
}
