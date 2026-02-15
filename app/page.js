Skip to content
jamai213-cloud
Lowkey-v2
Repository navigation
Code
Issues
Pull requests
Actions
Projects
Security
Insights
Settings
Lowkey-v2/app
/
page.js
in
conflict_150226_0304

Edit

Preview
Indent mode

Spaces
Indent size

2
Line wrap mode

No wrap
Editing page.js file contents
293
294
295
296
297
298
299
300
301
302
303
304
305
306
307
308
309
310
311
312
313
314
315
316
317
318
319
320
321
322
323
324
325
326
327
328
329
330
331
332
333
334
335
336
337
338
339
340
341
342
343
344
345
346
347
348
349
350
351
352
353
354
355
356
357
358
359
360
361
362
363
364
365
366
367
368
'use client'
import { useRouter } from 'next/navigation'
            
            <p className="text-gray-300 text-sm leading-relaxed">
              The central, open social space where conversation, culture, music, and community come together.
            </p>
            
            <p className="text-gray-400 text-sm mt-3 italic">
              A place for relaxed, real-time connection.
            </p>
          </div>
          
          {/* Actions */}
          <div className="space-y-2">
            <button 
              onClick={onEnter}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Enter Lounge
            </button>
            <button 
              onClick={onClose}
              className="w-full py-2 text-gray-400 text-sm hover:text-white transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Forgot Password Modal
const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 max-w-sm mx-4 w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Reset Password</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
Use Control + Shift + m to toggle the tab key moving focus. Alternatively, use esc then tab to move to the next interactive element on the page.
 
