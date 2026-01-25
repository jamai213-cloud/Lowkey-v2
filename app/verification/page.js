'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, CheckCircle, Upload, X } from 'lucide-react'

export default function VerificationPage() {
  const [user, setUser] = useState(null)
  const [step, setStep] = useState(1)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    if (userData.verified) {
      setStep(3) // Already verified
    }
  }, [])

  const simulateVerification = async () => {
    // In real app, this would upload photo and trigger verification
    setStep(2)
    
    // Simulate processing
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/${user.id}/verify`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verified: true })
        })
        
        if (res.ok) {
          const updatedUser = await res.json()
          localStorage.setItem('lowkey_user', JSON.stringify(updatedUser))
          setUser(updatedUser)
          setStep(3)
        }
      } catch (err) {
        console.error('Verification failed:', err)
      }
    }, 2000)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4">
      <header className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Verification</h1>
      </header>

      <div className="max-w-md mx-auto">
        {step === 1 && (
          <div className="glass-card rounded-2xl p-6">
            <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-white text-center mb-2">Verify Your Identity</h2>
            <p className="text-gray-400 text-center mb-6">
              Upload a photo of yourself to unlock all features including Radio, Music, and After Dark.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl border-2 border-dashed border-white/20 text-center hover:border-purple-500/50 transition-colors cursor-pointer" onClick={simulateVerification}>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-300 text-sm">Click to upload verification photo</p>
                <p className="text-gray-500 text-xs mt-1">JPG, PNG up to 10MB</p>
              </div>
              
              <div className="text-sm text-gray-500 space-y-2">
                <p>• Photo must clearly show your face</p>
                <p>• Good lighting, no filters</p>
                <p>• Photos are reviewed within 24 hours</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Upload className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Processing...</h2>
            <p className="text-gray-400">We're reviewing your verification photo.</p>
          </div>
        )}

        {step === 3 && (
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Verified!</h2>
            <p className="text-gray-400 mb-6">You now have full access to all LowKey features.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
            >
              Continue to Home
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
