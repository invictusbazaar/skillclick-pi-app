"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Layers, Heart, Star, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ISPRAVLJEN IMPORT: Koristimo @/lib/data umesto ../../
import { SERVICES_DATA } from "@/lib/data";

export default function AllServicesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "all";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  // Postavljamo početno stanje, ali ćemo ga filtrirati u useEffect-u
  const [filteredServices, setFilteredServices] = useState(SERVICES_DATA);

  // Funkcija za gradijente (ista kao na home)
  const getRandomGradient = (id: number) => {
    const gradients = [
      "from-fuchsia-500 to-pink-600",
      "from-violet-500 to-purple-600",
      "from-blue-500 to-indigo-600",
      "from-emerald-400 to-teal-500"
    ];
    return gradients[(id - 1) % gradients.length];
  };

  // Filtriranje
  useEffect(() => {
    let results = SERVICES_DATA;

    // Filter po pretrazi
    if (searchTerm) {
      results = results.filter(service => 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter po kategoriji
    if (selectedCategory && selectedCategory !== 'all') {
      results = results.filter(service => service.category === selectedCategory);
    }

    setFilteredServices(results);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* Header Pretraga */}
      <div className="bg-white border-b border-gray-200 sticky top-16 md:top-24 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
             <Button variant="ghost" onClick={() => router.push('/')} className="md:hidden self-start -ml-2">
                <ArrowLeft className="w-5 h-5" /> Back
             </Button>
             
             <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  type="text" 
                  placeholder="Search services..." 
                  className="pl-10 h-12 text-lg bg-gray-50 border-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
          
          {/* Kategorije Filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-2">
             <button onClick={() => setSelectedCategory('all')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
             <button onClick={() => setSelectedCategory('design')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'design' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Design</button>
             <button onClick={() => setSelectedCategory('programming')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'programming' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Programming</button>
             <button onClick={() => setSelectedCategory('writing')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'writing' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Writing</button>
             <button onClick={() => setSelectedCategory('video')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'video' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Video</button>
          </div>
        </div>
      </div>

      {/* REZULTATI */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {filteredServices.length} Services Found
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredServices.map((gig) => (
                <div key={gig.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer">
                    <Link href={`/services/${gig.id}`} className="block relative overflow-hidden h-48">
                        <div className={`absolute inset-0 bg-gradient-to-br ${getRandomGradient(gig.id)} flex items-center justify-center`}>
                             <div className="transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out">
                                {gig.icon ? gig.icon : <Layers className="h-12 w-12 text-white/90" />}
                             </div>
                        </div>
                        <div className="absolute top-3 right-3 p-2 bg-white/30 backdrop-blur-md rounded-full hover:bg-white text-white hover:text-red-500 transition-all z-20">
                              <Heart className="h-4 w-4" />
                        </div>
                    </Link>

                    <div className="p-5 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">
                                  {gig.author[0].toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-gray-600">@{gig.author}</span>
                            </div>
                        </div>

                        <Link href={`/services/${gig.id}`}>
                          <h3 className="text-gray-900 font-bold mb-2 text-lg leading-snug hover:text-purple-600 transition-colors line-clamp-2">
                            {gig.title}
                          </h3>
                        </Link>

                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center text-gray-700 text-sm font-semibold gap-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 
                              {gig.rating} <span className="text-gray-400 font-normal">({gig.reviews})</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">{gig.price} π</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-20">
             <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-gray-500">Nema rezultata</h3>
             <p className="text-gray-400">Pokušaj sa drugim terminom pretrage.</p>
          </div>
        )}
      </div>
    </div>
  );
}