"use client";

import { useState, useEffect } from 'react'; // Dodajemo useEffect
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Zap, DollarSign, List, FileText, ArrowLeft, Loader2, CheckCircle, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CreateServicePage() {
  const router = useRouter();

  // FIX: Koristimo loading stanje da prikažemo spinner dok ne utvrdimo status
  const [loadingStatus, setLoadingStatus] = useState(true);

  // --- ZAŠTITNI MEHANIZAM ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!loggedIn) {
        // Preusmeri na login ako nije ulogovan, sa povratnim linkom
        router.replace('/auth/login?redirect=/create'); 
      } else {
        // Ako je ulogovan, možemo da renderujemo formular
        setLoadingStatus(false); 
      }
    }
  }, [router]);
  // --- KRAJ ZAŠTITE ---

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
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

  // SIMULACIJA KORISNIKA - Uzimamo ime iz memorije
  const loggedInAuthor = typeof window !== 'undefined' ? (localStorage.getItem('userEmail') || 'Invictus Bazaar').split('@')[0] : 'Invictus Bazaar';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
      setFormData(prev => ({ ...prev, category: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const serviceData = {
      ...formData,
      price: parseFloat(formData.price),
      author: loggedInAuthor, // Koristi ime ulogovanog korisnika
    };
  
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData),
      });
  
      if (response.ok) {
        setIsSuccess(true);
        // Preusmeri na Home stranicu nakon uspešnog postavljanja
        setTimeout(() => {
          router.push('/'); 
        }, 2000);
      } else {
        alert("Failed to publish service.");
      }
    } catch (error) {
      console.error("Error creating service:", error);
      alert("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Ako je loadingStatus true (još proveravamo), prikaži loader
  if (loadingStatus) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-blue-50/50">
              <Loader2 className="animate-spin w-8 h-8 text-blue-600 mr-2" />
              <p className="text-gray-600">Checking login status...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-blue-50/50 py-12 px-4">
      
      <div className="max-w-2xl mx-auto">
        
        <Link href="/" className="inline-flex items-center text-blue-600 hover:underline mb-6 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Marketplace
        </Link>

        <Card className="shadow-xl border-t-4 border-blue-600 bg-white">
          <CardHeader className="text-center pb-2 space-y-2">
            <div className="mx-auto w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Zap className="w-7 h-7 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Publish Your Service
            </CardTitle>
            <p className="text-gray-500 text-sm">
              Logged in as: <span className="font-semibold text-blue-600">{loggedInAuthor}</span>
            </p>
          </CardHeader>
          
          <CardContent>
            {isSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg text-center animate-in fade-in zoom-in">
                    <CheckCircle className="h-8 w-8 mb-2 text-green-600 mx-auto" />
                    <span className="font-bold text-lg">Service published successfully! Redirecting...</span>
                </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                
                {/* NASLOV */}
                <div className="space-y-2">
                    <Label htmlFor="title">Service Title</Label>
                    <Input id="title" name="title" type="text" placeholder="e.g. I will design a modern logo" value={formData.title} onChange={handleChange} required className="border-blue-200" />
                </div>

                {/* OPIS */}
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="Describe your service in detail..." value={formData.description} onChange={handleChange} required rows={5} className="border-blue-200" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* KATEGORIJA */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={formData.category} onValueChange={handleCategoryChange}>
                            <SelectTrigger id="category" className="w-full border-blue-200">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* CENA */}
                    <div className="space-y-2">
                        <Label htmlFor="price">Price (in Pi)</Label>
                        <Input id="price" name="price" type="number" placeholder="e.g. 50.00" value={formData.price} onChange={handleChange} required className="border-blue-200" />
                    </div>
                </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg h-12" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                {isLoading ? "Publishing..." : "Publish Gig"}
              </Button>
            </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}