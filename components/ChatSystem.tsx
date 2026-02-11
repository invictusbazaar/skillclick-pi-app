"use client"

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  sellerUsername: string;
}

export default function ChatSystem({ sellerUsername }: Props) {
  const { user } = useAuth();
  const { language } = useLanguage(); // Koristimo 'language' iz context-a
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  
  // ✅ PROMENA: Ref sada gađa kontejner, a ne dno
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // --- PREVODI ---
  const txt: any = {
    en: { title: "Contact Seller", placeholder: "Type a message...", send: "Send", login: "Login to chat", empty: "No messages yet. Start the conversation!" },
    sr: { title: "Kontaktiraj Prodavca", placeholder: "Napiši poruku...", send: "Pošalji", login: "Prijavi se za chat", empty: "Nema poruka. Započni razgovor!" },
    zh: { title: "联系卖家", placeholder: "输入消息...", send: "发送", login: "登录聊天", empty: "暂无消息。开始对话！" },
    hi: { title: "Seller se sampark karein", placeholder: "Sandesh likhein...", send: "Bhejein", login: "Chat ke liye login karein", empty: "Koi sandesh nahi." },
    tw: { title: "聯繫賣家", placeholder: "輸入消息...", send: "發送", login: "登錄聊天", empty: "暫無消息。開始對話！" },
    id: { title: "Hubungi Penjual", placeholder: "Ketik pesan...", send: "Kirim", login: "Masuk untuk mengobrol", empty: "Belum ada pesan." }
  };
  
  // Siguran pristup prevodu
  const T = (key: string) => {
    return txt[language]?.[key] || txt['en'][key] || key;
  };

  // Automatsko osvežavanje poruka
  useEffect(() => {
    if (!user || !sellerUsername) return;
    
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat?myUsername=${user.username}&otherUsername=${sellerUsername}`);
        const data = await res.json();
        if (Array.isArray(data)) {
            setMessages(data);
        }
      } catch (e) { console.error(e); }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); 
    return () => clearInterval(interval);
  }, [user, sellerUsername]);

  // ✅ POPRAVKA SKAKANJA STRANICE:
  // Umesto scrollIntoView (koji pomera ceo ekran), koristimo scrollTop kontejnera
  useEffect(() => {
    if (chatContainerRef.current) {
        const { scrollHeight, clientHeight } = chatContainerRef.current;
        chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    setSending(true);

    await new Promise(r => setTimeout(r, 500)); // Mala pauza za efekat

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          senderUsername: user.username,
          receiverUsername: sellerUsername
        })
      });
      setNewMessage("");
      // Odmah osveži poruke
      const res = await fetch(`/api/chat?myUsername=${user.username}&otherUsername=${sellerUsername}`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
      
    } catch (e) {
      alert("Error sending message");
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center mt-6">
            <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2"/>
            <p className="text-gray-500 font-medium text-sm">{T('login')}</p>
        </div>
    );
  }

  // Ako sam ja prodavac, ne prikazuj chat sam sa sobom
  if (user.username === sellerUsername) return null;

  return (
    <div className="bg-white rounded-2xl border border-purple-100 shadow-lg relative overflow-hidden flex flex-col h-full max-h-[500px]">
        {/* Header Chata */}
        <div className="bg-purple-50 p-3 border-b border-purple-100 flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-full shadow-sm">
                <MessageCircle className="w-4 h-4 text-purple-600"/>
            </div>
            <h3 className="font-bold text-gray-800 text-sm">{T('title')}</h3>
        </div>

        {/* Lista Poruka - Ovde primenjujemo ref */}
        <div 
            ref={chatContainerRef} 
            className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50 h-64 scrollbar-thin scrollbar-thumb-purple-200"
        >
            {messages.length === 0 && (
                <div className="text-center text-gray-400 text-xs mt-10 italic">{T('empty')}</div>
            )}
            {messages.map((msg, index) => {
                const isMe = msg.sender.username === user.username;
                return (
                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                            max-w-[85%] px-3 py-2 rounded-xl text-xs font-medium shadow-sm leading-relaxed
                            ${isMe ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white text-gray-700 border border-gray-200 rounded-bl-none'}
                        `}>
                            {msg.content}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Unos */}
        <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={T('placeholder')}
                className="border-gray-200 focus:ring-purple-500 rounded-xl text-sm h-10"
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button 
                onClick={handleSend} 
                disabled={sending}
                className={`
                    rounded-xl h-10 w-10 p-0 flex items-center justify-center transition-all duration-300
                    ${sending ? "bg-purple-800" : "bg-purple-600 hover:bg-purple-700"}
                `}
            >
                {sending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
            </Button>
        </div>
    </div>
  );
}
