"use client"

import { useParams, useRouter } from 'next/navigation';
import { Star, CheckCircle, MapPin, ArrowLeft, MessageSquare, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// --- MOCK DATA ---
const mockService = {
  id: 123,
  title: "Modern Website Design (React/Next.js)",
  price: 350,
  description: "I will design and develop a modern, fast, and responsive website using the latest React framework (Next.js 14). Optimized for SEO and mobile viewing. Includes 3 revisions and basic deployment support.",
  author: "Stefan K. (DevMaster)",
  rating: 5.0,
  reviewsCount: 15,
  deliveryTime: "5 Days",
  location: "Belgrade, Serbia",
  imagePlaceholder: "💻",
  category: "Programming"
};

// --- DODAT LOKALNI PREVOD ZA HEADER ---
const t = {
    messages: { en: "Messages", sr: "Poruke" },
    profile: { en: "Profile", sr: "Profil" },
    offerService: { en: "Post a Service", sr: "Ponudi Svoju Uslugu" },
    transactionSent: { en: "Transaction Sent!", sr: "Transakcija Poslata!" }
}


export default function ServiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = parseInt(params.id as string);
  
  // SVE DEKLARACIJE STANJA SU OVDE JEDNOM I ISPRAVNO:
  const [service, setService] = useState<any>(null); 
  const [loading, setLoading] = useState(true);
  const [orderClicked, setOrderClicked] = useState(false);
  const [lang] = useState<"en" | "sr">("sr"); 
  const [menuOpen, setMenuOpen] = useState(false); 


  // FUNKCIJA ZA POZIV API-JA I PRONALAŽENJE OGLASA
  useEffect(() => {
    const fetchServiceData = async () => {
        try {
            const response = await fetch('/api/services');
            if (response.ok) {
                const allServices = await response.json();
                // Tražimo oglas po ID-u iz URL-a
                const foundService = allServices.find((s: any) => s.id === serviceId);
                
                if (foundService) {
                    setService(foundService);
                } else {
                    // Ako oglas nije pronađen, koristi fiksni mock
                    setService(mockService); 
                }
            }
        } catch (error) {
            console.error("Failed to load service data:", error);
            setService(mockService); // Fallback na mock
        } finally {
            setLoading(false);
        }
    };
    
    fetchServiceData();
  }, [serviceId]);


  // Simulacija Pi plaćanja
  const handleOrder = () => {
    if (typeof window !== 'undefined' && (window as any).Pi) {
      setOrderClicked(true); 
      alert(`Simulacija: Pokreće se Pi transakcija za ${service.price} Pi.`);
    } else {
      alert(`⚠️ SIMULACIJA: Ordering service "${service.title}" for ${service.price} Pi.\n\nTo really work, you must be inside the Pi Browser!`);
      setOrderClicked(true);
    }
    
    setTimeout(() => {
        setOrderClicked(false);
    }, 4000); 
  };

  // Prikaz učitavanja
  if (loading || !service) {
      return (
          <div className="min-h-screen flex items-center justify-center text-primary font-semibold">
              Učitavanje detalja oglasa...
          </div>
      );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border"> 
        <div className="container mx-auto px-4 py-3 flex items-center justify-between"> 
          
          <Link href="/" 
                className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-700 to-amber-500 text-transparent bg-clip-text"> 
            SkillClick
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => {}} className="text-xs font-semibold">
              {lang === "en" ? "SR" : "EN"}
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden md:flex items-center gap-2">
              <Link href="/messages">
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t.messages[lang]}
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {t.profile[lang]}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* --- MOBILNI MENI --- */}
      {menuOpen && (
          <div className="md:hidden border-t border-border bg-card absolute w-full z-30 shadow-lg animate-in fade-in slide-in-from-top-1">
            <div className="container mx-auto px-4 py-2 flex flex-col gap-2">
              <Link href="/create" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full justify-start border-primary text-primary">
                      {t.offerService[lang]}
                    </Button>
              </Link>
              <Link href="/messages" onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {t.messages[lang]}
                    </Button>
              </Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        {t.profile[lang]}
                    </Button>
              </Link>
            </div>
          </div>
      )}
      {/* --- KRAJ MOBILNOG MENIJA --- */}
      
      <div className="max-w-5xl mx-auto">
        
        {/* Breadcrumb / Back button */}
        <Link href="/services">
          <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
          </Button>
        </Link>

        {/* --- MAIN LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEVA KOLONA: OPIS I SLIKE (2/3 širine) */}
          <div className="lg:col-span-2 space-y-8">
            <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-purple-700 to-amber-500 text-transparent bg-clip-text">
              {service.title}
            </h1>
            
            {/* Rating and Author */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center text-yellow-500 font-bold">
                <Star className="h-4 w-4 fill-current mr-1" /> {service.rating} ({service.reviewsCount || 5} Reviews)
              </span>
              <span className="text-gray-500">|</span>
              <span className="font-medium text-primary">{service.author}</span>
            </div>

            {/* Image Placeholder */}
            <Card className="shadow-xl">
              <div className="h-80 bg-muted flex items-center justify-center text-9xl rounded-lg">
                {service.imagePlaceholder || "💼"}
              </div>
            </Card>

            {/* Full Description */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-3">Service Details</h2>
                <p className="text-gray-700 leading-relaxed">{service.description}</p>
                <ul className="mt-4 space-y-2 list-disc list-inside text-gray-700">
                    <li>Delivery within 5 Days</li>
                    <li>Source Code Provided</li>
                    <li>Fully Responsive Design</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* DESNA KOLONA: CENA I NARUČIVANJE (1/3 širine) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-2xl border-2 border-primary/50">
              <CardContent className="p-6 space-y-5">
                
                {/* Price Box */}
                <div className="text-4xl font-extrabold text-center bg-gradient-to-r from-purple-600 to-amber-500 text-transparent bg-clip-text">
                  {service.price} π
                </div>

                {/* Delivery Time */}
                <div className="flex items-center justify-between border-y py-3 text-sm">
                    <span className='font-semibold'>Delivery Time:</span>
                    <span className='font-bold text-primary'>5 Days</span>
                </div>

                {/* Main Action Button */}
                <Button 
                    size="lg" 
                    className="w-full text-lg bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600"
                    onClick={handleOrder} 
                    disabled={orderClicked}
                >
                  {orderClicked ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" /> Transaction Sent!
                      </>
                  ) : (
                      `Order Now for ${service.price} Pi`
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                    <MapPin className="h-3 w-3" /> Based in Belgrade, Serbia
                </p>

              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}