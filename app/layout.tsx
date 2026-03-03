import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google"; 
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; 
import { LanguageProvider } from "@/components/LanguageContext";
// import { AuthProvider } from "@/components/AuthContext"; // 🔴 PRIVREMENO ISKLJUČENO DA NE BLOKIRA SDK
import Script from "next/script";

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
        
        {/* ✅ POPRAVLJENO: afterInteractive je OBAVEZAN za React aplikacije */}
        <Script 
          src="https://sdk.minepi.com/pi-sdk.js" 
          strategy="afterInteractive" 
        />

        <LanguageProvider>
          {/* 🔴 PRIVREMENO ISKLJUČENO: Dok ne rešimo plaćanje, ovo mora biti ugašeno da ne krade sesiju */}
          {/* <AuthProvider> */}
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          {/* </AuthProvider> */}
        </LanguageProvider>

      </body>
    </html>
  );
}
