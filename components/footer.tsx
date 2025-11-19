import Link from 'next/link';
import { Mail, Heart, Github, Twitter, Linkedin } from 'lucide-react'; // Dodati svi potrebni importi

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const companyName = "Invictus Bazaar"; 
  const contactEmail = "invictusbazaar@gmail.com"; 

  return (
    <footer className="bg-card/80 backdrop-blur-sm border-t border-border"> 
      <div className="container mx-auto px-4 py-8">
        
        {/* --- GLAVNI GRID: 4 KOLONE (DESNI RASPORED) --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8"> 
          
          {/* KOLONA 1: BRENDING I OPIS (LEVO) */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {companyName} 
            </h3>
            <p className="text-sm text-gray-800 dark:text-gray-300 max-w-sm">
              The premier marketplace for digital skills. Connecting talent with opportunities in the Pi Network.
            </p>
          </div>

          {/* KOLONA 2: PLATFORMA */}
          <div>
            <h4 className="font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/services" className="hover:text-primary transition-colors">Browse Services</Link></li>
              <li><Link href="/create" className="hover:text-primary transition-colors">Post a Service</Link></li>
              <li><Link href="/profile" className="hover:text-primary transition-colors">My Profile</Link></li>
            </ul>
          </div>

          {/* KOLONA 3: PODRŠKA */}
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* KOLONA 4: PRATITE NAS */}
          <div>
            <h4 className="font-semibold mb-3">Follow Us</h4>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Github className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-blue-400 transition-colors"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-blue-600 transition-colors"><Linkedin className="h-5 w-5" /></Link>
            </div>
          </div>
        </div>

        {/* --- COPYRIGHT I KONTAKT --- */}
        <div className="border-t border-border pt-6 text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center">
            
            <div className="flex items-center text-gray-900 dark:text-gray-100 mb-2 md:mb-0">
                <Mail className="w-4 h-4 mr-2" />
                <p>
                    Za podršku: 
                    <a 
                    href={`mailto:${contactEmail}`} 
                    className="text-primary hover:text-purple-500 transition-colors ml-1 font-medium"
                    >
                    {contactEmail}
                    </a>
                </p>
            </div>

            <p className="text-xs text-center md:text-right">
                <span className="text-gray-900 dark:text-gray-100 font-semibold mr-1">&copy; 2025 Invictus Bazaar.</span> Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 inline-block" /> in Novi Sad.
            </p>
        </div>

      </div>
    </footer>
  );
}