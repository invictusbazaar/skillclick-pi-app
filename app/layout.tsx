import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer"; 
import Script from 'next/script'; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillClick - Freelance Market",
  description: "Find skilled providers for any task",
  manifest: "/manifest.json", // OVO SMO DODALI: Povezivanje manifesta
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* --- PI SDK SKRIPT TAG --- */}
      <Script
        src="https://sdk.minepi.com/v2/pi.js"
        strategy="afterInteractive" 
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