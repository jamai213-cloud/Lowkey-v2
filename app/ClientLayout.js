'use client'

import { RadioProvider, useRadio } from './contexts/RadioContext'
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
    <RadioProvider>
      <MainContent>{children}</MainContent>
      <RadioMiniPlayer />
    </RadioProvider>
  )
}
For the other 3 broken files (inbox/page.js, lounge/page.js, profile/edit/page.js), you need to remove the garbage text at the top and make sure each file starts with 'use client'.

Would you like me to output the clean versions of those 3 files?

Feb 22, 11:59 AM

Rollback
Rollback

Copy
Scroll to bottom
Agent is waiting...
Message Agent
Attach
GitHub
Save
Fork
Fo
