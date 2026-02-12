"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Send, User, MessageSquare, Search, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/LanguageContext"
import { useAuth } from "@/components/AuthContext"

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const { user } = useAuth()
  
  const sellerParam = searchParams.get('seller')
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.username) return;
      try {
        const res = await fetch('/api/messages/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user.username })
        });
        const data = await res.json();
        setConversations(data.conversations || []);
      } catch (err) {
        console.error("Greška pri učitavanju Inboxa", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user]);

  // Ako kliknemo na nekoga, otvara se čet (to ostaje isto)
  if (sellerParam) {
     return <DirectChat sellerName={decodeURIComponent(sellerParam)} />
  }

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 font-sans pb-20">
      <div className="max-w-2xl mx-auto bg-white min-h-screen md:shadow-2xl md:border-x md:border-gray-100">
        
        {/* HEADER (U tvom stilu) */}
        <div className="p-5 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {t('msgYourMessages')}
            </h1>
            <p className="text-xs text-purple-600 font-bold uppercase tracking-widest mt-1">
                SkillClick Chat
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-600 rounded-2xl rotate-3 flex items-center justify-center shadow-lg shadow-purple-200">
            <MessageSquare className="w-6 h-6 text-white -rotate-3" />
          </div>
        </div>

        {/* SEARCH BAR (Kao na WhatsApp-u) */}
        <div className="p-4">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Pretraži razgovore..." 
                    className="w-full bg-gray-100 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-purple-100 transition-all outline-none"
                />
            </div>
        </div>

        {/* LISTA RAZGOVORA */}
        {loading ? (
          <div className="p-10 text-center text-gray-400 animate-pulse">Učitavanje...</div>
        ) : conversations.length === 0 ? (
          <div className="p-20 text-center">
             <div className="bg-purple-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-purple-200 w-10 h-10" />
             </div>
             <p className="text-gray-500 font-medium">Još uvek nema poruka.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {conversations.map((conv) => (
              <div 
                key={conv.username}
                onClick={() => router.push(`/messages?seller=${conv.username}`)}
                className="px-4 py-4 flex items-center gap-4 hover:bg-purple-50 cursor-pointer transition-all border-b border-gray-50 group"
              >
                {/* Avatar sa tvojom bojom */}
                <div className="relative shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                        {conv.username[0].toUpperCase()}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                </div>

                {/* Tekst poruke */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-900 truncate text-base">{conv.username}</h3>
                    <span className="text-[11px] font-medium text-gray-400">
                        {new Date(conv.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Ikona za "pročitano" kao na WA */}
                    <CheckCheck className={`w-4 h-4 ${conv.isRead ? 'text-blue-500' : 'text-gray-300'}`} />
                    <p className={`text-sm truncate ${!conv.isRead ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                        {conv.lastMessage}
                    </p>
                  </div>
                </div>

                {/* Kružić za nepročitane poruke */}
                {!conv.isRead && (
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-200">
                    <span className="text-[10px] text-white font-bold">1</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Ostatak koda (DirectChat i Suspense) ostaje dole...