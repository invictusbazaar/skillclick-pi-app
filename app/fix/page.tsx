"use client"

import { useState, useEffect } from "react"

declare global {
  interface Window { Pi: any; }
}

export default function FixPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [jsonResult, setJsonResult] = useState<any>(null);

  const log = (msg: string) => setLogs(p => [...p, msg]);

  useEffect(() => {
    runScan();
  }, []);

  const runScan = async () => {
    log("Inicijalizacija...");
    
    if (!window.Pi) {
        log("Pi SDK nije učitan. Osveži stranicu.");
        return;
    }

    try {
        try { window.Pi.init({ version: "2.0", sandbox: false }); } catch(e) {}
        
        log("Tražim zaglavljene transakcije (Authenticate)...");
        
        // Koristimo onIncompletePaymentFound da nađemo ID
        const auth = await window.Pi.authenticate(['payments'], async (payment: any) => {
            log(`PRONAĐEN ID: ${payment.identifier}`);
            log("Šaljem na pametno čišćenje...");
            
            // Šaljemo na naš backend
            const res = await fetch('/api/debug/fix', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ paymentId: payment.identifier })
            });
            
            const data = await res.json();
            setJsonResult(data);
            log("GOTOVO! Pogledaj rezultat ispod.");
        });

        log(`Korisnik: ${auth.user.username}`);
        log("Skeniranje završeno. Ako se ništa nije desilo, možda nema zaglavljenih transakcija.");

    } catch (e: any) {
        log(`Greška: ${e.message}`);
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen font-mono text-sm">
      <h1 className="text-xl font-bold mb-4">ALAT ZA POPRAVKU (FIXER)</h1>
      
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="font-bold border-b mb-2">LOG SKENIRANJA:</h2>
        {logs.map((l, i) => <div key={i}>{l}</div>)}
      </div>

      {jsonResult && (
        <div className="bg-black text-green-400 p-4 rounded shadow overflow-auto">
            <h2 className="font-bold border-b border-green-600 mb-2">REZULTAT SERVERA:</h2>
            <pre>{JSON.stringify(jsonResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}