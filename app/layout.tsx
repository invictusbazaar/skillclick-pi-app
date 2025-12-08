import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/components/LanguageContext";
// 👇 UVOZIMO SCRIPT KOMPONENTU IZ NEXT.JS
import Script from "next/script"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillClick - Pi Network Marketplace",
  description: "Find skills, pay with Pi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Ovde možemo dodati meta tagove ako treba */}
      </head>
      <body className={inter.className}>
        
        {/* 👇 OVDE UČITAVAMO PI SDK */}
        {/* strategy="beforeInteractive" znači da se učitava pre nego što se aplikacija "probudi" */}
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="beforeInteractive" />

        <LanguageProvider>
          <div className="min-h-screen flex flex-col bg-[#f8f9fc]">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            
            {/* Footer možemo dodati kasnije ovde */}
            <footer className="py-6 text-center text-gray-400 text-xs">
              <p>© 2025 Invictus Bazaar. Powered by Pi Network.</p>
            </footer>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}