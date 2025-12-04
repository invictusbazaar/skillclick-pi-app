"use client"

import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8 md:p-12 border border-gray-200">
        
        <Link href="/" className="inline-flex items-center text-blue-600 hover:underline mb-8 font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
            <div className="p-3 bg-green-100 rounded-full text-green-600">
                <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Privacy Policy</h1>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed">
            
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-600" /> 1. Information Collection
                </h2>
                <p>
                    We collect information you provide directly to us when you register, create a gig, or communicate with other users. This may include your Pi username, email address, and transaction history on the Pi Network.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Facilitate transactions between buyers and sellers.</li>
                    <li>Provide customer support and resolve disputes.</li>
                    <li>Improve the functionality and security of the SkillClick platform.</li>
                    <li>Comply with Pi Network policies and legal obligations.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">3. Data Security</h2>
                <p>
                    We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">4. Sharing of Information</h2>
                <p>
                    We do not sell your personal data. We may share information with:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Other users (only necessary info to complete a transaction, like username).</li>
                    <li>Pi Network core team (if required for compliance or security audits).</li>
                    <li>Legal authorities if required by law.</li>
                </ul>
            </section>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-8">
                <p className="text-sm text-blue-800 font-medium">
                    By using SkillClick, you consent to our Privacy Policy. If you have any questions, please contact us at <a href="mailto:invictusbazaar@gmail.com" className="underline">invictusbazaar@gmail.com</a>.
                </p>
            </div>

        </div>
      </div>
    </div>
  );
}