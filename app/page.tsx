"use client"

import { useState } from "react"
import { Search, Palette, PenTool, Code, MessageSquare, User, Menu, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

const categories = [
  { id: "design", name: { en: "Design", sr: "Dizajn" }, icon: Palette, color: "text-blue-500" },
  { id: "writing", name: { en: "Writing", sr: "Pisanje" }, icon: PenTool, color: "text-green-500" },
  { id: "programming", name: { en: "Programming", sr: "Programiranje" }, icon: Code, color: "text-purple-500" },
]

export default function HomePage() {
  const [lang, setLang] = useState<"en" | "sr">("en")
  const [searchQuery] = useState("") 
  const [menuOpen, setMenuOpen] = useState(false)
  
  // DODATO: Simulacija stanja logovanja
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  
  const router = useRouter()

  const t = {
    subtitle: { en: "Find skilled providers for any task", sr: "Pronađite stručnjake za bilo koji posao" },
    searchPlaceholder: { en: "Search for services...", sr: "Pretražite usluge..." },
    categories: { en: "Browse Categories", sr: "Pregledaj kategorije" },
    profile: { en: "Profile", sr: "Profil" },
    messages: { en: "Messages", sr: "Poruke" },
    offerService: { en: "Post a Service", sr: "Ponudi Svoju Uslugu" },
    login: { en: "Login", sr: "Prijavi se" }, // DODATO
    register: { en: "Register", sr: "Registruj se" }, // DODATO
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/services?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  // --- NAPOMENA: Za test, samo promeni false u true u redu 30 (useState(false)) ---

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border"> 
        <div className="container mx-auto px-4 py-1 flex items-center justify-between"> 
          
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
              {isLoggedIn ? ( // LOGIKA: AKO JE ULOGOVAN
                <>
                  <Link href="/messages">
                    <Button variant="ghost" className="h-8 px-2 text-xs"> 
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {t.messages[lang]}
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="ghost" className="h-8 px-2 text-xs"> 
                      <User className="h-4 w-4 mr-1" />
                      {t.profile[lang]}
                    </Button>
                  </Link>
                </>
              ) : ( // LOGIKA: AKO NIJE ULOGOVAN
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="h-8 px-2 text-xs"> 
                      <LogIn className="h-4 w-4 mr-1" />
                      {t.login[lang]}
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="ghost" className="h-8 px-2 text-xs"> 
                      <UserPlus className="h-4 w-4 mr-1" />
                      {t.register[lang]}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-3xl mx-auto text-center mb-0"> 
          
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 text-balance tracking-tight bg-gradient-to-r from-purple-700 to-amber-500 text-transparent bg-clip-text">
            SkillClick
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto mb-4">
            {t.subtitle[lang]}
          </p>
          
          <div className="flex justify-center mb-6 animate-bounce-slow">
            <Link href="/create">
                <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-purple-600 to-amber-500 text-primary-foreground hover:from-purple-700 hover:to-amber-600">
                🚀 {t.offerService[lang]}
                </Button>
            </Link>
          </div>

        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10 md:mb-14">
          <div className="relative group">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 opacity-75 blur-sm group-hover:opacity-100 transition duration-200 animate-gradient-pulse"></div>
            <div className="relative bg-card rounded-xl shadow-lg flex items-center">
                <Search className="ml-4 h-5 w-5 text-muted-foreground" />
                <Input
                type="text"
                placeholder={t.searchPlaceholder[lang]}
                value={searchQuery}
                onChange={() => {}}
                className="border-0 focus-visible:ring-0 bg-transparent py-6 text-base md:text-lg rounded-xl flex-grow shadow-none"
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    handleSearch()
                    }
                }}
                />
                <Button onClick={handleSearch} className="mr-2 rounded-lg bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-primary-foreground">
                    {lang === "en" ? "Search" : "Traži"}
                </Button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{t.categories[lang]}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Link key={category.id} href={`/services?category=${category.id}`}>
                  <div className="relative group h-full">
                    <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 opacity-50 blur-sm group-hover:opacity-100 transition duration-200 animate-gradient-pulse"></div>
                    <Card className="relative h-full hover:shadow-xl transition-all duration-300 cursor-pointer border hover:border-primary/50 group bg-card">
                      <CardContent className="flex flex-col items-center justify-center p-8">
                        <div className={`mb-6 p-4 rounded-full bg-muted group-hover:bg-background transition-colors ${category.color}`}>
                          <Icon className="h-10 w-10 md:h-12 md:w-12" />
                        </div>
                        <h3 className="text-xl font-bold text-center bg-gradient-to-r from-purple-700 to-amber-500 text-transparent bg-clip-text">
                          {category.name[lang]}
                        </h3>
                      </CardContent>
                    </Card>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}