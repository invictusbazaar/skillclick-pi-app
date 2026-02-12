"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Send, MessageSquare, Search, CheckCheck, Loader2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/LanguageContext"
import { useAuth } from "@/components/AuthContext"

function ChatInterface() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const { user } = useAuth()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sellerParam = searchParams.get('seller')
  const serviceName = searchParams.get('service')
  const sellerName = sellerParam ? decodeURIComponent(sellerParam) : null

  const [conversations, setConversations] = useState<any[]>([])
  const [loadingInbox, setLoadingInbox] = useState(true)
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  
  const [chatHistory, setChatHistory] = useState<any[]>([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // 1. INBOX LISTA
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.username || sellerName) return; 
      try {
        const res = await fetch('/api/messages/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user.username })
        });
        const data = await res.json();
        setConversations(data.conversations || []);
      } catch (err) {
        console.error("Greška inbox", err);
      } finally {
        setLoadingInbox(false);
      }
    };

    if (!sellerName) {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000); 
        return () => clearInterval(interval);
    }
  }, [user, sellerName]);


  // 2. LIVE CHAT SYNC
  useEffect(() => {
    if (!sellerName || !user?.username) return;

    const syncMessages = async () => {
        try {
            const res = await fetch('/api/messages/get', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    myUsername: user.username,
                    otherUsername: sellerName
                })
            });
            
            if (!res.ok) return;

            const data = await res.json();
            
            if (data.messages) {
                const formatted = data.messages.map((m: any) => ({
                    id: m.id,
                    text: m.content,
                    sender: m.sender.username === user.username ? "me" : "other",
                    time: new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    isRead: m.isRead
                }));
                
                if (serviceName) {
                    formatted.unshift({ 
                        id: 'sys-topic', 
                        text: `${t('msgStartConv')} "${serviceName}"`, 
                        sender: "system", 
                        time: "" 
                    });
                }
                
                setChatHistory(prev => {
                    if (prev.length !== formatted.length) {
                        setTimeout(scrollToBottom, 100); 
                        return formatted;
                    }
                    const lastMsgNew = formatted[formatted.length - 1];
                    const lastMsgOld = prev[prev.length - 1];
                    if (lastMsgNew?.id !== lastMsgOld?.id || lastMsgNew?.isRead !== lastMsgOld?.isRead) {
                         return formatted;
                    }
                    return prev; 
                });
            }
        } catch (e) {
            console.error("Greška sync:", e);
        }
    };

    syncMessages();
    const interval = setInterval(syncMessages, 2000);
    return () => clearInterval(interval);
  }, [sellerName, user, serviceName, t]);


  // 3. SLANJE PORUKE
  const handleSend = async () => {
    if (!message.trim() || !user || !sellerName) return;
    const contentToSend = message;
    setMessage("");
    setIsSending(true);

    const optimisticMsg = { 
        id: "temp-" + Date.now(), 
        text: contentToSend, 
        sender: "me", 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        isRead: false
    };
    setChatHistory(prev => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 100);

    try {
        await fetch('/api/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: contentToSend,
                senderUsername: user.username,
                receiverUsername: sellerName
            }),
        });
    } catch (error) {
        console.error("Greška pri slanju:", error);
    } finally {
        setIsSending(false);
    }
  };

  const isOnline = (lastSeenDate: string) => {
    if (!lastSeenDate) return false;
    const now = new Date();
    const lastSeen = new Date(lastSeenDate);
    const diffInMinutes = (now.getTime() - lastSeen.getTime()) / 1000 / 60;
    return diffInMinutes < 2; 
  };

  // --- RENDERING: INBOX LISTA ---
  if (!sellerName) {
    return (
        <div className="min-h-screen bg-white md:bg-gray-50 font-sans pb-20">
          <div className="max-w-2xl mx-auto bg-white min-h-screen md:shadow-2xl md:border-x md:border-gray-100">
            <div className="p-5 border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between shadow-sm">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('msgYourMessages')}</h1>
                <p className="text-xs text-purple-600 font-bold uppercase tracking-widest mt-1">Inbox</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            
            <div className="p-4 bg-white">
               <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Pretraži..." className="w-full bg-gray-100 border-none rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-purple-100 transition-all" />
               </div>
            </div>

            {loadingInbox ? (
              <div className="p-10 text-center text-gray-400 animate-pulse">{t('loading')}</div>
            ) : conversations.length === 0 ? (
              <div className="p-20 text-center">
                 <MessageSquare className="text-purple-200 w-12 h-12 mx-auto mb-4" />
                 <p className="text-gray-500 font-medium">Nema poruka.</p>
              </div>
            ) : (
              <div className="flex flex-col pb-20">
                {conversations.map((conv) => (
                  <div 
                    key={conv.username} 
                    onClick={() => router.push(`/messages?seller=${conv.username}`)} 
                    className="px-4 py-4 flex items-center gap-4 hover:bg-purple-50 active:bg-purple-100 cursor-pointer transition-all border-b border-gray-50 group"
                  >
                    <div className="relative shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md">
                            {conv.username[0].toUpperCase()}
                        </div>
                        {isOnline(conv.lastSeen) && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-gray-900 truncate text-base">{conv.username}</h3>
                        <span className="text-[11px] text-gray-400 font-medium">{new Date(conv.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCheck className={`w-4 h-4 ${conv.isRead ? 'text-blue-500' : 'text-gray-300'}`} />
                        <p className={`text-sm truncate ${!conv.isRead ? 'font-bold text-gray-900' : 'text-gray-500'}`}>{conv.lastMessage}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    );
  }

  // --- RENDERING: ČAT PROZOR ---
  return (
    <div className="fixed inset-0 bg-white md:bg-gray-100 flex flex-col md:items-center md:justify-center font-sans z-50">
      <div className="w-full md:max-w-2xl bg-white md:rounded-2xl md:shadow-xl md:border md:border-gray-200 h-full md:h-[85vh] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 p-3 md:p-4 shadow-sm shrink-0 z-20">
          <div className="flex items-center gap-3">
               <button onClick={() => router.push('/messages')} className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors outline-none p-1">
                  <ArrowLeft className="w-6 h-6" />
                  <span className="hidden md:block">{t('back')}</span>
               </button>
               <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold shrink-0">
                      {sellerName[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                      <h1 className="font-bold text-gray-900 leading-tight truncate text-lg">{sellerName}</h1>
                      {serviceName ? (
                          <p className="text-[10px] text-gray-400 truncate">{t('msgTopic')} {serviceName}</p>
                      ) : (
                          <div className="flex items-center gap-1">
                             <span className="relative flex h-2 w-2">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                             </span>
                             <p className="text-[10px] text-green-600 font-bold">Live</p>
                          </div>
                      )}
                  </div>
               </div>
          </div>
        </div>

        {/* Poruke Area */}
        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50/50 pb-24 md:pb-4">
          {chatHistory.length === 0 && (
              <div className="text-center text-gray-400 mt-10 text-sm">Započnite razgovor...</div>
          )}
          {chatHistory.map((msg, index) => (
              <div key={index} className={`flex w-full ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] md:max-w-[70%] p-3 px-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed break-words
                      ${msg.sender === "me" ? "bg-purple-600 text-white rounded-br-none" : msg.sender === "system" ? "bg-purple-50 text-purple-800 text-center text-xs w-full shadow-none my-2 italic border border-purple-100" : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"}`}>
                      <p>{msg.text}</p>
                      {msg.sender !== "system" && (
                        <div className={`text-[10px] mt-1 flex justify-end items-center gap-1 opacity-70 ${msg.sender === "me" ? "text-purple-100" : "text-gray-400"}`}>
                            <span>{msg.time}</span>
                            {msg.sender === "me" && (
                                <CheckCheck className={`w-3 h-3 ${msg.isRead ? "text-green-300" : "text-purple-300"}`} />
                            )}
                        </div>
                      )}
                  </div>
              </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        {/* 👇 INPUT ZONA - POPRAVLJENO */}
        {/* Koristimo z-40 i fiksiranu poziciju, ali sa px-4 da odmaknemo od ivice */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-40 pb-safe">
            <div className="p-3 md:p-4 w-full max-w-2xl mx-auto">
                <div className="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-2xl px-2 py-2 focus-within:ring-2 focus-within:ring-purple-100 transition-all shadow-sm">
                    <input 
                      type="text" 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)} 
                      placeholder={t('msgPlaceholder')} 
                      className="flex-1 bg-transparent border-0 px-3 py-2 text-gray-700 outline-none text-base min-w-0" 
                      onKeyDown={(e) => e.key === "Enter" && !isSending && handleSend()} 
                    />
                    <Button onClick={handleSend} disabled={isSending} size="icon" className="shrink-0 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md disabled:opacity-50 w-10 h-10 mr-1">
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Učitavanje...</div>}>
      <ChatInterface />
    </Suspense>
  )
}
