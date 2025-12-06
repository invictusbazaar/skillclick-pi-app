"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Mail, MapPin, Heart, Twitter, Facebook, Instagram, Linkedin, Globe } from 'lucide-react';

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [clickedLink, setClickedLink] = useState<string | null>(null);

  useEffect(() => {
    setClickedLink(null);
  }, [pathname]);

  const handleSupportClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault(); 
    setClickedLink(href);

    setTimeout(() => {
      router.push(href);
    }, 500);
  };

  const getLinkClass = (href: string) => {
    const isActive = pathname === href || clickedLink === href;
    return `transition-colors duration-200 ${
      isActive ? 'text-purple-500 font-medium' : 'text-gray-400 hover:text-purple-400 active:text-purple-400'
    }`;
  };

  // --- PAMETNA FUNKCIJA ZA EMAIL ---
  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const email = "invictusbazaar@gmail.com";
    const subject = "SkillClick Contact";

    // Proveravamo da li je korisnik na mobilnom uređaju
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // AKO JE MOBILNI: Koristi "mailto"
      // Ovo otvara tvoju podrazumevanu aplikaciju (Gmail app) gde si već ulogovan.
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    } else {
      // AKO JE KOMPJUTER: Otvori onaj fini Gmail pop-up prozor
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
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 font-sans">
      <div className="container mx-auto px-6 py-8 md:py-16">
        
        {/* --- GLAVNI DEO --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-10">
          
          {/* KOLONA 1 */}
          <div className="space-y-4 text-center lg:text-left lg:col-span-4">
            <h3 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center lg:justify-start gap-2">
              <Globe className="w-6 h-6 text-purple-500" /> SkillClick
            </h3>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs text-center lg:text-left mx-auto lg:mx-0">
              The premier decentralized freelance marketplace built on the Pi Network ecosystem. 
              We bridge the gap between global talent and digital currency.
            </p>
          </div>
          
          {/* KOLONA 2 */}
          <div className="text-center lg:col-span-3">
            <h4 className="text-white font-bold mb-4">Support & Legal</h4>
            <ul className="space-y-2 text-sm flex flex-col items-center">
              <li><Link href="/help" onClick={(e) => handleSupportClick(e, '/help')} className={getLinkClass('/help')}>Help & Support</Link></li>
              <li><Link href="/trust" onClick={(e) => handleSupportClick(e, '/trust')} className={getLinkClass('/trust')}>Trust & Safety</Link></li>
              <li><Link href="/privacy" onClick={(e) => handleSupportClick(e, '/privacy')} className={getLinkClass('/privacy')}>Privacy Policy</Link></li>
              <li><Link href="/terms" onClick={(e) => handleSupportClick(e, '/terms')} className={getLinkClass('/terms')}>Terms of Service</Link></li>
            </ul>
          </div>

          {/* KOLONA 3: CONTACT US */}
          <div className="text-center lg:col-span-5 flex flex-col lg:items-end">
            <div className="text-left inline-block"> 
              <h4 className="text-white font-bold mb-4 text-center lg:text-left">Contact Us</h4>
              <ul className="space-y-4 text-sm flex flex-col items-center lg:items-start">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                  <span>Invictus Bazaar Team<br />Global Pi Network Community</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-500 shrink-0" />
                  
                  {/* --- LINK KOJI POZIVA PAMETNU FUNKCIJU --- */}
                  <a 
                    href="#" 
                    onClick={handleEmailClick}
                    className="hover:text-white active:text-white transition-colors text-purple-200 cursor-pointer"
                  >
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