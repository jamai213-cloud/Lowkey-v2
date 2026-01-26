'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DemoPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-login with demo user data
    const demoUser = {
      id: 'demo-user-123',
      email: 'demo@lowkey.com',
      displayName: 'DEMO USER',
      displayNameLower: 'demo user',
      verified: true,
      role: 'admin',
      permissions: {
        manageUsers: true,
        verifyUsers: true,
        removeUsers: true,
        accessAll: true
      },
      quietMode: false,
      ageVerified: true,
      friends: [],
      createdAt: new Date().toISOString()
    }

    localStorage.setItem('lowkey_user', JSON.stringify(demoUser))
    localStorage.setItem('lowkey_token', 'demo-token-123')
    
    // Redirect to home
    window.location.href = '/'
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading demo...</p>
      </div>
    </div>
  )
}
