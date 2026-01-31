'use client'

import { RadioProvider } from './contexts/RadioContext'
import RadioMiniPlayer from './components/RadioMiniPlayer'

export default function ClientLayout({ children }) {
  return (
    <RadioProvider>
      <main className="overflow-x-hidden max-w-full pb-16">
        {children}
      </main>
      <RadioMiniPlayer />
    </RadioProvider>
  )
}
