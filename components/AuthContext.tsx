"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Tip podataka za korisnika
type User = {
  username: string;
  email: string;
} | null;

type AuthContextType = {
  user: User;
  // ✅ IZMJENA: login funkcija sada prihvata i opcioni email
  login: (username: string, email?: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  // Provjera sesije pri učitavanju
  useEffect(() => {
    const savedUser = localStorage.getItem("user_session");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // ✅ Login funkcija koja čuva podatke
  const login = (username: string, email?: string) => {
    // Ako nema emaila (npr. guest login), generiši lažni
    const userEmail = email || `${username.toLowerCase().replace(/\s+/g, '')}@example.com`;
    
    const newUser = { 
        username, 
        email: userEmail 
    };
    
    setUser(newUser);
    localStorage.setItem("user_session", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user_session");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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