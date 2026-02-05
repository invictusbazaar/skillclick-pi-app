"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext"; // ✅ Povezujemo sa glavnim sistemom
import { getUserProfile, updateWalletAddress } from "@/app/actions/getProfile";
import CompleteOrderButton from "@/components/CompleteOrderButton";
import { Loader2, ShoppingBag, Wallet, LayoutGrid, User, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UserProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth(); // ✅ Uzimamo korisnika iz Context-a
  const [fullProfile, setFullProfile] = useState<any>(null); // Ovde čuvamo podatke o prodajama/kupovinama
  const [loadingData, setLoadingData] = useState(true);
  
  const [activeTab, setActiveTab] = useState("orders"); // orders, sales, settings
  const [walletInput, setWalletInput] = useState("");
  const [savingWallet, setSavingWallet] = useState(false);

  useEffect(() => {
    // Ako se auth još učitava, čekamo
    if (authLoading) return;

    // Ako nema korisnika u auth-u, prekidamo učitavanje
    if (!authUser || !authUser.username) {
        setLoadingData(false);
        return;
    }

    // Ako imamo korisnika, povlačimo njegove detaljne podatke (narudžbine, prodaje...)
    const fetchProfileData = async () => {
        try {
            const data = await getUserProfile(authUser.username);
            setFullProfile(data);
            if (data?.piWallet) setWalletInput(data.piWallet);
        } catch (error) {
            console.error("Greška pri učitavanju profila:", error);
        } finally {
            setLoadingData(false);
        }
    };

    fetchProfileData();
  }, [authUser, authLoading]);

  const handleSaveWallet = async () => {
      if (!fullProfile) return;
      setSavingWallet(true);
      try {
          await updateWalletAddress(fullProfile.username, walletInput);
          alert("✅ Adresa sačuvana! Sada ti zarada leže automatski.");
      } catch (e: any) {
          alert("Greška: " + e.message);
      } finally {
          setSavingWallet(false);
      }
  };

  // 1. Prikaz dok se proverava ko je ulogovan
  if (authLoading || (authUser && loadingData)) {
      return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-10 w-10 text-purple-600"/></div>;
  }
  
  // 2. Prikaz ako korisnik NIJE ulogovan (a auth je završio proveru)
  if (!authUser) {
      return (
        <div className="p-10 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
            <User className="h-16 w-16 text-gray-300 mb-4"/>
            <h2 className="text-xl font-bold text-gray-800">Nisi ulogovan</h2>
            <p className="text-gray-500 mt-2 mb-6">Moraš se ulogovati kroz Pi Browser da bi video profil.</p>
            <Button onClick={() => window.location.href = "/auth/login"} variant="outline">Prijavi se</Button>
        </div>
      );
  }

  // Ako podaci profila nisu stigli (greška servera), ali je user tu
  if (!fullProfile) {
      return <div className="p-20 text-center">Greška pri učitavanju podataka profila. Osveži stranicu.</div>;
  }

  // 3. GLAVNI PRIKAZ PROFILA
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* ZAGLAVLJE PROFILA */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row items-center gap-6">
            <div className="h-20 w-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center text-purple-600 shadow-inner">
                <User className="h-10 w-10" />
            </div>
            <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{fullProfile.username}</h1>
                <p className="text-gray-500 text-sm">Član platforme SkillClick</p>
            </div>
            <div className="flex flex-col items-end gap-2">
                 <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold border border-green-100 flex items-center gap-2">
                    💰 Zarada: {fullProfile.sales.reduce((acc:any, sale:any) => acc + (sale.status==='completed'?sale.amount:0), 0).toFixed(2)} π
                </div>
            </div>
        </div>

        {/* MENI (TABS) */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setActiveTab("orders")} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition whitespace-nowrap ${activeTab==="orders" ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
                <ShoppingBag className="h-4 w-4"/> Moje Kupovine
            </button>
            <button onClick={() => setActiveTab("sales")} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition whitespace-nowrap ${activeTab==="sales" ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
                <LayoutGrid className="h-4 w-4"/> Moje Prodaje
            </button>
            <button onClick={() => setActiveTab("settings")} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition whitespace-nowrap ${activeTab==="settings" ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
                <Wallet className="h-4 w-4"/> Novčanik & Info
            </button>
        </div>

        {/* SADRŽAJ */}
        
        {/* 1. KUPOVINE (Ono što si ti platio) */}
        {activeTab === "orders" && (
            <div className="space-y-4">
                {fullProfile.orders.length === 0 && <div className="text-center p-10 bg-white rounded-xl text-gray-400 border border-dashed">Nemaš kupovina.</div>}
                {fullProfile.orders.map((order: any) => (
                    <div key={order.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition">
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-lg">{order.service.title}</h3>
                            <div className="text-sm text-gray-500 mt-1">
                                <span className="mr-3">🛒 Prodavac: <b>{order.seller.username}</b></span>
                                <span>📅 {new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-2 font-bold text-purple-600">{order.amount} π</div>
                        </div>
                        
                        <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-2">
                             {/* STATUS BADGE */}
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.status==='completed'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
                                {order.status === 'completed' ? 'ISPLAĆENO' : 'NA ČEKANJU'}
                            </span>

                            {/* DUGME ZA ISPLATU (Samo ako nije završeno) */}
                            {order.status !== 'completed' && (
                                <CompleteOrderButton 
                                    orderId={order.id} 
                                    amount={order.amount} 
                                    sellerWallet={order.seller.piWallet || ""} 
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* 2. PRODAJE (Ono što si ti zaradio) */}
        {activeTab === "sales" && (
            <div className="space-y-4">
                 {fullProfile.sales.length === 0 && <div className="text-center p-10 bg-white rounded-xl text-gray-400 border border-dashed">Nemaš prodaja.</div>}
                 {fullProfile.sales.map((sale: any) => (
                    <div key={sale.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center hover:shadow-md transition">
                        <div>
                            <h3 className="font-bold text-gray-800">{sale.service.title}</h3>
                            <p className="text-sm text-gray-500">Kupac: {sale.buyer.username}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-green-600 text-lg">+{sale.amount} π</p>
                            <span className={`text-xs px-2 py-1 rounded ${sale.status==='completed'?'bg-green-100 text-green-600':'bg-gray-100 text-gray-500'}`}>
                                {sale.status === 'completed' ? 'Isplaćeno' : 'Čeka se kupac'}
                            </span>
                        </div>
                    </div>
                 ))}
            </div>
        )}

        {/* 3. PODEŠAVANJA (Wallet) */}
        {activeTab === "settings" && (
            <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <Wallet className="text-purple-600 h-5 w-5"/> Tvoj Pi Novčanik za Isplatu
                </h2>
                <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm mb-6 border border-blue-100">
                    <strong>Kako ovo radi?</strong><br/>
                    Ovde unesi svoju <b>Javnu Adresu (Public Key)</b>. To je ona dugačka adresa koja počinje sa slovom <b>"G"</b>.
                    Kada nešto prodaš, a kupac potvrdi prijem, novac automatski stiže na ovu adresu.
                </div>

                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Pi Wallet Adresa (G...)</label>
                <div className="flex flex-col md:flex-row gap-3">
                    <Input 
                        placeholder="GD4K..." 
                        value={walletInput}
                        onChange={(e) => setWalletInput(e.target.value)}
                        className="font-mono text-sm flex-1"
                    />
                    <Button onClick={handleSaveWallet} disabled={savingWallet} className="bg-purple-600 hover:bg-purple-700 text-white">
                        {savingWallet ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="h-4 w-4 mr-2"/>}
                        Sačuvaj Adresu
                    </Button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
