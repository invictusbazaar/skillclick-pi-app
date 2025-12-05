"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Scale, Gavel, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  const router = useRouter();
  // State za praćenje klika (efekat ljubičaste boje)
  const [isBackActive, setIsBackActive] = useState(false);

  // Funkcija za odlaganje navigacije (mobilni "app" osećaj)
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsBackActive(true); // Odmah oboji u ljubičasto

    setTimeout(() => {
      router.push('/'); // Prebaci na početnu posle 0.5s
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-xl shadow-purple-900/5 rounded-3xl overflow-hidden border border-gray-100">
        
        {/* --- HEADER (Usaglašen sa Privacy Policy stranicom) --- */}
        <div className="bg-gradient-to-br from-[#0f0518] to-[#2d1b4e] px-8 py-10 text-white relative overflow-hidden">
             {/* Dekoracija u pozadini */}
             <div className="absolute top-0 right-0 -mt-10 -mr-10 bg-white opacity-5 rounded-full w-64 h-64 blur-3xl"></div>

            {/* Back to Home dugme - SA EFEKTOM KAŠNJENJA */}
            <Link 
                href="/" 
                onClick={handleBackClick}
                className={`inline-flex items-center mb-6 font-medium transition-colors duration-300 ${
                    isBackActive ? 'text-purple-400' : 'text-gray-300 hover:text-purple-400'
                }`}
            >
                <ArrowLeft className={`w-4 h-4 mr-2 transition-colors duration-300 ${
                    isBackActive ? 'text-purple-400' : ''
                }`} /> 
                Back to Home
            </Link>

            <div className="flex items-center gap-6 relative z-10">
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <Scale className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
                    <p className="text-purple-200 mt-2 opacity-80">Last updated: December 2025</p>
                </div>
            </div>
        </div>

        {/* --- SADRŽAJ --- */}
        <div className="p-8 md:p-12 space-y-10 text-gray-600 leading-relaxed">
            
            {/* Sekcija 1 */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600" /> 1. Acceptance of Terms
                </h2>
                <p>
                    By accessing and using SkillClick, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
                </p>
            </section>

            <div className="h-px bg-gray-100 w-full"></div>

            {/* Sekcija 2 */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-purple-600" /> 2. Pi Network Compliance
                </h2>
                <p>
                    SkillClick operates within the Pi Network ecosystem. Users must strictly adhere to Pi Network's policies regarding Pi transactions. 
                    <span className="block mt-2 bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-100 text-sm font-medium">
                        Trading Pi for fiat currency (Dollar, Euro, etc.) or other cryptocurrencies is strictly prohibited and will result in an immediate ban.
                    </span>
                </p>
            </section>

            <div className="h-px bg-gray-100 w-full"></div>

            {/* Sekcija 3 */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" /> 3. Prohibited Activities
                </h2>
                <ul className="space-y-2 list-disc pl-5 marker:text-red-500">
                    <li>Posting illegal, harmful, or fraudulent services.</li>
                    <li>Attempting to scam other Pioneers.</li>
                    <li>Asking for or sharing Wallet Passphrases.</li>
                    <li>Creating multiple fake accounts to manipulate ratings.</li>
                </ul>
            </section>

            <div className="h-px bg-gray-100 w-full"></div>

            {/* Sekcija 4 */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-purple-600" /> 4. Limitation of Liability
                </h2>
                <p>
                    SkillClick acts as a marketplace connecting Freelancers and Clients. We are not responsible for the quality of work provided by freelancers. However, we provide an escrow service to protect funds until work is approved.
                </p>
            </section>

            {/* --- FOOTER NOTE --- */}
            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 mt-8 text-center">
                <p className="text-sm text-purple-900 font-medium">
                    We reserve the right to modify these terms at any time. Your continued use of the site will signify your acceptance of any adjustment to these terms.
                </p>
            </div>

        </div>
      </div>
    </div>
  );
}