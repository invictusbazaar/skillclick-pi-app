"use client"

import Link from "next/link"
import { useAuth } from "@/components/AuthContext"
import { ShieldCheck, Users, Layers, ArrowRight } from "lucide-react"

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Naslov */}
        <div className="mb-8 flex items-center gap-4 border-b border-gray-200 pb-6">
             <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <ShieldCheck className="h-8 w-8" />
             </div>
             <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Admin Panel</h1>
                <p className="text-gray-500 font-medium">
                    Ulogovan kao: <span className="text-gray-900 font-bold">{user?.username || "Admin"}</span>
                </p>
             </div>
        </div>

        {/* Linkovi ka tvojim postojećim folderima */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* OVO VODI NA app/admin/services */}
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

            {/* OVO VODI NA app/admin/users */}
            <Link href="/admin/users" className="group">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Users className="h-6 w-6" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Korisnici</h2>
                    <p className="text-sm text-gray-500">Lista korisnika</p>
                </div>
            </Link>

        </div>

      </div>
    </div>
  )
}