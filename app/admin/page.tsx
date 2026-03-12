import Link from "next/link";
import { prisma } from "@/lib/prisma"; 
import ReleaseFundsButton from "@/components/ReleaseFundsButton"; 
import AdminDisputeButtons from "@/components/AdminDisputeButtons"; // ✅ Nova komponenta za sporove
import { ShieldCheck, Users, Layers, ArrowRight, Banknote, TrendingUp, AlertTriangle } from "lucide-react";

// 🚀 Zabranjujemo keširanje, uvek vuče najnovije podatke!
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // --- DOHVATANJE PODATAKA ---
  const usersCount = await prisma.user.count();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      buyer: true,
      seller: true,
      service: true,
    },
  });

  // Računamo ukupnu zaradu platforme (5% od svih ZAVRŠENIH porudžbina)
  const totalRevenue = orders.reduce((acc, order) => {
    return order.status === 'completed' ? acc + (order.amount * 0.05) : acc;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans pb-20">
      <div className="max-w-6xl mx-auto space-y-6"> 
        
        {/* ZAGLAVLJE SA STATISTIKOM */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-purple-200">
                    <ShieldCheck className="h-8 w-8" />
                 </div>
                 <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Admin Panel</h1>
                    <p className="text-gray-500 font-medium text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                    </p>
                 </div>
             </div>

             {/* KARTICA ZARADE */}
             <div className="w-full md:w-auto bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-white text-green-600 rounded-xl shadow-sm">
                    <TrendingUp className="h-6 w-6"/>
                </div>
                <div>
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Zarada App (5%)</p>
                    <p className="text-2xl font-black text-gray-900">{totalRevenue.toFixed(4)} π</p>
                </div>
             </div>
        </div>

        {/* BRZI LINKOVI */}
        <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/services" className="group">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Layers className="h-5 w-5" /></div>
                        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-purple-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">Usluge</h2>
                        <p className="text-xs text-gray-500">Upravljanje oglasima</p>
                    </div>
                </div>
            </Link>

            <Link href="/admin/users" className="group">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="h-5 w-5" /></div>
                        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">Korisnici</h2>
                        <p className="text-xs text-gray-500">{usersCount} registrovanih</p>
                    </div>
                </div>
            </Link>
        </div>

        {/* 💰 SEKCIJA TRANSAKCIJE */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-700 rounded-xl"><Banknote className="h-5 w-5" /></div>
                <h2 className="text-lg font-bold text-gray-900">Transakcije</h2>
            </div>
            <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">{orders.length} ukupno</span>
          </div>
          
          {/* DESKTOP TABELA */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-5">Datum & Usluga</th>
                  <th className="p-5">Učesnici</th>
                  <th className="p-5">Finansije (Podela)</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Akcija</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  // ✅ DEFINIŠEMO ŠTA JE SPOR (Kupac ili Prodavac)
                  const isInDispute = order.status === "disputed_buyer" || order.status === "disputed_seller" || order.status === "disputed";

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition group">
                      <td className="p-5">
                          <div className="font-bold text-gray-900">{order.service.title}</div>
                          <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-bold text-blue-600">{order.buyer.username}</span>
                          <ArrowRight className="w-3 h-3 text-gray-300"/>
                          <span className="font-bold text-purple-600">{order.seller.username}</span>
                        </div>
                      </td>
                      <td className="p-5">
                          {order.status === 'completed' ? (
                              <div className="flex flex-col gap-1">
                                  <span className="text-xs text-gray-400 line-through">Ukupno: {order.amount} π</span>
                                  <div className="text-sm font-bold text-gray-700">Prodavac: <span className="text-green-600">{(order.amount * 0.95).toFixed(2)} π</span></div>
                                  <div className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded w-fit">App: +{(order.amount * 0.05).toFixed(2)} π</div>
                              </div>
                          ) : order.status === 'refunded' ? (
                              <span className="text-gray-400 font-bold">0.00 π</span>
                          ) : (
                              <span className="font-bold text-gray-900 text-lg">{order.amount} π</span>
                          )}
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          order.status === "completed" ? "bg-green-50 text-green-700 border-green-100" :
                          order.status === "refunded" ? "bg-gray-100 text-gray-600 border-gray-200" :
                          isInDispute ? "bg-red-50 text-red-700 border-red-100 animate-pulse" :
                          "bg-yellow-50 text-yellow-700 border-yellow-100"
                        }`}>
                          {order.status === 'completed' ? 'ISPLAĆENO' : 
                           order.status === 'refunded' ? 'REFUNDIRANO' : 
                           order.status === 'disputed_buyer' ? 'SPOR (KUPAC)' :
                           order.status === 'disputed_seller' ? 'SPOR (PRODAVAC)' :
                           order.status === 'disputed' ? 'U SPORU' : 'NA ČEKANJU'}
                        </span>
                      </td>
                      <td className="p-5 text-right flex justify-end">
                         {order.status === "completed" && (
                            <ShieldCheck className="w-5 h-5 text-green-300 ml-auto" />
                         )}
                         {order.status === "refunded" && (
                            <span className="text-gray-400 font-bold text-xs bg-gray-50 px-2 py-1 rounded">Vraćeno</span>
                         )}
                         {(order.status === "pending" || isInDispute) && (
                            <div className="flex flex-col gap-2 items-end w-full max-w-[200px]">
                               {order.status === "pending" && (
                                   <ReleaseFundsButton orderId={order.id} amount={order.amount} sellerWallet={order.seller.piWallet || order.seller.username} />
                               )}
                               {isInDispute && (
                                   <>
                                       <span className="text-xs font-black text-red-600 flex items-center gap-1 mb-1">
                                           <AlertTriangle className="w-4 h-4"/> ZAHTEVA PAŽNJU
                                       </span>
                                       <AdminDisputeButtons orderId={order.id} amount={order.amount} />
                                   </>
                               )}
                            </div>
                         )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 📱 MOBILE CARDS */}
          <div className="md:hidden flex flex-col divide-y divide-gray-100">
             {orders.map((order) => {
                const isInDispute = order.status === "disputed_buyer" || order.status === "disputed_seller" || order.status === "disputed";
                
                return (
                  <div key={order.id} className="p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                          <div>
                              <h3 className="font-bold text-gray-900 line-clamp-1">{order.service.title}</h3>
                              <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${
                              order.status === "completed" ? "bg-green-100 text-green-700 border-green-200" : 
                              order.status === "refunded" ? "bg-gray-100 text-gray-600 border-gray-200" :
                              isInDispute ? "bg-red-100 text-red-700 border-red-200 animate-pulse" : 
                              "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }`}>
                              {order.status === 'completed' ? 'ISPLAĆENO' : 
                               order.status === 'refunded' ? 'REFUNDIRANO' : 
                               isInDispute ? 'U SPORU' : 'ČEKA'}
                          </span>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl text-sm border border-gray-100">
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-gray-500 text-xs">Kupac:</span>
                              <span className="font-bold text-blue-600">{order.buyer.username}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-gray-500 text-xs">Prodavac:</span>
                              <span className="font-bold text-purple-600">{order.seller.username}</span>
                          </div>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                           {order.status === 'completed' ? (
                              <div className="flex flex-col">
                                  <span className="text-[10px] text-gray-400">Profit (5%):</span>
                                  <span className="font-bold text-purple-600 text-lg">+{(order.amount * 0.05).toFixed(2)} π</span>
                              </div>
                           ) : order.status === 'refunded' ? (
                              <span className="text-gray-400 font-bold text-sm">Vraćeno kupcu</span>
                           ) : (
                               <span className="font-bold text-gray-900 text-lg">{order.amount} π</span>
                           )}

                           {(order.status === "pending" || isInDispute) && (
                              <div className="flex flex-col items-end gap-2 w-full max-w-[150px]">
                                  {order.status === "pending" && (
                                      <ReleaseFundsButton orderId={order.id} amount={order.amount} sellerWallet={order.seller.piWallet || order.seller.username} />
                                  )}
                                  {isInDispute && (
                                      <AdminDisputeButtons orderId={order.id} amount={order.amount} />
                                  )}
                              </div>
                           )}
                      </div>
                  </div>
                )
             })}
             {orders.length === 0 && <div className="p-8 text-center text-gray-400">Nema transakcija</div>}
          </div>
        </div>

      </div>
    </div>
  );
}