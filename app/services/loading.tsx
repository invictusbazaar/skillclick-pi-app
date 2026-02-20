export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* Rotirajući krug */}
      <div className="relative">
        {/* Spoljni prsten */}
        <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-purple-200"></div>
        {/* Unutrašnji brzi prsten */}
        <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-b-4 border-purple-600 animate-spin"></div>
      </div>
      
      {/* Tekst ispod */}
      <h2 className="mt-5 text-xl font-bold text-gray-700 animate-pulse">
        Učitavanje SkillClick...
      </h2>
      <p className="text-sm text-gray-400 mt-2">Pripremanje Pi ekosistema</p>
    </div>
  )
}