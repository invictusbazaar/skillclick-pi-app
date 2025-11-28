"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>SkillClick</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
      </head>
      <body className={inter.className}>
        
        {/* --- PI SDK (Učitavamo ga pre svega ostalog) --- */}
        <Script 
          src="https://sdk.minepi.com/v2/pi.js" 
          strategy="beforeInteractive" 
          onLoad={() => {
            try {
                (window as any).Pi.init({ version: "2.0", sandbox: true });
                console.log("Pi SDK Pokrenut!");
            } catch (e) {
                console.error("Pi SDK Greška:", e);
            }
          }}
        />


        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}