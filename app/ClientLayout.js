'use client'

import { RadioProvider } from './contexts/RadioContext'

export default function ClientLayout({ children }) {
  return (
    <RadioProvider>
      {children}
    </RadioProvider>
  )
}
