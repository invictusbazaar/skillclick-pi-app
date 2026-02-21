export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fc]">
      
      {/* Centrirani kontejner */}
      <div className="relative flex flex-col items-center justify-center gap-6">
         
         {/* SPINNER ANIMACIJA */}
         <div className="relative w-20 h-20">
            {/* Pozadinski krug (sivkasto-ljubičast) */}
            <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
            
            {/* Glavni krug koji se vrti (Jarko ljubičast) */}
            <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin shadow-lg shadow-purple-500/20"></div>
            
            {/* Logo ili Ikonica u sredini (opciono) */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
            </div>
         </div>

         {/* TEKST ISPOD */}
         <div className="text-center space-y-2">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight animate-pulse">
                SkillClick
            </h3>
            <p className="text-xs text-purple-500 font-bold uppercase tracking-widest">
                Učitavanje...
            </p>
         </div>

      </div>
    </div>
  )
}