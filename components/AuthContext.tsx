"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// TVOJE IME - KLJUČ ZA ADMINA
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
      try {
        // @ts-ignore
        if (typeof window !== "undefined" && window.Pi) {
          // @ts-ignore
          const Pi = window.Pi;
          
          // Originalno podešavanje koje je radilo
          await Pi.init({ version: "2.0", sandbox: false });

          // Provera sesije
          const scopes = ['username', 'payments'];
          const onIncompletePaymentFound = (payment: any) => { console.log(payment); };

          const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);

          if (authResult && authResult.user) {
            login(authResult.user.username, authResult);
          } else {
             setIsLoading(false);
          }
        } else {
           // Ako nije Pi browser (za testiranje na PC)
           setIsLoading(false);
        }
      } catch (error) {
        console.error("Pi Auth Error:", error);
        setIsLoading(false);
      }
    };

    initPiApp();
  }, []);

  const login = (username: string, authResult?: any) => {
    // STROGA PROVERA: Samo Ilija1969 je admin
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
