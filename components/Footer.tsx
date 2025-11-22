import Link from 'next/link';
import { Mail, Heart, Github, Twitter, Linkedin } from 'lucide-react'; 

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const companyName = "Invictus Bazaar"; 
  const contactEmail = "invictusbazaar@gmail.com"; 

  // Stil za linkove 
  const linkStyle = "text-gray-600 border-b-2 border-transparent hover:text-blue-600 hover:border-blue-600 pb-0.5 transition-all inline-block cursor-pointer";
  // Stil za ikonice
  const iconStyle = "text-gray-500 hover:text-blue-600 transition-colors cursor-pointer";

  return (
    <footer className="bg-blue-50/50 border-t border-blue-100 mt-auto"> 
      <div className="container mx-auto px-4 py-12">
        
        {/* --- GLAVNI DEO (4 KOLONE) --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"> 
          
          {/* KOLONA 1: BRENDING (LEVO) */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {companyName} 
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              The premier marketplace for digital skills. Connecting talent with opportunities in the Pi Network ecosystem.
            </p>
          </div>

          {/* KOLONA 2: PLATFORMA */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              {/* OVO JE POPRAVLJENO: Linkovi sada vode na prave stranice */}
              <li><Link href="/services" className={linkStyle}>Browse Services</Link></li>
              <li><Link href="/create" className={linkStyle}>Post a Service</Link></li>
              <li><Link href="/profile" className={linkStyle}>My Profile</Link></li>
            </ul>
          </div>

          {/* KOLONA 3: PODRŠKA */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className={linkStyle}>FAQ</Link></li>
              <li><Link href="/terms" className={linkStyle}>Terms of Service</Link></li>
              <li><Link href="/privacy" className={linkStyle}>Privacy Policy</Link></li>
            </ul>
          </div>

          {/* KOLONA 4: PRATITE NAS */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <Link href="#" className={iconStyle}><Github className="h-6 w-6" /></Link>
              <Link href="#" className={iconStyle}><Twitter className="h-6 w-6" /></Link>
              <Link href="#" className={iconStyle}><Linkedin className="h-6 w-6" /></Link>
            </div>
          </div>
        </div>

        {/* --- COPYRIGHT I KONTAKT --- */}
        <div className="border-t border-gray-200 pt-8 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
            
            <div className="flex items-center mb-4 md:mb-0">
                <Mail className="w-4 h-4 mr-2 text-gray-900" />
                <p className="text-gray-900 font-medium">
                    Support: 
                    <a 
                    href={`mailto:${contactEmail}`} 
                    className="text-gray-900 hover:text-blue-600 hover:underline transition-colors ml-1 font-bold"
                    >
                    {contactEmail}
                    </a>
                </p>
            </div>

            <p className="text-center md:text-right">
                <span className="text-gray-900 font-bold mr-1">&copy; {currentYear} {companyName}.</span> 
                Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 inline-block mx-1" /> in Novi Sad.
            </p>
        </div>

      </div>
    </footer>
  );
}