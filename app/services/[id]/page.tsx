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
    { id: 1, title: "Modern Minimalist Logo Design", author: "pixel_art", price: 50, rating: 5.0, reviews: 124, category: "Design", description: "I will design a professional logo...", deliveryTime: "2 Days", icon: <Palette className="text-white h-10 w-10" /> },
    { id: 2, title: "Full Stack Web Development", author: "dev_guy", price: 300, rating: 4.9, reviews: 85, category: "Programming", description: "Complete website...", deliveryTime: "7 Days", icon: <Code className="text-white h-10 w-10" /> },
    { id: 3, title: "SEO Blog Writing", author: "writer_pro", price: 30, rating: 4.8, reviews: 210, category: "Writing", description: "SEO content...", deliveryTime: "1 Day", icon: <PenTool className="text-white h-10 w-10" /> },
    { id: 4, title: "Pro Video Editing", author: "vid_master", price: 100, rating: 5.0, reviews: 42, category: "Video", description: "Video editing...", deliveryTime: "3 Days", icon: <Video className="text-white h-10 w-10" /> },
];

export default function ServiceDetailsPage() {
  const params = useParams();
  const serviceId = params.id ? parseInt(params.id as string) : null;
  
  const [service, setService] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  // ISTA FUNKCIJA ZA BOJE KAO NA HOME STRANI (ZA KONZISTENTNOST)
  const getRandomGradient = (id: number) => {
    const gradients = [
      "from-pink-500 to-rose-500",
      "from-blue-500 to-cyan-500",
      "from-emerald-500 to-teal-500",
      "from-orange-500 to-amber-500",
      "from-purple-500 to-indigo-500"
    ];
    // Koristimo ID da uvek dobijemo istu boju za isti oglas
    return gradients[id % gradients.length];
  };

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

  const  handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) return;

    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                serviceId,
                rating: parseInt(rating),
                comment,
                author: "Guest User"
            })
        });

        if (response.ok) {
            const newReviewData = await response.json();
            setReviews([...reviews, newReviewData.review]);
            setComment(""); 
        }
    } catch (error) {
        alert("Error posting review");
    }
  };

  const handleOrder = () => {
      alert("Order simulation...");
  };

  const buttonStyle = "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md px-4 py-1 h-9 transition-all text-sm font-medium";

  if (loading || !service) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-medium bg-blue-50/50">Loading...</div>;

  return (
    <div className="min-h-screen bg-blue-50/50">
      
      <header className="border-b border-blue-100 bg-blue-50/50 sticky top-0 z-50"> 
        <div className="container mx-auto px-4 py-2 flex items-center justify-between"> 
          <Link href="/"><img src="/skillclick_logo.png" alt="SkillClick" width={140} height={30} className="object-contain" /></Link>
          <div className="flex items-center gap-3">
             <Link href="/services"><Button variant="outline" className={`hidden md:flex ${buttonStyle}`}>Explore</Button></Link>
             <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-600"><Menu className="h-5 w-5" /></Button>
             <div className="hidden md:flex gap-3 items-center ml-2"><Link href="/auth/login"><Button variant="outline" className={buttonStyle}><LogIn className="h-4 w-4 mr-1" />{t.login[lang]}</Button></Link><Link href="/auth/register"><Button variant="outline" className={buttonStyle}><UserPlus className="h-4 w-4 mr-1" />{t.register[lang]}</Button></Link></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Link href="/services" className="inline-flex items-center text-sm text-blue-600 hover:underline mb-6 font-medium"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Marketplace</Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          <div className="lg:col-span-2 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{service.title}</h1>
                <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold text-gray-900">{service.author}</span>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center text-yellow-500 font-bold"><Star className="h-4 w-4 fill-current mr-1" /> {service.rating || 5.0}</div>
                </div>
            </div>

            {/* FIX: BOJA JE SADA ISTA KAO NA KARTICI (ZAVISI OD ID-ja) */}
            <div className={`rounded-xl h-64 md:h-96 flex items-center justify-center text-white text-8xl shadow-sm bg-gradient-to-br ${getRandomGradient(service.id)}`}>
                {service.icon || <Layers className="h-20 w-20" />}
            </div>

            <Card className="border-gray-200 shadow-sm bg-white"><CardContent className="p-6"><h3 className="text-lg font-bold text-gray-900 mb-4">About This Gig</h3><p className="text-gray-600 leading-relaxed">{service.description}</p></CardContent></Card>

            <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Reviews ({reviews.length})</h3>
                
                <Card className="bg-white border border-blue-100 shadow-sm">
                    <CardContent className="p-4">
                        <h4 className="text-sm font-bold text-gray-700 mb-3">Leave a Review</h4>
                        <form onSubmit={handleSubmitReview} className="space-y-3">
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-500">Rating:</label>
                                <select value={rating} onChange={(e) => setRating(e.target.value)} className="border rounded p-1 text-sm bg-white font-medium text-gray-700 border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                                    <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                                    <option value="4">⭐⭐⭐⭐ (4)</option>
                                    <option value="3">⭐⭐⭐ (3)</option>
                                    <option value="2">⭐⭐ (2)</option>
                                    <option value="1">⭐ (1)</option>
                                </select>
                            </div>
                            <Textarea 
                                placeholder="Write your feedback here..." 
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                                className="min-h-[80px] border-blue-200 focus-visible:ring-blue-600"
                            />
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto font-bold">
                                <Send className="w-4 h-4 mr-2" /> Post Review
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <div className="space-y-3">
                    {reviews.map((r: any) => (
                        <Card key={r.id} className="bg-white border border-blue-50 shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-800">{r.author[0]}</div>
                                        <span className="text-sm font-bold text-gray-900">{r.author}</span>
                                    </div>
                                    <div className="flex text-yellow-500 text-xs"><Star className="w-3 h-3 fill-current mr-1"/> {r.rating}</div>
                                </div>
                                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{r.comment}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

          </div>

          {/* DESNO: CENA */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg border-blue-100 overflow-hidden bg-white">
              <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center"><span className="font-bold text-blue-800 text-sm uppercase tracking-wide">Standard</span><span className="text-3xl font-extrabold text-blue-900">{service.price} π</span></div>
              <CardContent className="p-6 space-y-4">
                  <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg h-12 shadow-md" onClick={handleOrder}>Order Now</Button>
                  <Link href={`/messages?seller=${service.author}`}>
                    <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-lg h-12">Contact Seller</Button>
                  </Link>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}