"use client"

import { useState } from "react"
import { Search, Send, MessageSquare, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

// Kontakti
const CONTACTS = [
  { id: 1, name: "Marko Dizajner", status: "online", lastMsg: "Dogovoreno!", initial: "M" },
  { id: 2, name: "Jelena Pisac", status: "offline", lastMsg: "Kad je rok?", initial: "J" },
  { id: 3, name: "Stefan Dev", status: "online", lastMsg: "Šaljem kod...", initial: "S" },
]

// Početne poruke
const INITIAL_MESSAGES = [
  { id: 1, sender: "them", text: "Pozdrav! Video sam tvoj oglas za aplikaciju.", time: "10:00" },
  { id: 2, sender: "me", text: "Zdravo! Da, kako mogu da pomognem?", time: "10:05" },
]

export default function MessagesPage() {
  const [activeContact, setActiveContact] = useState(CONTACTS[0])
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [inputText, setInputText] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSendMessage = () => {
    if (!inputText.trim()) return

    const newMsg = {
      id: Date.now(),
      sender: "me",
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages([...messages, newMsg])
    setInputText("")
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      
      {/* --- HEADER (BEZ dugmeta "Ponudi Uslugu") --- */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
        <Link href="/" className="text-2xl font-bold text-primary tracking-tight">
          SkillClick
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
             <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop Meni - Samo Profil */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profil
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobilni Meni */}
      {menuOpen && (
          <div className="md:hidden border-b border-border bg-card p-4 flex flex-col gap-2 absolute top-16 left-0 w-full z-40">
             <Link href="/profile">
               <Button variant="ghost" className="w-full justify-start">
                 <User className="h-4 w-4 mr-2" /> Profil
               </Button>
            </Link>
          </div>
        )}

      {/* --- GLAVNI DEO (ČET) --- */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* LEVO: Lista */}
        <div className="w-full md:w-80 border-r border-border bg-muted/10 flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pretraži razgovore..." className="pl-8" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {CONTACTS.map((contact) => (
              <div 
                key={contact.id}
                onClick={() => setActiveContact(contact)}
                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-muted transition-colors ${activeContact.id === contact.id ? "bg-muted" : ""}`}
              >
                <Avatar>
                  <AvatarFallback>{contact.initial}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">{contact.name}</span>
                    <span className="text-xs text-muted-foreground">10:05</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{contact.lastMsg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DESNO: Poruke */}
        <div className="hidden md:flex flex-1 flex-col bg-background">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{activeContact.initial}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold">{activeContact.name}</h3>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="block w-2 h-2 rounded-full bg-green-500"></span> {activeContact.status}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  msg.sender === "me" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-foreground"
                }`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${msg.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <form 
              className="flex gap-2"
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            >
              <Input 
                placeholder="Napišite poruku..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="md:hidden flex-1 flex items-center justify-center bg-muted/20 p-4 text-center text-muted-foreground">
            <p>Odaberite kontakt iz liste.</p>
        </div>

      </main>
    </div>
  )
}