"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Send, User, ArrowLeft, MoreVertical, Phone, Video, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"

// POČETNI RAZGOVORI (Mock)
const INITIAL_CHATS = [
  { id: 1, user: "DevMaster", avatar: "D", lastMsg: "Sure, I can help with that!", time: "10:30 AM", unread: 2, messages: [{ text: "Hi!", sender: "me" }, { text: "Sure, I can help with that!", sender: "them" }] },
  { id: 2, user: "WriterPro", avatar: "W", lastMsg: "When is the deadline?", time: "Yesterday", unread: 0, messages: [{ text: "I need an article.", sender: "me" }, { text: "When is the deadline?", sender: "them" }] },
];

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const sellerParam = searchParams.get("seller"); 

  const [chats, setChats] = useState<any[]>(INITIAL_CHATS);
  const [activeChat, setActiveChat] = useState<any>(null); 
  const [newMessage, setNewMessage] = useState("");

  // 1. PROVERA URL-a
  useEffect(() => {
    if (sellerParam) {
        const existingChat = chats.find(c => c.user === sellerParam);
        
        if (existingChat) {
            setActiveChat(existingChat);
        } else {
            const newChat = {
                id: Date.now(),
                user: sellerParam,
                avatar: sellerParam[0].toUpperCase(),
                lastMsg: "Start chatting...",
                time: "Now",
                unread: 0,
                messages: [] 
            };
            setChats([newChat, ...chats]);
            setActiveChat(newChat);
        }
    }
  }, [sellerParam]);

  // 2. SLANJE PORUKE
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const myMsg = { text: newMessage, sender: "me" };
    
    const updatedChat = {
        ...activeChat,
        messages: [...activeChat.messages, myMsg],
        lastMsg: newMessage,
        time: "Now"
    };

    const updatedChats = chats.map(c => c.id === activeChat.id ? updatedChat : c);
    setChats(updatedChats);
    setActiveChat(updatedChat);
    setNewMessage("");

    setTimeout(() => {
        const replyMsg = { text: "Thanks for the message! I will reply shortly.", sender: "them" };
        
        const chatWithReply = {
            ...updatedChat,
            messages: [...updatedChat.messages, replyMsg], 
            lastMsg: replyMsg.text,
            time: "Now"
        };

        setChats(currentChats => currentChats.map(c => c.id === activeChat.id ? chatWithReply : c));
        setActiveChat(chatWithReply);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
         <div className="flex items-center gap-3">
            {/* FIX: Strelica je sada PLAVA (text-blue-600) */}
            <Link href="/">
                <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Messages</h1>
         </div>
         <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">M</div>
      </header>

      <main className="flex-grow container mx-auto max-w-5xl p-4 flex gap-4 h-[calc(100vh-80px)]">
          
          {/* LEVA STRANA */}
          <div className={`w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search chats..." className="pl-9 bg-gray-50 border-none" />
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                  {chats.map(chat => (
                      <div 
                        key={chat.id} 
                        onClick={() => setActiveChat(chat)}
                        className={`p-4 flex gap-3 items-center cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-50 ${activeChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                      >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {chat.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                  <h3 className="font-bold text-gray-900 truncate">{chat.user}</h3>
                                  <span className="text-xs text-gray-400">{chat.time}</span>
                              </div>
                              <p className="text-sm text-gray-500 truncate">{chat.lastMsg}</p>
                          </div>
                          {chat.unread > 0 && (
                              <div className="w-5 h-5 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                                  {chat.unread}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>

          {/* DESNA STRANA */}
          <div className={`w-full md:w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
              
              {activeChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="md:hidden text-blue-600" onClick={() => setActiveChat(null)}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                {activeChat.avatar}
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">{activeChat.user}</h2>
                                <div className="flex items-center gap-1 text-xs text-green-600">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 text-gray-400">
                            <Phone className="h-5 w-5 cursor-pointer hover:text-blue-600" />
                            <Video className="h-5 w-5 cursor-pointer hover:text-blue-600" />
                            <MoreVertical className="h-5 w-5 cursor-pointer hover:text-blue-600" />
                        </div>
                    </div>

                    {/* Chat Poruke */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        <p className="text-center text-xs text-gray-400 my-4">This is the beginning of your conversation with {activeChat.user}</p>
                        
                        {activeChat.messages.map((msg: any, idx: number) => (
                            <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                                    msg.sender === 'me' 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Unos Poruke */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={sendMessage} className="flex gap-2">
                            <Input 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..." 
                                className="flex-1 border-gray-200 focus-visible:ring-blue-600"
                            />
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                  </>
              ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <MessageSquare className="h-10 w-10 text-gray-300" />
                      </div>
                      <p>Select a conversation to start messaging</p>
                  </div>
              )}
          </div>

      </main>
    </div>
  )
}