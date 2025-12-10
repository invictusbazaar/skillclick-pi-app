"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, Star, Heart, Clock, CheckCircle, Share2, ShieldCheck, MessageCircle,
  PenTool, Monitor, Briefcase, Video, Code, Music, Database, Coffee, Layers,
  Bike, Wrench, Car, Smartphone, Globe, Megaphone, Bot, PawPrint, Palette, 
  GraduationCap, Camera, Home, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"

import { SERVICES_DATA } from "@/lib/data"

export default function ServiceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params?.id)
  
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // 👇 Stanje za animaciju dugmeta
  const [isContactActive, setIsContactActive] = useState(false)

  useEffect(() => {
    if (id) {
        let allServices = [...SERVICES_DATA];
        if (typeof window !== 'undefined') {
            const localServicesStr = localStorage.getItem('skillclick_services');
            if (localServicesStr) {
                try {
                    const localServices = JSON.parse(localServicesStr);
                    allServices = [...localServices, ...allServices];
                } catch (e) {
                    console.error("Greška pri čitanju oglasa:", e);
                }
            }
        }
        const foundService = allServices.find(s => s.id === id);
        setService(foundService || null)
        setLoading(false)
    }
  }, [id])

  // 👇 FUNKCIJA: Aktivira boju, čeka 0.5s, pa preusmerava na poruke
  const handleContactClick = () => {
    setIsContactActive(true) // 1. Pali ljubičastu boju
    
    setTimeout(() => {
        setIsContactActive(false) // 2. Gasi boju (opciono)
        // 👇 3. Preusmerava na stranicu za poruke (možeš dodati i parametre, npr: ?user=Ime)
        router.push('/messages') 
    }, 500) // Čeka 500ms pre navigacije
  }

  // 👇 PAMETNA FUNKCIJA ZA IKONE
  const getSmartIcon = (service: any) => {
    const iconClass = "w-24 h-24 text-white/90 drop-shadow-lg transform transition-transform duration-700 group-hover:scale-110"; 
    
    const titleLower = (service.title || "").toLowerCase();
    const category = service.category || "";

    // --- 1. PROVERA KLJUČNIH REČI ---
    if (titleLower.includes('bicikl') || titleLower.includes('bike') || titleLower.includes('cycling')) 
        return <Bike className={iconClass} />;

    if (titleLower.includes('auto') || titleLower.includes('opel') || titleLower.includes('alfa') || titleLower.includes('bmw') || titleLower.includes('vozil') || titleLower.includes('car')) 
      return <Car className={iconClass} />;
    
    if (titleLower.includes('popravka') || titleLower.includes('majstor') || titleLower.includes('servis') || titleLower.includes('mehaničar') || titleLower.includes('fix') || titleLower.includes('repair')) 
      return <Wrench className={iconClass} />;

    if (titleLower.includes('cnc') || titleLower.includes('laser') || titleLower.includes('mašina') || titleLower.includes('3d')) 
      return <Bot className={iconClass} />;

    if (titleLower.includes('pas') || titleLower.includes('mačka') || titleLower.includes('ljubimac') || titleLower.includes('šetnja')) 
      return <PawPrint className={iconClass} />;

    if (titleLower.includes('sajt') || titleLower.includes('web') || titleLower.includes('kod') || titleLower.includes('app') || titleLower.includes('mobile')) 
      return <Code className={iconClass} />;

    if (titleLower.includes('logo') || titleLower.includes('dizajn') || titleLower.includes('slika')) 
      return <Palette className={iconClass} />;

    if (titleLower.includes('časovi') || titleLower.includes('matematika') || titleLower.includes('škola')) 
      return <GraduationCap className={iconClass} />;

    if (titleLower.includes('foto') || titleLower.includes('slikanje') || titleLower.includes('video')) 
      return <Camera className={iconClass} />;

    if (titleLower.includes('kuća') || titleLower.includes('stan') || titleLower.includes('čišćenje')) 
      return <Home className={iconClass} />;

    if (titleLower.includes('translat') || titleLower.includes('prevod')) 
        return <Globe className={iconClass} />;
  
    if (titleLower.includes('seo') || titleLower.includes('marketing') || titleLower.includes('reklam')) 
        return <Megaphone className={iconClass} />;

    if (titleLower.includes('hrana') || titleLower.includes('torta') || titleLower.includes('catering') || titleLower.includes('kafa')) 
      return <Coffee className={iconClass} />;


    // --- 2. FALLBACK PO KATEGORIJAMA ---
    switch (category) {
      case "Graphics & Design": return <Palette className={iconClass} />;
      case "Digital Marketing": return <Monitor className={iconClass} />;
      case "Writing & Translation": return <PenTool className={iconClass} />;
      case "Video & Animation": return <Video className={iconClass} />;
      case "Programming & Tech": return <Code className={iconClass} />;
      case "Music & Audio": return <Music className={iconClass} />;
      case "Business": return <Briefcase className={iconClass} />;
      case "Lifestyle": return <Heart className={iconClass} />;
      default: return <Layers className={iconClass} />;
    }
  };

  const getGradient = (id: number) => {
    const gradients = [
      "from-fuchsia-500 to-pink-600",
      "from-violet-500 to-purple-600",
      "from-blue-500 to-indigo-600",
      "from-emerald-400 to-teal-500"
    ];
    const numId = typeof id === 'number' ? id : 1;
    return gradients[(numId - 1) % gradients.length];
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>
  }

  if (!service) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-800">Ups! Oglas nije pronađen.</h1>
            <Button onClick={() => router.push('/')} className="bg-purple-600 hover:bg-purple-700 mt-4">Nazad na početnu</Button>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
             <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors font-medium">
                <ArrowLeft className="w-5 h-5" /> Nazad
             </button>
             <div className="flex gap-3">
                 <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><Share2 className="w-5 h-5" /></button>
                 <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><Heart className="w-5 h-5" /></button>
             </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-8">
                 <div className={`w-full h-64 md:h-96 rounded-3xl bg-gradient-to-br ${getGradient(service.id)} flex items-center justify-center shadow-lg relative overflow-hidden group`}>
                     {getSmartIcon(service)}
                 </div>

                 <div>
                     <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                         {service.title}
                     </h1>
                     <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-xs">
                                {(service.author && service.author[0]) ? service.author[0].toUpperCase() : 'U'}
                             </div>
                             <span className="font-semibold text-gray-900">@{service.author}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                             <Star className="w-4 h-4 fill-current" />
                             <span>{service.rating || "5.0"}</span>
                             <span className="text-gray-400 font-normal">({service.reviews || 0} recenzija)</span>
                        </div>
                        <div className="hidden md:flex items-center gap-1">
                             <ShieldCheck className="w-4 h-4 text-green-500" />
                             <span className="text-green-600 font-medium">Verifikovan prodavac</span>
                        </div>
                     </div>

                     <h3 className="text-xl font-bold text-gray-900 mb-3">O ovom servisu</h3>
                     <div className="prose prose-purple max-w-none text-gray-600 leading-relaxed">
                         <p className="text-lg whitespace-pre-line">{service.description}</p>
                     </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <Clock className="w-8 h-8 text-purple-500 bg-purple-50 p-1.5 rounded-lg" />
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Isporuka za</p>
                            <p className="font-bold text-gray-900">{service.deliveryTime || "3 dana"}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-500 bg-green-50 p-1.5 rounded-lg" />
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Revizije</p>
                            <p className="font-bold text-gray-900">{service.revisions || "Neograničeno"}</p>
                        </div>
                    </div>
                 </div>

             </div>

             <div className="lg:col-span-1">
                 <div className="sticky top-24 bg-white rounded-2xl shadow-xl shadow-purple-900/5 border border-gray-100 p-6">
                     <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-500 font-medium">Cena usluge</span>
                        <span className="text-3xl font-extrabold text-gray-900">{service.price} π</span>
                     </div>

                     <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500" /> <span>Sigurno Pi plaćanje</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500" /> <span>Garancija zadovoljstva</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500" /> <span>Podrška 24/7</span>
                        </div>
                     </div>

                     <Button className="w-full py-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 mb-3 rounded-xl active:scale-[0.98] transition-all">
                        Angažuj prodavca
                     </Button>
                     
                     {/* 👇 AŽURIRANO DUGME: KLIK -> EFEKAT 0.5s -> PORUKE */}
                     <Button 
                        variant="outline" 
                        onClick={handleContactClick}
                        className={`w-full py-6 border-gray-200 
                                   hover:bg-purple-100 hover:text-purple-900 hover:border-purple-300 
                                   active:scale-[0.98] 
                                   transition-all duration-300 rounded-xl font-bold flex items-center gap-2 group
                                   ${isContactActive 
                                     ? "bg-purple-100 text-purple-900 border-purple-300" 
                                     : "bg-white text-gray-700"}
                                   `}
                     >
                        <MessageCircle className={`w-5 h-5 transition-colors duration-300 
                            ${isContactActive ? "text-purple-900" : "group-hover:text-purple-900"}
                        `} /> Kontaktiraj prodavca
                     </Button>
                 </div>
             </div>
         </div>
      </main>
    </div>
  )
}