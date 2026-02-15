import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { ArrowLeft, Ban, ShieldCheck, Users } from "lucide-react";

// 🚀 Zabranjujemo keširanje! Uvek prikazuje najnovije stanje.
export const dynamic = "force-dynamic";

// --- SERVER ACTION ZA BANOVANJE ---
async function toggleBanUser(formData: FormData) {
  "use server";
  const userId = formData.get("userId") as string;
  const currentStatus = formData.get("currentStatus") === "true";

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: !currentStatus },
    });
    revalidatePath("/admin/users");
  } catch (error) {
    console.error("Greška pri banovanju:", error);
  }
}

export default async function AdminUsersPage() {
  // --- POVLAČENJE PRAVIH PODATAKA IZ BAZE ---
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true, sales: true } } },
  });

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans pb-20">
      <div className="max-w-6xl mx-auto space-y-6"> 
        
        {/* ZAGLAVLJE */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-4 w-full md:w-auto">
                 <Link href="/admin" className="p-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-purple-100 hover:text-purple-600 transition-colors shrink-0">
                    <ArrowLeft className="h-6 w-6" />
                 </Link>
                 <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-200 shrink-0 hidden sm:flex">
                    <Users className="h-8 w-8" />
                 </div>
                 <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Korisnici</h1>
                    <p className="text-gray-500 font-medium text-sm">
                        Upravljanje nalozima
                    </p>
                 </div>
             </div>

             <div className="w-full md:w-auto bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm">
                    <Users className="h-6 w-6"/>
                </div>
                <div>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Ukupno</p>
                    <p className="text-2xl font-black text-gray-900">{users.length}</p>
                </div>
             </div>
        </div>

        {/* 👥 LISTA KORISNIKA */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* --- DESKTOP TABELA (Sakriveno na mobilnom) --- */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 font-bold uppercase text-xs">
                <tr>
                  <th className="p-4">Korisnik (Pi Network)</th>
                  <th className="p-4">Aktivnost (Kupio / Prodao)</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Akcija</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={`desktop-${user.id}`} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                {user.username[0].toUpperCase()}
                            </div>
                            <div className="font-bold text-gray-900 text-base">
                                {user.username}
                                {user.piWallet && (
                                    <div className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-[150px]">
                                        Wallet: {user.piWallet.substring(0,8)}...
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                    <td className="p-4 text-gray-600">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs mr-2 font-medium border border-blue-100">🛒 {user._count.orders}</span>
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-medium border border-green-100">💰 {user._count.sales}</span>
                    </td>
                    <td className="p-4 text-center">
                         {user.isBanned ? (
                            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-bold border border-red-100 inline-flex items-center gap-1">
                                <Ban className="w-3 h-3" /> BLOKIRAN
                            </span>
                         ) : (
                            <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-xs font-bold border border-green-100 inline-flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> AKTIVAN
                            </span>
                         )}
                    </td>
                    <td className="p-4 text-right">
                      <form action={toggleBanUser}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="currentStatus" value={String(user.isBanned)} />
                        {user.username !== "Ilija1969" && (
                            <button type="submit" className={`px-4 py-2 rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-sm border ${
                                user.isBanned
                                  ? "bg-white text-green-600 border-green-200 hover:bg-green-50"
                                  : "bg-white text-red-600 border-red-200 hover:bg-red-50"
                              }`}>
                              {user.isBanned ? "ODBLOKIRAJ" : "BLOKIRAJ"}
                            </button>
                        )}
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- MOBILNE KARTICE (Sakriveno na desktopu) --- */}
          <div className="md:hidden flex flex-col divide-y divide-gray-100">
             {users.map((user) => (
                <div key={`mobile-${user.id}`} className="p-5 flex flex-col gap-4">
                    
                    {/* Gornji red: Slika, Ime, Status */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0">
                                {user.username[0].toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-bold text-gray-900 text-base truncate">{user.username}</h3>
                                {user.piWallet ? (
                                    <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                                        W: {user.piWallet.substring(0,10)}...
                                    </p>
                                ) : (
                                    <p className="text-[10px] text-gray-400 mt-0.5">Nema povezan novčanik</p>
                                )}
                            </div>
                        </div>
                        {user.isBanned ? (
                            <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg text-[10px] font-bold border border-red-100 shrink-0">
                                BLOKIRAN
                            </span>
                        ) : (
                            <span className="bg-green-50 text-green-600 px-2 py-1 rounded-lg text-[10px] font-bold border border-green-100 shrink-0">
                                AKTIVAN
                            </span>
                        )}
                    </div>

                    {/* Srednji red: Statistika */}
                    <div className="flex gap-2">
                        <div className="flex-1 bg-blue-50 border border-blue-100 rounded-lg p-2 text-center">
                            <p className="text-[10px] text-blue-500 font-bold uppercase">Kupio</p>
                            <p className="text-sm font-black text-blue-700">{user._count.orders}</p>
                        </div>
                        <div className="flex-1 bg-green-50 border border-green-100 rounded-lg p-2 text-center">
                            <p className="text-[10px] text-green-500 font-bold uppercase">Prodao</p>
                            <p className="text-sm font-black text-green-700">{user._count.sales}</p>
                        </div>
                    </div>

                    {/* Donji red: Akcija (Dugme preko cele širine) */}
                    {user.username !== "Ilija1969" && (
                        <form action={toggleBanUser} className="w-full">
                            <input type="hidden" name="userId" value={user.id} />
                            <input type="hidden" name="currentStatus" value={String(user.isBanned)} />
                            <button type="submit" className={`w-full py-3 rounded-xl text-sm font-black transition-transform active:scale-95 shadow-sm border flex items-center justify-center gap-2 ${
                                user.isBanned
                                  ? "bg-white text-green-600 border-green-200 hover:bg-green-50"
                                  : "bg-white text-red-600 border-red-200 hover:bg-red-50"
                              }`}>
                              {user.isBanned ? (
                                  <><ShieldCheck className="w-4 h-4" /> ODBLOKIRAJ KORISNIKA</>
                              ) : (
                                  <><Ban className="w-4 h-4" /> BLOKIRAJ KORISNIKA</>
                              )}
                            </button>
                        </form>
                    )}
                </div>
             ))}
             {users.length === 0 && <div className="p-8 text-center text-gray-400 font-medium">Nema korisnika</div>}
          </div>
        </div>

      </div>
    </div>
  );
}
