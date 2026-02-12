"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Star, MapPin, Calendar, MessageCircle, Share2, Layers, ShieldCheck, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/LanguageContext" // ✅ UBACENO

export default function SellerProfilePage() {
  const params = useParams()
  const router = useRouter()
  // Dekodiramo username iz URL-a
  const username = decodeURIComponent(params?.username as string || params?.id as string)
  
  // ✅ UČITAVAMO PREVODE
  const { t } = useLanguage();

  const [sellerServices, setSellerServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sellerStats, setSellerStats] = useState({ rating: 0, reviews: 0, joined: "" })

  const clickEffect = "active:scale-95 transition-transform duration-100";

  useEffect(() => {
    if (username) {
      fetchRealData();
    }
  }, [username])

  const fetchRealData = async () => {
    try {
        const res = await fetch('/api/services'); 
        const data = await res.json();
        
        if (Array.isArray(data)) {
            // Filtriramo oglase SAMO za ovog prodavca
            const myServices = data.filter((s: any) => 
                s.seller?.username === username || s.author?.username === username
            );
            setSellerServices(myServices);

            // Statistika
            if (myServices.length > 0) {
                const s = myServices[0];
                setSellerStats({
                    rating: s.sellerRating || 0,
                    reviews: s.reviewCount || 0,
                    joined: new Date(s.seller?.createdAt || s.author?.createdAt || Date.now()).toLocaleDateString()
                });
            } else {
                setSellerStats({ rating: 0, reviews: 0, joined: new Date().toLocaleDateString() })
            }
        }
    } catch (error) {
        console.error("Greška pri učitavanju profila:", error);
    } finally {
        setLoading(false);
    }
  };

  const getRandomGradient = (id: string) => {
    if (!id) return "from-purple-500 to-indigo-600";
    const num = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      "from-fuchsia-500 to-pink-600",
      "from-violet-500 to-purple-600",
      "from-blue-500 to-indigo-600",
      "from-emerald-400 to-teal-500"
    ];
    return gradients[num % gradients.length];
  };

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-3">
             <Button variant="ghost" onClick={() => router.back()} className={`text-gray-600 hover:text-purple-600 -ml-2 gap-2 ${clickEffect}`}>
                <ArrowLeft className="w-5 h-5" /> {t('back')} {/* ✅ PREVEDENO */}
             </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* --- PROFIL KARTICA --- */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 mb-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
            
            <div className="relative flex flex-col md:flex-row items-start md:items-end gap-6 pt-10">
                
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center text-3xl md:text-5xl font-bold text-purple-600 z-10 overflow-hidden">
                    {username ? username[0].toUpperCase() : <User />}
                </div>

                <div className="flex-grow z-10 pb-2 w-full md:w-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                                @{username} 
                                <ShieldCheck className="w-5 h-5 text-blue-500" />
                            </h1>
                            <p className="text-gray-500 mt-1">{t('verifiedSeller')}</p> {/* ✅ PREVEDENO */}
                        </div>
                        
                        <div className="flex gap-3">
                            <Button variant="outline" className={`gap-2 rounded-full ${clickEffect}`}>
                                <Share2 className="w-4 h-4" /> Share
                            </Button>
                            <Button className={`gap-2 rounded-full bg-purple-600 hover:bg-purple-700 ${clickEffect}`}>
                                <MessageCircle className="w-4 h-4" /> {t('contact')} {/* ✅ PREVEDENO */}
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 md:gap-8 mt-6 text-sm text-gray-600 border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>Global</span> {/* Promenjeno iz "Novi Sad" u "Global" da ne zbunjuje */}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {/* ✅ PREVEDENO */}
                            <span>{t('memberSince')} {sellerStats.joined}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="font-bold text-gray-900">{sellerStats.rating.toFixed(1)}</span>
                            <span>({sellerStats.reviews} {t('reviewsCountLabel')})</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- LISTA OGLASA --- */}
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            {t('sellerGigs')} <span className="text-purple-600">@{username}</span> {/* ✅ PREVEDENO */}
        </h2>

        {sellerServices.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <Layers className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">Ovaj korisnik trenutno nema aktivnih oglasa.</h3>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sellerServices.map((gig) => (
                    <div key={gig.id} className={`group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer ${clickEffect}`}>
                        <Link href={`/services/${gig.id}`} className="block relative overflow-hidden h-40">
                            <div className={`absolute inset-0 bg-gradient-to-br ${getRandomGradient(gig.id)} flex items-center justify-center`}>
                                 {gig.images && gig.images.length > 0 ? (
                                    <img src={gig.images[0]} alt={gig.title} className="w-full h-full object-cover" />
                                 ) : (
                                    <Layers className="h-10 w-10 text-white/90" />
                                 )}
                            </div>
                        </Link>

                        <div className="p-4 flex flex-col flex-grow">
                            <Link href={`/services/${gig.id}`}>
                              <h3 className="text-gray-900 font-bold mb-2 text-md leading-snug hover:text-purple-600 transition-colors line-clamp-2">
                                {typeof gig.title === 'string' ? gig.title : (gig.title?.sr || gig.title?.en || "Usluga")}
                              </h3>
                            </Link>

                            <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center text-gray-700 text-xs font-semibold gap-1">
                                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 
                                  {gig.sellerRating?.toFixed(1) || "N/A"} 
                                </div>
                                <span className="text-md font-bold text-gray-900">{gig.price} π</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  )
}