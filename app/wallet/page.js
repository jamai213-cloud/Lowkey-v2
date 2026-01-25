'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Wallet } from 'lucide-react'

export default function WalletPage() {
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
        <h1 className="text-xl font-bold text-white">Wallet</h1>
      </header>

      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
          <Wallet className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-white text-lg font-semibold mb-2">Wallet</h2>
        <p className="text-gray-400 text-center max-w-sm">
          Manage your tokens and transactions. Your balance will appear here.
        </p>
      </div>
    </div>
  )
}
