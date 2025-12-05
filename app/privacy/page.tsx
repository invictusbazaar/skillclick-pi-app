"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Lock, Eye, Share2, FileText, Mail } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  const router = useRouter();
  // State za praćenje klika (da li je aktivan ljubičasti efekat)
  const [isBackActive, setIsBackActive] = useState(false);

  // Funkcija koja odlaže navigaciju za 500ms
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsBackActive(true); // Odmah oboji u ljubičasto

    setTimeout(() => {
      router.push('/'); // Prebaci na početnu posle 0.5s
    }, 500);
  };

  // --- NOVA FUNKCIJA: OTVARA GMAIL POP-UP ---
  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Sprečava običan link
    
    // Link ka Gmail-u sa odgovarajućim naslovom (Subject: Privacy Policy Question)
    const gmailUrl = "https://mail.google.com/mail/?view=cm&fs=1&to=invictusbazaar@gmail.com&su=Privacy%20Policy%20Question";
    
    // Centriranje prozora
    const width = 800;
    const height = 600;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    window.open(
      gmailUrl, 
      'GmailCompose', 
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-xl shadow-purple-900/5 rounded-3xl overflow-hidden border border-gray-100">
        
        {/* --- HEADER --- */}
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
                    <ShieldCheck className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
                    <p className="text-purple-200 mt-2 opacity-80">Last updated: December 2025</p>
                </div>
            </div>
        </div>

        {/* --- SADRŽAJ --- */}
        <div className="p-8 md:p-12 space-y-10 text-gray-600 leading-relaxed">
            
            {/* Sekcija 1 */}
            <section className="flex gap-4">
                <div className="shrink-0 mt-1">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <FileText className="w-5 h-5" />
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information Collection</h2>
                    <p>
                        We collect information you provide directly to us when you register, create a gig, or communicate with other users. This may include your <strong className="text-purple-700">Pi username</strong>, email address, and transaction history on the Pi Network blockchain.
                    </p>
                </div>
            </section>

            <div className="h-px bg-gray-100 w-full"></div>

            {/* Sekcija 2 */}
            <section className="flex gap-4">
                <div className="shrink-0 mt-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Eye className="w-5 h-5" />
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
                    <p className="mb-2">We use the information we collect to:</p>
                    <ul className="space-y-2 list-disc pl-5 marker:text-purple-500">
                        <li>Facilitate transactions between buyers and sellers securely.</li>
                        <li>Provide customer support and resolve disputes via our Help Center.</li>
                        <li>Improve the functionality and security of the SkillClick platform.</li>
                        <li>Comply with Pi Network policies and legal obligations.</li>
                    </ul>
                </div>
            </section>

            <div className="h-px bg-gray-100 w-full"></div>

            {/* Sekcija 3 */}
            <section className="flex gap-4">
                <div className="shrink-0 mt-1">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <Lock className="w-5 h-5" />
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">3. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational measures to protect your personal data against unauthorized access. We <strong>never</strong> ask for or store your Wallet Passphrase.
                    </p>
                </div>
            </section>

            <div className="h-px bg-gray-100 w-full"></div>

            {/* Sekcija 4 */}
            <section className="flex gap-4">
                <div className="shrink-0 mt-1">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <Share2 className="w-5 h-5" />
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">4. Sharing of Information</h2>
                    <p>
                        We do not sell your personal data. We may share information with:
                    </p>
                    <ul className="space-y-2 list-disc pl-5 mt-2 marker:text-orange-500">
                        <li>Other users (only necessary info to complete a transaction, like username).</li>
                        <li>Pi Network core team (if required for compliance or security audits).</li>
                        <li>Legal authorities if required by law.</li>
                    </ul>
                </div>
            </section>

            {/* --- CONTACT BOX --- */}
            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 mt-8 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                <div className="p-3 bg-white rounded-full shadow-sm text-purple-600">
                    <Mail className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-purple-900 font-medium">
                        By using SkillClick, you consent to our Privacy Policy.
                    </p>
                    <p className="text-sm text-purple-700 mt-1">
                        Questions? Contact us at{' '}
                        {/* Ažurirani link koji otvara Gmail pop-up */}
                        <a 
                            href="#" 
                            onClick={handleEmailClick} 
                            className="underline font-bold hover:text-purple-900"
                        >
                            invictusbazaar@gmail.com
                        </a>
                    </p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}