"use client"

import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, Heart, Twitter, Facebook, Instagram, Linkedin, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 font-sans">
      <div className="container mx-auto px-6 py-8 md:py-16">
        
        {/* --- GLAVNI DEO --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-10">
          
          {/* KOLONA 1: O NAMA - ISPRAVLJENO (Centrirano na mob, levo na desktop) */}
          <div className="space-y-4 text-center lg:text-left lg:col-span-4">
            <h3 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center lg:justify-start gap-2">
              <Globe className="w-6 h-6 text-purple-500" /> SkillClick
            </h3>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs text-center lg:text-left mx-auto lg:mx-0">
              The premier decentralized freelance marketplace built on the Pi Network ecosystem. 
              We bridge the gap between global talent and digital currency.
            </p>
          </div>
          
          {/* KOLONA 2: SUPPORT & LEGAL - CENTRIRANO (lg:col-span-3) */}
          <div className="text-center lg:col-span-3">
            <h4 className="text-white font-bold mb-4">Support & Legal</h4>
            <ul className="space-y-2 text-sm flex flex-col items-center">
              <li><Link href="/help" className="hover:text-purple-400 active:text-purple-400 transition-colors">Help & Support</Link></li>
              <li><Link href="/trust" className="hover:text-purple-400 active:text-purple-400 transition-colors">Trust & Safety</Link></li>
              <li><Link href="/selling" className="hover:text-purple-400 active:text-purple-400 transition-colors">Selling on SkillClick</Link></li>
              <li><Link href="/privacy" className="hover:text-purple-400 active:text-purple-400 transition-colors text-gray-400">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-purple-400 active:text-purple-400 transition-colors text-gray-400">Terms of Service</Link></li>
            </ul>
          </div>

          {/* KOLONA 3: CONTACT US - IZMENJENO */}
          {/* lg:items-end gura ceo blok desno, a unutrašnji div drži tekst levo */}
          <div className="text-center lg:col-span-5 flex flex-col lg:items-end">
            
            {/* Ovaj unutrašnji div drži sadržaj na okupu i poravnava tekst ulevo */}
            <div className="text-left inline-block"> 
              <h4 className="text-white font-bold mb-4 text-center lg:text-left">Contact Us</h4>
              <ul className="space-y-4 text-sm flex flex-col items-center lg:items-start">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                  <span>
                    Invictus Bazaar Team<br />
                    Global Pi Network Community
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-500 shrink-0" />
                  <a href="mailto:invictusbazaar@gmail.com" className="hover:text-white active:text-white transition-colors text-purple-200">
                    invictusbazaar@gmail.com
                  </a>
                </li>
              </ul>
              
              <div className="flex gap-4 pt-4 justify-center lg:justify-start">
                <a href="#" className="hover:text-purple-400 active:text-purple-400 transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="hover:text-purple-400 active:text-purple-400 transition-colors"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="hover:text-purple-400 active:text-purple-400 transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="hover:text-purple-400 active:text-purple-400 transition-colors"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- DONJI DEO --- */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} SkillClick. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
            <span>From Novi Sad with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>to the World.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
