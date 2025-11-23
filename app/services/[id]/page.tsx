"use client"

import { useParams } from 'next/navigation';
import { Star, CheckCircle, MapPin, ArrowLeft, MessageSquare, User, Menu, LogIn, UserPlus, Heart, Share2, Clock, Shield, Layers, Palette, Code, PenTool, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// MOCK PODACI (Samo kao rezerva)
const MOCK_SERVICES = [
    { id: 1, title: "Modern Minimalist Logo Design", author: "pixel_art", price: 50, rating: 5.0, reviews: 124, category: "Design", description: "I will design a professional logo...", deliveryTime: "2 Days", gradient: "from-pink-500 to-rose-500", icon: <Palette className="text-white h-10 w-10" /> },
    { id: 2, title: "Full Stack Web Development", author: "dev_guy", price: 300, rating: 4.9, reviews: 85, category: "Programming", description: "Complete web solution...", deliveryTime: "7 Days", gradient: "from-blue-500 to-cyan-500", icon: <Code className="text-white h-10 w-10" /> },
];

export default function ServiceDetailsPage() {
  const params = useParams();
  
  // FIX: Sigurna konverzija ID-a
  const serviceId = params.id ? parseInt(params.id as string) : null;
  
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

  // --- 1. UČITAVANJE PODATAKA (FIXED) ---
  useEffect(() => {
    if (!serviceId) return; // Ako nema ID-a, ne radi ništa

    const fetchServiceData = async () => {
        try {
            const response = await fetch('/api/services');
            if (response.ok) {
                const allServices = await response.json();
                
                // Prvo traži u PRAVOJ BAZI
                let found = allServices.find((s: any) => s.id === serviceId);
                
                // Ako nema u bazi, traži u MOCK podacima
                if (!found) {
                    found = MOCK_SERVICES.find(s => s.id === serviceId);
                }

                setService(found || null);
            } else {
                // Ako API ne radi, traži u mocku
                const mockFound = MOCK_SERVICES.find(s => s.id === serviceId);
                setService(mockFound || null);
            }
        } catch (error) {
            const mockFound = MOCK_SERVICES.find(s => s.id === serviceId);
            setService(mockFound || null);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-medium bg-blue-50/50">Loading details...</div>;

  if (!service) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50/50">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Service Not Found</h2>
            <p className="text-gray-500 mb-6">The gig you are looking for does not exist or has been removed.</p>
            <Link href="/services"><Button>Back to Marketplace</Button></Link>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-blue-50/50">
      
      {/* HEADER (ISTI) */}
      <header className="border-b border-blue-100 bg-blue-50/50 sticky top-0 z-50"> 
        <div className="container mx-auto px-4 py-2 flex items-center justify-between"> 
          <Link href="/" className="flex items-center">
            <img src="/skillclick_logo.png" alt="SkillClick" width={140} height={30} className="object-contain" />
          </Link>
          <div className="flex items-center gap-3">
             <Link href="/services"><Button variant="outline" className={`hidden md:flex ${buttonStyle}`}>Explore</Button></Link>
             <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-600"><Menu className="h-5 w-5" /></Button>
             <div className="hidden md:flex gap-3 items-center ml-2"><Link href="/auth/login"><Button variant="outline" className={buttonStyle}><LogIn className="h-4 w-4 mr-1" />{t.login[lang]}</Button></Link><Link href="/auth/register"><Button variant="outline" className={buttonStyle}><UserPlus className="h-4 w-4 mr-1" />{t.register[lang]}</Button></Link></div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="container mx-auto px-4 py-8">
        <Link href="/services" className="inline-flex items-center text-sm text-blue-600 hover:underline mb-6 transition-colors font-medium"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Marketplace</Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* LEVO */}
          <div className="lg:col-span-2 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{service.title}</h1>
                <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold text-gray-900">{service.author}</span>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center text-yellow-500 font-bold"><Star className="h-4 w-4 fill-current mr-1" /> {service.rating || 5.0}</div>
                </div>
            </div>

            <div className={`rounded-xl h-64 md:h-96 flex items-center justify-center text-white text-8xl shadow-sm bg-gradient-to-br ${service.gradient || "from-blue-500 to-purple-600"}`}>
                {service.icon || (service.image && service.image.length < 5 ? service.image : <Layers className="h-20 w-20" />)}
            </div>

            <Card className="border-gray-200 shadow-sm bg-white"><CardContent className="p-6"><h3 className="text-lg font-bold text-gray-900 mb-4">About This Gig</h3><p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{service.description}</p></CardContent></Card>
          </div>

          {/* DESNO */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg border-blue-100 overflow-hidden bg-white">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center"><span className="font-bold text-gray-700 text-sm uppercase tracking-wide">Standard</span><span className="text-3xl font-bold text-gray-900">{service.price} π</span></div>
              <CardContent className="p-6 space-y-6"><Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg h-12" onClick={handleOrder} disabled={orderClicked}>{orderClicked ? <><CheckCircle className="mr-2 h-5 w-5" /> Sent!</> : 'Order Now'}</Button></CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}