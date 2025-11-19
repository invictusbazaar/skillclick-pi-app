"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Zap, DollarSign, List, FileText } from 'lucide-react';

export default function CreateServicePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ message: string, type: 'success' | 'error' | 'none' }>({ message: '', type: 'none' });

  // SIMULACIJA: OVO BI U STVARNOSTI BIO PODATAK O ULOGOVANOM KORISNIKU!
  const loggedInAuthor = 'Invictus Bazaar'; 

  const categories = [
    { value: 'design', label: 'Graphic & Design' },
    { value: 'programming', label: 'Programming' }, 
    { value: 'development', label: 'Web Development' },
    { value: 'marketing', label: 'Digital Marketing' },
    { value: 'writing', label: 'Writing & Translation' },
    { value: 'video', label: 'Video & Animation' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage({ message: '', type: 'none' });

    // Validacija polja
    if (!title || !description || !price || !category) {
      setStatusMessage({ message: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    // Dodajemo autora pre slanja!
    const serviceData = {
      title,
      description,
      price: parseFloat(price),
      category,
      author: loggedInAuthor, // DODATO: Autor je sada uključen u podatke
    };

    try {
      // POST API POZIV
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (response.ok) {
        setStatusMessage({ message: 'Service published successfully! Redirecting...', type: 'success' });
        
        setTitle(''); setDescription(''); setPrice(''); setCategory('');

        setTimeout(() => {
          window.location.href = '/'; 
        }, 3000);

      } else {
        const errorData = await response.json();
        setStatusMessage({ message: `Failed to publish service: ${errorData.message || 'Server error'}`, type: 'error' });
      }
    } catch (error) {
      setStatusMessage({ message: 'Network error. Please try again later.', type: 'error' });
      console.error('Submission error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <Zap className="w-10 h-10 mx-auto mb-2 text-primary" />
            <CardTitle className="text-3xl font-bold">
              Publish Your Service
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Offer your expertise to the Invictus Bazaar community and earn Pi.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STATUS PORUKA */}
              {statusMessage.type !== 'none' && (
                <div className={`p-3 rounded-lg text-center font-medium ${
                  statusMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
                  'bg-red-100 text-red-700 border border-red-300'
                }`}>
                  {statusMessage.message}
                </div>
              )}

              {/* TITLE */}
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center"><FileText className="w-4 h-4 mr-2" /> Service Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., I will design a modern logo for your brand"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center"><List className="w-4 h-4 mr-2" /> Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your service in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CATEGORY */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={setCategory} value={category} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* PRICE */}
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center"><DollarSign className="w-4 h-4 mr-2" /> Price (in Pi)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 50.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 mt-6"
                size="lg"
              >
                Publish Service
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}