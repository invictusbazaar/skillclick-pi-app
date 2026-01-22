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

  useEffect(() => {
    // 1. PROVERA: Da li smo na kompjuteru (localhost)?
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        console.log("🖥️ PC DETEKTOVAN: Forsiram login kao Admin...");
        setTimeout(() => {
            setUser({ username: "Ilija1969", isAdmin: true });
            setIsLoading(false);
            console.log("✅ Ulogovan si kao: Ilija1969");
        }, 500);
        return; 
    }

    // 2. Ako nismo na PC-u, probaj Pi Network (za telefon)
    // @ts-ignore
    if (typeof window !== "undefined" && window.Pi) {
        // @ts-ignore
        const Pi = window.Pi;
        Pi.init({ version: "2.0", sandbox: false }).then(() => {
            Pi.authenticate(['username', 'payments'], () => {}).then((res: any) => {
                const u = res.user;
                setUser({ username: u.username, isAdmin: u.username === ADMIN_USERNAME });
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