"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, Suspense, useEffect } from "react" // DODATO: useEffect za povlačenje podataka
import { Search, Filter, Star, ArrowLeft, MessageSquare, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Link from "next/link"

// Uklonjena statička lista ALL_SERVICES, sada se podaci povlače!

// Lokalni prevod
const t = {
    messages: { en: "Messages", sr: "Poruke" },
    profile: { en: "Profile", sr: "Profil" },
    offerService: { en: "Post a Service", sr: "Ponudi Svoju Uslugu" },
    search: { en: "Search", sr: "Traži" },
    back: { en: "Back to Home", sr: "Nazad na početnu" },
    details: { en: "Details", sr: "Detalji" },
    categoryTitle: { en: "Category:", sr: "Kategorija:" },
    searchResults: { en: "Search Results", sr: "Rezultati Pretrage" }
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // DODATO: Stanje za čuvanje podataka i loading
  const [allServices, setAllServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const initialQuery = searchParams.get("search") || ""
  const initialCategory = searchParams.get("category") || ""

  const [lang, setLang] = useState<"en" | "sr">("en") 
  const [query, setQuery] = useState(initialQuery)
  const [menuOpen, setMenuOpen] = useState(false)
  
  // FUNKCIJA ZA POZIV API-JA
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (response.ok) {
          const data = await response.json();
          setAllServices(data);
        } else {
          console.error("Failed to fetch services from API.");
        }
      } catch (error) {
        console.error("Network error during fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []); // Pokreće se samo jednom pri učitavanju

  // Filtriranje rezultata
  const filteredServices = allServices.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = initialCategory ? service.category === initialCategory : true
    return matchesSearch && matchesCategory
  })

  const handleSearch = () => {
    router.push(`/services?search=${encodeURIComponent(query)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border"> 
        <div className="container mx-auto px-4 py-3 flex items-center justify-between"> 
          
          <Link href="/" 
                className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-700 to-amber-500 text-transparent bg-clip-text"> 
            SkillClick
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === "en" ? "sr" : "en")} className="text-xs font-semibold">
              {lang === "en" ? "SR" : "EN"}
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden md:flex items-center gap-2">
                <Link href="/create">
                    <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white">
                        {t.offerService[lang]} 
                    </Button>
                </Link>
                <Link href="/messages">
                    <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t.messages[lang]}
                    </Button>
                </Link>
                <Link href="/profile">
                    <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {t.profile[lang]}
                    </Button>
                </Link>
            </div>
          </div>
        </div>
      </header>

      {/* --- GLAVNI SADRŽAJ --- */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t.back[lang]}
          </Button>
        </Link>

        <div className="max-w-6xl mx-auto">
          {/* Header Pretrage */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold">
              {initialCategory 
                ? `${t.categoryTitle[lang]} ${initialCategory.toUpperCase()}` 
                : `${t.searchResults[lang]}`
              }
            </h1>
            
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-grow md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                  placeholder={lang === "en" ? "Search..." : "Pretraži..."}
                />
              </div>
              <Button variant="outline" onClick={handleSearch} className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white">
                {t.search[lang]}
              </Button>
            </div>
          </div>

          {/* Rezultati */}
          {loading ? (
             <div className="text-center py-20 text-primary font-semibold">Učitavanje oglasa...</div>
          ) : filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div key={service.id} className="relative group h-full">
                  {/* SENKA: Puna gradijent senka oko kartice */}
                  <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 opacity-50 blur-sm group-hover:opacity-100 transition duration-200 animate-gradient-pulse"></div>
                  
                  {/* LINK KOJI VODI NA STRANICU DETALJA */}
                  <Link href={`/services/${service.id}`}> 
                    <Card className="relative h-full hover:shadow-xl transition-all duration-300 cursor-pointer border hover:border-primary/50 group bg-card">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {service.category}
                          </span>
                          <div className="flex items-center text-yellow-500 text-sm font-bold">
                            <Star className="h-3 w-3 fill-current mr-1" /> {service.rating}
                          </div>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{service.title}</h3>
                        <p className="text-sm text-muted-foreground">by {service.author}</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-muted/50 mt-auto">
                        <span className="font-bold text-lg">{service.price} π</span>
                        {/* DUGME: Sada koristi prevedeni tekst */}
                        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600">
                           {t.details[lang]} 
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-xl font-bold mb-2">Nema rezultata</h2>
              <p className="text-muted-foreground">Pokušaj sa drugom ključnom reči.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function ServicesPage() {
  // VAŽNO: Koristimo Suspense zbog useRouter/useSearchParams
  return (
    <Suspense fallback={<div className="p-10 text-center">Učitavanje...</div>}>
      <SearchContent />
    </Suspense>
  )
}