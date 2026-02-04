import { prisma } from "@/lib/prisma";
import CompleteOrderButton from "@/components/CompleteOrderButton";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Clock, CheckCircle } from "lucide-react";

// Ovde ćemo kasnije ubaciti pravu autentifikaciju
// Za sada hardkodujemo tvog test korisnika da bi video kako radi
const CURRENT_USER_USERNAME = "Ilija1969"; 

export default async function MyOrdersPage() {
  
  // 1. Nađi trenutnog korisnika u bazi
  const user = await prisma.user.findUnique({
    where: { username: CURRENT_USER_USERNAME }
  });

  if (!user) return <div className="p-10">Korisnik nije pronađen.</div>;

  // 2. Nađi sve porudžbine gde je on KUPAC
  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    include: { 
        service: true, 
        seller: true // Treba nam da bismo dobili wallet prodavca
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <ShoppingBag className="text-purple-600"/> Moje Kupovine
        </h1>

        <div className="space-y-4">
            {orders.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    
                    {/* Informacije o porudžbini */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg">{order.service.title}</h3>
                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className={
                                order.status === 'completed' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }>
                                {order.status === 'completed' ? 'Završeno' : 'Na čekanju'}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-500">Prodavac: {order.seller.username}</p>
                        <p className="text-sm text-gray-500">Datum: {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="font-bold text-purple-600 mt-1">Cena: {order.amount} Pi</p>
                    </div>

                    {/* Akcija: Isplata */}
                    <div>
                        {order.status === 'pending' ? (
                            <div className="flex flex-col items-end gap-2">
                                <p className="text-xs text-gray-400 text-right max-w-[200px]">
                                    Da li si zadovoljan uslugom? Klikni ispod da isplatiš prodavca.
                                </p>
                                <CompleteOrderButton 
                                    orderId={order.id}
                                    amount={order.amount}
                                    // Šaljemo wallet iz baze (ili username ako fali, pa će dugme prijaviti grešku)
                                    sellerWallet={order.seller.piWallet || ""} 
                                />
                            </div>
                        ) : (
                            <div className="flex items-center text-green-600 font-bold bg-green-50 px-4 py-2 rounded-lg">
                                <CheckCircle className="mr-2 h-5 w-5" />
                                Isplaćeno
                            </div>
                        )}
                    </div>

                </div>
            ))}

            {orders.length === 0 && (
                <div className="text-center py-10 text-gray-400">Još uvek nemaš porudžbina.</div>
            )}
        </div>
      </div>
    </div>
  );
}