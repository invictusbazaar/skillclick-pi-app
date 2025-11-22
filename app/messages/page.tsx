"use client"

import { useState } from "react"
import { ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

// Mock conversations
const mockConversations = [
  {
    id: 1,
    username: "dev_master",
    name: "Dev Master",
    lastMessage: "Sure, I can help with that!",
    lastMessageSr: "Naravno, mogu da pomognem!",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    username: "writer_ace",
    name: "Writer Ace",
    lastMessage: "When do you need it by?",
    lastMessageSr: "Kada vam je potrebno?",
    time: "1h ago",
    unread: false,
  },
  {
    id: 3,
    username: "ux_expert",
    name: "UX Expert",
    lastMessage: "Thanks for your order!",
    lastMessageSr: "Hvala na porudžbini!",
    time: "3h ago",
    unread: false,
  },
]

// Mock messages for selected conversation
const mockMessages = [
  {
    id: 1,
    sender: "other",
    text: "Hi! I saw your service listing.",
    textSr: "Zdravo! Video sam vašu uslugu.",
    time: "10:30 AM",
  },
  {
    id: 2,
    sender: "me",
    text: "Hello! How can I help you?",
    textSr: "Zdravo! Kako mogu da pomognem?",
    time: "10:32 AM",
  },
  {
    id: 3,
    sender: "other",
    text: "I need a logo for my startup.",
    textSr: "Potreban mi je logo za moj startup.",
    time: "10:33 AM",
  },
  {
    id: 4,
    sender: "me",
    text: "Sure, I can help with that! What style are you looking for?",
    textSr: "Naravno, mogu da pomognem! Koji stil tražite?",
    time: "10:35 AM",
  },
]

export default function MessagesPage() {
  const [lang, setLang] = useState<"en" | "sr">("en")
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [messageText, setMessageText] = useState("")

  const t = {
    back: { en: "Back", sr: "Nazad" },
    messages: { en: "Messages", sr: "Poruke" },
    typeMessage: { en: "Type a message...", sr: "Napišite poruku..." },
    noConversations: { en: "No conversations yet", sr: "Još nema razgovora" },
    selectConversation: {
      en: "Select a conversation to start messaging",
      sr: "Izaberite razgovor da počnete sa porukama",
    },
  }

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In a real app, this would send the message
      setMessageText("")
    }
  }

  const selectedConv = mockConversations.find((c) => c.id === selectedConversation)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedConversation ? (
              <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            ) : (
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <h1 className="text-lg font-semibold">{selectedConv ? selectedConv.name : t.messages[lang]}</h1>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setLang(lang === "en" ? "sr" : "en")} className="text-xs">
            {lang === "en" ? "SR" : "EN"}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List (Mobile: hidden when conversation selected) */}
        <div className={`w-full md:w-80 border-r border-border ${selectedConversation ? "hidden md:block" : "block"}`}>
          <ScrollArea className="h-[calc(100vh-57px)]">
            {mockConversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">{t.noConversations[lang]}</div>
            ) : (
              <div className="divide-y divide-border">
                {mockConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left ${
                      selectedConversation === conv.id ? "bg-muted" : ""
                    }`}
                  >
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={`/placeholder.svg?height=48&width=48&query=${conv.username}`} />
                      <AvatarFallback>
                        {conv.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <p className="font-semibold truncate">{conv.name}</p>
                        <span className="text-xs text-muted-foreground shrink-0">{conv.time}</span>
                      </div>
                      <p
                        className={`text-sm truncate ${conv.unread ? "font-medium text-foreground" : "text-muted-foreground"}`}
                      >
                        {lang === "en" ? conv.lastMessage : conv.lastMessageSr}
                      </p>
                    </div>
                    {conv.unread && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${selectedConversation ? "flex" : "hidden md:flex"}`}>
          {selectedConversation ? (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-2xl mx-auto">
                  {mockMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] ${msg.sender === "me" ? "order-2" : "order-1"}`}>
                        <Card className={msg.sender === "me" ? "bg-primary text-primary-foreground" : ""}>
                          <CardContent className="p-3">
                            <p className="text-sm leading-relaxed">{lang === "en" ? msg.text : msg.textSr}</p>
                            <p
                              className={`text-xs mt-1 ${msg.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                            >
                              {msg.time}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <div className="max-w-2xl mx-auto flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={t.typeMessage[lang]}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
              {t.selectConversation[lang]}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
