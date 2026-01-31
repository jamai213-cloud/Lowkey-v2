'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Gamepad2, Users, Trophy, X, Check } from 'lucide-react'

// Simple Snake Game Component
const SnakeGame = ({ onClose }) => {
  const [gameState, setGameState] = useState('ready') // ready, playing, over
  const [score, setScore] = useState(0)
  const [snake, setSnake] = useState([[5, 5]])
  const [food, setFood] = useState([10, 10])
  const [direction, setDirection] = useState('RIGHT')
  const [touchStart, setTouchStart] = useState(null)
  const gridSize = 20

  useEffect(() => {
    if (gameState !== 'playing') return

    const handleKey = (e) => {
      e.preventDefault()
      if (e.key === 'ArrowUp' && direction !== 'DOWN') setDirection('UP')
      if (e.key === 'ArrowDown' && direction !== 'UP') setDirection('DOWN')
      if (e.key === 'ArrowLeft' && direction !== 'RIGHT') setDirection('LEFT')
      if (e.key === 'ArrowRight' && direction !== 'LEFT') setDirection('RIGHT')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [direction, gameState])

  useEffect(() => {
    if (gameState !== 'playing') return

    const interval = setInterval(() => {
      setSnake(prev => {
        const head = [...prev[0]]
        if (direction === 'UP') head[1]--
        if (direction === 'DOWN') head[1]++
        if (direction === 'LEFT') head[0]--
        if (direction === 'RIGHT') head[0]++

        // Wall collision
        if (head[0] < 0 || head[0] >= gridSize || head[1] < 0 || head[1] >= gridSize) {
          setGameState('over')
          return prev
        }

        // Self collision
        if (prev.some(segment => segment[0] === head[0] && segment[1] === head[1])) {
          setGameState('over')
          return prev
        }

        const newSnake = [head, ...prev]

        // Food collision
        if (head[0] === food[0] && head[1] === food[1]) {
          setScore(s => s + 10)
          setFood([Math.floor(Math.random() * gridSize), Math.floor(Math.random() * gridSize)])
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }, 150)

    return () => clearInterval(interval)
  }, [direction, food, gameState])

  const startGame = () => {
    setSnake([[5, 5]])
    setFood([10, 10])
    setDirection('RIGHT')
    setScore(0)
    setGameState('playing')
  }

  // Touch controls - lower threshold for better responsiveness
  const handleTouchStart = (e) => {
    e.preventDefault()
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
  }

  const handleTouchEnd = (e) => {
    if (!touchStart) return
    const dx = e.changedTouches[0].clientX - touchStart.x
    const dy = e.changedTouches[0].clientY - touchStart.y
    
    // Lower threshold (15px) for better responsiveness
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 15 && direction !== 'LEFT') setDirection('RIGHT')
      else if (dx < -15 && direction !== 'RIGHT') setDirection('LEFT')
    } else {
      if (dy > 15 && direction !== 'UP') setDirection('DOWN')
      else if (dy < -15 && direction !== 'DOWN') setDirection('UP')
    }
    setTouchStart(null)
  }

  const handleControlBtn = (dir) => {
    if (dir === 'UP' && direction !== 'DOWN') setDirection('UP')
    if (dir === 'DOWN' && direction !== 'UP') setDirection('DOWN')
    if (dir === 'LEFT' && direction !== 'RIGHT') setDirection('LEFT')
    if (dir === 'RIGHT' && direction !== 'LEFT') setDirection('RIGHT')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="flex justify-between items-center w-full max-w-md mb-4">
        <h2 className="text-xl text-white font-semibold">Snake</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="text-white mb-2 text-lg font-bold">Score: {score}</div>

      <div 
        className="border-2 border-green-500/50 rounded-lg overflow-hidden touch-none"
        style={{ width: gridSize * 15, height: gridSize * 15 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={(e) => e.preventDefault()}
      >
        <div className="relative w-full h-full bg-gray-900">
          {snake.map((segment, i) => (
            <div
              key={i}
              className="absolute bg-green-500 rounded-sm"
              style={{
                width: 15 - 2,
                height: 15 - 2,
                left: segment[0] * 15 + 1,
                top: segment[1] * 15 + 1
              }}
            />
          ))}
          <div
            className="absolute bg-red-500 rounded-full"
            style={{
              width: 15 - 2,
              height: 15 - 2,
              left: food[0] * 15 + 1,
              top: food[1] * 15 + 1
            }}
          />
        </div>
      </div>

      {/* D-Pad Controls - Always visible when playing, bigger buttons */}
      {gameState === 'playing' && (
        <div className="mt-6 relative w-44 h-44">
          {/* Up */}
          <button 
            onTouchStart={(e) => { e.preventDefault(); handleControlBtn('UP'); }}
            onClick={() => handleControlBtn('UP')} 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-xl bg-green-500/30 border-2 border-green-500/50 flex items-center justify-center text-white text-2xl font-bold active:bg-green-500/60 active:scale-95 transition-all"
          >
            ▲
          </button>
          {/* Down */}
          <button 
            onTouchStart={(e) => { e.preventDefault(); handleControlBtn('DOWN'); }}
            onClick={() => handleControlBtn('DOWN')} 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-xl bg-green-500/30 border-2 border-green-500/50 flex items-center justify-center text-white text-2xl font-bold active:bg-green-500/60 active:scale-95 transition-all"
          >
            ▼
          </button>
          {/* Left */}
          <button 
            onTouchStart={(e) => { e.preventDefault(); handleControlBtn('LEFT'); }}
            onClick={() => handleControlBtn('LEFT')} 
            className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-xl bg-green-500/30 border-2 border-green-500/50 flex items-center justify-center text-white text-2xl font-bold active:bg-green-500/60 active:scale-95 transition-all"
          >
            ◀
          </button>
          {/* Right */}
          <button 
            onTouchStart={(e) => { e.preventDefault(); handleControlBtn('RIGHT'); }}
            onClick={() => handleControlBtn('RIGHT')} 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-xl bg-green-500/30 border-2 border-green-500/50 flex items-center justify-center text-white text-2xl font-bold active:bg-green-500/60 active:scale-95 transition-all"
          >
            ▶
          </button>
          {/* Center indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-green-500/50" />
          </div>
        </div>
      )}

      {gameState === 'ready' && (
        <button onClick={startGame} className="mt-6 px-8 py-4 rounded-xl bg-green-500 text-white font-bold text-lg shadow-lg shadow-green-500/30">
          Start Game
        </button>
      )}
      {gameState === 'over' && (
        <div className="mt-6 text-center">
          <p className="text-red-400 text-xl mb-3">Game Over! Score: {score}</p>
          <button onClick={startGame} className="px-8 py-4 rounded-xl bg-green-500 text-white font-bold text-lg shadow-lg shadow-green-500/30">
            Play Again
          </button>
        </div>
      )}
      <p className="text-gray-400 text-sm mt-4">Tap arrows or swipe on game area to move</p>
    </div>
  )
}

// Simple Pac-Man Style Game
const PacManGame = ({ onClose }) => {
  const [score, setScore] = useState(0)
  const [position, setPosition] = useState({ x: 10, y: 10 })
  const [dots, setDots] = useState([])
  const [gameState, setGameState] = useState('ready')
  const [touchStart, setTouchStart] = useState(null)
  const gridSize = 20

  useEffect(() => {
    // Initialize dots
    const initialDots = []
    for (let i = 0; i < gridSize; i += 2) {
      for (let j = 0; j < gridSize; j += 2) {
        if (!(i === 10 && j === 10)) {
          initialDots.push({ x: i, y: j })
        }
      }
    }
    setDots(initialDots)
  }, [])

  useEffect(() => {
    if (gameState !== 'playing') return

    const handleKey = (e) => {
      e.preventDefault()
      setPosition(prev => {
        let newPos = { ...prev }
        if (e.key === 'ArrowUp' && prev.y > 0) newPos.y--
        if (e.key === 'ArrowDown' && prev.y < gridSize - 1) newPos.y++
        if (e.key === 'ArrowLeft' && prev.x > 0) newPos.x--
        if (e.key === 'ArrowRight' && prev.x < gridSize - 1) newPos.x++
        return newPos
      })
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [gameState])

  useEffect(() => {
    if (gameState !== 'playing') return
    
    const dotIndex = dots.findIndex(d => d.x === position.x && d.y === position.y)
    if (dotIndex !== -1) {
      setDots(prev => prev.filter((_, i) => i !== dotIndex))
      setScore(s => s + 10)
    }

    if (dots.length === 0 && score > 0) {
      setGameState('won')
    }
  }, [position, dots, gameState, score])

  const startGame = () => {
    setPosition({ x: 10, y: 10 })
    setScore(0)
    const initialDots = []
    for (let i = 0; i < gridSize; i += 2) {
      for (let j = 0; j < gridSize; j += 2) {
        if (!(i === 10 && j === 10)) {
          initialDots.push({ x: i, y: j })
        }
      }
    }
    setDots(initialDots)
    setGameState('playing')
  }

  // Touch controls - lower threshold
  const handleTouchStart = (e) => {
    e.preventDefault()
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
  }

  const handleTouchEnd = (e) => {
    if (!touchStart) return
    const dx = e.changedTouches[0].clientX - touchStart.x
    const dy = e.changedTouches[0].clientY - touchStart.y
    
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 15) movePlayer('RIGHT')
      else if (dx < -15) movePlayer('LEFT')
    } else {
      if (dy > 15) movePlayer('DOWN')
      else if (dy < -15) movePlayer('UP')
    }
    setTouchStart(null)
  }

  const movePlayer = (dir) => {
    setPosition(prev => {
      let newPos = { ...prev }
      if (dir === 'UP' && prev.y > 0) newPos.y--
      if (dir === 'DOWN' && prev.y < gridSize - 1) newPos.y++
      if (dir === 'LEFT' && prev.x > 0) newPos.x--
      if (dir === 'RIGHT' && prev.x < gridSize - 1) newPos.x++
      return newPos
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="flex justify-between items-center w-full max-w-md mb-4">
        <h2 className="text-xl text-white font-semibold">Pac-Man</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="text-white mb-2 text-lg font-bold">Score: {score} | Dots: {dots.length}</div>

      <div 
        className="border-2 border-yellow-500/50 rounded-lg overflow-hidden touch-none"
        style={{ width: gridSize * 15, height: gridSize * 15 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={(e) => e.preventDefault()}
      >
        <div className="relative w-full h-full bg-gray-900">
          {dots.map((dot, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                width: 6,
                height: 6,
                left: dot.x * 15 + 5,
                top: dot.y * 15 + 5
              }}
            />
          ))}
          <div
            className="absolute bg-yellow-400 rounded-full"
            style={{
              width: 12,
              height: 12,
              left: position.x * 15 + 2,
              top: position.y * 15 + 2
            }}
          />
        </div>
      </div>

      {/* D-Pad Controls - Always visible when playing, bigger buttons */}
      {gameState === 'playing' && (
        <div className="mt-6 relative w-44 h-44">
          {/* Up */}
          <button 
            onTouchStart={(e) => { e.preventDefault(); movePlayer('UP'); }}
            onClick={() => movePlayer('UP')} 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-xl bg-yellow-500/30 border-2 border-yellow-500/50 flex items-center justify-center text-white text-2xl font-bold active:bg-yellow-500/60 active:scale-95 transition-all"
          >
            ▲
          </button>
          {/* Down */}
          <button 
            onTouchStart={(e) => { e.preventDefault(); movePlayer('DOWN'); }}
            onClick={() => movePlayer('DOWN')} 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-xl bg-yellow-500/30 border-2 border-yellow-500/50 flex items-center justify-center text-white text-2xl font-bold active:bg-yellow-500/60 active:scale-95 transition-all"
          >
            ▼
          </button>
          {/* Left */}
          <button 
            onTouchStart={(e) => { e.preventDefault(); movePlayer('LEFT'); }}
            onClick={() => movePlayer('LEFT')} 
            className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-xl bg-yellow-500/30 border-2 border-yellow-500/50 flex items-center justify-center text-white text-2xl font-bold active:bg-yellow-500/60 active:scale-95 transition-all"
          >
            ◀
          </button>
          {/* Right */}
          <button 
            onTouchStart={(e) => { e.preventDefault(); movePlayer('RIGHT'); }}
            onClick={() => movePlayer('RIGHT')} 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-xl bg-yellow-500/30 border-2 border-yellow-500/50 flex items-center justify-center text-white text-2xl font-bold active:bg-yellow-500/60 active:scale-95 transition-all"
          >
            ▶
          </button>
          {/* Center indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500/50" />
          </div>
        </div>
      )}

      {gameState === 'ready' && (
        <button onClick={startGame} className="mt-6 px-8 py-4 rounded-xl bg-yellow-500 text-black font-bold text-lg shadow-lg shadow-yellow-500/30">
          Start Game
        </button>
      )}
      {gameState === 'won' && (
        <div className="mt-6 text-center">
          <p className="text-green-400 text-xl mb-3">You Won! Score: {score}</p>
          <button onClick={startGame} className="px-8 py-4 rounded-xl bg-yellow-500 text-black font-bold text-lg shadow-lg shadow-yellow-500/30">
            Play Again
          </button>
        </div>
      )}
      <p className="text-gray-400 text-sm mt-4">Tap arrows or swipe on game area to move</p>
    </div>
  )
}

// Tic-Tac-Toe Component
const TicTacToe = ({ user, onClose }) => {
  const [invites, setInvites] = useState([])
  const [friends, setFriends] = useState([])
  const [session, setSession] = useState(null)
  const [view, setView] = useState('menu') // menu, invite, game
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchInvites()
    fetchFriends()
  }, [])

  const fetchInvites = async () => {
    try {
      const res = await fetch(`/api/games/invites/${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setInvites(data)
      }
    } catch (err) {
      console.error('Failed to fetch invites')
    }
  }

  const fetchFriends = async () => {
    try {
      const res = await fetch(`/api/friends/${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setFriends(data)
      }
    } catch (err) {
      console.error('Failed to fetch friends')
    }
  }

  const sendInvite = async (friendId) => {
    setLoading(true)
    try {
      await fetch('/api/games/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'tictactoe',
          fromUserId: user.id,
          toUserId: friendId
        })
      })
      alert('Invite sent!')
      setView('menu')
    } catch (err) {
      console.error('Failed to send invite')
    }
    setLoading(false)
  }

  const acceptInvite = async (inviteId) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/games/invite/${inviteId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.ok) {
        const sessionData = await res.json()
        setSession(sessionData)
        setView('game')
      }
    } catch (err) {
      console.error('Failed to accept invite')
    }
    setLoading(false)
  }

  const makeMove = async (position) => {
    if (!session || session.currentTurn !== user.id || session.board[position]) return

    try {
      const res = await fetch(`/api/games/session/${session.id}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, position })
      })
      if (res.ok) {
        const updated = await res.json()
        setSession(updated)
      }
    } catch (err) {
      console.error('Failed to make move')
    }
  }

  const refreshGame = async () => {
    if (!session) return
    try {
      const res = await fetch(`/api/games/session/${session.id}`)
      if (res.ok) {
        const data = await res.json()
        setSession(data)
      }
    } catch (err) {
      console.error('Failed to refresh game')
    }
  }

  useEffect(() => {
    if (view === 'game' && session?.status === 'active') {
      const interval = setInterval(refreshGame, 2000)
      return () => clearInterval(interval)
    }
  }, [view, session])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="flex justify-between items-center w-full max-w-md mb-4">
        <h2 className="text-xl text-white font-semibold">Tic-Tac-Toe</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {view === 'menu' && (
        <div className="w-full max-w-md space-y-4">
          <button
            onClick={() => setView('invite')}
            className="w-full py-4 rounded-xl bg-amber-500 text-black font-semibold"
          >
            Invite a Friend
          </button>

          {invites.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-white font-medium">Pending Invites</h3>
              {invites.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-white/10">
                  <span className="text-white">{inv.fromUser?.displayName || 'Unknown'}</span>
                  <button
                    onClick={() => acceptInvite(inv.id)}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'invite' && (
        <div className="w-full max-w-md space-y-4">
          <button onClick={() => setView('menu')} className="text-gray-400 text-sm mb-2">
            ← Back
          </button>
          <h3 className="text-white font-medium">Select a Friend</h3>
          {friends.length === 0 ? (
            <p className="text-gray-400">No friends yet. Add friends first!</p>
          ) : (
            friends.map(friend => (
              <button
                key={friend.id}
                onClick={() => sendInvite(friend.id)}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20"
              >
                <span className="text-white">{friend.displayName}</span>
                <span className="text-amber-400 text-sm">Invite</span>
              </button>
            ))
          )}
        </div>
      )}

      {view === 'game' && session && (
        <div className="text-center">
          <div className="text-white mb-4">
            {session.status === 'active' && (
              session.currentTurn === user.id ? 'Your turn!' : 'Waiting for opponent...'
            )}
            {session.status === 'won' && (
              session.winner === user.id ? '🎉 You Won!' : 'You Lost!'
            )}
            {session.status === 'draw' && "It's a Draw!"}
          </div>

          <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
            {session.board.map((cell, i) => (
              <button
                key={i}
                onClick={() => makeMove(i)}
                disabled={session.status !== 'active' || session.currentTurn !== user.id || cell}
                className={`w-14 h-14 rounded-xl text-2xl font-bold ${
                  cell ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'
                } ${cell === 'X' ? 'text-amber-400' : 'text-pink-400'}`}
              >
                {cell}
              </button>
            ))}
          </div>

          {session.status !== 'active' && (
            <button
              onClick={() => { setSession(null); setView('menu'); }}
              className="mt-4 px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold"
            >
              Back to Menu
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function GamesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [activeGame, setActiveGame] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('lowkey_user')
    if (!storedUser) {
      router.push('/')
      return
    }
    setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  const games = [
    { id: 'snake', name: 'Snake', desc: 'Classic snake game', icon: '🐍', color: 'from-green-500 to-emerald-600' },
    { id: 'pacman', name: 'Pac-Man', desc: 'Collect all the dots', icon: '👾', color: 'from-yellow-400 to-orange-500' },
    { id: 'tictactoe', name: 'Tic-Tac-Toe', desc: '1v1 with friends', icon: '⭕', color: 'from-purple-500 to-pink-500' }
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-white/10">
        <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">Games</h1>
      </header>

      <div className="p-4 space-y-4">
        {games.map(game => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl`}>
                {game.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-white font-semibold">{game.name}</h3>
                <p className="text-gray-400 text-sm">{game.desc}</p>
              </div>
              {game.id === 'tictactoe' && (
                <Users className="w-5 h-5 text-purple-400" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Game Modals */}
      {activeGame === 'snake' && <SnakeGame onClose={() => setActiveGame(null)} />}
      {activeGame === 'pacman' && <PacManGame onClose={() => setActiveGame(null)} />}
      {activeGame === 'tictactoe' && <TicTacToe user={user} onClose={() => setActiveGame(null)} />}
    </div>
  )
}
