import Link from "next/link";
import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";
import ReleaseFundsButton from "@/components/ReleaseFundsButton"; 
import { ShieldCheck, Users, Layers, ArrowRight, Banknote, AlertCircle, TrendingUp, Wallet } from "lucide-react";

// 🚀 DODATO: Striktna naredba Next.js-u da nikada ne kešira ovu stranicu. 
// Uvek će povlačiti najnovije korisnike i transakcije čim osvežiš stranu!
export const dynamic = "force-dynamic";

// --- 1. SERVER ACTION: BANOVANJE ---
async function toggleBan(formData: FormData) {
  "use server";

  const userId = formData.get("userId") as string;
  const currentStatus = formData.get("currentStatus") === "true";

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: !currentStatus },
    });
    revalidatePath("/admin"); 
  } catch (error) {
    console.error("Greška pri banovanju:", error);
  }
}

export default async function AdminDashboard() {
  // --- 2. DOHVATANJE PODATAKA ---
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true, sales: true } } },
  });

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

             {/* KARTICA ZARADE (NOVO) */}
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
                        <p className="text-xs text-gray-500">{users.length} registrovanih</p>
                    </div>
                </div>
            </Link>
        </div>

        {/* 💰 SEKCIJA TRANSAKCIJE (Responsive: Card View na mobilnom, Table na PC) */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-700 rounded-xl"><Banknote className="h-5 w-5" /></div>
                <h2 className="text-lg font-bold text-gray-900">Transakcije</h2>
            </div>
            <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">{orders.length} ukupno</span>
          </div>
          
          {/* DESKTOP TABELA (Sakrivena na mobilnom) */}
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
                {orders.map((order) => (
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
                        ) : (
                            <span className="font-bold text-gray-900 text-lg">{order.amount} π</span>
                        )}
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        order.status === "completed" ? "bg-green-50 text-green-700 border-green-100" :
                        order.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                        "bg-gray-50 text-gray-700 border-gray-100"
                      }`}>
                        {order.status === 'completed' ? 'ISPLAĆENO' : 'NA ČEKANJU'}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                       {order.status !== "completed" ? (
                          <ReleaseFundsButton orderId={order.id} amount={order.amount} sellerWallet={order.seller.piWallet || order.seller.username} />
                       ) : (
                          <ShieldCheck className="w-5 h-5 text-green-300 ml-auto" />
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 📱 MOBILE CARDS (Vidljivo samo na mobilnom) */}
          <div className="md:hidden flex flex-col divide-y divide-gray-100">
             {orders.map((order) => (
                <div key={order.id} className="p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-900 line-clamp-1">{order.service.title}</h3>
                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                            order.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                            {order.status === 'completed' ? 'ISPLAĆENO' : 'ČEKA'}
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

                    {/* Finansije na mobilnom */}
                    <div className="flex justify-between items-center">
                         {order.status === 'completed' ? (
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400">Profit (5%):</span>
                                <span className="font-bold text-purple-600 text-lg">+{(order.amount * 0.05).toFixed(2)} π</span>
                            </div>
                         ) : (
                             <span className="font-bold text-gray-900 text-lg">{order.amount} π</span>
                         )}

                         {/* Dugme za isplatu */}
                         {order.status !== "completed" && (
                             <ReleaseFundsButton orderId={order.id} amount={order.amount} sellerWallet={order.seller.piWallet || order.seller.username} />
                         )}
                    </div>
                </div>
             ))}
             {orders.length === 0 && <div className="p-8 text-center text-gray-400">Nema transakcija</div>}
          </div>
        </div>

        {/* 👥 TABELA KORISNIKA (Responsive) */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><AlertCircle className="h-5 w-5" /></div>
            <h2 className="text-lg font-bold text-gray-900">Korisnici</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 font-bold uppercase text-xs">
                <tr>
                  <th className="p-4">Korisnik</th>
                  <th className="p-4 hidden sm:table-cell">Statistika</th>
                  <th className="p-4 text-right">Kontrola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                            {user.username}
                            {user.isBanned && <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded font-bold">BANNED</span>}
                        </div>
                        <div className="text-xs text-gray-500 sm:hidden">
                           🛒 {user._count.orders} | 💰 {user._count.sales}
                        </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs mr-2">Kupio: <b>{user._count.orders}</b></span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">Prodao: <b>{user._count.sales}</b></span>
                    </td>
                    <td className="p-4 text-right">
                      <form action={toggleBan}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="currentStatus" value={String(user.isBanned)} />
                        <button type="submit" className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-transform active:scale-95 shadow-sm border ${
                            user.isBanned
                              ? "bg-white text-green-600 border-green-200 hover:bg-green-50"
                              : "bg-white text-red-600 border-red-200 hover:bg-red-50"
                          }`}>
                          {user.isBanned ? "ODBLOKIRAJ" : "BLOKIRAJ"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
