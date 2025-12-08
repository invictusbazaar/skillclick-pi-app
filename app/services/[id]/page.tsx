"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, Star, Heart, Clock, CheckCircle, Share2, ShieldCheck, MessageCircle,
  PenTool, Monitor, Briefcase, Video, Code, Music, Layers,
  Bike, Wrench, Car, Coffee, 
  Bot, PawPrint, Palette, GraduationCap, Camera, Home
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/components/LanguageContext" 
import { SERVICES_DATA } from "@/lib/data"

export default function ServiceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params?.id)
  
  const { t } = useLanguage(); // Uvoz prevodioca

  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([]) 
  
  const [newRating, setNewRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isContactActive, setIsContactActive] = useState(false)
  const [isBackActive, setIsBackActive] = useState(false)

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
                    console.error("Error reading ads:", e);
                }
            }
        }
        
        const foundService = allServices.find(s => s.id === id);
        setService(foundService || null)

        const storedReviews = localStorage.getItem(`reviews_${id}`);
        if (storedReviews) {
            setReviews(JSON.parse(storedReviews));
        } else {
            setReviews([
                { id: 1, user: "Marko Petrović", rating: 5, text: "Odlična saradnja! Sve preporuke.", date: "2 days ago" },
                { id: 2, user: "Jelena M.", rating: 4, text: "Veoma profesionalno, ali malo kasni isporuka.", date: "1 week ago" }
            ]);
        }

        setLoading(false)
    }
  }, [id])

  const handleSubmitReview = () => {
    if (newRating === 0) return; 
    setIsSubmitting(true);

    setTimeout(() => {
        const newReviewObj = {
            id: Date.now(),
            user: t('guestUser'), 
            rating: newRating,
            text: comment,
            date: "Just now"
        };

        const updatedReviews = [newReviewObj, ...reviews];
        setReviews(updatedReviews);
        localStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews));

        setNewRating(0);
        setComment("");
        setIsSubmitting(false);
    }, 1000);
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : service?.rating || "5.0";

  const handleBack = () => {
    setIsBackActive(true);
    setTimeout(() => {
        router.back();
    }, 500);
  }

  const handleContactClick = (e: any) => {
    e.preventDefault() 
    setIsContactActive(true)
    setTimeout(() => {
        setIsContactActive(false)
        const sellerName = service?.author || "User"
        const serviceName = service?.title || "Service"
        router.push(`/messages?seller=${encodeURIComponent(sellerName)}&service=${encodeURIComponent(serviceName)}`)
    }, 500) 
  }

  const getSmartIcon = (service: any) => {
    const iconClass = "w-24 h-24 text-white/90 drop-shadow-lg transform transition-transform duration-700 group-hover:scale-110"; 
    const titleLower = (service.title || "").toLowerCase();
    const category = service.category || "";

    if (titleLower.includes('auto') || titleLower.includes('opel') || titleLower.includes('alfa') || titleLower.includes('bmw')) return <Car className={iconClass} />;
    if (titleLower.includes('popravka') || titleLower.includes('majstor') || titleLower.includes('servis') || titleLower.includes('fix')) return <Wrench className={iconClass} />;
    if (titleLower.includes('cnc') || titleLower.includes('laser') || titleLower.includes('mašina') || titleLower.includes('3d')) return <Bot className={iconClass} />;
    if (titleLower.includes('pas') || titleLower.includes('mačka') || titleLower.includes('ljubimac') || titleLower.includes('šetnja')) return <PawPrint className={iconClass} />;
    if (titleLower.includes('sajt') || titleLower.includes('web') || titleLower.includes('kod') || titleLower.includes('app')) return <Code className={iconClass} />;
    if (titleLower.includes('logo') || titleLower.includes('dizajn') || titleLower.includes('slika')) return <Palette className={iconClass} />;
    if (titleLower.includes('časovi') || titleLower.includes('matematika') || titleLower.includes('škola')) return <GraduationCap className={iconClass} />;
    if (titleLower.includes('hrana') || titleLower.includes('torta') || titleLower.includes('catering') || titleLower.includes('kafa')) return <Coffee className={iconClass} />;
    if (titleLower.includes('foto') || titleLower.includes('slikanje') || titleLower.includes('video')) return <Camera className={iconClass} />;
    if (titleLower.includes('kuća') || titleLower.includes('stan') || titleLower.includes('čišćenje')) return <Home className={iconClass} />;
    if (titleLower.includes('bicikl') || titleLower.includes('bike')) return <Bike className={iconClass} />;

    switch(category) {
        case "Lifestyle": return <Heart className={iconClass} />;
        case "Graphics & Design": return <Palette className={iconClass} />;
        case "Programming & Tech": return <Code className={iconClass} />;
        case "Digital Marketing": return <Monitor className={iconClass} />;
        case "Writing & Translation": return <PenTool className={iconClass} />;
        case "Video & Animation": return <Video className={iconClass} />;
        case "Business": return <Briefcase className={iconClass} />;
        case "Music & Audio": return <Music className={iconClass} />;
        default: return <Layers className={iconClass} />;
    }
  };

  const getGradient = (id: number) => {
    const gradients = ["from-fuchsia-500 to-pink-600", "from-violet-500 to-purple-600", "from-blue-500 to-indigo-600", "from-emerald-400 to-teal-500"];
    const numId = typeof id === 'number' ? id : 1;
    return gradients[(numId - 1) % gradients.length];
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>
  }

  if (!service) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-800">Oops! Service not found.</h1>
            <Button onClick={() => router.push('/')} className="bg-purple-600 hover:bg-purple-700 mt-4">Back to Home</Button>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
             <button 
                onClick={handleBack} 
                className={`flex items-center gap-2 font-medium transition-colors duration-200 outline-none ${isBackActive ? "text-purple-600" : "text-gray-600 hover:text-purple-600"}`}
                style={{ WebkitTapHighlightColor: "transparent" }}
             >
                {/* 👇 PREVEDENO DUGME BACK */}
                <ArrowLeft className="w-5 h-5" /> {t('back')} 
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
                             <span className="font-semibold text-gray-900">{service.author}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                             <Star className="w-4 h-4 fill-current" />
                             <span>{averageRating}</span>
                             <span className="text-gray-400 font-normal">({reviews.length} {t('reviewsCountLabel')})</span>
                        </div>
                        <div className="hidden md:flex items-center gap-1">
                             <ShieldCheck className="w-4 h-4 text-green-500" />
                             {/* 👇 PREVEDENO VERIFIED SELLER */}
                             <span className="text-green-600 font-medium">{t('verifiedSeller')}</span>
                        </div>
                     </div>

                     <h3 className="text-xl font-bold text-gray-900 mb-3">{t('aboutService')}</h3>
                     <div className="prose prose-purple max-w-none text-gray-600 leading-relaxed">
                         <p className="text-lg whitespace-pre-line">{service.description}</p>
                     </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <Clock className="w-8 h-8 text-purple-500 bg-purple-50 p-1.5 rounded-lg" />
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">{t('delivery')}</p>
                            <p className="font-bold text-gray-900">{service.deliveryTime || "3"} {t('days')}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-500 bg-green-50 p-1.5 rounded-lg" />
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">{t('revisions')}</p>
                            <p className="font-bold text-gray-900">{service.revisions || "Unlimited"}</p>
                        </div>
                    </div>
                 </div>

                 {/* --- KONTEJNER ZA RECENZIJE --- */}
                 <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-purple-600" />
                        {/* 👇 PREVEDENO NASLOV RECENZIJA */}
                        {t('reviewsTitle')}
                    </h3>

                    <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
                        {/* 👇 PREVEDENO OSTAVITE UTISAK */}
                        <h4 className="font-bold text-gray-800 mb-3 text-sm">{t('leaveReview')}</h4>
                        
                        <div className="flex gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star 
                                        className={`w-8 h-8 ${
                                            star <= (hoverRating || newRating) 
                                            ? "fill-amber-400 text-amber-400" 
                                            : "text-gray-300"
                                        } transition-colors`} 
                                    />
                                </button>
                            ))}
                        </div>

                        <Textarea 
                            // 👇 PREVEDEN PLACEHOLDER
                            placeholder={t('writeReview')}
                            className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-100 min-h-[100px] rounded-xl mb-3 resize-none"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        <Button 
                            onClick={handleSubmitReview}
                            disabled={isSubmitting || newRating === 0}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                        >
                            {/* 👇 PREVEDENO DUGME POSTAVI */}
                            {isSubmitting ? "..." : t('submitReview')}
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {reviews.length === 0 ? (
                            <p className="text-gray-500 text-center italic">{t('noReviews')}</p>
                        ) : (
                            reviews.map((rev) => (
                                <div key={rev.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0 animate-in fade-in">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-tr from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold shrink-0">
                                            {rev.user[0]}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h5 className="font-bold text-gray-900 text-sm">{rev.user}</h5>
                                                <span className="text-xs text-gray-400">{rev.date}</span>
                                            </div>
                                            <div className="flex text-amber-400 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < rev.rating ? "fill-current" : "text-gray-200"}`} />
                                                ))}
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed">{rev.text}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                 </div>

             </div>

             <div className="lg:col-span-1">
                 <div className="sticky top-24 bg-white rounded-2xl shadow-xl shadow-purple-900/5 border border-gray-100 p-6">
                     <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-500 font-medium">{t('servicePrice')}</span>
                        <span className="text-3xl font-extrabold text-gray-900">{service.price} π</span>
                     </div>

                     <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500" /> <span>{t('securePayment')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500" /> <span>{t('satisfaction')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500" /> <span>{t('support')}</span>
                        </div>
                     </div>

                     <Button className="w-full py-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 mb-3 rounded-xl active:scale-[0.98] transition-all">
                        {/* 👇 PREVEDENO ANGAŽUJ */}
                        {t('hireSeller')}
                     </Button>
                     
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
                        `} /> 
                        {/* 👇 PREVEDENO KONTAKTIRAJ */}
                        {t('contactSeller')}
                     </Button>
                 </div>
             </div>
         </div>
      </main>
    </div>
  )
}