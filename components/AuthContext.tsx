"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// OVO TRENUTNO NIJE BITNO JER SAM DOLE UKLJUČIO DA SVAKO BUDE ADMIN ZBOG TESTA
const ADMIN_USERNAME = "Ilija1969";

type User = {
  username: string;
  email: string;
  uid?: string;
  accessToken?: string;
  isAdmin: boolean;
} | null;

type AuthContextType = {
  user: User;
  login: (username: string, authResult?: any) => void;
  logout: () => void;
  isLoading: boolean;
};

// Default vrednosti
const defaultContext: AuthContextType = {
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: false 
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let piFound = false;

    // 1. Sigurnosna kočnica: Ako Pi ne odgovori za 5 sekundi, pusti korisnika kao gosta
    const safetyTimeout = setTimeout(() => {
        if (!piFound) {
            // alert("PAŽNJA: Pi Mreža se nije javila na vreme (5s). Prikazujem aplikaciju kao GOST.");
            setIsLoading(false);
        }
    }, 5000);

    const initPiApp = async () => {
      try {
        // @ts-ignore
        if (typeof window !== "undefined" && window.Pi) {
          piFound = true;
          // @ts-ignore
          const Pi = window.Pi;
          
          // alert("KORAK 1: Pi SDK Pronađen. Pokrećem init...");
          
          // INIT - Sandbox TRUE za testiranje
          await Pi.init({ version: "2.0", sandbox: true });

          // AUTHENTICATE
          const scopes = ['username', 'payments'];
          const onIncompletePaymentFound = (payment: any) => { console.log(payment); };

          // alert("KORAK 2: Šaljem zahtev za autentifikaciju...");
          
          const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound)
            .catch((err: any) => {
                alert("GREŠKA PRI LOGOVANJU: " + JSON.stringify(err));
                setIsLoading(false);
                return null;
            });

          if (authResult && authResult.user) {
            // alert("USPEH! Tvoje Test Ime je: " + authResult.user.username);
            login(authResult.user.username, authResult);
          } else {
             // alert("Nije uspelo logovanje. AuthResult je prazan.");
             setIsLoading(false);
          }
        } else {
            // Pokušaj ponovo za 0.5s ako Pi nije spreman
            setTimeout(initPiApp, 500);
        }
      } catch (error) {
        alert("CRITICAL ERROR: " + JSON.stringify(error));
        setIsLoading(false);
      }
    };

    initPiApp();

    return () => clearTimeout(safetyTimeout);
  }, []);

  const login = (username: string, authResult?: any) => {
    // ⚠️⚠️⚠️ PAŽNJA: OVO JE PRIVREMENA IZMENA ⚠️⚠️⚠️
    // Ignorišemo proveru imena i SVAKOM ulogovanom korisniku dajemo Admin prava
    // Samo da bi ti video dugme. Kada završiš test, vrati na: const isUserAdmin = username === ADMIN_USERNAME;
    
    const isUserAdmin = true; 

    const newUser: User = { 
        username, 
        email: `${username}@pi.email`,
        uid: authResult?.user?.uid,
        accessToken: authResult?.accessToken,
        isAdmin: isUserAdmin
    };
    
    setUser(newUser);
    localStorage.setItem("user_session", JSON.stringify(newUser));
    setIsLoading(false);
    
    // Opciono: Prebaci odmah na admin ako treba
    // if (isUserAdmin) router.push("/admin");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user_session");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) return defaultContext;
  return context;
};
