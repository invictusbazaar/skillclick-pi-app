"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Send, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/LanguageContext"
import { useAuth } from "@/components/AuthContext" // ✅ 1. Uvozimo AuthContext

function ChatInterface() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage();
  const { user } = useAuth(); // ✅ 2. Uzimamo ulogovanog korisnika
  
  const rawSellerName = searchParams.get('seller')
  const serviceName = searchParams.get('service')
  
  const sellerName = rawSellerName ? decodeURIComponent(rawSellerName) : null

  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false); // Za spinner dok šalje
  
  const [chatHistory, setChatHistory] = useState([
    { id: 1, text: "Welcome...", sender: "system", time: "10:00", type: "welcome" } 
  ])

  const [isMobileBackActive, setIsMobileBackActive] = useState(false)

  // Prevođenje sistemskih poruka
  useEffect(() => {
    setChatHistory(prevHistory => prevHistory.map(msg => {
        if (msg.id === 1) {
            return { ...msg, text: t('msgSystemWelcome') };
        }
        if (msg.id === 2 && serviceName) {
            return { ...msg, text: `${t('msgStartConv')} "${serviceName}"` };
        }
        return msg;
    }));
  }, [t, serviceName]);

  // Inicijalna poruka ako postoji tema (serviceName)
  useEffect(() => {
    if (sellerName && serviceName) {
        setChatHistory(prev => {
            if (prev.some(msg => msg.id === 2)) return prev;
            return [
                ...prev,
                { 
                    id: 2, 
                    text: `${t('msgStartConv')} "${serviceName}"`, 
                    sender: "system", 
                    time: "Just now",
                    type: "topic"
                }
            ]
        })
    }
  }, [sellerName, serviceName])

  const handleBack = (e: React.MouseEvent) => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        e.preventDefault();
        e.stopPropagation();
        setIsMobileBackActive(true);
        setTimeout(() => {
            setIsMobileBackActive(false); 
            navigateBack();
        }, 500);
    } else {
        navigateBack();
    }
  }

  const navigateBack = () => {
      if (window.history.length > 1) {
          router.back();
      } else {
          router.push('/');
      }
  }

  // ✅ 3. NOVA FUNKCIJA ZA SLANJE (POVEZANA SA SERVEROM)
  const handleSend = async () => {
    if (!message.trim() || !user || !sellerName) return;

    const contentToSend = message;
    setMessage(""); // Odmah isprazni polje
    setIsSending(true);

    // 1. Optimistički prikaz (prikaži poruku odmah da korisnik ne čeka)
    const optimisticMsg = { 
        id: Date.now(), 
        text: contentToSend, 
        sender: "me", 
        time: "Now", 
        type: "user" 
    };
    setChatHistory(prev => [...prev, optimisticMsg]);

    try {
        // 2. Šaljemo podatke na API
        const response = await fetch('/api/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: contentToSend,
                senderUsername: user.username,   // Ko šalje (JA)
                receiverUsername: sellerName     // Kome šaljem (PRODAVAC)
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Greška pri slanju");
        }

        // Ovde bi idealno zamenili optimističku poruku sa pravom iz baze,
        // ali za sada je dovoljno da znamo da je prošlo.
        // Server je sada kreirao NOTIFIKACIJU za primaoca! 🔔

    } catch (error) {
        console.error("Greška pri slanju:", error);
        alert("Nije uspelo slanje poruke. Proverite internet.");
    } finally {
        setIsSending(false);
    }
  }

  return (
    <div className="h-[100dvh] md:min-h-screen w-full bg-white md:bg-gray-100 flex flex-col md:items-center md:justify-center font-sans overflow-hidden">
      
      <div className="w-full md:max-w-2xl bg-white md:rounded-2xl md:shadow-xl md:border md:border-gray-200 h-full md:h-[85vh] flex flex-col relative">
        
        {/* HEADER */}
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 p-3 md:p-4 shadow-sm shrink-0 z-20">
          <div className="flex items-center gap-3">
               <button 
                  onClick={handleBack} 
                  className={`
                    flex items-center gap-2 transition-colors duration-200 font-medium outline-none p-1
                    ${isMobileBackActive ? "text-purple-600" : "text-gray-500 md:hover:text-purple-600"}
                  `}
               >
                  <ArrowLeft className="w-6 h-6" />
                  <span className="hidden md:block">{t('back')}</span>
               </button>
               
               <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div className="relative shrink-0">
                      <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
                          {sellerName ? sellerName[0].toUpperCase() : <User className="w-5 h-5"/>}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  
                  <div className="flex flex-col overflow-hidden">
                      <div className="flex items-center gap-2">
                          <h1 className="font-bold text-gray-900 leading-tight truncate">
                              {sellerName ? sellerName : t('msgYourMessages')}
                          </h1>
                      </div>
                      {serviceName ? (
                          <p className="text-xs text-gray-500 truncate w-full">
                              {t('msgTopic')} {serviceName}
                          </p>
                      ) : (
                          <p className="text-xs text-green-600 font-medium">{t('msgOnline')}</p>
                      )}
                  </div>
               </div>
          </div>
        </div>

        {/* CHAT AREA */}
        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/50 w-full">
          {chatHistory.map((msg) => (
              <div 
                  key={msg.id} 
                  className={`flex w-full ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                  <div 
                      className={`max-w-[85%] md:max-w-[70%] p-3.5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed break-words
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
        <div className="bg-white border-t border-gray-100 p-3 md:p-4 shrink-0 w-full z-20 pb-safe">
            <div className="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-2xl px-2 py-2 focus-within:ring-2 focus-within:ring-purple-100 focus-within:border-purple-300 transition-all w-full">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('msgPlaceholder')}
                  className="flex-1 bg-transparent border-0 px-3 py-2 text-gray-700 placeholder:text-gray-400 focus:outline-none min-w-0"
                  onKeyDown={(e) => e.key === "Enter" && !isSending && handleSend()}
                  disabled={isSending}
                />
                <Button 
                  onClick={handleSend}
                  disabled={isSending}
                  size="icon"
                  className="shrink-0 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200 disabled:opacity-50"
                >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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