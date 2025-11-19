import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer"; 
import Script from 'next/script'; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillClick - Freelance Market",
  description: "Find skilled providers for any task",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </div>

        {/* --- PI SDK SKRIPT TAG (PREMEŠTEN NA KRAJ BODY-JA) --- */}
        <Script
          src="https://sdk.minepi.com/v2/pi.js"
          strategy="afterInteractive" // Sigurnija strategija
        />
        {/* --- KRAJ PI SDK TAGA --- */}
        
      </body>
    </html>
  );
}