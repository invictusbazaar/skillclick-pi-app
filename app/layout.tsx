import type { Metadata } from "next";
// 👇 1. UVOZIMO OUTFIT FONT
import { Outfit } from "next/font/google";
import "./globals.css";

import { LanguageProvider } from "@/components/LanguageContext"; 
import { AuthProvider } from "@/components/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; 

// 👇 2. KONFIGURIŠEMO GA (Učitavamo razne debljine za lepši dizajn)
const outfit = Outfit({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800'] 
});

export const metadata: Metadata = {
  title: "SkillClick - Invictus Bazaar",
  description: "Global marketplace for Pi Network community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 👇 3. PRIMENJUJEMO GA NA CELO TELO APLIKACIJE */}
      <body className={outfit.className}>
        <LanguageProvider>
          <AuthProvider> 
             <Navbar /> 
             {children}
             <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}