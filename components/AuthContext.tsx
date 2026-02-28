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

  // Funkcija za sinhronizaciju sa bazom
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
            setIsLoading(false);
        } catch (e) { console.error(e); }
    }

    // 2. PC Detekcija (za testiranje)
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        setTimeout(() => {
            if (!savedUser) { // Samo ako nije već ulogovan
                const adminData = { username: ADMIN_USERNAME, isAdmin: true };
                setUser(adminData);
                localStorage.setItem("pi_user", JSON.stringify(adminData));
                setIsLoading(false);
            }
        }, 500);
        return; 
    }

    // 3. PI NETWORK LOGIKA (Telefon)
    // @ts-ignore
    if (typeof window !== "undefined" && window.Pi) {
        // @ts-ignore
        const Pi = window.Pi;

        // 🔥 OVO JE KLJUČNO ZA TVOJ PROBLEM
        // Ova funkcija se poziva automatski ako Pi nađe zaglavljenu transakciju pri startu
        const onIncompletePaymentFound = async (payment: any) => {
            console.log("🧹 AUTO-CLEAN: Detektovana zaglavljena transakcija:", payment.identifier);
            try {
                // Tiho šaljemo zahtev serveru da otkaže/očisti transakciju
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

        Pi.init({ version: "2.0", sandbox: false }).then(() => {
            // Umesto prazne funkcije (), sada prosleđujemo onIncompletePaymentFound
            Pi.authenticate(['username', 'payments'], onIncompletePaymentFound)
                .then((res: any) => {
                    const u = res.user;
                    const userData = { username: u.username, isAdmin: u.username === ADMIN_USERNAME };
                    
                    // Osvežavamo podatke (ako je novi token ili uid)
                    localStorage.setItem("pi_user", JSON.stringify(userData));
                    setUser(userData);
                    syncUserToDatabase(u.username, u.uid);
                    
                    if (!savedUser) setIsLoading(false);
                })
                .catch((err: any) => {
                    console.error("Auth error:", err);
                    if (!savedUser) setIsLoading(false);
                });
        }).catch(() => {
             if (!savedUser) setIsLoading(false);
        });
    } else {
        if (!savedUser) setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
