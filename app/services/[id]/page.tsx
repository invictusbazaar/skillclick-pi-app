"use client"

import { useParams } from 'next/navigation';
import { Star, CheckCircle, ArrowLeft, MessageSquare, User, Menu, LogIn, UserPlus, Heart, Share2, Clock, Shield, Layers, Palette, Code, PenTool, Video, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// MOCK PODACI
const MOCK_SERVICES = [
    { id: 1, title: "Modern Minimalist Logo Design", author: "pixel_art", price: 50, rating: 5.0, reviews: 124, category: "Design", description: "I will design a professional logo...", deliveryTime: "2 Days", gradient: "from-pink-500 to-rose-500", icon: <Palette className="text-white h-10 w-10" /> },
    { id: 2, title: "Full Stack Web Development", author: "dev_guy", price: 300, rating: 4.9, reviews: 85, category: "Programming", description: "Complete website...", deliveryTime: "7 Days", gradient: "from-blue-500 to-cyan-500", icon: <Code className="text-white h-10 w-10" /> },
    { id: 3, title: "SEO Blog Writing", author: "writer_pro", price: 30, rating: 4.8, reviews: 210, category: "Writing", description: "SEO content...", deliveryTime: "1 Day", gradient: "from-emerald-500 to-teal-500", icon: <PenTool className="text-white h-10 w-10" /> },
    { id: 4, title: "Pro Video Editing", author: "vid_master", price: 100, rating: 5.0, reviews: 42, category: "Video", description: "Video editing...", deliveryTime: "3 Days", gradient: "from-orange-500 to-amber-500", icon: <Video className="text-white h-10 w-10" /> },
];

export default function ServiceDetailsPage() {
  const params = useParams();
  const serviceId = params.id ? parseInt(params.id as string) : null;
  
  const [service, setService] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderClicked, setOrderClicked] = useState(false);
  
  // Stanje za recenzije
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  
  const [menuOpen, setMenuOpen] = useState(false); 
  const [lang, setLang] = useState<"en" | "sr">("en");

  const t = {
    login: { en: "Login", sr: "Prijavi se" }, 
    register: { en: "Register", sr: "Registruj se" },
    messages: { en: "Messages", sr: "Poruke" },
    profile: { en: "Profile", sr: "Profil" },
  }

  useEffect(() => {
    if (!serviceId) return;

    const fetchData = async () => {
        try {
            const resService = await fetch('/api/services');
            if (resService.ok) {
                const allServices = await resService.json();
                let found = allServices.find((s: any) => s.id === serviceId);
                if (!found) found = MOCK_SERVICES.find(s => s.id === serviceId);
                setService(found || MOCK_SERVICES[0]); 
            } else {
                setService(MOCK_SERVICES.find(s => s.id === serviceId) || MOCK_SERVICES[0]);
            }

            const resReviews = await fetch(`/api/reviews?serviceId=${serviceId}`);
            if (resReviews.ok) {
                const data = await resReviews.json();
                setReviews(data);
            }
        } catch (error) {
            setService(MOCK_SERVICES[0]);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [serviceId]);

  // --- FUNKCIJA ZA PLAĆANJE (PI SDK) ---
  const handleOrder = async () => {
    setOrderClicked(true);

    // Provera da li smo u Pi Browseru
    if (typeof window !== 'undefined' && (window as any).Pi) {
        try {
            const Pi = (window as any).Pi;
            
            // 1. Autentifikacija
            const scopes = ['payments'];
            // Prazna funkcija za onIncompletePaymentFound (obavezna)
            const onIncompletePaymentFound = (payment: any) => { console.log("Incomplete payment found", payment); };
            
            await Pi.authenticate(scopes, onIncompletePaymentFound);

            // 2. Kreiranje Plaćanja (OVO OTVARA NOVČANIK!)
            const paymentData = {
                amount: service.price, // Cena iz oglasa
                memo: `Order: ${service.title}`, // Opis transakcije
                metadata: { serviceId: service.id, type: "service_order" },
            };

            const callbacks = {
                onReadyForServerApproval: (paymentId: string) => {
                    // Ovde bi inače išao poziv ka tvom backendu da odobri
                    alert(`Payment ID: ${paymentId} - Čekam server (Backend još nije povezan za ovo)`);
                },
                onReadyForServerCompletion: (paymentId: string, txid: string) => {
                    alert("Payment Completed! TXID: " + txid);
                },
                onCancel: (paymentId: string) => { 
                    alert("Payment Cancelled");
                    setOrderClicked(false);
                },
                onError: (error: any, payment: any) => { 
                    console.error("Payment Error", error);
                    alert("Payment Error: " + error.message);
                    setOrderClicked(false);
                },
            };

            // POKRENI!
            await Pi.createPayment(paymentData, callbacks);

        } catch (err: any) {
            alert("Pi Error: " + err.message);
            setOrderClicked(false);
        }
    } else {
        // Fallback za PC (Simulacija)
        alert(`⚠️ SIMULACIJA (PC): Naručujete uslugu za ${service.price} Pi.`);
        setTimeout(() => { setOrderClicked(false); }, 2000); 
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
      e.preventDefault();
      // (Logika za review ostaje ista...)
  };

  const buttonStyle = "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md px-4 py-1 h-9 transition-all text-sm font-medium";

  if (loading || !service) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-medium bg-blue-50/50">Loading...</div>;

  return (
    <div className="min-h-screen bg-blue-50/50">
      
      {/* HEADER */}
      <header className="border-b border-blue-100 bg-blue-50/50 sticky top-0 z-50"> 
        <div className="container mx-auto px-4 py-2 flex items-center justify-between"> 
          <Link href="/"><img src="/skillclick_logo.png" alt="SkillClick" width={140} height={30} className="object-contain" /></Link>
          <div className="flex items-center gap-3">
             <Link href="/services"><Button variant="outline" className={`hidden md:flex ${buttonStyle}`}>Explore</Button></Link>
             <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-600"><Menu className="h-5 w-5" /></Button>
             <div className="hidden md:flex gap-3 items-center ml-2"><Link href="/auth/login"><Button variant="outline" className={buttonStyle}