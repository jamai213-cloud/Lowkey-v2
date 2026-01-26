'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Search, Play, Pause, Music as MusicIcon, 
  Clock, Share2, Plus, X, User, Disc3, Mic2
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
  const [friendStatuses, setFriendStatuses] = useState([])
  const [myStatus, setMyStatus] = useState(null)
  const [showAddToStatus, setShowAddToStatus] = useState(null)
  const audioRef = useRef(null)
  const progressRef = useRef(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(storedUser)
    setUser(userData)
    fetchMyStatus(userData.id)
    fetchFriendStatuses(userData.id)
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', updateProgress)
      audioRef.current.addEventListener('ended', () => setPlaying(null))
      return () => {
        audioRef.current?.removeEventListener('timeupdate', updateProgress)
        audioRef.current?.removeEventListener('ended', () => setPlaying(null))
      }
    }
  }, [])

  const updateProgress = () => {
    if (audioRef.current) {
      const percent = (audioRef.current.currentTime / audioRef.current.duration) * 100
      setProgress(percent || 0)
    }
  }

  const fetchMyStatus = async (userId) => {
    try {
      const res = await fetch(`/api/profile/music-status/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setMyStatus(data)
      }
    } catch (err) {
      console.error('Failed to fetch music status')
    }
  }

  const fetchFriendStatuses = async (userId) => {
    try {
      const res = await fetch(`/api/music-statuses?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setFriendStatuses(data)
      }
    } catch (err) {
      console.error('Failed to fetch friend statuses')
    }
  }

  const searchMusic = async (e) => {
    e?.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`/api/itunes/search?term=${encodeURIComponent(query)}&type=${searchType}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results || [])
      }
    } catch (err) {
      console.error('Search failed')
    }
    setLoading(false)
  }

  const playTrack = (track) => {
    if (!track.previewUrl) return

    if (playing?.id === track.id) {
      audioRef.current?.pause()
      setPlaying(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = track.previewUrl
      audioRef.current.play().catch(e => console.error('Audio error:', e))
    }
    setPlaying(track)
    setProgress(0)
  }

  const addToStatus = async (track) => {
    try {
      const res = await fetch('/api/profile/music-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, track })
      })
      if (res.ok) {
        const data = await res.json()
        setMyStatus(data)
        setShowAddToStatus(null)
        fetchFriendStatuses(user.id)
      }
    } catch (err) {
      console.error('Failed to add to status')
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const searchTypes = [
    { id: 'all', label: 'All', icon: MusicIcon },
    { id: 'song', label: 'Songs', icon: Disc3 },
    { id: 'artist', label: 'Artists', icon: Mic2 },
    { id: 'album', label: 'Albums', icon: Disc3 }
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-32">
      <audio ref={audioRef} />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0a0a0f]/95 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Music</h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <form onSubmit={searchMusic} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artists, songs, albums..."
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 text-base"
            />
          </form>

          {/* Search Type Pills */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {searchTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSearchType(type.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  searchType === type.id
                    ? 'bg-pink-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <type.icon className="w-4 h-4" />
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* My Music Status */}
        {myStatus && (
          <div className="mb-6">
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <MusicIcon className="w-4 h-4 text-pink-400" />
              Your 24hr Song
            </h2>
            <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30">
              <div className="flex items-center gap-4">
                {myStatus.artwork ? (
                  <img src={myStatus.artwork} alt="" className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-pink-500/30 flex items-center justify-center">
                    <MusicIcon className="w-8 h-8 text-pink-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{myStatus.trackName}</h3>
                  <p className="text-gray-400 text-sm truncate">{myStatus.artistName}</p>
                </div>
                {myStatus.previewUrl && (
                  <button
                    onClick={() => playTrack({ 
                      id: myStatus.trackId, 
                      previewUrl: myStatus.previewUrl,
                      name: myStatus.trackName,
                      artist: myStatus.artistName,
                      artwork: myStatus.artwork
                    })}
                    className="p-3 rounded-full bg-pink-500"
                  >
                    {playing?.id === myStatus.trackId ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Friends' Music Status */}
        {friendStatuses.length > 0 && (
          <div className="mb-6">
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              What Friends Are Playing
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {friendStatuses.filter(s => s.userId !== user?.id).map(status => (
                <button
                  key={status.id}
                  onClick={() => status.previewUrl && playTrack({
                    id: status.trackId,
                    previewUrl: status.previewUrl,
                    name: status.trackName,
                    artist: status.artistName,
                    artwork: status.artwork
                  })}
                  className="flex-shrink-0 w-36 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  {status.artwork ? (
                    <img src={status.artwork} alt="" className="w-full aspect-square rounded-lg object-cover mb-2" />
                  ) : (
                    <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center mb-2">
                      <MusicIcon className="w-10 h-10 text-pink-400" />
                    </div>
                  )}
                  <p className="text-white text-sm font-medium truncate">{status.trackName}</p>
                  <p className="text-gray-500 text-xs truncate">{status.displayName}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">
            <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-4" />
            Searching...
          </div>
        ) : results.length > 0 ? (
          <div>
            <h2 className="text-white font-semibold mb-3">Results</h2>
            <div className="space-y-2">
              {results.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  className={`p-3 rounded-xl transition-colors ${
                    playing?.id === track.id
                      ? 'bg-pink-500/20 border border-pink-500/50'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Artwork / Play Button */}
                    <button
                      onClick={() => playTrack(track)}
                      disabled={!track.previewUrl}
                      className="relative group"
                    >
                      {track.artwork ? (
                        <img src={track.artwork} alt="" className="w-14 h-14 rounded-lg object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center">
                          <MusicIcon className="w-6 h-6 text-pink-400" />
                        </div>
                      )}
                      {track.previewUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          {playing?.id === track.id ? (
                            <Pause className="w-6 h-6 text-white" />
                          ) : (
                            <Play className="w-6 h-6 text-white" />
                          )}
                        </div>
                      )}
                    </button>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium truncate">{track.name}</h3>
                        {track.explicit && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-white/20 text-white rounded">E</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                      {track.album && track.type !== 'album' && (
                        <p className="text-gray-500 text-xs truncate">{track.album}</p>
                      )}
                    </div>

                    {/* Duration & Actions */}
                    <div className="flex items-center gap-2">
                      {track.duration && (
                        <span className="text-gray-500 text-sm">{formatDuration(track.duration)}</span>
                      )}
                      <button
                        onClick={() => setShowAddToStatus(track)}
                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-pink-400 transition-colors"
                        title="Add to 24hr status"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : query && !loading ? (
          <div className="text-center text-gray-400 py-12">
            <MusicIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No results for "{query}"</p>
            <p className="text-sm mt-1">Try searching for an artist or song</p>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Search for music</p>
            <p className="text-sm mt-1">Find any artist, song, or album</p>
          </div>
        )}
      </div>

      {/* Now Playing Bar */}
      {playing && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#1a1a2e] border-t border-white/10">
          {/* Progress Bar */}
          <div className="h-1 bg-white/10">
            <div 
              className="h-full bg-pink-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="p-4 flex items-center gap-4">
            {playing.artwork ? (
              <img src={playing.artwork} alt="" className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-pink-500/30 flex items-center justify-center">
                <MusicIcon className="w-6 h-6 text-pink-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate">{playing.name}</h3>
              <p className="text-gray-400 text-sm truncate">{playing.artist}</p>
            </div>
            <button
              onClick={() => playTrack(playing)}
              className="p-3 rounded-full bg-pink-500"
            >
              <Pause className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Add to Status Modal */}
      {showAddToStatus && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowAddToStatus(null)}>
          <div className="w-full max-w-lg bg-[#1a1a2e] rounded-t-3xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Add to your 24hr status</h3>
              <button onClick={() => setShowAddToStatus(null)} className="p-2 rounded-full hover:bg-white/10">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 mb-4">
              {showAddToStatus.artwork ? (
                <img src={showAddToStatus.artwork} alt="" className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-pink-500/30 flex items-center justify-center">
                  <MusicIcon className="w-8 h-8 text-pink-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{showAddToStatus.name}</h4>
                <p className="text-gray-400 text-sm truncate">{showAddToStatus.artist}</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              This song will be shown on your profile for 24 hours. Friends can listen to it too!
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddToStatus(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => addToStatus(showAddToStatus)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
              >
                Add to Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
