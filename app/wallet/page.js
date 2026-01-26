'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Wallet as WalletIcon, CreditCard, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'

export default function WalletPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  // Placeholder transactions
  const transactions = []

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-white/10">
        <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">Wallet</h1>
      </header>

      <div className="p-4">
        {/* Balance Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <WalletIcon className="w-5 h-5 text-black/60" />
            <span className="text-black/60 text-sm font-medium">Available Balance</span>
          </div>
          <div className="text-4xl font-bold text-black mb-6">
            $0.00
          </div>
          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-xl bg-black/20 text-black font-semibold flex items-center justify-center gap-2">
              <ArrowDownLeft className="w-4 h-4" /> Add Funds
            </button>
            <button className="flex-1 py-3 rounded-xl bg-black text-white font-semibold flex items-center justify-center gap-2">
              <ArrowUpRight className="w-4 h-4" /> Send
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button className="p-4 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors">
            <CreditCard className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <span className="text-white text-sm">Cards</span>
          </button>
          <button className="p-4 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors">
            <ArrowUpRight className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <span className="text-white text-sm">Transfer</span>
          </button>
          <button className="p-4 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors">
            <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <span className="text-white text-sm">History</span>
          </button>
        </div>

        {/* Transactions */}
        <div>
          <h2 className="text-white font-semibold mb-3">Recent Transactions</h2>
          
          {transactions.length === 0 ? (
            <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
              <WalletIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No transactions yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Your transaction history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    tx.type === 'in' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {tx.type === 'in' ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{tx.description}</p>
                    <p className="text-gray-500 text-xs">{tx.date}</p>
                  </div>
                  <span className={`font-semibold ${
                    tx.type === 'in' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {tx.type === 'in' ? '+' : '-'}${tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <p className="text-amber-400 text-sm text-center">
            🚀 Full wallet features coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}
