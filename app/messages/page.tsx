"use client"

import { useState } from 'react';
import { Send, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';

export default function MessagesPage() {
  const { t } = useLanguage(); // Prevodi
  const [messages, setMessages] = useState([
      { id: 1, sender: "support", text: "Hello! How can we help you?", time: "10:00 AM" }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
      if(!newMessage.trim()) return;
      setMessages([...messages, { id: Date.now(), sender: "me", text: newMessage, time: "Now" }]);
      setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-blue-50/50 flex flex-col">
        
      {/* HEADER */}
      <header className="bg-white border-b border-blue-100 p-4 flex items-center gap-4 sticky top-0 z-10">
          <Link href="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5 text-gray-600" /></Button></Link>
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center relative">
                  <User className="h-6 w-6 text-green-700" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                  <h3 className="font-bold text-gray-900">{t.supportInbox}</h3>
                  <p className="text-xs text-green-600 font-medium">{t.online}</p>
              </div>
          </div>
      </header>

      {/* CHAT AREA */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-blue-200' : 'text-gray-400'}`}>{msg.time}</p>
                  </div>
              </div>
          ))}
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0">
          <div className="flex gap-2">
              <Input 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder={t.typeMessage}
                className="flex-1 border-blue-200 focus-visible:ring-blue-600"
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Send className="h-4 w-4" />
              </Button>
          </div>
      </div>

    </div>
  );
}