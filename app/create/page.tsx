"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Zap, List, FileText, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'; // Uklonjen DollarSign
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

  const loggedInAuthor = 'Invictus Bazaar';

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
      author: loggedInAuthor,
    };
  
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData),
      });
  
      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/'); 
        }, 2000);
      } else {
        alert("Failed to create service.");
      }
    } catch (error) {
      console.error("Error creating service:", error);
      alert("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

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
              Create a new gig and start earning Pi.
            </p>
          </CardHeader>
          
          <CardContent>
            {isSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg flex flex-col items-center justify-center mb-6 text-center animate-in fade-in zoom-in">
                    <CheckCircle className="h-8 w-8 mb-2 text-green-600" />
                    <span className="font-bold text-lg">Service published successfully!</span>
                    <span className="text-sm text-green-600">Redirecting to home...</span>
                </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              
              <div className="space-y-2">
                <Label htmlFor="title" className="font-semibold text-gray-700">Service Title</Label>
                <div className="relative group">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                    id="title"
                    name="title"
                    placeholder="e.g., I will design a modern logo for your brand"
                    value={formData.title}
                    onChange={handleChange}
                    className="pl-10 border-gray-300 focus-visible:ring-blue-600 h-11 transition-all"
                    required
                    />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category" className="font-semibold text-gray-700">Category</Label>
                  <Select required onValueChange={handleCategoryChange}>
                    <SelectTrigger id="category" className="border-gray-300 focus:ring-blue-600 h-11">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 focus:text-blue-700">
                            {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price" className="font-semibold text-gray-700">Price (Pi)</Label>
                  <div className="relative group">
                    {/* FIX: Sada je ovde π simbol umesto $ */}
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">π</span>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        placeholder="50"
                        value={formData.price}
                        onChange={handleChange}
                        className="pl-8 border-gray-300 focus-visible:ring-blue-600 h-11 transition-all"
                        required
                        min="1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold text-gray-700">Description</Label>
                <div className="relative group">
                    <List className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your service in detail..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    className="pl-10 border-gray-300 focus-visible:ring-blue-600 min-h-[120px] transition-all"
                    required
                    />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg h-12 font-bold shadow-lg shadow-blue-200 transition-all"
                disabled={isLoading}
              >
                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Publishing...</> : 'Publish Gig'}
              </Button>

            </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}