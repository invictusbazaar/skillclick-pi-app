"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// OVDJE UPIŠI TVOJ TAČAN PI USERNAME
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

// Default vrednosti da ne puca build
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
    let attempts = 0;
    const maxAttempts = 10; // Pokušavamo 5 sekundi (10 * 500ms)

    const initPiApp = async () => {
      try {
        // @ts-ignore
        if (typeof window !== "undefined" && window.Pi) {
          // @ts-ignore
          const Pi = window.Pi;
          
          // BITNO: Ako želiš pravo ime "Ilija1969", ovo mora biti false.
          // Ako je true, dobijaš lažno ime. Ostavi true dok testiraš, ali vidi šta ti ispiše.
          await Pi.init({ version: "2.0", sandbox: true });

          const scopes = ['username', 'payments'];
          const onIncompletePaymentFound = (payment: any) => { console.log(payment); };

          const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);

          if (authResult && authResult.user) {
            // Prikazujemo alert da vidimo šta Pi Browser tačno vidi
            // alert(`Uspešan login! Tvoje ime je: ${authResult.user.username}`);
            login(authResult.user.username, authResult);
          } else {
             setIsLoading(false);
          }
        } else {
            // Ako Pi nije pronađen, probaj ponovo za 500ms
            if (attempts < maxAttempts) {
                attempts++;
                setTimeout(initPiApp, 500);
            } else {
                console.error("Pi SDK nije pronađen nakon čekanja.");
                setIsLoading(false); // Prestani da vrtiš
            }
        }
      } catch (error) {
        console.error("Pi auth greška:", error);
        setIsLoading(false); // Obavezno prestani da vrtiš ako pukne greška
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
    setIsLoading(false);
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
