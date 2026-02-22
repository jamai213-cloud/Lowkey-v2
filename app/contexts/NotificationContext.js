'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const NotificationContext = createContext({})

// Simple notification sound (base64 encoded short beep)
const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleGRkk8HWu4FJIA1IjtLcmk0hFVuKwN+rbzkPOnLS55N0PiM4gtjiqVkWJGqLz+KnVBEkbpjN3pt9TCs/l9jgpF8nK5DM28l0aDY6idDenVIkJHao09aZUxAfZpHO2KB3TCgvhM3bn1YuL5jS2KBRICyGvduheWpCN4HI2J9aIiqI1NahSTsgbqLT05FBMyuDxdeTPDI2i9bZjTUyRIrT05FCJDN8wNWKMzBMnNHTjDonVJ7P0Hg3Rm6a0M18Lk+W0NN6Mkmb0tJ1M1qc0NF3LFqe0NJ7LlyZzdB5LmOa0M53MWaZ0Ml2NmyZ0Md0OnOW0MNwPoOW0L5rQ46Sz7pnSpeQzbdkTp6OzLJhU6WMy65cWqyJyqhYYLKHyaRVZriDyZ5QbbyAyZhNc8B9yZJIeMV6yYxFfsZ2yYdBhMhzyIE9is1uxno5kM9qxHQ1ltVmwG0xnNdjvGYtn99gumApsONduVorufZbtkQov/VZsjop/wZYrS4mDxxWqCImIzFVoyEdQUlToB0bU1JRnRoZZFhQmhcYdF1OlxQXgWJMlBEWjWVLkQ4WmWhJjgwVpWpIiwsUr2xGiAkTuG5FhQcTwHBEggYSyHFDfwURz3NDfQQQ1HRDfAMP2nVCewIO33dCegIO4XdCeQEN4nhBdwEM4npBdwEM43pBdwEM43pAdwEL4npBdgEL4npBdgEL4XpAdgEL4HpAdgEL33lAdgEL3nlAdQEL3XlAdQEM23hAdQEM2XhAdAEM2HdAdAEM13dAdAAM1ndAdAAM1XZAdAAM1HZAdAAM03VAdAAM0nVAdAAM0XRAdAAMz3RAdAAMznRAdAAMzXRAdAAMyHRAdAAMx3NAdAAMxnNAdAAMxXNAdAAMxHNAdAAMwXNAdAAMv3NAdAAMvXJAdAAMu3JAdAAMuXJAdAAMt3JAdAAMs3JAdAAMsXJAdAAMr3JAdAAMrXJAdAAMq3JAdAAMp3JAdAAMo3JAdAAMn3JAdAAMmXJAdAAMlnJAdAAMkXJAdAAMjXJAdAAMiXJAdAAMhXJAdAAMgXJAdAAMfXJAdAAMeXJAdAAMdXJAdAAMcXJAdAAMbXJAdAAMaXJAdAAMZXJAdAAMYXJAdAAMXXJAdAAMWXJAdAAMVXJAdAAMUXJAdAAMTXJAdAAMSXJAdAAMRXJAdAAMQXJAdAAMPXJAdAAMOXJAdAAMNXJAdAAMMXJAdAAMLXJAdAAMKXJAdAAMJXJAdAAMIXJAdAAMHXJAdAAMGXJAdAAMFXJAdAAMEXJAdAAMDXJAdAAMCXJAdAAMBXJAdAAMAXJAdAAL/XJAdAAL+XJAdAAL9XJAdAAL8XJAdAAL7XJAdAAL6XJAdAAL5XJAdAAL4XJAdAAL3XJAdAAL2XJAdAAL1XJAdAAL0XJAdAALzXJAdAALyXJAdAALxXJAdAALwXJAdAALvXJAdAALuXJAdAALtXJAdAALsXJAdAALrXJAdAALqXJAdAALpXJAdAALoXJAdAALnXJAdAALmXJAdAALlXJAdAALkXJAdAALjXJAdAALiXJAdAALhXJAdAALgXJAdAALfXJAdAALeXJAdAALdXJAdAALcXJAdAALbXJAdAALaXJAdAALZXJAdAALYXJAdAALXXJAdAALWXJAdAALVXJAdAALUXJAdAALTXJAdAALSXJAdAALRXJAdAALQXJAdAALPXJAdAALOXJAdAALNXJAdAALMXJAdAALLXJAdAALKXJAdAALJXJAdAALIXJAdAALHXJAdAALGXJAdAALFXJAdAALEXJAdAALDXJAdAALCXJAdAALBXJAdAALAXJAdAAK/XJAdAAK+XJAdAAK9XJAdAAK8XJAdAAK7XJAdAAK6XJAdAAK5XJAdAAK4XJAdAAK3XJAdAAK2XJAdAAK1XJAdAAK0XJAdAAKzXJAdAAKyXJAdAAKxXJAdAAKwXJAdAAKvXJAdAAKuXJAdAAKtXJAdAAKsXJAdAAKrXJAdAAKqXJAdAAKpXJAdAAKoXJAdAAKnXJAdAAKmXJAdAAKlXJAdAAKkXJAdAAKjXJAdAAKiXJAdAAKhXJAdAAKgXJAdAAKfXJAdAAKeXJAdAAKdXJAdAAKcXJAdAAKbXJAdAAKaXJAdAAKZXJAdAAKYXJAdAAKXXJAdAAKWXJAdAAKVXJAdAAKUXJAdAAKTXJAdAAKSXJAdAAKRXJAdAAKQXJAdAAKPXJAdAAKOXJAdAAKNXJAdAAKMXJAdAAKLXJAdAAKKXJAdAAKJXJAdAAKIXJAdAAKHXJAdAAKGXJAdAAKFXJAdAAKEXJAdAAKDXJAdAAKCXJAdAAKBXJAdAAKAXJAdAAJ/XJAdAAJ+XJAdAAJ9XJAdAAJ8XJAdAAJ7XJAdAAJ6XJAdAAJ5XJAdAAJ4XJAdAAJ3XJAdAAJ2XJAdAAJ1XJAdAAJ0XJAdAAJzXJAdAAJyXJAdAAJxXJAdAAJwXJAdAAJvXJAdAAJuXJAdAAJtXJAdAAJsXJAdAAJrXJAdAAJqXJAdAAJpXJAdAAJoXJAdAAJnXJAdAAJmXJAdAAJlXJAdAAJkXJAdAAJjXJAdAAJiXJAdAAJhXJAdAAJgXJAdAAJfXJAdAAJeXJAdAAJdXJAdAAJcXJAdAAJbXJAdAAJaXJAdAAJZXJAdAAJYXJAdAAJXXJAdAAJWXJAdAAJVXJAdAAJUXJAdAAJTXJAdAAJSXJAdAAJRXJAdAAJQXJAdAAJPXJAdAAJOXJAdAAJNXJAdAAJMXJAdAAJLXJAdAAJKXJAdAAJJXJAdAAJIXJAdAAJHXJAdAAJGXJAdAAJFXJAdAAJEXJA='

export function NotificationProvider({ children }) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const audioRef = useRef(null)
  const lastNotificationTime = useRef(0)

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL)
    audioRef.current.volume = 0.5
    
    // Check localStorage for sound preference
    const savedPref = localStorage.getItem('lowkey_notification_sound')
    if (savedPref !== null) {
      setSoundEnabled(savedPref === 'true')
    }

    // Check if browser supports notifications
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted')
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

  // Play notification sound
  const playSound = useCallback(() => {
    if (!soundEnabled || !audioRef.current) return
    
    // Throttle sounds to prevent spam (minimum 1 second between sounds)
    const now = Date.now()
    if (now - lastNotificationTime.current < 1000) return
    lastNotificationTime.current = now

    try {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(err => {
        // Autoplay might be blocked, need user interaction
        console.log('Could not play notification sound:', err.message)
      })
    } catch (err) {
      console.error('Error playing notification sound:', err)
    }
  }, [soundEnabled])

  // Toggle sound enabled
  const toggleSound = useCallback(() => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)
    localStorage.setItem('lowkey_notification_sound', String(newValue))
    
    // Play test sound when enabling
    if (newValue && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }, [soundEnabled])

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
