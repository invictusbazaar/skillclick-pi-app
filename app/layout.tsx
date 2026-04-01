import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google"; 
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; 
import { LanguageProvider } from "@/components/LanguageContext";
import { AuthProvider } from "@/components/AuthContext";
import Script from "next/script";
import { Suspense } from "react";

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
      <head>
        {/* Ispravljen origin za lokalno testiranje */}
        <meta name="pi:origin" content="https://localhost:3000" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans bg-[#f8f9fc] antialiased flex flex-col min-h-screen`}>
        
        <Script 
          src="https://sdk.minepi.com/pi-sdk.js" 
          strategy="beforeInteractive" 
        />

        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-grow">
              <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]">Učitavanje...</div>}>
                {children}
              </Suspense>
            </main>
            <Footer />
          </AuthProvider>
        </LanguageProvider>

      </body>
    </html>
  );
}
