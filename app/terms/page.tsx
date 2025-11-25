"use client"

import { ArrowLeft, ShieldAlert, Gavel, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        
        <Link href="/auth/register" className="inline-flex items-center text-blue-600 hover:underline mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Registration
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: November 2025</p>

        <div className="space-y-8">
            
            <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-blue-600" /> 1. User Conduct
                </h2>
                <p className="text-gray-600 leading-relaxed">
                    By using SkillClick, you agree to maintain a professional and respectful environment. 
                    We have a <strong>zero-tolerance policy</strong> for hate speech, discrimination, harassment, or fraudulent activities.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                    <ShieldAlert className="w-5 h-5 mr-2 text-red-600" /> 2. Prohibited Content
                </h2>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>No illegal services or products.</li>
                    <li>No adult content or offensive material.</li>
                    <li>No spamming or misleading advertisements.</li>
                    <li>No attempts to take payments off the Pi Network platform.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                    <Gavel className="w-5 h-5 mr-2 text-orange-600" /> 3. Violations & Penalties
                </h2>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm">
                    <p className="font-bold text-red-700 mb-2">We take violations seriously:</p>
                    <ul className="list-disc pl-4 text-red-600 space-y-1">
                        <li><strong>First Violation:</strong> Temporary account suspension (30 days).</li>
                        <li><strong>Second Violation:</strong> Permanent ban from the platform.</li>
                        <li><strong>Severe Violations:</strong> Immediate permanent ban without warning.</li>
                    </ul>
                </div>
            </section>

            <div className="pt-6 border-t border-gray-100 text-center">
                <p className="text-gray-500 mb-4">By creating an account, you acknowledge that you have read and agree to these terms.</p>
                <Link href="/auth/register">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">I Agree & Sign Up</Button>
                </Link>
            </div>

        </div>
      </div>
    </div>
  );
}