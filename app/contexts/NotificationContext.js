'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const NotificationContext = createContext({})

// Web Audio API notification sound generator
const createNotificationSound = () => {
  if (typeof window === 'undefined') return null
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    return audioContext
  } catch (e) {
    console.log('Web Audio API not supported')
    return null
  }
}

export function NotificationProvider({ children }) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const audioContextRef = useRef(null)
  const lastNotificationTime = useRef(0)

  // Initialize audio context on first user interaction
  useEffect(() => {
    // Check localStorage for sound preference
    const savedPref = localStorage.getItem('lowkey_notification_sound')
    if (savedPref !== null) {
      setSoundEnabled(savedPref === 'true')
    }

    // Check if browser supports notifications
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted')
    }

    // Initialize audio context on user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = createNotificationSound()
      }
      document.removeEventListener('click', initAudio)
      document.removeEventListener('touchstart', initAudio)
    }
    
    document.addEventListener('click', initAudio)
    document.addEventListener('touchstart', initAudio)
    
    return () => {
      document.removeEventListener('click', initAudio)
      document.removeEventListener('touchstart', initAudio)
    }
  }, [])

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Notifications not supported')
      return false
    }

    if (Notification.permission === 'granted') {
      setPermissionGranted(true)
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      const granted = permission === 'granted'
      setPermissionGranted(granted)
      return granted
    }

    return false
  }, [])

  // Play notification sound using Web Audio API
  const playSound = useCallback(() => {
    if (!soundEnabled) return
    
    // Throttle sounds to prevent spam (minimum 1 second between sounds)
    const now = Date.now()
    if (now - lastNotificationTime.current < 1000) return
    lastNotificationTime.current = now

    try {
      // Initialize audio context if not done yet
      if (!audioContextRef.current) {
        audioContextRef.current = createNotificationSound()
      }
      
      const audioContext = audioContextRef.current
      if (!audioContext) return

      // Resume audio context if suspended (required for some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume()
      }

      // Create a pleasant notification chime
      const time = audioContext.currentTime
      
      // First tone (higher)
      const osc1 = audioContext.createOscillator()
      const gain1 = audioContext.createGain()
      osc1.connect(gain1)
      gain1.connect(audioContext.destination)
      osc1.frequency.setValueAtTime(880, time) // A5
      osc1.type = 'sine'
      gain1.gain.setValueAtTime(0.3, time)
      gain1.gain.exponentialRampToValueAtTime(0.01, time + 0.3)
      osc1.start(time)
      osc1.stop(time + 0.3)

      // Second tone (lower, slightly delayed)
      const osc2 = audioContext.createOscillator()
      const gain2 = audioContext.createGain()
      osc2.connect(gain2)
      gain2.connect(audioContext.destination)
      osc2.frequency.setValueAtTime(1320, time + 0.1) // E6
      osc2.type = 'sine'
      gain2.gain.setValueAtTime(0, time)
      gain2.gain.setValueAtTime(0.25, time + 0.1)
      gain2.gain.exponentialRampToValueAtTime(0.01, time + 0.4)
      osc2.start(time + 0.1)
      osc2.stop(time + 0.4)
      
    } catch (err) {
      console.log('Could not play notification sound:', err.message)
    }
  }, [soundEnabled])

  // Toggle sound enabled
  const toggleSound = useCallback(() => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)
    localStorage.setItem('lowkey_notification_sound', String(newValue))
    
    // Play test sound when enabling
    if (newValue) {
      // Initialize audio context on toggle
      if (!audioContextRef.current) {
        audioContextRef.current = createNotificationSound()
      }
      setTimeout(playSound, 100)
    }
  }, [soundEnabled, playSound])

  // Send notification with sound
  const notify = useCallback((title, options = {}) => {
    // Play sound
    playSound()

    // Show browser notification if permitted
    if (permissionGranted && 'Notification' in window) {
      try {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          silent: true, // We handle sound ourselves
          ...options
        })
      } catch (err) {
        console.log('Could not show notification:', err.message)
      }
    }
  }, [playSound, permissionGranted])

  // Notify for different events
  const notifyFriendRequest = useCallback((fromName) => {
    notify('New Friend Request', {
      body: `${fromName} wants to be your friend`,
      tag: 'friend-request'
    })
  }, [notify])

  const notifyMessage = useCallback((fromName, preview) => {
    notify('New Message', {
      body: `${fromName}: ${preview?.substring(0, 50) || 'Sent you a message'}`,
      tag: 'message'
    })
  }, [notify])

  const notifyInteraction = useCallback((type, fromName) => {
    const messages = {
      like: `${fromName} liked your profile`,
      comment: `${fromName} commented on your profile`,
      tip: `${fromName} sent you a tip!`,
      default: `${fromName} interacted with you`
    }
    notify('New Activity', {
      body: messages[type] || messages.default,
      tag: 'interaction'
    })
  }, [notify])

  return (
    <NotificationContext.Provider value={{
      soundEnabled,
      permissionGranted,
      toggleSound,
      requestPermission,
      playSound,
      notify,
      notifyFriendRequest,
      notifyMessage,
      notifyInteraction
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}

