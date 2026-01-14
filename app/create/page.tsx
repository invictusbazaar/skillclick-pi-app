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
  Image as ImageIcon 
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';

export default function CreateServicePage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    deliveryTime: "",
    revisions: "",
    image1: "", 
    image2: "",
    image3: "" 
  });

  const categories = [
    { key: "catDesign", val: "Graphics & Design" },
    { key: "catMarketing", val: "Digital Marketing" },
    { key: "catWriting", val: "Writing & Translation" },
    { key: "catVideo", val: "Video & Animation" },
    { key: "catTech", val: "Programming & Tech" },
    { key: "catBusiness", val: "Business" },
    { key: "catLifestyle", val: "Lifestyle" }
  ];

  const [loggedInAuthor, setLoggedInAuthor] = useState<string | null>(null);

  // Provera logovanja
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/auth/login?redirect=/create");
            return;
        }
        try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.username) {
                setLoggedInAuthor(parsedUser.username);
                setIsAuthorized(true);
            } else {
                router.push("/auth/login");
            }
        } catch (e) {
            console.error("Greška pri čitanju korisnika", e);
            router.push("/auth/login");
        }
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
      setFormData(prev => ({ ...prev, category: value }));
  }

  // --- GLAVNA IZMENA: DETALJNA PROVERA GREŠAKA ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Provera autora
    if (!loggedInAuthor) {
        alert("Greška: Niste ulogovani. Molimo ulogujte se ponovo.");
        setIsLoading(false);
        return;
    }

    // 2. Provera kategorije
    if (!formData.category) {
        alert("Molimo izaberite kategoriju.");
        setIsLoading(false);
        return;
    }

    try {
        console.log("🚀 Šaljem podatke na server...", { author: loggedInAuthor, title: formData.title });

        const response = await fetch('/api/services/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: formData.title,
                description: formData.description,
                category: formData.category,
                price: formData.price,
                deliveryTime: formData.deliveryTime,
                revisions: formData.revisions,
                author: loggedInAuthor,
                images: [formData.image1, formData.image2, formData.image3].filter(img => img.length > 0)
            }),
        });

        // Čitamo odgovor servera (bilo da je uspeh ili greška)
        const data = await response.json();

        if (!response.ok) {
            // Ako server vrati grešku (npr. 400 ili 500), bacamo exception sa TAČNOM porukom
            throw new Error(data.error || "Nepoznata greška na serveru");
        }

        // Ako je sve OK
        setIsSuccess(true);
        setTimeout(() => {
            router.push('/'); 
        }, 1500);

    } catch (error: any) {
        console.error("❌ Greška pri slanju:", error);
        // Prikazujemo pravu poruku korisniku
        alert(`Greška: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  if (!isAuthorized) return null; 

  const inputClass = "rounded-xl border-gray-200 focus:!border-purple-500 focus:!ring-purple-500 focus:ring-2 outline-none transition-all h-12 bg-white";
  const labelClass = "text-xs font-bold text-gray-700 uppercase ml-1 mb-1.5 block";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-purple-600 mb-6 font-bold text-sm transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> {t('backHome')}
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl shadow-purple-900/10 border border-white overflow-hidden">
          <div className="bg-white pt-8 pb-2 px-8 text-center">
            <div className="mx-auto w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 text-purple-600">
                <Zap className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">{t('createTitle')}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {t('welcomeBack')}: <span className="font-semibold text-purple-600">{loggedInAuthor}</span>
            </p>
          </div>
          
          <div className="p-8">
            {isSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-8 rounded-2xl text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-bold text-xl mb-2">{t('successMessage')}</h3>
                    <p>{t('loading')}...</p>
                </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="title" className={labelClass}>{t('labelTitle')}</Label>
                    <Input id="title" name="title" placeholder={t('placeholderTitle')} value={formData.title} onChange={handleChange} required className={inputClass} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="category" className={labelClass}>{t('labelCategory')}</Label>
                        <Select value={formData.category} onValueChange={handleCategoryChange}>
                            <SelectTrigger id="category" className={inputClass}>
                                <SelectValue placeholder={t('selectCategory')} />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {categories.map(cat => (
                                    <SelectItem key={cat.key} value={cat.val}>{t(cat.key)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="price" className={labelClass}>{t('labelPrice')}</Label>
                        <Input id="price" name="price" type="number" placeholder="10.00" value={formData.price} onChange={handleChange} required className={inputClass} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="deliveryTime" className={labelClass}>{t('labelDelivery')}</Label>
                        <Input id="deliveryTime" name="deliveryTime" type="number" placeholder="3" value={formData.deliveryTime} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div>
                        <Label htmlFor="revisions" className={labelClass}>{t('revisions')}</Label>
                        <Input id="revisions" name="revisions" placeholder="Unlimited" value={formData.revisions} onChange={handleChange} required className={inputClass} />
                    </div>
                </div>

                {/* UNOS SLIKA */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <Label className={`${labelClass} mb-3 flex items-center gap-2`}>
                        <ImageIcon className="w-4 h-4" /> Slike Oglasa (URL)
                    </Label>
                    <div className="space-y-3">
                        <Input name="image1" placeholder="Image URL 1 (Cover)" value={formData.image1} onChange={handleChange} className={inputClass} />
                        <Input name="image2" placeholder="Image URL 2 (Optional)" value={formData.image2} onChange={handleChange} className={inputClass} />
                    </div>
                </div>

                <div>
                    <Label htmlFor="description" className={labelClass}>{t('aboutService')}</Label>
                    <Textarea id="description" name="description" placeholder={t('placeholderDesc')} value={formData.description} onChange={handleChange} required rows={5} className="rounded-xl border-gray-200 focus:ring-purple-500 h-32 resize-none" />
                </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg h-14 rounded-xl shadow-lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                {isLoading ? t('loading') : t('btnPublish')} 
              </Button>
            </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
