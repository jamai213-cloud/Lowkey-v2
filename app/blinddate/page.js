'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Heart, Clock, Volume2, VolumeX, Phone, PhoneOff,
  User, X, Check, Eye, Timer, Sparkles, MessageSquare, Flag, Shield
} from 'lucide-react'

// Mood options for blind date
const MOOD_OPTIONS = [
  { id: 'chill', label: 'Chill vibes', emoji: '😌' },
  { id: 'flirty', label: 'Flirty', emoji: '😏' },
  { id: 'deep', label: 'Deep talk', emoji: '🤔' },
  { id: 'fun', label: 'Fun & playful', emoji: '😄' },
  { id: 'mysterious', label: 'Mysterious', emoji: '🌙' },
  { id: 'romantic', label: 'Romantic', emoji: '💕' },
]

// Time options in minutes
const TIME_OPTIONS = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
]

// Icebreaker prompts
const ICEBREAKER_PROMPTS = [
  "What's something that made you smile today?",
  "If you could be anywhere right now, where would it be?",
  "What's your idea of a perfect evening?",
  "What's something you're passionate about?",
  "Describe your vibe in three words.",
  "What song is stuck in your head right now?",
  "What's the best compliment you've ever received?",
  "If we matched, what would our first date look like?",
]

export default function BlindDatePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stage, setStage] = useState('setup') // setup, matching, active, reveal, ended
  const [selectedMood, setSelectedMood] = useState(null)
  const [selectedTime, setSelectedTime] = useState(10)
  const [preferences, setPreferences] = useState({ gender: 'any', ageRange: 'any' })
  const [matchedUser, setMatchedUser] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [minTimePassed, setMinTimePassed] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState(null)
  const [showRevealModal, setShowRevealModal] = useState(false)
  const [revealChoice, setRevealChoice] = useState(null) // 'reveal', 'extend', 'end'
  const [partnerChoice, setPartnerChoice] = useState(null)
  const [revealResult, setRevealResult] = useState(null) // 'mutual', 'not_mutual', null
  const timerRef = useRef(null)
  const promptTimerRef = useRef(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    setUser(JSON.parse(storedUser))
  }, [])

  // Timer effect for active date
  useEffect(() => {
    if (stage === 'active' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setShowRevealModal(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Set minimum time passed after 3 minutes
      setTimeout(() => {
        setMinTimePassed(true)
      }, 3 * 60 * 1000)

      return () => clearInterval(timerRef.current)
    }
  }, [stage, timeRemaining])

  // Icebreaker prompt rotation
  useEffect(() => {
    if (stage === 'active') {
      // Show first prompt after 30 seconds
      setTimeout(() => {
        showNewPrompt()
      }, 30000)

      // Rotate prompts every 90 seconds
      promptTimerRef.current = setInterval(() => {
        showNewPrompt()
      }, 90000)

      return () => clearInterval(promptTimerRef.current)
    }
  }, [stage])

  const showNewPrompt = () => {
    const randomPrompt = ICEBREAKER_PROMPTS[Math.floor(Math.random() * ICEBREAKER_PROMPTS.length)]
    setCurrentPrompt(randomPrompt)
    // Auto-dismiss prompt after 15 seconds
    setTimeout(() => setCurrentPrompt(null), 15000)
  }

  const startMatching = async () => {
    if (!selectedMood) return
    setStage('matching')

    try {
      const res = await fetch('/api/blinddate/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          mood: selectedMood,
          duration: selectedTime,
          preferences
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.matched) {
          setMatchedUser(data.partner)
          setTimeRemaining(selectedTime * 60)
          setStage('active')
        } else {
          // Poll for match
          pollForMatch()
        }
      }
    } catch (err) {
      console.error('Matching failed:', err)
      setStage('setup')
    }
  }

  const pollForMatch = () => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/blinddate/status?userId=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          if (data.matched) {
            clearInterval(pollInterval)
            setMatchedUser(data.partner)
            setTimeRemaining(selectedTime * 60)
            setStage('active')
          }
        }
      } catch (err) {
        console.error('Poll failed:', err)
      }
    }, 3000)

    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
      if (stage === 'matching') {
        setStage('setup')
      }
    }, 120000)
  }

  const handleRevealChoice = async (choice) => {
    setRevealChoice(choice)

    try {
      const res = await fetch('/api/blinddate/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: matchedUser?.sessionId,
          oderId: user.id,
          choice
        })
      })

      if (res.ok) {
        const data = await res.json()
        setPartnerChoice(data.partnerChoice)

        if (choice === 'reveal' && data.partnerChoice === 'reveal') {
          setRevealResult('mutual')
        } else if (choice === 'end' || data.partnerChoice === 'end') {
          setRevealResult('not_mutual')
          setTimeout(() => {
            setStage('ended')
          }, 2000)
        } else if (choice === 'extend' && data.partnerChoice === 'extend') {
          // Both chose extend - add more time
          setTimeRemaining(prev => prev + (5 * 60))
          setShowRevealModal(false)
          setRevealChoice(null)
          setPartnerChoice(null)
        }
      }
    } catch (err) {
      console.error('Reveal failed:', err)
    }
  }

  const endDate = async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (promptTimerRef.current) clearInterval(promptTimerRef.current)

    try {
      await fetch('/api/blinddate/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: matchedUser?.sessionId,
          userId: user.id
        })
      })
    } catch (err) {
      console.error('End date failed:', err)
    }

    setStage('ended')
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const continueToChat = () => {
    // Navigate to inbox with new match
    router.push(`/inbox?newMatch=${matchedUser?.id}`)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  // SETUP STAGE - Mood & preferences selection
  if (stage === 'setup') {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-semibold text-white">Blind Date</h1>
          </div>
        </header>

        <div className="p-4 pb-24">
          {/* Hero */}
          <div className="text-center mb-8 pt-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
              <Heart className="w-8 h-8 text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No photos. Just vibes.</h2>
            <p className="text-gray-400 text-sm">Connect through voice first. Reveal only if it feels right.</p>
          </div>

          {/* Mood Selection */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">What's your mood?</h3>
            <div className="grid grid-cols-2 gap-2">
              {MOOD_OPTIONS.map(mood => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedMood === mood.id
                      ? 'bg-pink-500/20 border-pink-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl mb-1 block">{mood.emoji}</span>
                  <span className="text-sm">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" /> Date length
            </h3>
            <div className="flex gap-2">
              {TIME_OPTIONS.map(time => (
                <button
                  key={time.value}
                  onClick={() => setSelectedTime(time.value)}
                  className={`flex-1 py-3 rounded-xl border transition-all ${
                    selectedTime === time.value
                      ? 'bg-pink-500/20 border-pink-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-white font-semibold mb-3">Looking for</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                {['any', 'men', 'women'].map(gender => (
                  <button
                    key={gender}
                    onClick={() => setPreferences(p => ({ ...p, gender }))}
                    className={`flex-1 py-2 rounded-lg text-sm capitalize ${
                      preferences.gender === gender
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    {gender === 'any' ? 'Anyone' : gender}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startMatching}
            disabled={!selectedMood}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Find a Match
          </button>

          {/* Info */}
          <p className="text-center text-gray-500 text-xs mt-4">
            Voice-first connection. Photos revealed only with mutual consent.
          </p>
        </div>
      </div>
    )
  }

  // MATCHING STAGE - Waiting for match
  if (stage === 'matching') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6">
        <div className="text-center">
          {/* Animated heart */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-pink-500/20 animate-ping" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart className="w-12 h-12 text-pink-400 animate-pulse" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Finding your match...</h2>
          <p className="text-gray-400 text-sm mb-8">Looking for someone with similar vibes</p>

          {/* Selected mood display */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="text-lg">{MOOD_OPTIONS.find(m => m.id === selectedMood)?.emoji}</span>
            <span className="text-gray-300 text-sm">{MOOD_OPTIONS.find(m => m.id === selectedMood)?.label}</span>
          </div>

          <button
            onClick={() => setStage('setup')}
            className="text-gray-400 text-sm hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // ACTIVE STAGE - Voice date in progress
  if (stage === 'active') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
        {/* Header with timer */}
        <header className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h1 className="text-white font-semibold">Blind Date</h1>
              <p className="text-gray-400 text-xs">Voice connection active</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-white/10 flex items-center gap-2">
              <Timer className="w-4 h-4 text-pink-400" />
              <span className="text-white font-mono text-sm">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {/* Partner display - anonymous */}
          <div className="text-center mb-8">
            <div className="w-28 h-28 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center border border-white/20">
              <User className="w-14 h-14 text-white/60" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{matchedUser?.alias || 'Anonymous'}</h2>
            <p className="text-gray-400 text-sm mb-3">{matchedUser?.age || '?'} years old</p>
            
            {/* Vibe emojis */}
            <div className="flex items-center justify-center gap-2">
              {(matchedUser?.vibeEmojis || ['🌙', '💫', '✨']).map((emoji, i) => (
                <span key={i} className="text-2xl">{emoji}</span>
              ))}
            </div>
          </div>

          {/* Icebreaker prompt */}
          {currentPrompt && (
            <div className="w-full max-w-sm mb-8 p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-white/10">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-400 text-xs mb-1">Icebreaker</p>
                  <p className="text-white text-sm">{currentPrompt}</p>
                </div>
              </div>
            </div>
          )}

          {/* Voice controls */}
          <div className="flex items-center gap-6 mb-8">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'
              }`}
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
            
            <button
              onClick={endDate}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>

            <button
              onClick={() => setShowRevealModal(true)}
              disabled={!minTimePassed && timeRemaining > 0}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                minTimePassed ? 'bg-pink-500/20 text-pink-400' : 'bg-white/5 text-gray-600'
              }`}
            >
              <Eye className="w-6 h-6" />
            </button>
          </div>

          {/* Status */}
          <p className="text-gray-500 text-xs text-center">
            {minTimePassed 
              ? 'Tap the eye to request a reveal when you\'re ready' 
              : 'Reveal option available after 3 minutes'}
          </p>
        </div>

        {/* Safety footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-center gap-4">
            <button className="flex items-center gap-2 text-gray-500 text-sm hover:text-white transition-colors">
              <Flag className="w-4 h-4" /> Report
            </button>
            <button className="flex items-center gap-2 text-gray-500 text-sm hover:text-white transition-colors">
              <Shield className="w-4 h-4" /> Block
            </button>
          </div>
        </div>

        {/* Reveal Decision Modal */}
        {showRevealModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="max-w-sm w-full glass-card rounded-2xl p-6 border border-white/10">
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <Heart className="w-7 h-7 text-pink-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {timeRemaining === 0 ? 'Time\'s up!' : 'Make a choice'}
                </h2>
                <p className="text-gray-400 text-sm">What would you like to do?</p>
              </div>

              {revealChoice ? (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm mb-2">Waiting for their choice...</p>
                  <div className="animate-pulse">
                    <Heart className="w-8 h-8 text-pink-400 mx-auto" />
                  </div>
                  {revealResult === 'mutual' && (
                    <div className="mt-4 p-4 rounded-xl bg-green-500/20 border border-green-500/30">
                      <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 font-semibold">It's a match!</p>
                      <p className="text-gray-400 text-sm mt-1">You both chose to reveal</p>
                      <button
                        onClick={continueToChat}
                        className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
                      >
                        Continue to Chat
                      </button>
                    </div>
                  )}
                  {revealResult === 'not_mutual' && (
                    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-gray-400">Date ended gracefully</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => handleRevealChoice('reveal')}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" /> Reveal Photos
                  </button>
                  <button
                    onClick={() => handleRevealChoice('extend')}
                    className="w-full py-4 rounded-xl bg-white/10 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <Clock className="w-5 h-5" /> Extend Date (+5 min)
                  </button>
                  <button
                    onClick={() => handleRevealChoice('end')}
                    className="w-full py-3 text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    End Date
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ENDED STAGE
  if (stage === 'ended') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
            <Heart className="w-10 h-10 text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Date Ended</h2>
          <p className="text-gray-400 text-sm mb-8">
            Thanks for trying Blind Date. Better luck next time!
          </p>
          <button
            onClick={() => {
              setStage('setup')
              setMatchedUser(null)
              setSelectedMood(null)
              setRevealChoice(null)
              setPartnerChoice(null)
              setRevealResult(null)
            }}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold mb-3"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 text-sm hover:text-white transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return null
}
