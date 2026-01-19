"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// OVDJE UPIŠI TVOJ TAČAN PI USERNAME KAKO BI TE APLIKACIJA PREPOZNALA KAO ADMINA
const ADMIN_USERNAME = "Ilija1969"; 

// Proširen tip podataka za korisnika
type User = {
  username: string;
  email: string;
  uid?: string; // Pi Network User ID
  accessToken?: string;
  isAdmin: boolean; // Novo polje za admina
} | null;

type AuthContextType = {
  user: User;
  login: (username: string, authResult?: any) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Inicijalizacija Pi SDK-a i Auto-Login
  useEffect(() => {
    const initPiApp = async () => {
      try {
        // @ts-ignore
        if (typeof window !== "undefined" && window.Pi) {
          // @ts-ignore
          const Pi = window.Pi;
          
          // Inicijalizacija (sandbox: true za testiranje, prebaci na false za live)
          await Pi.init({ version: "2.0", sandbox: true });

          // Definišemo callback za nekompletna plaćanja (obavezno za Pi SDK)
          const onIncompletePaymentFound = (payment: any) => {
             console.log("Nekompletno plaćanje pronađeno:", payment);
             // Ovde kasnije možemo dodati logiku za završetak plaćanja
          };

          // Autentifikacija - tražimo username i payments dozvole
          const scopes = ['username', 'payments'];
          const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);

          // Ako je uspešno, logujemo korisnika
          if (authResult && authResult.user) {
            login(authResult.user.username, authResult);
          }
        } else {
            // Fallback za testiranje van Pi Browsera (opciono, čita iz local storage)
            const savedUser = localStorage.getItem("user_session");
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        }
      } catch (error) {
        console.error("Pi Network autentifikacija nije uspela:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initPiApp();
  }, []);

  const login = (username: string, authResult?: any) => {
    // Provera da li je korisnik Admin
    const isUserAdmin = username === ADMIN_USERNAME;

    const newUser: User = { 
        username, 
        email: `${username}@pi.email`, // Placeholder jer Pi ne daje pravi email
        uid: authResult?.user?.uid,
        accessToken: authResult?.accessToken,
        isAdmin: isUserAdmin
    };
    
    setUser(newUser);
    localStorage.setItem("user_session", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user_session");
    // @ts-ignore
    if (window.Pi) {
        // Opciono: window.Pi.openShareDialog... ili slično, ali Pi nema striktni 'logout' iz SDK
    }
    router.push("/"); // Vraćanje na početnu
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth mora biti korišten unutar AuthProvider-a");
  }
  return context;
};
