'use client'

import { RadioProvider, useRadio } from './contexts/RadioContext'
import { NotificationSoundProvider } from './contexts/NotificationSoundContext'
import RadioMiniPlayer from './components/RadioMiniPlayer'

function MainContent({ children }) {
  const { currentStation } = useRadio()
  
  // Add extra bottom padding when radio player is visible
  const paddingClass = currentStation ? 'pb-32' : 'pb-16'
  
  return (
    <main className={`overflow-x-hidden max-w-full ${paddingClass}`}>
      {children}
    </main>
  )
}

export default function ClientLayout({ children }) {
  return (
    <NotificationSoundProvider>
      <RadioProvider>
        <MainContent>{children}</MainContent>
        <RadioMiniPlayer />
      </RadioProvider>
    </NotificationSoundProvider>
  )
}
