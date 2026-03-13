import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, User } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminChatView({ params }: { params: { orderId: string } }) {
  const { orderId } = params;

  // 1. Nalazimo spornu porudžbinu da bismo dobili ID kupca i prodavca
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { 
        buyer: true, 
        seller: true, 
        service: true 
    }
  });

  if (!order) return notFound();

  // 2. BOŽIJI POGLED: Izvlačimo kompletnu prepisku između ova dva korisnika
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: order.buyerId, receiverId: order.sellerId },
        { senderId: order.sellerId, receiverId: order.buyerId }
      ]
    },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* ZAGLAVLJE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
              <Link href="/admin" className="text-gray-400 hover:text-purple-600 flex items-center gap-2 font-bold text-sm mb-2 transition">
                  <ArrowLeft className="w-4 h-4" /> Nazad u Admin Panel
              </Link>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-red-500" />
                  Admin Pregled Prepiske
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                  Usluga: <span className="font-bold text-gray-800">{order.service.title}</span>
              </p>
          </div>
          <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex gap-4 text-sm w-full md:w-auto">
              <div className="flex flex-col">
                  <span className="text-gray-500 text-xs">Kupac (Plava)</span>
                  <span className="font-bold text-blue-700">{order.buyer.username}</span>
              </div>
              <div className="w-px bg-red-200"></div>
              <div className="flex flex-col">
                  <span className="text-gray-500 text-xs">Prodavac (Ljubičasta)</span>
                  <span className="font-bold text-purple-700">{order.seller.username}</span>
              </div>
          </div>
        </div>

        {/* CHAT BOX */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 min-h-[500px] flex flex-col gap-4 overflow-y-auto">
            {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-20 font-medium">Nema zabeleženih poruka između ovih korisnika.</div>
            ) : (
                messages.map((msg) => {
                    const isBuyer = msg.senderId === order.buyerId;

                    return (
                        <div key={msg.id} className={`flex flex-col max-w-[85%] ${isBuyer ? 'self-start' : 'self-end'}`}>
                            {/* Ime i vreme */}
                            <div className={`flex items-center gap-2 mb-1 text-xs ${isBuyer ? 'flex-row' : 'flex-row-reverse'}`}>
                                <span className={`font-bold ${isBuyer ? 'text-blue-600' : 'text-purple-600'}`}>
                                    {isBuyer ? order.buyer.username : order.seller.username}
                                </span>
                                <span className="text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
                            </div>

                            {/* Balončić sa porukom */}
                            <div className={`p-4 rounded-2xl shadow-sm text-sm ${
                                isBuyer 
                                ? 'bg-blue-50 border border-blue-100 text-gray-800 rounded-tl-sm' 
                                : 'bg-purple-50 border border-purple-100 text-gray-800 rounded-tr-sm'
                            }`}>
                                {msg.content}

                                {/* Ako ima zakačen fajl */}
                                {msg.fileUrl && (
                                    <div className="mt-3 pt-3 border-t border-black/5">
                                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold bg-white/60 p-2 rounded-lg hover:bg-white transition border border-black/5">
                                            <FileText className="w-4 h-4 text-red-500" />
                                            {msg.fileName || "Zakačen fajl (Klikni za pregled)"}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })
            )}
        </div>

      </div>
    </div>
  );
}