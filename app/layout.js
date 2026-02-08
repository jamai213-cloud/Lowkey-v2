Suggested Fix: Please create app/layout.js with the original content. Here's how to do it:

Create this file: app/layout.js
import './globals.css'
import ClientLayout from './ClientLayout'

export const metadata = {
  title: 'LowKey - Private Parties',
  description: 'Grown chats. Real nights. Private parties.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark overflow-x-hidden">
      <body className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}


Copy
Agent is wait
