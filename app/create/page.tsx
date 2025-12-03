"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Zap, ArrowLeft, Loader2, CheckCircle, 
  Car, Wrench, Bot, PawPrint, Heart, Palette, Code, 
  PenTool, Coffee, Camera, Home, GraduationCap, Tag, 
  Clock, Repeat // Dodali smo ikonice za vreme i revizije
} from 'lucide-react';
import Link from 'next/link';

export default function CreateServicePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    deliveryTime: "", // Novo polje
    revisions: ""     // Novo polje
  });

  const categories = [
    "Graphics & Design",
    "Digital Marketing",
    "Writing & Translation",
    "Video & Animation",
    "Programming & Tech",
    "Business",
    "Lifestyle"
  ];

  const [loggedInAuthor, setLoggedInAuthor] = useState('Invictus Bazaar');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const email = localStorage.getItem('userEmail');
        const name = localStorage.getItem('db_user_name');
        if (name) {
             setLoggedInAuthor(name);
        } else if (email) {
            setLoggedInAuthor(email.split('@')[0]);
        }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
      setFormData(prev => ({ ...prev, category: value }));
  }

  // --- LOGIKA ZA PAMETNE IKONICE ---
  const getDynamicVisuals = () => {
    const titleLower = formData.title.toLowerCase();
    let Icon = Zap; 
    let colorClass = "text-gray-600 bg-gray-100"; 

    switch(formData.category) {
        case "Lifestyle": colorClass = "text-orange-500 bg-orange-100"; break;
        case "Graphics & Design": colorClass = "text-purple-600 bg-purple-100"; break;
        case "Programming & Tech": colorClass = "text-blue-600 bg-blue-100"; break;
        case "Digital Marketing": colorClass = "text-green-600 bg-green-100"; break;
        case "Video & Animation": colorClass = "text-pink-600 bg-pink-100"; break;
        case "Writing & Translation": colorClass = "text-yellow-600 bg-yellow-100"; break;
        case "Business": colorClass = "text-slate-600 bg-slate-200"; break;
        default: colorClass = "text-purple-600 bg-purple-50"; 
    }

    if (titleLower.includes('auto') || titleLower.includes('opel') || titleLower.includes('alfa') || titleLower.includes('fiat') || titleLower.includes('bmw')) Icon = Car;
    else if (titleLower.includes('popravka') || titleLower.includes('majstor') || titleLower.includes('servis') || titleLower.includes('mehaničar')) Icon = Wrench;
    else if (titleLower.includes('cnc') || titleLower.includes('laser') || titleLower.includes('mašina') || titleLower.includes('3d')) Icon = Bot;
    else if (titleLower.includes('pas') || titleLower.includes('mačka') || titleLower.includes('ljubimac') || titleLower.includes('šetnja')) Icon = PawPrint;
    else if (titleLower.includes('sajt') || titleLower.includes('web') || titleLower.includes('kod')) Icon = Code;
    else if (titleLower.includes('logo') || titleLower.includes('dizajn') || titleLower.includes('slika')) Icon = Palette;
    else if (titleLower.includes('časovi') || titleLower.includes('matematika') || titleLower.includes('škola')) Icon = GraduationCap;
    else if (titleLower.includes('hrana') || titleLower.includes('torta') || titleLower.includes('catering')) Icon = Coffee;
    else if (titleLower.includes('foto') || titleLower.includes('slikanje')) Icon = Camera;
    else if (titleLower.includes('kuća') || titleLower.includes('stan') || titleLower.includes('čišćenje')) Icon = Home;
    else {
        switch(formData.category) {
            case "Lifestyle": Icon = Heart; break;
            case "Graphics & Design": Icon = PenTool; break;
            case "Programming & Tech": Icon = Code; break;
            case "Video & Animation": Icon = Camera; break;
            default: Icon = Zap;
        }
    }

    return { Icon, colorClass };
  };

  const { Icon: DynamicIcon, colorClass } = getDynamicVisuals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newService = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      price: parseFloat(formData.price),
      // Čuvamo unete vrednosti, ili podrazumevane ako korisnik ostavi prazno
      deliveryTime: formData.deliveryTime ? `${formData.deliveryTime} dana` : "3 dana",
      revisions: formData.revisions ? formData.revisions : "Neograničeno",
      author: loggedInAuthor,
      authorAvatar: "/placeholder-avatar.jpg",
      image: "/placeholder-service.jpg",
      rating: 5.0,
      reviews: 0,
      createdAt: new Date().toISOString()
    };
  
    setTimeout(() => {
        try {
            const existingServicesStr = localStorage.getItem('skillclick_services');
            const existingServices = existingServicesStr ? JSON.parse(existingServicesStr) : [];
            const updatedServices = [newService, ...existingServices];
            localStorage.setItem('skillclick_services', JSON.stringify(updatedServices));

            setIsSuccess(true);
            setTimeout(() => {
                router.push('/'); 
            }, 1500);

        } catch (error) {
            console.error("Greška:", error);
            alert("Greška pri čuvanju oglasa.");
        } finally {
            setIsLoading(false);
        }
    }, 1000);
  };

  // STILOVI
  const inputClass = "rounded-xl border-gray-200 focus:!border-purple-500 focus:!ring-purple-500 focus:ring-2 outline-none transition-all h-12";
  const labelClass = "text-xs font-bold text-gray-700 uppercase ml-1 mb-1.5 block";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-purple-600 mb-6 font-bold text-sm transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Nazad na početnu
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl shadow-purple-900/10 border border-white overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="bg-white pt-8 pb-2 px-8 text-center">
            <div className="mx-auto w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 text-purple-600 shadow-sm">
                <Zap className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Postavi novi oglas</h1>
            <p className="text-gray-500 text-sm mt-1">
              Prijavljen kao: <span className="font-semibold text-purple-600">{loggedInAuthor}</span>
            </p>
          </div>
          
          <div className="p-8">
            {isSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-8 rounded-2xl text-center animate-in fade-in zoom-in">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">Uspešno postavljeno!</h3>
                    <p>Tvoj oglas je sada aktivan. Preusmeravam...</p>
                </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. NASLOV */}
                <div>
                    <Label htmlFor="title" className={labelClass}>Naslov usluge</Label>
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                            <Tag className="w-5 h-5" />
                        </div>
                        <Input 
                            id="title" 
                            name="title" 
                            type="text" 
                            placeholder="Npr. Popravka Opel vozila..." 
                            value={formData.title} 
                            onChange={handleChange} 
                            required 
                            className={`${inputClass} pl-10`} 
                        />
                    </div>
                </div>

                {/* 2. RED: KATEGORIJA I CENA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="category" className={labelClass}>Kategorija</Label>
                        <Select value={formData.category} onValueChange={handleCategoryChange}>
                            <SelectTrigger 
                                id="category" 
                                className={`
                                    ${inputClass} bg-white 
                                    focus:!ring-purple-500 focus:!border-purple-500 
                                    data-[state=open]:!ring-purple-500 data-[state=open]:!border-purple-500
                                    focus:ring-offset-0 focus:outline-none ring-offset-0
                                `}
                            >
                                <SelectValue placeholder="Izaberi kategoriju" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-100">
                                {categories.map(cat => (
                                    <SelectItem key={cat} value={cat} className="focus:bg-purple-50 focus:text-purple-700 cursor-pointer">
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="price" className={labelClass}>Cena (Pi)</Label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors font-bold text-lg font-serif">
                                π
                            </div>
                            <Input 
                                id="price" 
                                name="price" 
                                type="number" 
                                placeholder="50.00" 
                                value={formData.price} 
                                onChange={handleChange} 
                                required 
                                className={`${inputClass} pl-10`} 
                            />
                        </div>
                    </div>
                </div>

                {/* 3. RED: ROK ISPORUKE I REVIZIJE (NOVO!) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="deliveryTime" className={labelClass}>Rok isporuke (Dani)</Label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                                <Clock className="w-5 h-5" />
                            </div>
                            <Input 
                                id="deliveryTime" 
                                name="deliveryTime" 
                                type="number" 
                                placeholder="Npr. 3" 
                                value={formData.deliveryTime} 
                                onChange={handleChange} 
                                required 
                                className={`${inputClass} pl-10`} 
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="revisions" className={labelClass}>Broj revizija</Label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                                <Repeat className="w-5 h-5" />
                            </div>
                            <Input 
                                id="revisions" 
                                name="revisions" 
                                type="text" 
                                placeholder="Npr. 2 ili Neograničeno" 
                                value={formData.revisions} 
                                onChange={handleChange} 
                                required 
                                className={`${inputClass} pl-10`} 
                            />
                        </div>
                    </div>
                </div>

                {/* 4. OPIS */}
                <div>
                    <Label htmlFor="description" className={labelClass}>Opis usluge</Label>
                    <div className="relative">
                        <Textarea 
                            id="description" 
                            name="description" 
                            placeholder="Opiši detaljno šta nudiš..." 
                            value={formData.description} 
                            onChange={handleChange} 
                            required 
                            rows={5} 
                            className="rounded-xl border-gray-200 focus:!border-purple-500 focus:!ring-purple-500 focus:ring-2 outline-none resize-none py-3 transition-all" 
                        />
                    </div>
                </div>

                <div className="mt-6 p-5 border border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-3 text-center">Kako će izgledati tvoj oglas</p>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
                        <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center ${colorClass} transition-all duration-300`}>
                            <DynamicIcon className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 truncate text-base">
                                {formData.title || "Tvoj naslov ovde..."}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                    {formData.category || "Kategorija"}
                                </span>
                                <span className="text-xs text-purple-600 font-bold flex items-center gap-1">
                                    {formData.price ? `${formData.price} π` : "0 π"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg h-14 rounded-xl shadow-lg shadow-purple-600/20 active:scale-95 transition-all mt-4" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                {isLoading ? "Objavljujem..." : "Objavi Oglas"}
              </Button>
            </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}