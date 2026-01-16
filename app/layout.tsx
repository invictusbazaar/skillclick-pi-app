import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google"; 
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; 
import { LanguageProvider } from "@/components/LanguageContext";
import Script from "next/script"; // NOVO: Uvozimo Next.js Script komponentu

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({ 
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

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
      <body className={`${inter.variable} ${poppins.variable} font-sans bg-[#f8f9fc] antialiased flex flex-col min-h-screen`}>
        
        {/* NOVO: Brzo učitavanje Pi SDK-a pre interaktivnog dela */}
        <Script 
          src="https://sdk.minepi.com/pi-sdk.js" 
          strategy="beforeInteractive" 
        />

        <LanguageProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
        </LanguageProvider>

      </body>
    </html>
  );
}