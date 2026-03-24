'use client'

import { RadioProvider } from './contexts/RadioContext'
import { NotificationProvider } from './contexts/NotificationContext'
import RadioMiniPlayer from './components/RadioMiniPlayer'

export default function ClientLayout({ children }) {
  return (
    <NotificationProvider>
      <RadioProvider>
        <div className="app-container min-h-screen bg-[#0a0a0f] relative overflow-x-hidden">
          {children}
          <RadioMiniPlayer />
        </div>
      </RadioProvider>
    </NotificationProvider>
  )
}
