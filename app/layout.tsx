"use client"

import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer"; 
import Script from 'next/script'; 
import { LanguageProvider } from "@/components/LanguageContext"; // UVOZIMO MOZAK

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>SkillClick - Freelance Market</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      
      <body className={inter.className}>
        {/* --- OMOTAVAMO CELU APLIKACIJU JEZIKOM --- */}
        <LanguageProvider>
            
            <Script
                src="https://sdk.minepi.com/v2/pi.js"
                strategy="beforeInteractive" 
                onLoad={() => { try { (window as any).Pi.init({ version: "2.0", sandbox: true }); } catch (e) {} }}
            />
            
            <div className="flex flex-col min-h-screen">
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