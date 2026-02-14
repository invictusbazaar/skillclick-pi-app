"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import { getUserProfile, updateWalletAddress, updateUserAvatar } from "@/app/actions/getProfile";
import CompleteOrderButton from "@/components/CompleteOrderButton";
import ReviewModal from "@/components/ReviewModal"; 
import AvatarUploader from "@/components/AvatarUploader"; 
import { Loader2, ShoppingBag, Wallet, LayoutGrid, User, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UserProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { language, t } = useLanguage(); 
  
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [walletInput, setWalletInput] = useState("");
  const [savingWallet, setSavingWallet] = useState(false);

  // --- LOKALNI PREVODI USKLAĐENI SA TVOJIM LANGUAGE CONTEXT-OM ---
  const txt: any = {
    en: {
        earnings: "Earnings",
        member: "Member of SkillClick",
        tabOrders: "My Purchases",
        tabSales: "My Sales",
        tabWallet: "Wallet & Info",
        noPurchases: "No purchases yet.",
        noSales: "No sales yet.",
        seller: "Seller",
        buyer: "Buyer",
        date: "Date",
        statusPaid: "PAID",
        statusPending: "PENDING",
        statusWaiting: "Waiting for buyer",
        walletTitle: "Your Pi Payout Wallet",
        walletDesc: "Enter your Public Key (starts with 'G'). Earnings will be sent here automatically.",
        labelWallet: "Pi Wallet Address (G...)",
        btnSave: "Save Address",
        savedMsg: "✅ Address saved! Earnings will arrive automatically.",
        notLogged: "Not Logged In",
        loginReq: "You must login via Pi Browser to view your profile.",
        backHome: "Back to Home",
        error: "Error loading profile data.",
        rated: "Rated" 
    },
    sr: {
        earnings: "Zarada",
        member: "Član platforme SkillClick",
        tabOrders: "Moje Kupovine",
        tabSales: "Moje Prodaje",
        tabWallet: "Novčanik & Info",
        noPurchases: "Nemaš kupovina.",
        noSales: "Nemaš prodaja.",
        seller: "Prodavac",
        buyer: "Kupac",
        date: "Datum",
        statusPaid: "ISPLAĆENO",
        statusPending: "NA ČEKANJU",
        statusWaiting: "Čeka se kupac",
        walletTitle: "Tvoj Pi Novčanik za Isplatu",
        walletDesc: "Ovde unesi svoju Javnu Adresu (Public Key). Tu ti leže zarada automatski.",
        labelWallet: "Pi Wallet Adresa (G...)",
        btnSave: "Sačuvaj Adresu",
        savedMsg: "✅ Adresa sačuvana! Sada ti zarada leže automatski.",
        notLogged: "Nisi ulogovan",
        loginReq: "Moraš se ulogovati kroz Pi Browser da bi video profil.",
        backHome: "Nazad na Početnu",
        error: "Greška pri učitavanju podataka profila.",
        rated: "Ocenjeno" 
    },
    hi: {
        earnings: "कमाई",
        member: "SkillClick सदस्य",
        tabOrders: "मेरी खरीदारी",
        tabSales: "मेरी बिक्री",
        tabWallet: "वॉलेट और जानकारी",
        noPurchases: "अभी तक कोई खरीदारी नहीं।",
        noSales: "अभी तक कोई बिक्री नहीं।",
        seller: "विक्रेता",
        buyer: "खरीदार",
        date: "तारीख",
        statusPaid: "भुगतान किया गया",
        statusPending: "लंबित",
        statusWaiting: "खरीदार की प्रतीक्षा",
        walletTitle: "आपका Pi पेआउट वॉलेट",
        walletDesc: "अपनी पब्लिक की (G से शुरू) दर्ज करें। कमाई स्वचालित रूप से यहां भेजी जाएगी।",
        labelWallet: "Pi वॉलेट पता (G...)",
        btnSave: "पता सहेजें",
        savedMsg: "✅ पता सहेजा गया! कमाई स्वचालित रूप से आ जाएगी।",
        notLogged: "लॉग इन नहीं है",
        loginReq: "अपनी प्रोफ़ाइल देखने के लिए आपको Pi Browser के माध्यम से लॉग इन करना होगा।",
        backHome: "होम पर वापस जाएं",
        error: "प्रोफ़ाइल डेटा लोड करने में त्रुटि।",
        rated: "रेट किया गया"
    },
    zh: {
        earnings: "收入",
        member: "SkillClick 会员",
        tabOrders: "我的购买",
        tabSales: "我的销售",
        tabWallet: "钱包 & 信息",
        noPurchases: "暂无购买记录。",
        noSales: "暂无销售记录。",
        seller: "卖家",
        buyer: "买家",
        date: "日期",
        statusPaid: "已支付",
        statusPending: "待处理",
        statusWaiting: "等待买家",
        walletTitle: "您的 Pi 收款钱包",
        walletDesc: "输入您的公钥（以 'G' 开头）。收入将自动发送到此处。",
        labelWallet: "Pi 钱包地址 (G...)",
        btnSave: "保存地址",
        savedMsg: "✅ 地址已保存！收入将自动到账。",
        notLogged: "未登录",
        loginReq: "您必须通过 Pi 浏览器登录才能查看个人资料。",
        backHome: "返回首页",
        error: "加载个人资料数据时出错。",
        rated: "已评价" 
    },
    tw: {
        earnings: "收入",
        member: "SkillClick 會員",
        tabOrders: "我的購買",
        tabSales: "我的銷售",
        tabWallet: "錢包 & 資訊",
        noPurchases: "暫無購買記錄。",
        noSales: "暫無銷售記錄。",
        seller: "賣家",
        buyer: "買家",
        date: "日期",
        statusPaid: "已支付",
        statusPending: "待處理",
        statusWaiting: "等待買家",
        walletTitle: "您的 Pi 收款錢包",
        walletDesc: "輸入您的公鑰（以 'G' 開頭）。收入將自動發送到此處。",
        labelWallet: "Pi 錢包地址 (G...)",
        btnSave: "保存地址",
        savedMsg: "✅ 地址已保存！收入將自動到帳。",
        notLogged: "未登錄",
        loginReq: "您必須通過 Pi 瀏覽器登錄才能查看個人資料。",
        backHome: "返回首頁",
        error: "加載個人資料數據時出錯。",
        rated: "已評價"
    },
    id: {
        earnings: "Pendapatan",
        member: "Anggota SkillClick",
        tabOrders: "Pembelian Saya",
        tabSales: "Penjualan Saya",
        tabWallet: "Dompet & Info",
        noPurchases: "Belum ada pembelian.",
        noSales: "Belum ada penjualan.",
        seller: "Penjual",
        buyer: "Pembeli",
        date: "Tanggal",
        statusPaid: "DIBAYAR",
        statusPending: "TERTUNDA",
        statusWaiting: "Menunggu pembeli",
        walletTitle: "Dompet Pencairan Pi Anda",
        walletDesc: "Masukkan Public Key Anda (dimulai dengan 'G'). Pendapatan akan dikirim ke sini secara otomatis.",
        labelWallet: "Alamat Dompet Pi (G...)",
        btnSave: "Simpan Alamat",
        savedMsg: "✅ Alamat disimpan! Pendapatan akan masuk secara otomatis.",
        notLogged: "Belum Masuk",
        loginReq: "Anda harus masuk melalui Pi Browser untuk melihat profil.",
        backHome: "Kembali ke Beranda",
        error: "Kesalahan memuat data profil.",
        rated: "Dinilai"
    }
  };

  const T = (key: string) => {
    const currentDict = txt[language] || txt['en'];
    return currentDict[key] || txt['en'][key];
  };

  useEffect(() => {
    if (authLoading) return;

    if (!authUser || !authUser.username) {
        setLoadingData(false);
        return;
    }

    const fetchProfileData = async () => {
        try {
            const data = await getUserProfile(authUser.username);
            setFullProfile(data);
            if (data?.piWallet) setWalletInput(data.piWallet);
        } catch (error) {
            console.error(error);
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
          alert(T('savedMsg'));
      } catch (e: any) {
          alert("Error: " + e.message);
      } finally {
          setSavingWallet(false);
      }
  };

  const handleAvatarUpdate = async (base64Image: string) => {
      if (!fullProfile) return;
      try {
          const result = await updateUserAvatar(fullProfile.username, base64Image);
          
          if (result?.error) {
              alert("Greška sa servera: " + result.error);
              return;
          }

          setFullProfile({ ...fullProfile, avatar: base64Image });
          alert("Slika uspešno sačuvana!");
      } catch (error: any) {
          console.error("Greška pri čuvanju slike:", error);
          alert("Sistemska greška: " + error.message);
      }
  };

  const hasReviewed = (order: any) => {
    if (!fullProfile || !order.reviews) return false;
    return order.reviews.some((r: any) => r.userId === fullProfile.id);
  };

  if (authLoading || (authUser && loadingData)) {
      return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-10 w-10 text-purple-600"/></div>;
  }
  
  if (!authUser) {
      return (
        <div className="p-10 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
            <User className="h-16 w-16 text-gray-300 mb-4"/>
            <h2 className="text-xl font-bold text-gray-800">{T('notLogged')}</h2>
            <p className="text-gray-500 mt-2 mb-6">{T('loginReq')}</p>
            <Button onClick={() => window.location.href = "/"} variant="outline">{T('backHome')}</Button>
        </div>
      );
  }

  if (!fullProfile) {
      return <div className="p-20 text-center">{T('error')}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* ZAGLAVLJE PROFILA */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row items-center gap-6">
            <AvatarUploader 
                currentAvatar={fullProfile.avatar} 
                username={fullProfile.username} 
                onAvatarUpdate={handleAvatarUpdate} 
            />
            
            <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{fullProfile.username}</h1>
                <p className="text-gray-500 text-sm">{T('member')}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
                 <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold border border-green-100 flex items-center gap-2">
                    💰 {T('earnings')}: {fullProfile.sales.reduce((acc:any, sale:any) => acc + (sale.status==='completed'?sale.amount:0), 0).toFixed(2)} π
                </div>
            </div>
        </div>

        {/* MENI (TABS) */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setActiveTab("orders")} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition whitespace-nowrap ${activeTab==="orders" ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
                <ShoppingBag className="h-4 w-4"/> {T('tabOrders')}
            </button>
            <button onClick={() => setActiveTab("sales")} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition whitespace-nowrap ${activeTab==="sales" ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
                <LayoutGrid className="h-4 w-4"/> {T('tabSales')}
            </button>
            <button onClick={() => setActiveTab("settings")} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition whitespace-nowrap ${activeTab==="settings" ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
                <Wallet className="h-4 w-4"/> {T('tabWallet')}
            </button>
        </div>

        {/* SADRŽAJ */}
        
        {/* 1. KUPOVINE */}
        {activeTab === "orders" && (
            <div className="space-y-4">
                {fullProfile.orders.length === 0 && <div className="text-center p-10 bg-white rounded-xl text-gray-400 border border-dashed">{T('noPurchases')}</div>}
                {fullProfile.orders.map((order: any) => (
                    <div key={order.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition">
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-lg">{order.service.title}</h3>
                            <div className="text-sm text-gray-500 mt-1">
                                <span className="mr-3">🛒 {T('seller')}: <b>{order.seller.username}</b></span>
                                <span>📅 {new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-2 font-bold text-purple-600">{order.amount} π</div>
                        </div>
                        
                        <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-2">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.status==='completed'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
                                {order.status === 'completed' ? T('statusPaid') : T('statusPending')}
                            </span>

                            {order.status !== 'completed' && (
                                <CompleteOrderButton 
                                    orderId={order.id} 
                                    amount={order.amount} 
                                    sellerWallet={order.seller.piWallet || ""} 
                                />
                            )}

                            {order.status === 'completed' && !hasReviewed(order) && (
                                <ReviewModal orderId={order.id} myUsername={authUser.username} targetRole="Seller" />
                            )}
                            
                            {hasReviewed(order) && (
                                <span className="text-xs text-yellow-600 font-bold flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-md">
                                    <CheckCircle className="w-3 h-3"/> {T('rated')}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* 2. PRODAJE */}
        {activeTab === "sales" && (
            <div className="space-y-4">
                 {fullProfile.sales.length === 0 && <div className="text-center p-10 bg-white rounded-xl text-gray-400 border border-dashed">{T('noSales')}</div>}
                 {fullProfile.sales.map((sale: any) => (
                    <div key={sale.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition">
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{sale.service.title}</h3>
                            <p className="text-sm text-gray-500">{T('buyer')}: {sale.buyer.username}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                            <p className="font-bold text-green-600 text-lg">+{sale.amount} π</p>
                            <span className={`text-xs px-2 py-1 rounded ${sale.status==='completed'?'bg-green-100 text-green-600':'bg-gray-100 text-gray-500'}`}>
                                {sale.status === 'completed' ? T('statusPaid') : T('statusWaiting')}
                            </span>

                            {sale.status === 'completed' && !hasReviewed(sale) && (
                                <ReviewModal orderId={sale.id} myUsername={authUser.username} targetRole="Buyer" />
                            )}
                            
                            {hasReviewed(sale) && (
                                <span className="text-xs text-yellow-600 font-bold flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-md">
                                    <CheckCircle className="w-3 h-3"/> {T('rated')}
                                </span>
                            )}
                        </div>
                    </div>
                 ))}
            </div>
        )}

        {/* 3. PODEŠAVANJA */}
        {activeTab === "settings" && (
            <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <Wallet className="text-purple-600 h-5 w-5"/> {T('walletTitle')}
                </h2>
                <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm mb-6 border border-blue-100">
                    {T('walletDesc')}
                </div>

                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{T('labelWallet')}</label>
                <div className="flex flex-col md:flex-row gap-3">
                    <Input 
                        placeholder="GD4K..." 
                        value={walletInput}
                        onChange={(e) => setWalletInput(e.target.value)}
                        className="font-mono text-sm flex-1"
                    />
                    <Button onClick={handleSaveWallet} disabled={savingWallet} className="bg-purple-600 hover:bg-purple-700 text-white">
                        {savingWallet ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="h-4 w-4 mr-2"/>}
                        {T('btnSave')}
                    </Button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
