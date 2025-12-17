"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"

// Definicija za Pi
declare global {
  interface Window {
    Pi: any;
  }
}

function HomeContent() {
  const [logs, setLogs] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  
  // Funkcija za dodavanje teksta na ekran
  const addLog = (msg: string) => {
    setLogs(prev => [`${new Date().toLocaleTimeString().split(' ')[0]}: ${msg}`, ...prev]);
  };

  const piInitRan = useRef(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (piInitRan.current) return;
    piInitRan.current = true;

    const startPi = async () => {
      try {
        addLog("🚀 POČETAK: Tražim Pi...");

        // 1. Čekamo skriptu
        if (!window.Pi) {
          addLog("⚠️ Nema Pi. Čekam 1 sekundu...");
          await new Promise(r => setTimeout(r, 1000));
        }

        if (!window.Pi) {
          addLog("❌ KRAJ: Pi SDK nije pronađen. Proveri internet.");
          return;
        }

        // 2. Init
        addLog("⚙️ Radim Pi.init...");
        await window.Pi.init({ version: "2.0", sandbox: true });
        addLog("✅ Init završen.");

        // 3. Auth - IZMENJENO: TRAŽIMO SAMO USERNAME
        addLog("🔐 Tražim Auth (samo Username)...");
        
        // 👇 OVDE JE BILA GREŠKA - IZBACIO SAM 'PAYMENTS'
        const scopes = ['username']; 
        
        const auth = await window.Pi.authenticate(scopes, (p: any) => addLog("Plaćanje nađeno"));
        
        addLog(`👤 USPEH: Korisnik je ${auth.user.username}`);
        setUser(auth.user);

      } catch (err: any) {
        addLog(`❌ GREŠKA: ${err.message || err}`);
      }
    };

    // Učitaj skriptu ako fali
    if (!window.Pi) {
      const s = document.createElement('script');
      s.src = "https://sdk.minepi.com/pi-sdk.js";
      s.async = true;
      s.onload = () => startPi();
      document.head.appendChild(s);
    } else {
      startPi();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-mono p-4">
      
      {/* CRVENA DEBUG KUTIJA */}
      <div className="border-2 border-red-500 bg-black p-4 rounded-lg mb-6">
        <h1 className="text-xl font-bold text-red-500 border-b border-gray-700 mb-2">
          DEBUG KONZOLA v3 (Samo Username)
        </h1>
        <div className="space-y-1 text-sm text-green-400">
          {logs.length === 0 ? "Čekam pokretanje..." : logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>

      {/* STATUS KORISNIKA */}
      <div className="p-4 bg-gray-800 rounded-lg text-center">
        {user ? (
          <div>
             <h2 className="text-2xl text-green-500 font-bold mb-2">🎉 ULOGOVAN: {user.username}</h2>
             <p className="text-gray-400">UID: {user.uid}</p>
          </div>
        ) : (
          <h2 className="text-xl text-yellow-500 animate-pulse">Nisi ulogovan...</h2>
        )}
      </div>

    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-white p-5">Učitavam...</div>}>
      <HomeContent />
    </Suspense>
  )
}