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
          alert(t('savedMsg'));
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
            <h2 className="text-xl font-bold text-gray-800">{t('notLogged')}</h2>
            <p className="text-gray-500 mt-2 mb-6">{t('loginReq')}</p>
            <Button onClick={() => window.location.href = "/"} variant="outline">{t('backHome')}</Button>
        </div>
      );
  }

  if (!fullProfile) {
      return <div className="p-20 text-center">{t('error')}</div>;
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
                <p className="text-gray-500 text-sm">{t('member')}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
                 <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold border border-green-100 flex items-center gap-2">
                    💰 {t('earnings')}: {fullProfile.sales.reduce((acc:any, sale:any) => acc + (sale.status==='completed'?sale.amount:0), 0).toFixed(2)} π
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            <button onClick={() => setActiveTab("orders")} className={`p-2 rounded-xl font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-all text-[11px] sm:text-sm leading-tight text-center ${activeTab==="orders" ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
                <ShoppingBag className="h-4 w-4 md:h-5 md:w-5"/> <span>{t('tabOrders')}</span>
            </button>
            <button onClick={() => setActiveTab("sales")} className={`p-2 rounded-xl font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-all text-[11px] sm:text-sm leading-tight text-center ${activeTab==="sales" ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
                <LayoutGrid className="h-4 w-4 md:h-5 md:w-5"/> <span>{t('tabSales')}</span>
            </button>
            <button onClick={() => setActiveTab("favorites")} className={`p-2 rounded-xl font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-all text-[11px] sm:text-sm leading-tight text-center ${activeTab==="favorites" ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
                <Heart className={`h-4 w-4 md:h-5 md:w-5 ${activeTab==="favorites" ? "fill-white" : ""}`}/> <span>{t('tabFavorites')}</span>
            </button>
            <button onClick={() => setActiveTab("settings")} className={`p-2 rounded-xl font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-all text-[11px] sm:text-sm leading-tight text-center ${activeTab==="settings" ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
                <Wallet className="h-4 w-4 md:h-5 md:w-5"/> <span>{t('tabWallet')}</span>
            </button>
        </div>
        
        {activeTab === "orders" && (
            <div className="space-y-4">
                {fullProfile.orders.length === 0 && <div className="text-center p-10 bg-white rounded-xl text-gray-400 border border-dashed">{t('noPurchases')}</div>}
                {fullProfile.orders.map((order: any) => (
                    <div key={order.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition">
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-lg">{order.service.title}</h3>
                            <div className="text-sm text-gray-500 mt-1">
                                <span className="mr-3">🛒 {t('seller')}: <b>{order.seller.username}</b></span>
                                <span>📅 {new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-2 font-bold text-purple-600">{order.amount} π</div>
                        </div>
                        
                        <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-2">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.status==='completed'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
                                {order.status === 'completed' ? t('statusPaid') : t('statusPending')}
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
                                    <CheckCircle className="w-3 h-3"/> {t('rated')}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {activeTab === "sales" && (
            <div className="space-y-4">
                 {fullProfile.sales.length === 0 && <div className="text-center p-10 bg-white rounded-xl text-gray-400 border border-dashed">{t('noSales')}</div>}
                 {fullProfile.sales.map((sale: any) => (
                    <div key={sale.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition">
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{sale.service.title}</h3>
                            <p className="text-sm text-gray-500">{t('buyer')}: {sale.buyer.username}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                            <p className="font-bold text-green-600 text-lg">+{sale.amount} π</p>
                            <span className={`text-xs px-2 py-1 rounded ${sale.status==='completed'?'bg-green-100 text-green-600':'bg-gray-100 text-gray-500'}`}>
                                {sale.status === 'completed' ? t('statusPaid') : t('statusWaiting')}
                            </span>

                            {sale.status === 'completed' && !hasReviewed(sale) && (
                                <ReviewModal orderId={sale.id} myUsername={authUser.username} targetRole="Buyer" />
                            )}
                            
                            {hasReviewed(sale) && (
                                <span className="text-xs text-yellow-600 font-bold flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-md">
                                    <CheckCircle className="w-3 h-3"/> {t('rated')}
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
                    <div className="text-center p-10 bg-white rounded-xl text-gray-400 border border-dashed">{t('noFavorites')}</div>
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
                    <Wallet className="text-purple-600 h-5 w-5"/> {t('walletTitle')}
                </h2>
                <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm mb-6 border border-blue-100">
                    {t('walletDesc')}
                </div>

                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{t('labelWallet')}</label>
                <div className="flex flex-col md:flex-row gap-3">
                    <Input 
                        placeholder="GD4K..." 
                        value={walletInput}
                        onChange={(e) => setWalletInput(e.target.value)}
                        className="font-mono text-sm flex-1"
                    />
                    <Button onClick={handleSaveWallet} disabled={savingWallet} className="bg-purple-600 hover:bg-purple-700 text-white">
                        {savingWallet ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="h-4 w-4 mr-2"/>}
                        {t('btnSave')}
                    </Button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
