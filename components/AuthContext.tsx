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

  const syncUserToDatabase = async (username: string, uid?: string) => {
    try {
        await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, uid }) 
        });
    } catch (error) {
        console.error("Greška pri sinhronizaciji:", error);
    }
  };

  useEffect(() => {
    // 1. Učitaj korisnika iz keša da ne traži login svaki put
    const savedUser = localStorage.getItem("pi_user");
    if (savedUser) {
        try {
            setUser(JSON.parse(savedUser));
            // 🚨 UKLONILI SMO setIsLoading(false) ODAVDE! 🚨
            // Sada dugme ostaje na "Povezivanje..." sve dok se Pi SDK potpuno ne učita sa 'payments' dozvolom.
        } catch (e) { console.error(e); }
    }

    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        setTimeout(() => {
            const adminData = { username: ADMIN_USERNAME, isAdmin: true };
            setUser(adminData);
            localStorage.setItem("pi_user", JSON.stringify(adminData));
            setIsLoading(false);
        }, 500);
        return; 
    }

    let attempts = 0;

    const initPiNetwork = () => {
        // @ts-ignore
        if (typeof window !== "undefined" && window.Pi) {
            // @ts-ignore
            const Pi = window.Pi;

            const onIncompletePaymentFound = async (payment: any) => {
                console.log("🧹 AUTO-CLEAN: Detektovana zaglavljena transakcija:", payment.identifier);
                try {
                    await fetch('/api/payments/incomplete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentId: payment.identifier })
                    });
                    console.log("✅ AUTO-CLEAN: Uspešno očišćeno.");
                } catch (err) {
                    console.error("Greška pri automatskom čišćenju:", err);
                }
            };

            // IZMENA: sandbox postavljeno na true za dobijanje koda!
            Pi.init({ version: "2.0", sandbox: true });
            
            // 2. Tražimo obe dozvole (username i payments)
            Pi.authenticate(['username', 'payments'], onIncompletePaymentFound)
                .then((res: any) => {
                    const u = res.user;
                    const userData = { username: u.username, isAdmin: u.username === ADMIN_USERNAME };
                    
                    localStorage.setItem("pi_user", JSON.stringify(userData));
                    setUser(userData);
                    syncUserToDatabase(u.username, u.uid);
                    
                    // ✅ TEK OVDE OSLOBAĐAMO DUGME (Kada imamo sigurnu dozvolu)
                    setIsLoading(false);
                })
                .catch((err: any) => {
                    console.error("Auth error:", err);
                    setIsLoading(false);
                });
        } else {
            attempts++;
            if (attempts < 10) {
                setTimeout(initPiNetwork, 300);
            } else {
                setIsLoading(false);
            }
        }
    };

    initPiNetwork();

  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
