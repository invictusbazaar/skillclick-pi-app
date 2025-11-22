"use client"

import { useParams } from 'next/navigation';
import { Star, CheckCircle, MapPin, ArrowLeft, MessageSquare, User, Menu, LogIn, UserPlus, Heart, Share2, Clock, Shield, Layers, Palette, Code, PenTool, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// MOCK PODACI (Istih 4 kao na Home strani, za svaki slučaj)
const MOCK_SERVICES = [
    { 
      id: 1, title: "Modern Minimalist Logo Design", author: "pixel_art", price: 50, rating: 5.0, reviews: 124, category: "Design", 
      description: "I will design a professional, modern, and minimalist logo for your brand. Includes vector files and 3D mockup.", 
      deliveryTime: "2 Days", gradient: "from-pink-500 to-rose-500", icon: <Palette className="text-white h-10 w-10" /> 
    },
    { 
      id: 2, title: "Full Stack Web Development", author: "dev_guy", price: 300, rating: 4.9, reviews: 85, category: "Programming", 
      description: "I will build a fully responsive, fast, and SEO-optimized website using Next.js and Tailwind CSS.", 
      deliveryTime: "7 Days", gradient: "from-blue-500 to-cyan-500", icon: <Code className="text-white h-10 w-10" /> 
    },
    { 
      id: 3, title: "SEO Blog Writing & Copy", author: "writer_pro", price: 30, rating: 4.8, reviews: 210, category: "Writing", 
      description: "High-quality, engaging, and SEO-friendly content for your blog or website.", 
      deliveryTime: "1 Day", gradient: "from-emerald-500 to-teal-500", icon: <PenTool className="text-white h-10 w-10" /> 
    },
    { 
      id: 4, title: "Pro Video Editing & VFX", author: "vid_master", price: 100, rating: 5.0, reviews: 42, category: "Video", 
      description: "Professional video editing for YouTube, Instagram, or corporate videos with VFX.", 
      deliveryTime: "3 Days", gradient: "from-orange-500 to-amber-500", icon: <Video className="text-white h-10 w-10" /> 
    },
];

export default function ServiceDetailsPage() {
  const params = useParams();
  const serviceId = parseInt(params.id as string);
  
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orderClicked, setOrderClicked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); 
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [lang, setLang] = useState<"en" | "sr">("en");

  const t = {
    login: { en: "Login", sr: "Prijavi se" }, 
    register: { en: "Register", sr: "Registruj se" },
    messages: { en: "Messages", sr: "Poruke" },
    profile: { en: "Profile", sr: "Profil" },
  }

  // UČITAVANJE PODATAKA
  useEffect(() => {
    const fetchServiceData = async () => {
        try {
            const response = await fetch('/api/services');
            if (response.ok) {
                const allServices = await response.json();
                const combined = [...MOCK_SERVICES, ...allServices];
                const found = combined.find((s: any) => s.id === serviceId);
                
                setService(found || MOCK_SERVICES[0]); 
            } else {
                setService(MOCK_SERVICES.find(s => s.id === serviceId) || MOCK_SERVICES[0]);
            }
        } catch (error) {
            setService(MOCK_SERVICES.find(s => s.id === serviceId) || MOCK_SERVICES[0]);
        } finally {
            setLoading(false);
        }
    };
    fetchServiceData();
  }, [serviceId]);

  const handleOrder = () => {
    if (typeof window !== 'undefined' && (window as any).Pi) {
      setOrderClicked(true); 
      alert(`Pi Payment: Requesting ${service.price} Pi...`);
    } else {
      alert(`⚠️ SIMULACIJA: Naručujete uslugu za ${service.price} Pi.`);
      setOrderClicked(true);
    }
    setTimeout(() => { setOrderClicked(false); }, 3000); 
  };

  const buttonStyle = "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md px-4 py-1 h-9 transition-all text-sm font-medium";

  if (loading || !service) {
      return <div className="min-h-screen flex items-center justify-center text-blue-600 font-medium bg-blue-50/50">Loading details...</div>;
  }

  return (
    <div className="min-h-screen bg-blue-50/50">
      
      {/* --- HEADER (ISTI KAO NA OSTALIM STRANAMA) --- */}
      <header className="border-b border-blue-100 bg-blue-50/50 sticky top-0 z-50"> 
        <div className="container mx-auto px-4 py-2 flex items-center justify-between"> 
          <Link href="/" className="flex items-center">
            <img src="/skillclick_logo.png" alt="SkillClick" width={140} height={30} className="object-contain" />
          </Link>
          
          <div className="flex items-center gap-3">
             <Button variant="outline" onClick={() => setLang(lang === "en" ? "sr" : "en")} className={buttonStyle}>
                {lang === "en" ? "SR" : "EN"}
             </Button>

             <Link href="/services">
                <Button variant="outline" className={`hidden md:flex ${buttonStyle}`}>Explore</Button>
             </Link>
             <Link href="/auth/register">
                <Button variant="outline" className={`hidden md:flex ${buttonStyle}`}>Become a Seller</Button>
             </Link>

             <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-600">
               <Menu className="h-5 w-5" />
             </Button>

             {isLoggedIn ? (
                <div className="hidden md:flex gap-3 ml-2">
                    <Link href="/messages"><Button variant="ghost" className="h-8 px-2 text-xs text-gray-600 hover:text-blue-600"><MessageSquare className="h-4 w-4 mr-1" />{t.messages[lang]}</Button></Link>
                    <Link href="/profile"><Button variant="ghost" className="h-8 px-2 text-xs text-gray-600 hover:text-blue-600"><User className="h-4 w-4 mr-1" />{t.profile[lang]}</Button></Link>
                </div>
             ) : (
                <div className="hidden md:flex gap-3 items-center ml-2">
                    <Link href="/auth/login"><Button variant="outline" className={buttonStyle}><LogIn className="h-4 w-4 mr-1" />{t.login[lang]}</Button></Link>
                    <Link href="/auth/register"><Button variant="outline" className={buttonStyle}><UserPlus className="h-4 w-4 mr-1" />{t.register[lang]}</Button></Link>
                </div>
             )}
          </div>
        </div>
      </header>
      
      {/* --- MOBILNI MENI (ZA DETALJE) --- */}
      {menuOpen && (
          <div className="md:hidden border-t border-border bg-white absolute w-full z-50 shadow-xl animate-in fade-in slide-in-from-top-2 p-4">
             {/* ... (Isti sadržaj menija kao na Home) ... */}
             <Link href="/services" className="block py-2 text-gray-600">Explore</Link>
             <Link href="/auth/register" className="block py-2 text-gray-600">Become a Seller</Link>
          </div>
      )}

      {/* --- GLAVNI DEO --- */}
      <div className="container mx-auto px-4 py-8">
        
        <Link href="/services" className="inline-flex items-center text-sm text-blue-600 hover:underline mb-6 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* LEVO: DETALJI (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Naslov i Autor */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{service.title}</h1>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                            {service.author ? service.author[0].toUpperCase() : 'U'}
                        </div>
                        <span className="font-semibold text-gray-900 hover:underline cursor-pointer">{service.author}</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center text-yellow-500 font-bold">
                        <Star className="h-4 w-4 fill-current mr-1" /> {service.rating || '5.0'} 
                        <span className="text-gray-400 font-normal ml-1">({service.reviews || 0} reviews)</span>
                    </div>
                </div>
            </div>

            {/* Slika (Veliki Gradient) */}
            <div className={`rounded-xl h-64 md:h-96 flex items-center justify-center text-white text-8xl shadow-sm bg-gradient-to-br ${service.gradient || "from-blue-500 to-purple-600"}`}>
                {service.icon || (service.image && service.image.length < 5 ? service.image : <Layers className="h-20 w-20" />)}
            </div>

            {/* Opis */}
            <Card className="border-gray-200 shadow-sm bg-white">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">About This Gig</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {service.description || "No description provided for this service."}
                    </p>
                    
                    <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <span>{service.deliveryTime || "3 Days"} Delivery</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Shield className="w-5 h-5 text-green-500" />
                            <span>Secure Pi Payment</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

          </div>

          {/* DESNO: CENA I PORUČIVANJE (Sticky) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg border-blue-100 overflow-hidden bg-white">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-700 text-sm uppercase tracking-wide">Standard</span>
                  <span className="text-3xl font-bold text-gray-900">{service.price} π</span>
              </div>
              
              <CardContent className="p-6 space-y-6">
                <p className="text-sm text-gray-600">
                    Complete package including source files and revisions.
                </p>

                <div className="space-y-3">
                    <Button 
                        size="lg" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg h-12 shadow-blue-200 shadow-lg transition-all"
                        onClick={handleOrder}
                        disabled={orderClicked}
                    >
                        {orderClicked ? <><CheckCircle className="mr-2 h-5 w-5" /> Sent!</> : 'Order Now'}
                    </Button>
                    
                    <Button variant="outline" className="w-full border-gray-300 text-gray-600 hover:bg-gray-50">
                        <MessageSquare className="mr-2 h-4 w-4" /> Contact Seller
                    </Button>
                </div>
                
                <div className="text-xs text-center text-gray-400 flex items-center justify-center gap-2 pt-2">
                    <Share2 className="w-3 h-3" /> Share this Gig
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}