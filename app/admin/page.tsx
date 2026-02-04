import Link from "next/link";
import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";
import ReleaseFundsButton from "@/components/ReleaseFundsButton"; 
import { ShieldCheck, Users, Layers, ArrowRight, Banknote, AlertCircle } from "lucide-react";

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
  // --- 2. DOHVATANJE PODATAKA IZ BAZE ---
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true, sales: true } } },
  });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      buyer: true,
      seller: true, // Ovo sada automatski hvata i polje 'piWallet'
      service: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto"> 
        
        {/* ZAGLAVLJE */}
        <div className="mb-8 flex items-center gap-4 border-b border-gray-200 pb-6">
             <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <ShieldCheck className="h-8 w-8" />
             </div>
             <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Admin Panel</h1>
                <p className="text-gray-500 font-medium">
                    Status: <span className="text-gray-900 font-bold">Administrator</span>
                </p>
             </div>
        </div>

        {/* LINKOVI / KARTICE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <Link href="/admin/services" className="group">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <Layers className="h-6 w-6" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Usluge / Oglasi</h2>
                    <p className="text-sm text-gray-500">Upravljanje uslugama</p>
                </div>
            </Link>

            <Link href="/admin/users" className="group">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Users className="h-6 w-6" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Korisnici</h2>
                    <p className="text-sm text-gray-500">Lista korisnika ({users.length})</p>
                </div>
            </Link>
        </div>

        {/* SEKCIJA TRANSAKCIJE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-10">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Banknote className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Transakcije & Isplata</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="p-4">Datum</th>
                  <th className="p-4">Usluga</th>
                  <th className="p-4">Kupac ➜ Prodavac</th>
                  <th className="p-4">Iznos</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Akcija</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-medium text-gray-900">{order.service.title}</td>
                    <td className="p-4 text-gray-600">
                      {order.buyer.username} <span className="text-gray-400">➜</span> {order.seller.username}
                    </td>
                    <td className="p-4 font-bold text-green-600">{order.amount} π</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        order.status === "completed" ? "bg-green-100 text-green-700" :
                        order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                       {/* Isplata dugme - Prikazuje se samo ako nije završeno */}
                       {order.status !== "completed" ? (
                          <ReleaseFundsButton 
                            orderId={order.id} 
                            amount={order.amount}
                            // 👇 OVO JE GLAVNA PROMENA: Šaljemo wallet iz baze
                            sellerWallet={order.seller.piWallet || order.seller.username} 
                          />
                       ) : (
                          <span className="text-gray-400 text-xs flex items-center gap-1">
                             <ShieldCheck className="w-3 h-3" /> Isplaćeno
                          </span>
                       )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-400">Nema transakcija</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABELA KORISNIKA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <AlertCircle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Upravljanje Korisnicima</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="p-4">Username</th>
                  <th className="p-4">Uloga</th>
                  <th className="p-4">Aktivnost</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Akcija</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-gray-900">{user.username}</td>
                    <td className="p-4">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100">
                            {user.role}
                        </span>
                    </td>
                    <td className="p-4 text-gray-500">
                        Kupio: {user._count.orders} | Prodao: {user._count.sales}
                    </td>
                    <td className="p-4">
                      {user.isBanned ? (
                        <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded text-xs">BANNED</span>
                      ) : (
                        <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-xs">ACTIVE</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <form action={toggleBan}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="currentStatus" value={String(user.isBanned)} />
                        <button
                          type="submit"
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            user.isBanned
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
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
