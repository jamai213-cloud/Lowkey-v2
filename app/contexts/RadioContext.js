'use client'

import { createContext, useContext, useState, useRef, useEffect } from 'react'

const RadioContext = createContext(null)

export function RadioProvider({ children }) {
  const [currentStation, setCurrentStation] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const audioRef = useRef(null)

  // Initialize audio element once
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = volume
      
      // Restore state from localStorage
      const saved = localStorage.getItem('lowkey_radio')
      if (saved) {
        try {
          const { station, playing } = JSON.parse(saved)
          if (station) {
            setCurrentStation(station)
            // Don't auto-play on restore - user must tap to resume
          }
        } catch (e) {}
      }

      // Handle audio events
      audioRef.current.addEventListener('play', () => setIsPlaying(true))
      audioRef.current.addEventListener('pause', () => setIsPlaying(false))
      audioRef.current.addEventListener('error', (e) => {
        console.error('Radio stream error:', e)
        setIsPlaying(false)
      })
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  // Save state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lowkey_radio', JSON.stringify({
        station: currentStation,
        playing: isPlaying
      }))
    }
  }, [currentStation, isPlaying])

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const playStation = (station) => {
    if (!audioRef.current) return

    // If same station, toggle play/pause
    if (currentStation?.id === station.id) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(console.error)
      }
      return
    }

    // New station
    audioRef.current.pause()
    audioRef.current.src = station.streamUrl
    audioRef.current.load()
    setCurrentStation(station)
    audioRef.current.play().catch(console.error)
  }

  const stopRadio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    setCurrentStation(null)
    setIsPlaying(false)
  }

  const togglePlay = () => {
    if (!audioRef.current || !currentStation) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(console.error)
    }
  }

  return (
    <RadioContext.Provider value={{
      currentStation,
      isPlaying,
      volume,
      setVolume,
      playStation,
      stopRadio,
      togglePlay
    }}>
      {children}
    </RadioContext.Provider>
  )
}

export function useRadio() {
  const context = useContext(RadioContext)
  if (!context) {
    throw new Error('useRadio must be used within RadioProvider')
  }
  return context
}
