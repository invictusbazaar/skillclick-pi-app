"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

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

// ✅ IZMENA: Definišemo "prazan" default kontekst da ne puca build ako provider fali
const defaultContext: AuthContextType = {
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initPiApp = async () => {
      try {
        // @ts-ignore
        if (typeof window !== "undefined" && window.Pi) {
          // @ts-ignore
          const Pi = window.Pi;
          await Pi.init({ version: "2.0", sandbox: true });

          const onIncompletePaymentFound = (payment: any) => {
             console.log("Nekompletno plaćanje:", payment);
          };

          const scopes = ['username', 'payments'];
          const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);

          if (authResult && authResult.user) {
            login(authResult.user.username, authResult);
          }
        } else {
            const savedUser = localStorage.getItem("user_session");
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        }
      } catch (error) {
        console.error("Pi auth error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initPiApp();
  }, []);

  const login = (username: string, authResult?: any) => {
    const isUserAdmin = username === ADMIN_USERNAME;
    const newUser: User = { 
        username, 
        email: `${username}@pi.email`,
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
    if (typeof window !== "undefined" && window.Pi) {
       // Pi logout logika ako postoji
    }
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
  // ✅ IZMENA: Ako nema providera, vraćamo default umesto greške
  if (!context) {
    return defaultContext;
  }
  return context;
};
