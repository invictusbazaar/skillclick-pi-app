"use client"
import { useEffect, useState } from "react";

export default function PopraviPocetnu() {
  const [status, setStatus] = useState("Inicijalizacija...");

  useEffect(() => {
    // @ts-ignore
    if (window.Pi) {
      // @ts-ignore
      window.Pi.init({ version: "2.0", sandbox: false }).then(() => {
        // @ts-ignore
        window.Pi.authenticate(['payments'], (payment: any) => {
          setStatus("Pronađeno zapelo plaćanje! Pokušavam da popravim...");
          fetch('/api/payments/resolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId: payment.identifier })
          }).then(() => setStatus("USPEH! Nalog je odglavljen. Sada možeš da obrišeš ovaj fajl i kupuješ normalno."));
        }).then(() => setStatus("Nema zapelih plaćanja. Ako i dalje imaš grešku, Pi Browser kešira stari prozor."));
      });
    }
  }, []);

  return <div className="p-10 text-center font-bold">{status}</div>;
}