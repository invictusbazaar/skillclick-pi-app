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

  // Funkcija za tihu registraciju u bazu
  const syncUserToDatabase = async (username: string, uid?: string) => {
    try {
        await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, uid }) 
        });
    } catch (error) {
        console.error("Greška pri sinhronizaciji sa bazom:", error);
    }
  };

  useEffect(() => {
    // 0. 💾 PRVO PROVERAVAMO KEŠ (DA NE TRAŽI DOZVOLU SVAKI PUT)
    const savedUser = localStorage.getItem("pi_user");
    if (savedUser) {
        try {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            setIsLoading(false); // ✅ Odmah prikazujemo aplikaciju
        } catch (e) {
            console.error("Greška pri čitanju keša", e);
        }
    }

    // 1. PC DETEKCIJA
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        console.log("🖥️ PC DETEKTOVAN: Forsiram login kao Admin...");
        setTimeout(() => {
            const adminUser = "Ilija1969";
            const adminData = { username: adminUser, isAdmin: true };
            
            setUser(adminData);
            localStorage.setItem("pi_user", JSON.stringify(adminData)); // 💾 Čuvamo i admina
            syncUserToDatabase(adminUser, "mock-admin-uid-123"); 
            setIsLoading(false);
            console.log("✅ Ulogovan si kao: " + adminUser);
        }, 500);
        return; 
    }

    // 2. Pi Network Logika (Telefon)
    // @ts-ignore
    if (typeof window !== "undefined" && window.Pi) {
        // @ts-ignore
        const Pi = window.Pi;
        Pi.init({ version: "2.0", sandbox: false }).then(() => {
            // Ostavljamo prazan callback za payments ovde, jer ga rešavamo u BuyButton-u
            Pi.authenticate(['username', 'payments'], () => {}).then((res: any) => {
                const u = res.user;
                const userData = { username: u.username, isAdmin: u.username === ADMIN_USERNAME };
                
                // 💾 KLJUČNO: ČUVAMO KORISNIKA ZA ZAUVEK
                localStorage.setItem("pi_user", JSON.stringify(userData));

                setUser(userData);
                syncUserToDatabase(u.username, u.uid); 
                setIsLoading(false);
            }).catch((err: any) => {
                console.error("Auth greška:", err);
                // Ako auth pukne, a nemamo sačuvanog korisnika, tek onda skidamo loading
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
