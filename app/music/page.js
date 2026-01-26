'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, Pause, Bookmark, Download, Music as MusicIcon } from 'lucide-react'

export default function MusicPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [tracks, setTracks] = useState([])
  const [savedTracks, setSavedTracks] = useState([])
  const [playing, setPlaying] = useState(null)
  const [loading, setLoading] = useState(true)
  const audioRef = useRef(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    fetchTracks()
    fetchSaved(userData.id)
  }, [])

  const fetchTracks = async () => {
    try {
      const res = await fetch('/api/music/tracks')
      if (res.ok) {
        const data = await res.json()
        setTracks(data)
      }
    } catch (err) {
      console.error('Failed to fetch tracks')
    }
    setLoading(false)
  }

  const fetchSaved = async (userId) => {
    try {
      const res = await fetch(`/api/music/saved/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setSavedTracks(data)
      }
    } catch (err) {
      console.error('Failed to fetch saved tracks')
    }
  }

  const togglePlay = (track) => {
    if (playing?.id === track.id) {
      audioRef.current?.pause()
      setPlaying(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    setPlaying(track)
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = track.clipUrl
        audioRef.current.play().catch(e => console.error('Audio error:', e))
      }
    }, 100)
  }

  const toggleSave = async (track) => {
    const isSaved = savedTracks.includes(track.id)
    const endpoint = isSaved ? '/api/music/unsave' : '/api/music/save'
    
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, trackId: track.id })
      })
      fetchSaved(user.id)
    } catch (err) {
      console.error('Failed to toggle save')
    }
  }

  const downloadTrack = (track) => {
    window.open(track.clipUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={() => setPlaying(null)} />

      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-white/10">
        <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">Music</h1>
      </header>

      <div className="p-4">
        {/* Now Playing */}
        {playing && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                <MusicIcon className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Now Playing</p>
                <h2 className="text-white text-lg font-semibold">{playing.title}</h2>
                <p className="text-gray-400 text-sm">{playing.artist}</p>
              </div>
              <button 
                onClick={() => togglePlay(playing)}
                className="p-4 rounded-full bg-pink-500 text-white"
              >
                <Pause className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Tracks */}
        <h2 className="text-white font-semibold mb-3">Featured Tracks</h2>
        <div className="space-y-3">
          {tracks.map((track) => (
            <div
              key={track.id}
              className={`p-4 rounded-xl transition-colors ${
                playing?.id === track.id 
                  ? 'bg-pink-500/20 border border-pink-500/50' 
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => togglePlay(track)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    playing?.id === track.id ? 'bg-pink-500' : 'bg-white/10'
                  }`}
                >
                  {playing?.id === track.id ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white" />
                  )}
                </button>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{track.title}</h3>
                  <p className="text-gray-400 text-sm">{track.artist} • {track.duration}</p>
                </div>
                <button
                  onClick={() => toggleSave(track)}
                  className={`p-2 rounded-full hover:bg-white/10 ${
                    savedTracks.includes(track.id) ? 'text-amber-400' : 'text-gray-400'
                  }`}
                >
                  <Bookmark className="w-5 h-5" fill={savedTracks.includes(track.id) ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => downloadTrack(track)}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-400"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Saved Tracks Info */}
        {savedTracks.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <p className="text-amber-400 text-sm">
              <Bookmark className="w-4 h-4 inline mr-1" />
              You have {savedTracks.length} saved track(s)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
