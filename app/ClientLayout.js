'use client'

import { RadioProvider, useRadio } from './contexts/RadioContext'
import { NotificationProvider } from './contexts/NotificationContext'
import RadioMiniPlayer from './components/RadioMiniPlayer'

function MainContent({ children }) {
  const { currentStation } = useRadio()
  
  // Add extra bottom padding when radio player is visible to prevent content overlap
  // pb-32 (128px) provides enough space for the radio bar + safe area
  const paddingClass = currentStation ? 'pb-36' : 'pb-20'
  
  return (
    <main className={`overflow-x-hidden max-w-full ${paddingClass} relative z-0`}>
      {children}
    </main>
  )
}

export default function ClientLayout({ children }) {
  return (
    <NotificationProvider>
      <RadioProvider>
        <MainContent>{children}</MainContent>
        <RadioMiniPlayer />
      </RadioProvider>
    </NotificationProvider>
  )
}

