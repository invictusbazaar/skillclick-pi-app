"use client"

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Loader2, User } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  sellerUsername: string;
}

export default function ChatSystem({ sellerUsername }: Props) {
  const { user } = useAuth();
  const { language } = useLanguage();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- PREVODI ---
  const txt: any = {
    en: { title: "Contact Seller", placeholder: "Type a message...", send: "Send", login: "Login to chat", empty: "No messages yet. Start the conversation!" },
    sr: { title: "Kontaktiraj Prodavca", placeholder: "Napiši poruku...", send: "Pošalji", login: "Prijavi se za chat", empty: "Nema poruka. Započni razgovor!" },
    zh: { title: "联系卖家", placeholder: "输入消息...", send: "发送", login: "登录聊天", empty: "暂无消息。开始对话！" },
    hi: { title: "Seller se sampark karein", placeholder: "Sandesh likhein...", send: "Bhejein", login: "Chat ke liye login karein", empty: "Koi sandesh nahi." },
    tw: { title: "聯繫賣家", placeholder: "輸入消息...", send: "發送", login: "登錄聊天", empty: "暫無消息。開始對話！" },
    id: { title: "Hubungi Penjual", placeholder: "Ketik pesan...", send: "Kirim", login: "Masuk untuk mengobrol", empty: "Belum ada pesan." }
  };
  const T = (key: string) => txt[language]?.[key] || txt['en'][key];

  // Automatsko osvežavanje poruka (svake 3 sekunde)
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
    const interval = setInterval(fetchMessages, 3000); // Polling interval
    return () => clearInterval(interval);
  }, [user, sellerUsername]);

  // Skroluj na dno kad stigne nova poruka
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    setSending(true);

    // Animacija čekanja od 500ms
    await new Promise(r => setTimeout(r, 500));

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
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl text-center mt-6">
            <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2"/>
            <p className="text-gray-500 font-medium">{T('login')}</p>
        </div>
    );
  }

  // Ako sam ja prodavac, neću sam sebi da pišem (osim ako ne želiš testiranje)
  if (user.username === sellerUsername) return null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 mt-6 overflow-hidden">
        {/* Header Chata */}
        <div className="bg-purple-50 p-4 border-b border-purple-100 flex items-center gap-3">
            <div className="bg-white p-2 rounded-full shadow-sm">
                <MessageCircle className="w-5 h-5 text-purple-600"/>
            </div>
            <h3 className="font-bold text-gray-800">{T('title')}</h3>
        </div>

        {/* Lista Poruka */}
        <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-10 italic">{T('empty')}</div>
            )}
            {messages.map((msg) => {
                const isMe = msg.sender.username === user.username;
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                            max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-sm
                            ${isMe ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white text-gray-700 border border-gray-200 rounded-bl-none'}
                        `}>
                            {msg.content}
                        </div>
                    </div>
                );
            })}
            <div ref={scrollRef} />
        </div>

        {/* Unos */}
        <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={T('placeholder')}
                className="border-gray-200 focus:ring-purple-500 rounded-xl"
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button 
                onClick={handleSend} 
                disabled={sending}
                className={`
                    rounded-xl font-bold transition-all duration-300
                    ${sending ? "bg-purple-800 scale-95" : "bg-purple-600 hover:bg-purple-700 hover:scale-105"}
                `}
            >
                {sending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
            </Button>
        </div>
    </div>
  );
}