"use client"

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, MapPin, Mail, MessageSquare, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

// MOCK PODACI (Dok ne povežemo bazu za korisnike)
const mockSellers: any = {
  "pixel_art": {
    fullName: "Pixel Studio",
    location: "Novi Sad, Serbia",
    bio: "Professional graphic designer with 10 years of experience in branding and logo design.",
    rating: 5.0,
    reviews: 124,
    avatar: "🎨",
    joined: "Jan 2024"
  },
  "dev_guy": {
    fullName: "Stefan K.",
    location: "Belgrade, Serbia",
    bio: "Full stack developer specializing in Next.js and React.",
    rating: 4.9,
    reviews: 85,
    avatar: "💻",
    joined: "Feb 2024"
  }
};

export default function SellerProfilePage() {
  const params = useParams();
  const username = params.username as string; // Uzimamo username iz URL-a
  
  const [seller, setSeller] = useState<any>(null);
  const [sellerGigs, setSellerGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Učitaj podatke o prodavcu (Simulacija)
    const foundSeller = mockSellers[username] || {
        fullName: username,
        location: "Global",
        bio: "New seller on SkillClick.",
        rating: 0,
        reviews: 0,
        avatar: "👤",
        joined: "Just now"
    };
    setSeller(foundSeller);

    // 2. Učitaj oglase tog prodavca iz baze
    const fetchGigs = async () => {
        try {
            const response = await fetch('/api/services');
            if (response.ok) {
                const allServices = await response.json();
                // Filtriraj samo oglase ovog prodavca
                const gigs = allServices.filter((s: any) => s.author === username);
                setSellerGigs(gigs);
            }
        } catch (error) {
            console.error("Error loading gigs", error);
        } finally {
            setLoading(false);
        }
    };
    fetchGigs();

  }, [username]);

  if (!seller) return <div className="p-10 text-center">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* --- LEVA KOLONA: INFO KARTICA --- */}
            <div className="md:col-span-1">
                <Card className="sticky top-24 shadow-md border-gray-200">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-28 h-28 bg-blue-100 rounded-full flex items-center justify-center text-5xl mb-4">
                            {seller.avatar}
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">{seller.fullName}</h1>
                        <p className="text-sm text-gray-500 mb-4">@{username}</p>
                        
                        <div className="w-full border-t border-gray-100 my-4"></div>

                        <div className="w-full space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500 flex items-center"><MapPin className="w-4 h-4 mr-2"/> From</span>
                                <span className="font-medium text-gray-800">{seller.location}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 flex items-center"><Star className="w-4 h-4 mr-2"/> Rating</span>
                                <span className="font-medium text-yellow-600 font-bold">{seller.rating} ({seller.reviews})</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 flex items-center"><User className="w-4 h-4 mr-2"/> Member since</span>
                                <span className="font-medium text-gray-800">{seller.joined}</span>
                            </div>
                        </div>

                        <div className="w-full border-t border-gray-100 my-4"></div>
                        
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            <MessageSquare className="w-4 h-4 mr-2" /> Contact Me
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* --- DESNA KOLONA: BIOGRAFIJA I OGLASI --- */}
            <div className="md:col-span-2 space-y-8">
                
                {/* BIO */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">About Me</h2>
                    <p className="text-gray-600 leading-relaxed">
                        {seller.bio}
                    </p>
                </div>

                {/* OGLASI (GIGS) */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">My Gigs</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {loading ? <p>Loading gigs...</p> : sellerGigs.length > 0 ? (
                            sellerGigs.map((gig) => (
                                <Link key={gig.id} href={`/services/${gig.id}`}>
                                    <Card className="group cursor-pointer hover:shadow-md transition-all overflow-hidden border-gray-200">
                                        <div className="h-32 bg-blue-50 flex items-center justify-center text-4xl">
                                            {gig.image || '⚡'}
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">{gig.title}</h3>
                                            <div className="flex justify-between items-center border-t pt-3 mt-2">
                                                <span className="text-xs font-semibold text-gray-400 uppercase">{gig.category}</span>
                                                <span className="font-bold text-gray-900">{gig.price} π</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        ) : (
                            <p className="text-gray-500 italic">No active gigs to display.</p>
                        )}
                    </div>
                </div>

            </div>

        </div>
      </div>
    </div>
  );
}