"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import { getUserProfile, updateWalletAddress, updateUserAvatar } from "@/app/actions/getProfile";
import CompleteOrderButton from "@/components/CompleteOrderButton";
import ReviewModal from "@/components/ReviewModal"; 
import AvatarUploader from "@/components/AvatarUploader"; 
import { Loader2, ShoppingBag, Wallet, LayoutGrid, User, Save, CheckCircle, Heart, Trash, Star, Wrench, Car, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const getGradient = (id: string) => {
  if (!id) return "from-indigo-500 to-purple-600";
  const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = ["from-fuchsia-600 to-pink-600", "from-violet-600 to-indigo-600", "from-blue-600 to-cyan-500", "from-emerald-500 to-teal-600"];
  return gradients[sum % gradients.length];
};

const getSmartIcon = (service: any) => {
  const iconClass = "h-12 w-12 text-white/90 drop-shadow-md"; 
  const title = (typeof service.title === 'string' ? service.title : (service.title?.en || "")).toLowerCase();
  if (title.includes('auto') || title.includes('alfa')) return <Car className={iconClass} />;
  if (title.includes('popravka') || title.includes('servis')) return <Wrench className={iconClass} />;
  return <Layers className={iconClass} />;
};

export default function UserProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { language, t } = useLanguage(); 
  
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [walletInput, setWalletInput] = useState("");
  const [savingWallet, setSavingWallet] = useState(false);

  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingFavs, setLoadingFavs] = useState(false);

  const txt: any = {
    en: {
        earnings: "Earnings",
        member: "Member of SkillClick",
        tabOrders: "My Purchases",
        tabSales: "My Sales",
        tabWallet: "Wallet & Info",
        tabFavorites: "Favorites",
        noPurchases: "No purchases yet.",
        noSales: "No sales yet.",
        noFavorites: "No favorite ads yet.",
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
        tabFavorites: "Omiljeno",
        noPurchases: "Nemaš kupovina.",
        noSales: "Nemaš prodaja.",
        noFavorites: "Nemaš omiljenih oglasa.",
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
        tabFavorites: "पसंदीदा",
        noPurchases: "अभी तक कोई खरीदारी नहीं।",
        noSales: "अभी तक कोई बिक्री नहीं।",
        noFavorites: "कोई पसंदीदा विज्ञापन नहीं।",
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
        tabFavorites: "收藏",
        noPurchases: "暂无购买记录。",
        noSales: "暂无销售记录。",
        noFavorites: "没有最喜欢的广告。",
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
        tabFavorites: "收藏",
        noPurchases: "暫無購買記錄。",
        noSales: "暫無銷售記錄。",
        noFavorites: "沒有最喜歡的廣告。",
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
        tabFavorites: "Favorit",
        noPurchases: "Belum ada pembelian.",
        noSales: "Belum ada penjualan.",
        noFavorites: "Tidak ada iklan favorit.",
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

  useEffect(() => {
    if (activeTab === "favorites" && authUser?.username) {
        setLoadingFavs(true);
        fetch(`/api/favorites?username=${authUser.username}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setFavorites(data);
            })
            .catch(console.error)
            .finally(() => setLoadingFavs(false));
    }
  }, [activeTab, authUser?.username]);

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

  const removeFavorite = async (e: React.MouseEvent, serviceId: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (!authUser?.username) return;
      
      setFavorites(prev => prev.filter(f => f.serviceId !== serviceId));
      
      try {
          await fetch('/api/favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: authUser.username, serviceId })
          });
      } catch (error) {
          console.error("Greška pri brisanju:", error);
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            <button onClick={() => setActiveTab("orders")} className={`p-2 rounded-xl font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-all text-[11px] sm:text-sm leading-tight text-center ${activeTab==="orders" ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
                <ShoppingBag className="h-4 w-4 md:h-5 md:w-5"/> <span>{T('tabOrders')}</span>
            </button>
            <button onClick={() => setActiveTab("sales")} className={`p-2 rounded-xl font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-all text-[11px] sm:text-sm leading-tight text-center ${activeTab==="sales" ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
                <LayoutGrid className="h-4 w-4 md:h-5 md:w-5"/> <span>{T('tabSales')}</span>
            </button>
            <button onClick={() => setActiveTab("favorites")} className={`p-2 rounded-xl font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-all text-[11px] sm:text-sm leading-tight text-center ${activeTab==="favorites" ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
                <Heart className={`h-4 w-4 md:h-5 md:w-5 ${activeTab==="favorites" ? "fill-white" : ""}`}/> <span>{T('tabFavorites')}</span>
            </button>
            <button onClick={() => setActiveTab("settings")} className={`p-2 rounded-xl font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-all text-[11px] sm:text-sm leading-tight text-center ${activeTab==="settings" ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
                <Wallet className="h-4 w-4 md:h-5 md:w-5"/> <span>{T('tabWallet')}</span>
            </button>
        </div>
        
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

        {/* 3. OMILJENO KARTICE (SA KANTOM ZA SMEĆE) */}
        {activeTab === "favorites" && (
            <div className="space-y-4">
                 {loadingFavs ? (
                    <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-purple-600"/></div>
                 ) : favorites.length === 0 ? (
                    <div className="text-center p-10 bg-white rounded-xl text-gray-400 border border-dashed">{T('noFavorites')}</div>
                 ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        {favorites.map((fav: any) => {
                            const gig = fav.service;
                            return (
                                <div key={fav.id} className="group bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col h-full relative">
                                    
                                    {/* KANTA ZA SMEĆE VRAĆENA OVDE */}
                                    <button 
                                        onClick={(e) => removeFavorite(e, fav.serviceId)}
                                        className="absolute top-3 left-3 z-20 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm hover:scale-110 hover:bg-red-50 transition-transform border border-red-100"
                                        title="Ukloni iz omiljenih"
                                    >
                                        <Trash className="w-4 h-4 text-red-500" />
                                    </button>

                                    <Link href={`/services/${gig.id}`} className="block relative aspect-[4/3] md:aspect-[3/2] overflow-hidden bg-gray-100 cursor-pointer">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(gig.id)} flex items-center justify-center transition-transform duration-700 group-hover:scale-110`}>
                                            {gig.images && gig.images.length > 0 ? ( 
                                                <img src={gig.images[0]} alt={typeof gig.title === 'string' ? gig.title : 'Slika oglasa'} className="w-full h-full object-cover" /> 
                                            ) : ( 
                                                getSmartIcon(gig) 
                                            )}
                                        </div>
                                        <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs md:text-sm font-black text-purple-700 shadow-sm border border-white/50">
                                            {gig.price} π
                                        </div>
                                    </Link>

                                    <div className="p-4 flex flex-col flex-grow relative gap-2">
                                        <Link href={`/services/${gig.id}`} className="block cursor-pointer">
                                            <h3 className="text-gray-900 font-bold text-sm md:text-base leading-snug line-clamp-2 group-hover:text-purple-600 transition-colors">
                                              {typeof gig.title === 'object' ? (gig.title[language] || gig.title['en']) : gig.title}
                                            </h3>
                                        </Link>
                                        
                                        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                                            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0 overflow-hidden">
                                                {gig.seller?.avatar ? (
                                                    <img src={gig.seller.avatar} alt={gig.seller?.username} className="w-full h-full object-cover" />
                                                ) : gig.seller?.username ? (
                                                    gig.seller.username[0].toUpperCase()
                                                ) : (
                                                    <User className="w-3 h-3"/>
                                                )}
                                            </div>
                                            <Link 
                                              href={gig.seller?.username ? `/seller/${gig.seller.username}` : "#"} 
                                              className="truncate hover:text-purple-600 hover:underline font-medium"
                                              onClick={(e) => e.stopPropagation()} 
                                            >
                                                {gig.seller?.username || "Nepoznat prodavac"}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                 )}
            </div>
        )}

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