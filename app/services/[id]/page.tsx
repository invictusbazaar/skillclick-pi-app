"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Star, Heart, Clock, CheckCircle, Share2, ShieldCheck, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

// ✅ ISPRAVLJEN IMPORT: Koristimo alias @ koji uvek radi
import { SERVICES_DATA } from "@/lib/data"

export default function ServiceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  // ID iz URL-a je uvek string, pa ga konvertujemo u broj za poređenje
  const id = Number(params?.id)
  
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simuliramo učitavanje da ne "blinkne" odmah
    if (id) {
        const foundService = SERVICES_DATA.find(s => s.id === id)
        setService(foundService || null)
        setLoading(false)
    }
  }, [id])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>
  }

  if (!service) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-800">Ups! Oglas nije pronađen.</h1>
            <p className="text-gray-500">Možda je oglas obrisan ili link nije ispravan.</p>
            <Button onClick={() => router.push('/services')} className="bg-purple-600 hover:bg-purple-700">Nazad na pretragu</Button>
        </div>
    )
  }

  // Funkcija za gradijent (ista kao tvoja logika)
  const getGradient = (id: number) => {
    const gradients = [
      "from-fuchsia-500 to-pink-600",
      "from-violet-500 to-purple-600",
      "from-blue-500 to-indigo-600",
      "from-emerald-400 to-teal-500"
    ];
    return gradients[(id - 1) % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* HEADER NAVIGACIJA */}
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
             
             {/* LEVA STRANA - GLAVNI SADRŽAJ */}
             <div className="lg:col-span-2 space-y-8">
                 
                 {/* HERO SLIKA SERVISA */}
                 <div className={`w-full h-64 md:h-96 rounded-3xl bg-gradient-to-br ${getGradient(service.id)} flex items-center justify-center shadow-lg relative overflow-hidden group`}>
                     <div className="transform transition-transform duration-700 hover:scale-110">
                        {service.icon ? (
                            // Kloniramo element da bismo mu povećali dimenzije za detaljni prikaz
                            <div className="scale-[2.0] text-white/90 drop-shadow-2xl">
                                {service.icon}
                            </div>
                        ) : null}
                     </div>
                 </div>

                 {/* NASLOV I INFO */}
                 <div>
                     <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                         {service.title}
                     </h1>
                     
                     <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-xs">
                                {service.author[0].toUpperCase()}
                             </div>
                             <span className="font-semibold text-gray-900">@{service.author}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                             <Star className="w-4 h-4 fill-current" />
                             <span>{service.rating}</span>
                             <span className="text-gray-400 font-normal">({service.reviews} recenzija)</span>
                        </div>
                        <div className="hidden md:flex items-center gap-1">
                             <ShieldCheck className="w-4 h-4 text-green-500" />
                             <span className="text-green-600 font-medium">Verifikovan prodavac</span>
                        </div>
                     </div>

                     <h3 className="text-xl font-bold text-gray-900 mb-3">O ovom servisu</h3>
                     <div className="prose prose-purple max-w-none text-gray-600 leading-relaxed">
                         <p className="text-lg">{service.description}</p>
                         <p className="mt-4">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                         </p>
                     </div>
                 </div>
                 
                 {/* DODATNE INFORMACIJE */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <Clock className="w-8 h-8 text-purple-500 bg-purple-50 p-1.5 rounded-lg" />
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Isporuka za</p>
                            <p className="font-bold text-gray-900">{service.deliveryTime}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-500 bg-green-50 p-1.5 rounded-lg" />
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Revizije</p>
                            <p className="font-bold text-gray-900">Neograničeno</p>
                        </div>
                    </div>
                 </div>

             </div>

             {/* DESNA STRANA - PORUČIVANJE (STICKY) */}
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

                     <Button className="w-full py-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 mb-3 rounded-xl">
                        Poruči odmah
                     </Button>
                     
                     <Button variant="outline" className="w-full py-6 text-gray-700 border-gray-200 hover:bg-gray-50 rounded-xl font-semibold flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" /> Kontaktiraj prodavca
                     </Button>
                 </div>
             </div>

         </div>
      </main>
    </div>
  )
}