'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Search, Play, Pause, Music as MusicIcon, 
  Clock, Plus, X, User, Disc3, Heart, Download, Upload, Loader2
} from 'lucide-react'

export default function MusicPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('all')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(null)
  const [progress, setProgress] = useState(0)
  const [myStatus, setMyStatus] = useState(null)
  const [friendStatuses, setFriendStatuses] = useState([])
  const [savedTracks, setSavedTracks] = useState([])
  const [activeTab, setActiveTab] = useState('search') // search, saved, friends
  const audioRef = useRef(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) { router.push('/'); return }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    fetchMyStatus(userData.id)
    fetchFriendStatuses(userData.id)
    fetchSavedTracks(userData.id)
  }, [router])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    
    const updateProg = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0)
    }
    const onEnd = () => setPlaying(null)
    
    audio.addEventListener('timeupdate', updateProg)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', updateProg)
      audio.removeEventListener('ended', onEnd)
    }
  }, [])

  const fetchMyStatus = async (userId) => {
    try {
      const res = await fetch(`/api/profile/music-status/${userId}`)
      if (res.ok) {
        const data = await res.json()
        if (data && data.track) setMyStatus(data)
      }
    } catch (err) { console.error('Failed to fetch status') }
  }

  const fetchFriendStatuses = async (userId) => {
    try {
      const res = await fetch(`/api/music-statuses?userId=${userId}`)
      if (res.ok) setFriendStatuses(await res.json())
    } catch (err) { console.error('Failed to fetch friend statuses') }
  }

  const fetchSavedTracks = async (userId) => {
    try {
      const res = await fetch(`/api/music/saved/${userId}`)
      if (res.ok) setSavedTracks(await res.json())
    } catch (err) { console.error('Failed to fetch saved tracks') }
  }

  const searchMusic = async (e) => {
    e?.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setResults([])
    
    try {
      // Try Deezer first (better previews)
      const deezerRes = await fetch(`/api/deezer/search?q=${encodeURIComponent(query)}`)
      if (deezerRes.ok) {
        const data = await deezerRes.json()
        if (data.results?.length > 0) {
          setResults(data.results)
          setLoading(false)
          return
        }
      }
      
      // Fallback to iTunes
      const itunesRes = await fetch(`/api/itunes/search?term=${encodeURIComponent(query)}&type=${searchType}`)
      if (itunesRes.ok) {
        const data = await itunesRes.json()
        setResults(data.results || [])
      }
    } catch (err) {
      console.error('Search failed:', err)
    }
    setLoading(false)
  }

  const playTrack = (track) => {
    const previewUrl = track.previewUrl || track.preview
    if (!previewUrl) return

    if (playing?.id === track.id) {
      audioRef.current?.pause()
      setPlaying(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = previewUrl
      audioRef.current.play().catch(e => console.error('Audio error:', e))
    }
    setPlaying(track)
    setProgress(0)
  }

  const saveTrackToProfile = async (track) => {
    try {
      const res = await fetch('/api/music/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, track })
      })
      if (res.ok) {
        fetchSavedTracks(user.id)
        alert('Track saved to your profile for 24 hours!')
      }
    } catch (err) { console.error('Failed to save track') }
  }

  const setAsStatus = async (track) => {
    try {
      const res = await fetch('/api/profile/music-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, track })
      })
      if (res.ok) {
        setMyStatus(await res.json())
        fetchFriendStatuses(user.id)
        alert('Track set as your status!')
      }
    } catch (err) { console.error('Failed to set status') }
  }

  const removeTrack = async (trackId) => {
    try {
      await fetch(`/api/music/saved/${user.id}/${trackId}`, { method: 'DELETE' })
      fetchSavedTracks(user.id)
    } catch (err) { console.error('Failed to remove track') }
  }

  const formatDuration = (ms) => {
    if (!ms) return '--:--'
    const sec = Math.floor(ms / 1000)
    return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`
  }

  if (!user) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
    <div className="animate-pulse text-white">Loading...</div>
  </div>

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-32">
      <audio ref={audioRef} />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/10">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Music</h1>
        </div>
        
        {/* Search Bar */}
        <form onSubmit={searchMusic} className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search artists, songs, albums..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:border-green-500 focus:outline-none"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setResults([]) }} 
                className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button type="submit" disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-green-500 text-black font-semibold text-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pb-3">
          {['search', 'saved', 'friends'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize
                ${activeTab === tab ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
              {tab === 'saved' ? `Saved (${savedTracks.length})` : tab}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        {/* Search Results */}
        {activeTab === 'search' && (
          <>
            {loading && (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-3" />
                <p className="text-gray-400">Searching...</p>
              </div>
            )}
            
            {!loading && results.length === 0 && query && (
              <div className="text-center py-12">
                <MusicIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No results found for "{query}"</p>
                <p className="text-gray-500 text-sm mt-1">Try a different search term</p>
              </div>
            )}
            
            {!loading && results.length === 0 && !query && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Search for your favorite music</p>
                <p className="text-gray-500 text-sm mt-1">Find artists, songs, and albums</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-2">
                <p className="text-gray-400 text-sm mb-4">{results.length} results</p>
                {results.map(track => (
                  <TrackItem 
                    key={track.id} 
                    track={track} 
                    playing={playing}
                    onPlay={() => playTrack(track)}
                    onSave={() => saveTrackToProfile(track)}
                    onSetStatus={() => setAsStatus(track)}
                    formatDuration={formatDuration}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Saved Tracks */}
        {activeTab === 'saved' && (
          <>
            {savedTracks.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No saved tracks</p>
                <p className="text-gray-500 text-sm mt-1">Save tracks from search to see them here</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-400 text-sm mb-4">Tracks saved for 24 hours</p>
                {savedTracks.map(item => (
                  <TrackItem 
                    key={item.id}
                    track={item.track}
                    playing={playing}
                    onPlay={() => playTrack(item.track)}
                    onRemove={() => removeTrack(item.id)}
                    onSetStatus={() => setAsStatus(item.track)}
                    formatDuration={formatDuration}
                    showRemove
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Friends' Statuses */}
        {activeTab === 'friends' && (
          <>
            {friendStatuses.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No friends listening</p>
                <p className="text-gray-500 text-sm mt-1">When friends set a song status, it'll appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friendStatuses.map(status => (
                  <div key={status.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        {status.displayName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-white font-medium">{status.displayName}</span>
                      <span className="text-gray-500 text-xs">is listening to</span>
                    </div>
                    {status.track && (
                      <TrackItem 
                        track={status.track}
                        playing={playing}
                        onPlay={() => playTrack(status.track)}
                        formatDuration={formatDuration}
                        compact
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Now Playing Bar */}
      {playing && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a2e] border-t border-white/10 p-3 z-50">
          <div className="flex items-center gap-3">
            <img 
              src={playing.artwork || playing.album?.cover_medium || '/placeholder.png'} 
              alt="" 
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{playing.name || playing.title}</p>
              <p className="text-gray-400 text-sm truncate">{playing.artist || playing.artist?.name}</p>
            </div>
            <button onClick={() => playTrack(playing)} className="p-3 rounded-full bg-green-500">
              <Pause className="w-5 h-5 text-black" />
            </button>
          </div>
          <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}

// Track Item Component
function TrackItem({ track, playing, onPlay, onSave, onRemove, onSetStatus, formatDuration, showRemove, compact }) {
  const isPlaying = playing?.id === track.id
  const artwork = track.artwork || track.album?.cover_medium || track.album?.cover_small
  const name = track.name || track.title
  const artist = track.artist?.name || track.artist
  const album = track.album?.title || track.album
  const duration = track.duration ? (track.duration > 1000 ? track.duration : track.duration * 1000) : null
  const hasPreview = track.previewUrl || track.preview

  return (
    <div className={`flex items-center gap-3 p-2 rounded-xl ${isPlaying ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/5 hover:bg-white/10'} transition-colors`}>
      <div className="relative">
        <img src={artwork || '/placeholder.png'} alt="" className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} rounded-lg object-cover`} />
        {hasPreview && (
          <button onClick={onPlay}
            className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 hover:opacity-100 transition-opacity ${isPlaying ? 'opacity-100' : ''}`}>
            {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
          </button>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`text-white font-medium truncate ${compact ? 'text-sm' : ''}`}>{name}</p>
        <p className={`text-gray-400 truncate ${compact ? 'text-xs' : 'text-sm'}`}>{artist}</p>
        {!compact && album && <p className="text-gray-500 text-xs truncate">{album}</p>}
      </div>
      
      {!compact && (
        <div className="flex items-center gap-1">
          {duration && (
            <span className="text-gray-500 text-xs mr-2">{formatDuration(duration)}</span>
          )}
          {onSetStatus && (
            <button onClick={onSetStatus} title="Set as status"
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-green-400">
              <Upload className="w-4 h-4" />
            </button>
          )}
          {onSave && (
            <button onClick={onSave} title="Save to profile"
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-pink-400">
              <Heart className="w-4 h-4" />
            </button>
          )}
          {showRemove && onRemove && (
            <button onClick={onRemove} title="Remove"
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
