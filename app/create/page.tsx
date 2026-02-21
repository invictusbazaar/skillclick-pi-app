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
  Image as ImageIcon, Upload, X 
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/components/AuthContext';

export default function CreateServicePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
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

  // Ako nije ulogovan, logika se može dodati ovde, ali trenutno samo prikazujemo poruku dole
  useEffect(() => {
    if (!authLoading && !user) {
        // router.push('/'); 
    }
  }, [authLoading, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
      setFormData(prev => ({ ...prev, category: value }));
  }

  // --- LOGIKA ZA UPLOAD SLIKA ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, imageKey: string) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Provera veličine (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Slika je prevelika. Molimo koristite sliku manju od 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [imageKey]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (imageKey: string) => {
    setFormData(prev => ({ ...prev, [imageKey]: "" }));
  };
  // ------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user || !user.username) {
        alert("Greška: Niste ulogovani.");
        setIsSubmitting(false);
        return;
    }

    if (!formData.category) {
        alert("Molimo izaberite kategoriju.");
        setIsSubmitting(false);
        return;
    }

    try {
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
                author: user.username, 
                // Filtriramo prazne stringove da ne šaljemo prazna polja
                images: [formData.image1, formData.image2, formData.image3].filter(img => img.length > 0)
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Greška na serveru");
        }

        setIsSuccess(true);
        setTimeout(() => {
            router.push('/'); 
        }, 1500);

    } catch (error: any) {
        console.error("❌ Greška:", error);
        alert(`Greška: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        </div>
      );
  }

  if (!user) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Morate biti ulogovani</h2>
            <Link href="/">
                <Button>Vrati se na početnu</Button>
            </Link>
        </div>
      );
  }

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
              {t('welcomeBack')}: <span className="font-semibold text-purple-600">{user.username}</span>
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

                {/* NOVI SISTEM ZA UPLOAD SLIKA - SA PREVODIMA */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <Label className={`${labelClass} mb-3 flex items-center gap-2`}>
                        <ImageIcon className="w-4 h-4" /> 
                        {t('uploadImages')} 
                        <span className="text-gray-400 font-normal ml-auto text-[10px] md:text-xs">
                           ({t('uploadHint')})
                        </span>
                    </Label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Image 1 Upload */}
                        <div className="relative">
                            {formData.image1 ? (
                                <div className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-200 group">
                                    <img src={formData.image1} alt="Preview 1" className="h-full w-full object-cover" />
                                    <button 
                                        type="button" 
                                        onClick={() => removeImage('image1')}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-32 w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 hover:border-purple-500 transition">
                                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                    {/* ✅ PREVOD: Cover Slika */}
                                    <span className="text-xs text-gray-500 font-semibold">{t('coverImage')}</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'image1')} />
                                </label>
                            )}
                        </div>

                        {/* Image 2 Upload */}
                        <div className="relative">
                            {formData.image2 ? (
                                <div className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-200 group">
                                    <img src={formData.image2} alt="Preview 2" className="h-full w-full object-cover" />
                                    <button 
                                        type="button" 
                                        onClick={() => removeImage('image2')}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-32 w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 hover:border-purple-500 transition">
                                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                    {/* ✅ PREVOD: Slika 2 */}
                                    <span className="text-xs text-gray-500">{t('imageLabel')} 2</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'image2')} />
                                </label>
                            )}
                        </div>

                        {/* Image 3 Upload */}
                        <div className="relative">
                            {formData.image3 ? (
                                <div className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-200 group">
                                    <img src={formData.image3} alt="Preview 3" className="h-full w-full object-cover" />
                                    <button 
                                        type="button" 
                                        onClick={() => removeImage('image3')}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-32 w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 hover:border-purple-500 transition">
                                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                    {/* ✅ PREVOD: Slika 3 */}
                                    <span className="text-xs text-gray-500">{t('imageLabel')} 3</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'image3')} />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <Label htmlFor="description" className={labelClass}>{t('aboutService')}</Label>
                    <Textarea id="description" name="description" placeholder={t('placeholderDesc')} value={formData.description} onChange={handleChange} required rows={5} className="rounded-xl border-gray-200 focus:ring-purple-500 h-32 resize-none" />
                </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg h-14 rounded-xl shadow-lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                {isSubmitting ? t('loading') : t('btnPublish')} 
              </Button>
            </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}