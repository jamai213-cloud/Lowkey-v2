'use client'

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const NotificationSoundContext = createContext(null)

// Simple notification sound (using Web Audio API)
const createNotificationSound = () => {
  if (typeof window === 'undefined') return null
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    return {
      play: (type = 'default') => {
        // Frequencies for different notification types
        const frequencies = {
          default: [800, 1000],
          message: [600, 800, 1000],
          friend_request: [400, 600, 800],
          success: [600, 800, 1000, 1200]
        }
        
        const freqs = frequencies[type] || frequencies.default
        
        freqs.forEach((freq, i) => {
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1)
          oscillator.type = 'sine'
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.1)
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + i * 0.1 + 0.2)
          
          oscillator.start(audioContext.currentTime + i * 0.1)
          oscillator.stop(audioContext.currentTime + i * 0.1 + 0.2)
        })
      }
    }
  } catch (e) {
    console.error('Audio context not supported')
    return null
  }
}

export function NotificationSoundProvider({ children }) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastNotificationCount, setLastNotificationCount] = useState(0)
  const soundRef = useRef(null)
  
  useEffect(() => {
    // Check localStorage for sound preference
    const pref = localStorage.getItem('lowkey_sound_enabled')
    if (pref !== null) {
      setSoundEnabled(pref === 'true')
    }
    
    // Initialize sound system
    soundRef.current = createNotificationSound()
  }, [])
  
  const toggleSound = useCallback(() => {
    const newVal = !soundEnabled
    setSoundEnabled(newVal)
    localStorage.setItem('lowkey_sound_enabled', String(newVal))
  }, [soundEnabled])
  
  const playNotificationSound = useCallback((type = 'default') => {
    if (soundEnabled && soundRef.current) {
      soundRef.current.play(type)
    }
  }, [soundEnabled])
  
  // Check for new notifications
  const checkNewNotifications = useCallback((currentCount) => {
    if (currentCount > lastNotificationCount && lastNotificationCount > 0) {
      playNotificationSound('default')
    }
    setLastNotificationCount(currentCount)
  }, [lastNotificationCount, playNotificationSound])
  
  return (
    <NotificationSoundContext.Provider value={{
      soundEnabled,
      toggleSound,
      playNotificationSound,
      checkNewNotifications
    }}>
      {children}
    </NotificationSoundContext.Provider>
  )
}

export function useNotificationSound() {
  const context = useContext(NotificationSoundContext)
  if (!context) {
    // Return a noop version if not in provider
    return {
      soundEnabled: false,
      toggleSound: () => {},
      playNotificationSound: () => {},
      checkNewNotifications: () => {}
    }
  }
  return context
}
