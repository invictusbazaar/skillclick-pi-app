"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Tip podataka za korisnika (za sad samo ime i email)
type User = {
  username: string;
  email: string;
} | null;

type AuthContextType = {
  user: User;
  login: (username: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  // Proveravamo da li već postoji ulogovan korisnik (u localStorage) čim se sajt učita
  useEffect(() => {
    const savedUser = localStorage.getItem("user_session");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Funkcija za logovanje (ovo pozivaš kad neko klikne Login)
  const login = (username: string) => {
    const newUser = { username, email: `${username}@example.com` };
    setUser(newUser);
    localStorage.setItem("user_session", JSON.stringify(newUser)); // Čuvamo sesiju
  };

  // Funkcija za odjavu
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

// Ovo je "kuka" koju ćemo koristiti u komponentama
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};