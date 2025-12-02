import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { LanguageProvider } from "@/components/LanguageContext"; 
import { AuthProvider } from "@/components/AuthContext";
import Navbar from "@/components/Navbar";
// ✅ 1. MORAŠ GA UVESTI OVDE
import Footer from "@/components/Footer"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pi Freelance Market",
  description: "Best freelance services on Pi Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider> 
             <Navbar /> 
             {children}
             {/* ✅ 2. MORAŠ GA PRIKAZATI OVDE (ISPOD CHILDREN) */}
             <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}