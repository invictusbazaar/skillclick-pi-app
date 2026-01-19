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

const defaultContext: AuthContextType = {
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: false // Default false da ne blokira prikaz
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Sigurnosna kočnica: Ako Pi ne odgovori za 3 sekunde, ukini loading da vidiš aplikaciju
    const safetyTimeout = setTimeout(() => {
        setIsLoading(false);
    }, 3000);

    const initPiApp = async () => {
      try {
        // @ts-ignore
        if (typeof window !== "undefined" && window.Pi) {
          // @ts-ignore
          const Pi = window.Pi;
          
          // U SANDBOX MODU PI TI NEĆE DATI IME "Ilija1969" NEGO NEKO IZMIŠLJENO!
          // Zato ćemo ispisati Alert da vidiš koje ti je ime dodelio.
          await Pi.init({ version: "2.0", sandbox: true });

          const scopes = ['username', 'payments'];
          const onIncompletePaymentFound = (payment: any) => { console.log(payment); };

          const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);

          if (authResult && authResult.user) {
            // OVO JE KLJUČNO: Javiće ti koje ime vidi sistem
            // alert(`PI PREPOZNAO KORISNIKA: ${authResult.user.username}`); 
            login(authResult.user.username, authResult);
          }
        }
      } catch (error) {
        console.error("Pi Greška:", error);
      } finally {
        clearTimeout(safetyTimeout);
        setIsLoading(false);
      }
    };

    initPiApp();
  }, []);

  const login = (username: string, authResult?: any) => {
    // Proveravamo da li je username tvoj ILI ako je to neki Sandbox test user
    // (Možeš privremeno da staviš true ovde da bi testirao admin panel ako ti ime nije Ilija1969)
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
