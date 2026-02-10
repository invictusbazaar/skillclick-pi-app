import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Briefcase, CheckCircle, Clock } from "lucide-react";
import ReviewModal from "@/components/ReviewModal";
import StatusButton from "@/components/StatusButton";

export const dynamic = 'force-dynamic';

export default async function MyOrdersPage() {
  const username = "Ilija1969";

  const user = await prisma.user.findUnique({
    where: { username: username }
  });

  if (!user) {
    return <div className="p-10 text-red-500">Korisnik nije pronađen.</div>;
  }

  // Učitavamo obe liste ODJEDNOM (brže i čistije)
  const [myPurchases, mySales] = await Promise.all([
    prisma.order.findMany({
      where: { buyerId: user.id },
      include: { service: true, seller: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.order.findMany({
      where: { sellerId: user.id },
      include: { service: true, buyer: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* 1. MOJE KUPOVINE */}
        <section>
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800 border-b pb-2">
            <ShoppingBag className="text-purple-600" /> Moje Kupovine
          </h1>

          <div className="space-y-4">
            {myPurchases.length === 0 ? (
              <p className="text-gray-400">Nema kupovina.</p>
            ) : (
              myPurchases.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{order.service.title}</h3>
                    <p className="text-sm text-gray-500">Prodavac: @{order.seller.username}</p>
                    <div className="mt-2">
                      {order.status === 'pending' && <Badge className="bg-yellow-100 text-yellow-700">U izradi</Badge>}
                      {order.status === 'delivered' && <Badge className="bg-blue-100 text-blue-700">Isporučeno</Badge>}
                      {order.status === 'completed' && <Badge className="bg-green-100 text-green-700">Završeno</Badge>}
                    </div>
                  </div>

                  <div>
                    {order.status === 'delivered' ? (
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-green-600 font-bold">Stiglo je!</span>
                        <ReviewModal
                          orderId={order.id}
                          myUsername={user.username}
                          targetRole="Seller"
                        />
                      </div>
                    ) : order.status === 'completed' ? (
                      <div className="flex items-center text-green-600 font-bold">
                        <CheckCircle className="w-5 h-5 mr-1" /> Ocenjeno
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-400 text-sm">
                        <Clock className="w-4 h-4 mr-1" /> Čeka se...
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 2. MOJE PRODAJE */}
        <section>
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800 border-b pb-2">
            <Briefcase className="text-blue-600" /> Moji Poslovi
          </h1>

          <div className="space-y-4">
            {mySales.length === 0 ? (
              <p className="text-gray-400">Nemaš aktivnih poslova.</p>
            ) : (
              mySales.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{order.service.title}</h3>
                    <p className="text-sm text-gray-500">Kupac: @{order.buyer.username}</p>
                    <p className="font-bold text-green-600 mt-1">Zarada: {order.amount} π</p>
                  </div>

                  <div>
                    {order.status === 'pending' ? (
                      <StatusButton
                        orderId={order.id}
                        newStatus="delivered"
                        label="Označi kao Isporučeno"
                      />
                    ) : order.status === 'delivered' ? (
                      <span className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full">
                        Čeka potvrdu
                      </span>
                    ) : (
                      <div className="flex items-center text-green-600 font-bold">
                        <CheckCircle className="w-5 h-5 mr-1" /> Novac legao
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
