"use client"

import { createContext, useContext, useState, useEffect } from "react"

const ADMIN_USERNAME = "Ilija1969";

type User = {
  username: string;
  isAdmin: boolean;
} | null;

const AuthContext = createContext<{ user: User; isLoading: boolean }>({ user: null, isLoading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 DODATO: Funkcija za tihu registraciju u bazu sada prima i opciono 'uid'
  const syncUserToDatabase = async (username: string, uid?: string) => {
    try {
        await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, uid }) // ✅ Sada šaljemo i uid na backend
        });
    } catch (error) {
        console.error("Greška pri sinhronizaciji sa bazom:", error);
    }
  };

  useEffect(() => {
    // 1. PROVERA: Da li smo na kompjuteru (localhost)?
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        console.log("🖥️ PC DETEKTOVAN: Forsiram login kao Admin...");
        setTimeout(() => {
            const adminUser = "Ilija1969";
            setUser({ username: adminUser, isAdmin: true });
            syncUserToDatabase(adminUser, "mock-admin-uid-123"); // 🚀 TIHA REGISTRACIJA sa test uid-om
            setIsLoading(false);
            console.log("✅ Ulogovan si kao: " + adminUser);
        }, 500);
        return; 
    }

    // 2. Ako nismo na PC-u, probaj Pi Network (za telefon)
    // @ts-ignore
    if (typeof window !== "undefined" && window.Pi) {
        // @ts-ignore
        const Pi = window.Pi;
        Pi.init({ version: "2.0", sandbox: false }).then(() => {
            
            // 🚀 DODATO: Funkcija za automatsko čišćenje zapelih plaćanja
            const onIncompletePaymentFound = (payment: any) => {
                console.log("⚠️ Pronađeno zapelo plaćanje:", payment);
                // Šaljemo podatke backendu da ga odglavi (kroz /complete ili endpoint za rešavanje)
                fetch('/api/payments/resolve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        paymentId: payment.identifier, 
                        txid: payment.transaction?.txid || "N/A" 
                    })
                }).catch(err => console.error("Greška pri čišćenju zapelog plaćanja:", err));
            };

            // Ubacujemo našu funkciju kao drugi parametar u authenticate
            Pi.authenticate(['username', 'payments'], onIncompletePaymentFound).then((res: any) => {
                const u = res.user;
                setUser({ username: u.username, isAdmin: u.username === ADMIN_USERNAME });
                syncUserToDatabase(u.username, u.uid); // 🚀 TIHA REGISTRACIJA sada hvata pravi Pi uid!
                setIsLoading(false);
            }).catch(() => setIsLoading(false));
        }).catch(() => setIsLoading(false));
    } else {
        setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
