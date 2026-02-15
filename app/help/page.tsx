"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Mail, ShieldCheck, Wallet, User, Info, ArrowLeft, 
  CircleHelp 
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function HelpPage() {
  const router = useRouter();
  // State za praćenje klika na "Back to Home"
  const [isBackActive, setIsBackActive] = useState(false);

  // Funkcija sa delay efektom za mobilni osećaj
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsBackActive(true); // Odmah oboji u ljubičasto

    setTimeout(() => {
      router.push('/'); // Prebaci nakon 500ms
    }, 500);
  };

  // --- PAMETNA FUNKCIJA ZA PODRŠKU (UPDATED) ---
  const handleContactSupport = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const email = "invictusbazaar@gmail.com";
    const subject = "SkillClick Support";

    // Proveravamo da li je korisnik na mobilnom uređaju
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // MOBILNI: Otvara podrazumevanu aplikaciju
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    } else {
      // KOMPJUTER: Otvara Gmail Pop-up
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}`;
      
      const width = 600;
      const height = 600;
      const left = (window.screen.width / 2) - (width / 2);
      const top = (window.screen.height / 2) - (height / 2);

      window.open(
        gmailUrl, 
        'GmailCompose', 
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 py-8 px-4">
      
      {/* --- GLAVNI KONTEJNER (JEDAN JEDINI) --- */}
      <div className="container mx-auto max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* --- DEO 1: ZAGLAVLJE (Tamno ljubičasto) --- */}
        <div className="bg-[#2A1A3A] text-white relative">
            <div className="px-6 py-10 md:px-10 md:py-12 relative z-10">
                
                {/* Back to Home Button sa efektom */}
                <Link 
                  href="/" 
                  onClick={handleBackClick}
                  className={`group inline-flex items-center transition-colors duration-300 mb-8 font-medium ${
                    isBackActive ? 'text-purple-400' : 'text-gray-300 hover:text-purple-400'
                  }`}
                >
                    <ArrowLeft className={`w-5 h-5 mr-2 transition-colors duration-300 ${
                      isBackActive ? 'text-purple-400' : 'group-hover:text-purple-400'
                    }`} />
                    <span>Back to Home</span>
                </Link>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-800/50 border-2 border-purple-700 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                        <CircleHelp className="w-8 h-8 md:w-10 md:h-10 text-purple-300" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">Help Center</h1>
                        <p className="text-purple-200 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
                            Everything you need to know about SkillClick. We are here to help.
                        </p>
                    </div>
                </div>
            </div>

            {/* Dekoracija */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-blue-600/20 blur-[60px] rounded-full pointer-events-none"></div>
        </div>

        {/* --- DEO 2: SADRŽAJ --- */}
        <main className="p-6 md:p-12 space-y-12">

            {/* --- Grid sa informacijama (2 kolone) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Sekcija 1: Plaćanje */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-purple-200 group">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">Payments & Pi Wallet</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  SkillClick is fully integrated with the Pi Network. All payments are processed securely through your Pi Wallet. Funds are held safely until the work is delivered.
                </p>
              </div>

              {/* Sekcija 2: Sigurnost */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-blue-200 group">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">Safety & Protection</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Your safety is our priority. We use an <strong>Escrow system</strong>. The seller doesn't get paid until you approve the work. Our Dispute Center resolves issues fairly.
                </p>
              </div>

              {/* Sekcija 3: Verifikacija */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-green-200 group">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">Account Verification</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To ensure a high-quality community, we rely on Pi Network KYC. Real humans, real services. No bots allowed.
                </p>
              </div>

               {/* Sekcija 4: Naknade */}
               <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-orange-200 group">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                  <Info className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">Fees</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Posting a service is free. SkillClick charges a small service fee only on successful transactions to maintain the platform and support the community.
                </p>
              </div>

            </div>

            {/* --- KONTAKT SEKCIJA (Dole) --- */}
            <div className="bg-gray-50 rounded-3xl p-8 md:p-10 text-center border border-gray-100">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-purple-600">
                  <Mail className="w-7 h-7" />
               </div>
               <h2 className="text-2xl font-bold text-gray-900 mb-2">Can't find the answer?</h2>
               <p className="text-gray-500 mb-8 text-sm md:text-base">
                 Our support team is here to help you with any questions or issues.
               </p>
               
               {/* DUGME: Prilagođeno za mobilne ekrane */}
               <Button 
                 onClick={handleContactSupport}
                 className="bg-purple-600 hover:bg-purple-700 text-white w-full md:w-auto px-4 md:px-10 py-5 md:py-6 rounded-xl font-bold text-sm md:text-base shadow-lg hover:shadow-xl transition-all mb-6 flex items-center justify-center"
               >
                  <Mail className="w-5 h-5 mr-2 shrink-0" /> Contact Support Team
               </Button>

               <div className="bg-white inline-block px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                 <p className="text-xs text-gray-400">
                   Or email us directly at: <span className="text-purple-600 font-bold select-all cursor-text ml-1">invictusbazaar@gmail.com</span>
                 </p>
               </div>
            </div>

        </main>
      </div>
    </div>
  );
}