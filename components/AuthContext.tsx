"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// TVOJE KORISNIČKO IME (Mora biti tačno ovako)
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

    // 1. Sigurnosna kočnica: Ako se ništa ne desi za 3 sekunde, ugasi loading
    const safetyTimeout = setTimeout(() => {
        if (!piFound) {
            console.log("Pi SDK nije odgovorio na vreme. Gašenje loadinga.");
            setIsLoading(false);
        }
    }, 3000);

    const initPiApp = async () => {
      try {
        // @ts-ignore
        if (typeof window !== "undefined" && window.Pi) {
          piFound = true;
          // @ts-ignore
          const Pi = window.Pi;
          
          // IZMENA: Stavili smo sandbox na FALSE da bi prepoznao tvoje pravo ime "Ilija1969"
          // Ako ti aplikacija još nije verifikovana na portalu, možda ćeš morati da vratiš na true,
          // ali onda moramo saznati koje ti lažno ime daje.
          await Pi.init({ version: "2.0", sandbox: false });

          // Provera da li već imamo sesiju
          const scopes = ['username', 'payments'];
          const onIncompletePaymentFound = (payment: any) => { console.log(payment); };

          const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);

          if (authResult && authResult.user) {
            // Ako uspesno uloguje, odmah te logujemo u aplikaciju
            login(authResult.user.username, authResult);
          } else {
             setIsLoading(false);
          }
        } else {
            // Ako window.Pi još nije spreman, probamo ponovo za kratko vreme
            setTimeout(initPiApp, 300);
        }
      } catch (error) {
        console.error("Pi Auth Greška:", error);
        // Čak i ako pukne greška, moramo ugasiti loading da vidiš sajt
        setIsLoading(false);
      }
    };

    initPiApp();

    return () => clearTimeout(safetyTimeout);
  }, []);

  const login = (username: string, authResult?: any) => {
    // Provera admina
    const isUserAdmin = username === ADMIN_USERNAME;

    // DEBUG: Otkomentariši ovo ako i dalje ne radi, da vidiš koje ime ti vidi sistem
    // alert(`Ulogovan kao: ${username} | Admin pravo: ${isUserAdmin}`);

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
