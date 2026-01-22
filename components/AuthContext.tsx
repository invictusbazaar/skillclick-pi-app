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
      // 1. PRVO PROVERAVAMO LOCALHOST (Da izbegnemo Pi skriptu na PC-u)
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

      if (isLocalhost) {
          console.log("🖥️ LOCALHOST DETEKTOVAN: Pokrećem simulaciju...");
          setTimeout(() => {
              console.log("✅ SIMULACIJA: Uspešan login kao Ilija1969");
              login("Ilija1969", { accessToken: "pc-simulation-token" });
          }, 1000);
          return; // Prekidamo dalje da ne bi pokušao pravi Pi login
      }

      // 2. OVO SE IZVRŠAVA SAMO AKO NIJE LOCALHOST (Znači pravi Pi Browser)
      try {
        // @ts-ignore
        if (typeof window !== "undefined" && window.Pi) {
          console.log("Pi Browser detektovan (Live).");
          // @ts-ignore
          const Pi = window.Pi;
          await Pi.init({ version: "2.0", sandbox: false }); 

          const scopes = ['username', 'payments'];
          const onIncompletePaymentFound = (payment: any) => { console.log(payment); };

          const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound)
            .catch((err: any) => console.error("Pi Auth Error:", err));

          if (authResult && authResult.user) {
            login(authResult.user.username, authResult);
          } else {
             setIsLoading(false);
          }
        } else {
           setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth Greška:", error);
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
    sessionStorage.setItem("user_session", JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user_session");
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