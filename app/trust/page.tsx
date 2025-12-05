"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Lock, Eye, TriangleAlert, 
  Wallet, Users, CircleHelp, ArrowLeft, 
  OctagonAlert, MessageSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TrustSafetyPage() {
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

  // --- NOVA FUNKCIJA: OTVARA GMAIL POP-UP ---
  const handleReportIssue = () => {
    // Link direktno ka Gmail Compose prozoru sa popunjenom adresom i naslovom
    const gmailUrl = "https://mail.google.com/mail/?view=cm&fs=1&to=invictusbazaar@gmail.com&su=Report%20Issue%20-%20Trust%20%26%20Safety";
    
    // Dimenzije i pozicija prozora (centrirano)
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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 py-8 px-4">
      
      {/* --- GLAVNI KONTEJNER (JEDAN JEDINI) --- */}
      <div className="container mx-auto max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* --- DEO 1: ZAGLAVLJE (Tamno ljubičasto) --- */}
        <div className="bg-[#2A1A3A] text-white relative">
            <div className="px-6 py-10 md:px-10 md:py-12 relative z-10">
                
                {/* Back to Home Button - SA EFEKTOM KAŠNJENJA */}
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
                        <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-purple-300" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">Trust & Safety</h1>
                        <p className="text-purple-200 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
                            Your security is our priority. Learn how SkillClick protects your Pi coins and ensures fair trading.
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

            {/* --- CORE PILLARS --- */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-purple-200 group">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                        <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-gray-900">Verified Pioneers</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        SkillClick relies on the strength of the Pi Network community. We encourage collaboration with users who have passed <strong>Pi KYC</strong>.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-blue-200 group">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-gray-900">Secure Pi Payments</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                    Pi coins are held securely. Payment is released to the seller only after you confirm the work is <strong>successfully completed</strong>.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-yellow-200 group">
                    <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow-100 transition-colors">
                        <Eye className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-gray-900">Transparency</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Our review system is public. Before hiring anyone, you can check their history and ratings. <strong>Reputation is key</strong>.
                    </p>
                </div>
            </section>

            {/* --- WALLET SAFETY (RED ZONE) --- */}
            <section className="bg-red-50 border border-red-100 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 text-red-100/60 pointer-events-none">
                    <OctagonAlert className="w-48 h-48" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0 bg-white p-3 rounded-full text-red-600 shadow-sm ring-4 ring-red-100">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pi Wallet - Golden Rules</h2>
                        <p className="text-red-700 font-medium mb-6">Read this carefully to keep your Pi safe.</p>
                        
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 bg-white/60 p-4 rounded-xl">
                                <TriangleAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-gray-800 text-sm leading-relaxed">
                                    <strong>NEVER share your 24-word Passphrase.</strong> SkillClick admins will NEVER ask for it.
                                </p>
                            </li>
                            <li className="flex items-start gap-3 bg-white/60 p-4 rounded-xl">
                                <MessageSquare className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-gray-800 text-sm leading-relaxed">
                                    Keep communication strictly <strong>inside the app</strong>. Avoid Telegram or WhatsApp deals.
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* --- TIPS SECTION --- */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-5">
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">For Buyers</span>
                        <h3 className="text-lg font-bold text-gray-900">Safe Buying Tips</h3>
                    </div>
                    <ul className="space-y-4">
                        <li className="flex gap-3 text-gray-600 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                            <p>Read descriptions carefully before ordering.</p>
                        </li>
                        <li className="flex gap-3 text-gray-600 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                            <p>Check seller reviews and verified badges.</p>
                        </li>
                    </ul>
                </div>

                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-5">
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">For Sellers</span>
                        <h3 className="text-lg font-bold text-gray-900">Safe Selling Tips</h3>
                    </div>
                    <ul className="space-y-4">
                        <li className="flex gap-3 text-gray-600 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                            <p>Don't start working without an official order notification.</p>
                        </li>
                        <li className="flex gap-3 text-gray-600 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                            <p>Always deliver work through the SkillClick system.</p>
                        </li>
                    </ul>
                </div>
            </section>

            {/* --- REPORT CTA --- */}
            <section className="bg-white border-t border-gray-100 pt-10 text-center">
                <div className="max-w-3xl mx-auto flex flex-col items-center">
                    <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                        <TriangleAlert className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">See something suspicious?</h2>
                    <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                        If you spot a listing that violates our rules or a potential scam attempt, please let us know immediately.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                        <Link href="/help" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto border-gray-300 hover:bg-gray-50 hover:text-purple-600 font-bold h-11 rounded-xl px-8 transition-all">
                                <CircleHelp className="w-4 h-4 mr-2" />
                                Help Center
                            </Button>
                        </Link>
                        {/* DUGME ZA PRIJAVU PROBLEMA - SADA OTVARA EMAIL */}
                        <Button 
                            onClick={handleReportIssue}
                            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold h-11 rounded-xl px-8 shadow-md transition-all"
                        >
                            Report an Issue
                        </Button>
                    </div>
                </div>
            </section>

        </main>
      </div>
    </div>
  );
}