"use client" // OVO JE NOVO: Mora biti client component zbog onLoading

import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer"; 
import Script from 'next/script'; 

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
        <meta name="description" content="Find skilled providers for any task" />
      </head>
      
      {/* --- PI SDK INICIJALIZACIJA --- */}
      <Script
        src="https://sdk.minepi.com/v2/pi.js"
        strategy="afterInteractive"
        onLoad={() => {
            // OVO JE KLJUČNO: Pokrećemo Pi SDK
            try {
                (window as any).Pi.init({ version: "2.0", sandbox: true });
                console.log("Pi SDK Initialized");
            } catch (err) {
                console.error("Pi SDK Init Error:", err);
            }
        }}
      />
      
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}