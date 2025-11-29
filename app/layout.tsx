"use client"

import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer"; 
import Script from 'next/script'; 
import Header from "@/components/Header";
import { useState, useEffect } from "react"; 
import { LanguageProvider } from "@/components/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Stanje za forsirano osvežavanje Headera
  const [sessionKey, setSessionKey] = useState<string | null>(null);

  useEffect(() => {
    // Čita ključ koji se menja pri logovanju/registraciji
    const key = localStorage.getItem('sessionKey');
    setSessionKey(key);
  }, []);

  return (
    <html lang="en">
      <head>
        <title>SkillClick - Freelance Market</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      
      <body className={inter.className}>
        <LanguageProvider>
            
            {/* PI SDK - Agresivna inicijalizacija za Pi Browser i Wallet */}
            <Script
              src="https://sdk.minepi.com/v2/pi.js"
              strategy="afterInteractive" 
              onLoad={() => {
                  try { (window as any).Pi.init({ version: "2.0", sandbox: true }); } catch (e) {}
              }}
            />

            <div className="flex flex-col min-h-screen">
              {/* Prosleđujemo sessionKey za forsirano osvežavanje Headera */}
              <Header sessionKeyProp={sessionKey} /> 
              <div className="flex-grow">
                {children}
              </div>
              <Footer />
            </div>
        </LanguageProvider>
      </body>
    </html>
  );
}