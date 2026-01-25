'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Search } from 'lucide-react'

export default function SearchPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4">
      <header className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Search</h1>
      </header>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search people, communities..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-white text-lg font-semibold mb-2">Discover</h2>
        <p className="text-gray-400 text-center max-w-sm">
          Find people, communities, and content that interests you.
        </p>
      </div>
    </div>
  )
}
