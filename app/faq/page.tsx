"use client"

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    question: "What is SkillClick?",
    answer: "SkillClick is a decentralized freelance marketplace powered by the Pi Network. It allows users to offer services (gigs) or hire freelancers using Pi cryptocurrency."
  },
  {
    question: "How do I pay for services?",
    answer: "All payments are processed securely using the Pi Network blockchain. Funds are held in our Escrow system until you approve the delivered work, ensuring your Pi is safe."
  },
  {
    question: "How do I withdraw my Pi coins?",
    answer: "You can withdraw your earned Pi coins directly to your Pi Wallet through your profile dashboard. The transfer is processed securely on the Pi Network blockchain."
  },
  {
    question: "Is there a fee for selling?",
    answer: "Listing a service is free. However, a small platform fee (e.g., 5%) may be deducted from successful transactions to support the maintenance of the platform."
  },
  {
    question: "How do I become a seller?",
    answer: "Simply click on 'Become a Seller' or 'Post a Service', create an account, and fill out the details of your gig. Once published, it will be visible to all users."
  },
  {
    question: "What if I'm not satisfied with the work or the freelancer is late?",
    answer: "We encourage communication first. If a seller misses a deadline or the work is unsatisfactory, you can cancel or open a dispute. Locked Pi funds can be fully or partially refunded based on Admin mediation."
  },
  {
    question: "Can I communicate with clients outside the platform?",
    answer: "No, this is strictly against our terms. For your protection, all communication and file sharing must happen within SkillClick. We cannot protect you in a dispute if you communicate elsewhere."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        
        <Link href="/" className="inline-flex items-center text-blue-600 hover:underline mb-6 font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <HelpCircle className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
                <p className="text-gray-500">Everything you need to know about SkillClick.</p>
            </div>
        </div>

        <div className="space-y-4">
            {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button 
                        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-blue-50 transition-colors text-left"
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    >
                        <span className="font-semibold text-gray-800">{faq.question}</span>
                        {openIndex === index ? <ChevronUp className="text-blue-600" /> : <ChevronDown className="text-gray-400" />}
                    </button>
                    
                    {openIndex === index && (
                        <div className="p-4 bg-white text-gray-600 border-t border-gray-100 leading-relaxed">
                            {faq.answer}
                        </div>
                    )}
                </div>
            ))}
        </div>

        <div className="mt-10 text-center p-6 bg-blue-50 rounded-lg">
            <p className="text-gray-700 font-medium mb-2">Still have questions?</p>
            <a href="mailto:invictusbazaar@gmail.com" className="text-blue-600 font-bold hover:underline">Contact Support</a>
        </div>

      </div>
    </div>
  );
}
