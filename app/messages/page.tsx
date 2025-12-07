"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Send, User, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

function ChatInterface() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const rawSellerName = searchParams.get('seller')
  const serviceName = searchParams.get('service')
  
  const sellerName = rawSellerName ? decodeURIComponent(rawSellerName) : null

  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState([
    { id: 1, text: "Dobrodošli u SkillClick chat! 👋", sender: "system", time: "10:00" },
  ])

  // 👇 Stanje za animaciju strelice na mobilnom
  const [isMobileBackActive, setIsMobileBackActive] = useState(false)

  useEffect(() => {
    if (sellerName && serviceName) {
        setChatHistory(prev => {
            if (prev.some(msg => msg.text.includes(serviceName))) return prev;
            return [
                ...prev,
                { 
                    id: 2, 
                    text: `Započinjete razgovor sa korisnikom ${sellerName} u vezi usluge: "${serviceName}"`, 
                    sender: "system", 
                    time: "Upravo sada" 
                }
            ]
        })
    }
  }, [sellerName, serviceName])

  // 👇 LOGIKA ZA DUGME NAZAD
  const handleBack = (e: React.MouseEvent) => {
    // Provera da li je mobilni uređaj (manje od 768px)
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
        e.preventDefault(); // Sprečava default
        e.stopPropagation(); // Sprečava eventualne druge evente

        setIsMobileBackActive(true); // 1. Pali ljubičastu boju

        // 2. Čeka 0.5 sekundi pa vraća nazad
        setTimeout(() => {
            setIsMobileBackActive(false); 
            navigateBack();
        }, 500);
    } else {
        // PC ponašanje - trenutno
        navigateBack();
    }
  }

  // Pomoćna funkcija za navigaciju
  const navigateBack = () => {
      if (window.history.length > 1) {
          router.back();
      } else {
          router.push('/');
      }
  }

  const handleSend = () => {
    if (!message.trim()) return
    const newMsg = { id: Date.now(), text: message, sender: "me", time: "Sad" }
    setChatHistory(prev => [...prev, newMsg])
    setMessage("")

    setTimeout(() => {
        setChatHistory(prev => [...prev, { 
            id: Date.now() + 1, 
            text: "Hvala na poruci! Javiću se uskoro.", 
            sender: "other", 
            time: "Sad" 
        }])
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-white md:bg-gray-100 flex items-center justify-center p-0 md:p-6 font-sans">
      
      {/* KONTEJNER */}
      <div className="w-full md:max-w-2xl bg-white md:rounded-2xl md:shadow-xl md:border md:border-gray-200 h-screen md:h-[85vh] flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 p-4 shadow-sm">
          <div className="flex items-center gap-4">
               
               {/* 👇 DUGME NAZAD - POPRAVLJENO */}
               <button 
                  onClick={handleBack} 
                  className={`
                    flex items-center gap-2 transition-colors duration-200 font-medium outline-none
                    ${isMobileBackActive 
                        ? "text-purple-600" // MOBILNI KLIK: Ljubičasto
                        : "text-gray-500 md:hover:text-purple-600" // PC HOVER: Ljubičasto (md:hover sprečava mešanje na mobilnom)
                    }
                  `}
                  title="Povratak nazad"
                  style={{ WebkitTapHighlightColor: "transparent" }} // Uklanja plavi odsjaj na Androidu/iOS pri kliku
               >
                  <ArrowLeft className="w-6 h-6" />
                  <span className="hidden md:block">Nazad</span>
               </button>
               
               <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                      <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
                          {sellerName ? sellerName[0].toUpperCase() : <User className="w-5 h-5"/>}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  
                  <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                          <h1 className="font-bold text-gray-900 leading-tight">
                              {sellerName ? sellerName : "Vaše poruke"}
                          </h1>
                          <MessageSquare className="w-4 h-4 text-purple-400" />
                      </div>
                      
                      {serviceName ? (
                          <p className="text-xs text-gray-500 truncate max-w-[200px] md:max-w-sm">
                              Tema: {serviceName}
                          </p>
                      ) : (
                          <p className="text-xs text-green-600 font-medium">Online</p>
                      )}
                  </div>
               </div>
          </div>
        </div>

        {/* CHAT AREA */}
        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/50">
          {chatHistory.map((msg) => (
              <div 
                  key={msg.id} 
                  className={`flex w-full ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                  <div 
                      className={`max-w-[85%] md:max-w-[70%] p-3.5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed
                      ${msg.sender === "me" 
                          ? "bg-purple-600 text-white rounded-br-none" 
                          : msg.sender === "system"
                              ? "bg-transparent text-gray-400 text-center text-xs w-full shadow-none my-2"
                              : "bg-white border border-gray-200 text-gray-700 rounded-bl-none"
                      }`}
                  >
                      <p>{msg.text}</p>
                      {msg.sender !== "system" && (
                          <span className={`text-[10px] block mt-1 text-right opacity-70`}>
                              {msg.time}
                          </span>
                      )}
                  </div>
              </div>
          ))}
        </main>

        {/* INPUT AREA */}
        <div className="bg-white border-t border-gray-100 p-4">
            <div className="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-2xl px-2 py-2 focus-within:ring-2 focus-within:ring-purple-100 focus-within:border-purple-300 transition-all">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Napišite poruku..."
                  className="flex-1 bg-transparent border-0 px-3 py-2 text-gray-700 placeholder:text-gray-400 focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <Button 
                  onClick={handleSend}
                  size="icon"
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>

      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Učitavanje...</div>}>
      <ChatInterface />
    </Suspense>
  )
}