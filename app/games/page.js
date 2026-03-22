'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, X, Pause, Play, RotateCcw } from 'lucide-react'

// Classic Snake Game with Pause
const SnakeGame = ({ onClose }) => {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('ready') // ready, playing, paused, over
  const [score, setScore] = useState(0)
  const directionRef = useRef('RIGHT')
  const snakeRef = useRef([{x: 10, y: 10}])
  const foodRef = useRef({x: 15, y: 10})
  const gameLoopRef = useRef(null)

  const GRID = 20
  const CELL = 15

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Grid
    ctx.strokeStyle = '#252545'
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL, 0)
      ctx.lineTo(i * CELL, GRID * CELL)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * CELL)
      ctx.lineTo(GRID * CELL, i * CELL)
      ctx.stroke()
    }
    
    // Snake
    snakeRef.current.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#4ade80' : '#22c55e'
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2)
    })
    
    // Food
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(foodRef.current.x * CELL + CELL/2, foodRef.current.y * CELL + CELL/2, CELL/2 - 2, 0, Math.PI * 2)
    ctx.fill()
    
    // Paused overlay
    if (gameState === 'paused') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 24px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('PAUSED', canvas.width/2, canvas.height/2)
    }
  }, [gameState])

  const spawnFood = useCallback(() => {
    let newFood
    do {
      newFood = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }
    } while (snakeRef.current.some(s => s.x === newFood.x && s.y === newFood.y))
    foodRef.current = newFood
  }, [])

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return
    
    const head = { ...snakeRef.current[0] }
    
    if (directionRef.current === 'UP') head.y--
    if (directionRef.current === 'DOWN') head.y++
    if (directionRef.current === 'LEFT') head.x--
    if (directionRef.current === 'RIGHT') head.x++
    
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
      setGameState('over')
      return
    }
    
    if (snakeRef.current.some(s => s.x === head.x && s.y === head.y)) {
      setGameState('over')
      return
    }
    
    snakeRef.current.unshift(head)
    
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore(s => s + 10)
      spawnFood()
    } else {
      snakeRef.current.pop()
    }
    
    draw()
  }, [gameState, draw, spawnFood])

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, 120)
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current) }
  }, [gameState, gameLoop])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault()
        if (gameState === 'playing') setGameState('paused')
        else if (gameState === 'paused') setGameState('playing')
        return
      }
      if (gameState !== 'playing') return
      const key = e.key.toLowerCase()
      if ((key === 'arrowup' || key === 'w') && directionRef.current !== 'DOWN') directionRef.current = 'UP'
      if ((key === 'arrowdown' || key === 's') && directionRef.current !== 'UP') directionRef.current = 'DOWN'
      if ((key === 'arrowleft' || key === 'a') && directionRef.current !== 'RIGHT') directionRef.current = 'LEFT'
      if ((key === 'arrowright' || key === 'd') && directionRef.current !== 'LEFT') directionRef.current = 'RIGHT'
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [gameState])

  const startGame = () => {
    snakeRef.current = [{x: 10, y: 10}]
    directionRef.current = 'RIGHT'
    spawnFood()
    setScore(0)
    setGameState('playing')
  }

  const togglePause = () => {
    if (gameState === 'playing') setGameState('paused')
    else if (gameState === 'paused') setGameState('playing')
  }

  const handleControl = (dir) => {
    if (gameState !== 'playing') return
    if (dir === 'UP' && directionRef.current !== 'DOWN') directionRef.current = 'UP'
    if (dir === 'DOWN' && directionRef.current !== 'UP') directionRef.current = 'DOWN'
    if (dir === 'LEFT' && directionRef.current !== 'RIGHT') directionRef.current = 'LEFT'
    if (dir === 'RIGHT' && directionRef.current !== 'LEFT') directionRef.current = 'RIGHT'
  }

  useEffect(() => { draw() }, [draw])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <div className="flex justify-between items-center w-full max-w-xs mb-3">
        <h2 className="text-xl text-white font-bold">🐍 Snake</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="text-white mb-2 text-lg font-bold">Score: {score}</div>

      <canvas ref={canvasRef} width={GRID * CELL} height={GRID * CELL} className="border-2 border-green-500 rounded-lg" />

      {/* Game Controls */}
      <div className="flex gap-2 mt-3">
        {gameState === 'ready' && (
          <button onClick={startGame} className="px-6 py-2 rounded-xl bg-green-500 text-white font-bold flex items-center gap-2">
            <Play className="w-5 h-5" /> Start
          </button>
        )}
        {(gameState === 'playing' || gameState === 'paused') && (
          <>
            <button onClick={togglePause} className="px-4 py-2 rounded-xl bg-yellow-500 text-black font-bold flex items-center gap-2">
              {gameState === 'playing' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {gameState === 'playing' ? 'Pause' : 'Resume'}
            </button>
            <button onClick={startGame} className="px-4 py-2 rounded-xl bg-gray-600 text-white font-bold flex items-center gap-2">
              <RotateCcw className="w-5 h-5" /> Restart
            </button>
          </>
        )}
        {gameState === 'over' && (
          <button onClick={startGame} className="px-6 py-2 rounded-xl bg-green-500 text-white font-bold flex items-center gap-2">
            <RotateCcw className="w-5 h-5" /> Play Again
          </button>
        )}
      </div>

      {gameState === 'over' && <p className="text-red-400 text-lg mt-2">Game Over! Score: {score}</p>}

      {/* D-Pad */}
      <div className="mt-4 grid grid-cols-3 gap-1 w-36">
        <div />
        <button onTouchStart={() => handleControl('UP')} onClick={() => handleControl('UP')} 
          className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center text-white text-2xl font-bold active:bg-green-500">▲</button>
        <div />
        <button onTouchStart={() => handleControl('LEFT')} onClick={() => handleControl('LEFT')}
          className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center text-white text-2xl font-bold active:bg-green-500">◀</button>
        <button onClick={togglePause} className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
          {gameState === 'playing' ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
        </button>
        <button onTouchStart={() => handleControl('RIGHT')} onClick={() => handleControl('RIGHT')}
          className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center text-white text-2xl font-bold active:bg-green-500">▶</button>
        <div />
        <button onTouchStart={() => handleControl('DOWN')} onClick={() => handleControl('DOWN')}
          className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center text-white text-2xl font-bold active:bg-green-500">▼</button>
        <div />
      </div>
    </div>
  )
}

// Classic Pac-Man with Maze and Pause
const PacManGame = ({ onClose }) => {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('ready')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const gameLoopRef = useRef(null)
  
  const CELL = 16
  const gameRef = useRef(null)

  const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1],
    [1,1,1,1,0,1,0,0,0,0,0,0,0,1,0,1,1,1,1],
    [1,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,1,1],
    [0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0],
    [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
    [1,1,1,1,0,1,0,0,0,0,0,0,0,1,0,1,1,1,1],
    [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,2,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,2,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ]

  const ROWS = maze.length
  const COLS = maze[0].length

  const initGame = useCallback(() => {
    const dots = []
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (maze[y][x] === 0) dots.push({ x, y, power: false })
        else if (maze[y][x] === 2) dots.push({ x, y, power: true })
      }
    }
    
    gameRef.current = {
      pacman: { x: 1, y: 1, dir: 'RIGHT', nextDir: 'RIGHT', frame: 0 },
      ghosts: [
        { x: 9, y: 9, dir: 'UP', color: '#ff0000', home: {x:9, y:9} },
        { x: 8, y: 9, dir: 'LEFT', color: '#ffb8ff', home: {x:8, y:9} },
        { x: 10, y: 9, dir: 'RIGHT', color: '#00ffff', home: {x:10, y:9} },
        { x: 9, y: 8, dir: 'DOWN', color: '#ffb852', home: {x:9, y:8} }
      ],
      dots,
      powerMode: false,
      powerTimer: 0
    }
    setScore(0)
    setLives(3)
  }, [])

  const canMove = (x, y) => {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return y === 9 // Allow tunnel
    return maze[y][x] !== 1
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !gameRef.current) return
    const ctx = canvas.getContext('2d')
    const game = gameRef.current
    
    ctx.fillStyle = '#000033'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Walls
    ctx.fillStyle = '#0000ff'
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (maze[y][x] === 1) ctx.fillRect(x * CELL, y * CELL, CELL, CELL)
      }
    }
    
    // Dots
    game.dots.forEach(dot => {
      ctx.fillStyle = '#ffb8ae'
      const size = dot.power ? 6 : 2
      ctx.beginPath()
      ctx.arc(dot.x * CELL + CELL/2, dot.y * CELL + CELL/2, size, 0, Math.PI * 2)
      ctx.fill()
    })
    
    // Pac-Man
    ctx.fillStyle = '#ffff00'
    const px = game.pacman.x * CELL + CELL/2
    const py = game.pacman.y * CELL + CELL/2
    const mouthAngle = game.pacman.frame % 2 === 0 ? 0.2 : 0.05
    let rotation = 0
    if (game.pacman.dir === 'LEFT') rotation = Math.PI
    if (game.pacman.dir === 'UP') rotation = -Math.PI/2
    if (game.pacman.dir === 'DOWN') rotation = Math.PI/2
    ctx.beginPath()
    ctx.arc(px, py, CELL/2 - 2, rotation + mouthAngle * Math.PI, rotation + (2 - mouthAngle) * Math.PI)
    ctx.lineTo(px, py)
    ctx.fill()
    
    // Ghosts
    game.ghosts.forEach(ghost => {
      const gx = ghost.x * CELL + CELL/2
      const gy = ghost.y * CELL + CELL/2
      ctx.fillStyle = game.powerMode ? '#0000ff' : ghost.color
      ctx.beginPath()
      ctx.arc(gx, gy - 2, CELL/2 - 2, Math.PI, 0)
      ctx.lineTo(gx + CELL/2 - 2, gy + CELL/2 - 4)
      ctx.lineTo(gx + CELL/4, gy + CELL/2 - 7)
      ctx.lineTo(gx, gy + CELL/2 - 4)
      ctx.lineTo(gx - CELL/4, gy + CELL/2 - 7)
      ctx.lineTo(gx - CELL/2 + 2, gy + CELL/2 - 4)
      ctx.closePath()
      ctx.fill()
      if (!game.powerMode) {
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(gx - 3, gy - 2, 3, 0, Math.PI * 2)
        ctx.arc(gx + 3, gy - 2, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#0000ff'
        ctx.beginPath()
        ctx.arc(gx - 3, gy - 2, 1.5, 0, Math.PI * 2)
        ctx.arc(gx + 3, gy - 2, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    
    // Paused
    if (gameState === 'paused') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 20px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('PAUSED', canvas.width/2, canvas.height/2)
    }
  }, [gameState])

  const moveGhost = useCallback((ghost) => {
    const game = gameRef.current
    const dirs = ['UP', 'DOWN', 'LEFT', 'RIGHT']
    const opposite = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }
    const dx = game.pacman.x - ghost.x
    const dy = game.pacman.y - ghost.y
    
    let preferred = []
    if (game.powerMode) {
      preferred = dx > 0 ? ['LEFT', 'UP', 'DOWN', 'RIGHT'] : ['RIGHT', 'DOWN', 'UP', 'LEFT']
    } else {
      preferred = dx > 0 ? ['RIGHT', 'DOWN', 'UP', 'LEFT'] : ['LEFT', 'UP', 'DOWN', 'RIGHT']
      if (Math.abs(dy) > Math.abs(dx)) {
        preferred = dy > 0 ? ['DOWN', 'RIGHT', 'LEFT', 'UP'] : ['UP', 'LEFT', 'RIGHT', 'DOWN']
      }
    }
    if (Math.random() < 0.3) preferred = dirs.sort(() => Math.random() - 0.5)
    
    for (const dir of preferred) {
      if (dir === opposite[ghost.dir] && Math.random() > 0.1) continue
      let nx = ghost.x, ny = ghost.y
      if (dir === 'UP') ny--
      if (dir === 'DOWN') ny++
      if (dir === 'LEFT') nx--
      if (dir === 'RIGHT') nx++
      if (nx < 0) nx = COLS - 1
      if (nx >= COLS) nx = 0
      if (canMove(nx, ny)) {
        ghost.x = nx
        ghost.y = ny
        ghost.dir = dir
        break
      }
    }
  }, [canMove])

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing' || !gameRef.current) return
    const game = gameRef.current
    
    // Try next direction first
    let nx = game.pacman.x, ny = game.pacman.y
    if (game.pacman.nextDir === 'UP') ny--
    if (game.pacman.nextDir === 'DOWN') ny++
    if (game.pacman.nextDir === 'LEFT') nx--
    if (game.pacman.nextDir === 'RIGHT') nx++
    if (nx < 0) nx = COLS - 1
    if (nx >= COLS) nx = 0
    
    if (canMove(nx, ny)) {
      game.pacman.dir = game.pacman.nextDir
      game.pacman.x = nx
      game.pacman.y = ny
    } else {
      // Try current direction
      nx = game.pacman.x
      ny = game.pacman.y
      if (game.pacman.dir === 'UP') ny--
      if (game.pacman.dir === 'DOWN') ny++
      if (game.pacman.dir === 'LEFT') nx--
      if (game.pacman.dir === 'RIGHT') nx++
      if (nx < 0) nx = COLS - 1
      if (nx >= COLS) nx = 0
      if (canMove(nx, ny)) {
        game.pacman.x = nx
        game.pacman.y = ny
      }
    }
    game.pacman.frame++
    
    // Move ghosts
    game.ghosts.forEach(ghost => moveGhost(ghost))
    
    // Dot collision
    const dotIdx = game.dots.findIndex(d => d.x === game.pacman.x && d.y === game.pacman.y)
    if (dotIdx !== -1) {
      const dot = game.dots[dotIdx]
      game.dots.splice(dotIdx, 1)
      if (dot.power) {
        setScore(s => s + 50)
        game.powerMode = true
        game.powerTimer = 50
      } else {
        setScore(s => s + 10)
      }
    }
    
    // Power timer
    if (game.powerMode) {
      game.powerTimer--
      if (game.powerTimer <= 0) game.powerMode = false
    }
    
    // Ghost collision
    for (const ghost of game.ghosts) {
      if (ghost.x === game.pacman.x && ghost.y === game.pacman.y) {
        if (game.powerMode) {
          setScore(s => s + 200)
          ghost.x = ghost.home.x
          ghost.y = ghost.home.y
        } else {
          setLives(l => {
            if (l <= 1) {
              setGameState('over')
              return 0
            }
            game.pacman = { x: 1, y: 1, dir: 'RIGHT', nextDir: 'RIGHT', frame: 0 }
            game.ghosts.forEach(g => { g.x = g.home.x; g.y = g.home.y })
            return l - 1
          })
          return
        }
      }
    }
    
    // Win
    if (game.dots.length === 0) {
      setGameState('won')
      return
    }
    
    draw()
  }, [gameState, draw, moveGhost, canMove])

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, 150)
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current) }
  }, [gameState, gameLoop])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault()
        if (gameState === 'playing') setGameState('paused')
        else if (gameState === 'paused') setGameState('playing')
        return
      }
      if (!gameRef.current || gameState !== 'playing') return
      const key = e.key.toLowerCase()
      if (key === 'arrowup' || key === 'w') gameRef.current.pacman.nextDir = 'UP'
      if (key === 'arrowdown' || key === 's') gameRef.current.pacman.nextDir = 'DOWN'
      if (key === 'arrowleft' || key === 'a') gameRef.current.pacman.nextDir = 'LEFT'
      if (key === 'arrowright' || key === 'd') gameRef.current.pacman.nextDir = 'RIGHT'
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [gameState])

  const startGame = () => {
    initGame()
    setGameState('playing')
    setTimeout(draw, 50)
  }

  const togglePause = () => {
    if (gameState === 'playing') setGameState('paused')
    else if (gameState === 'paused') setGameState('playing')
  }

  const handleControl = (dir) => {
    if (gameState !== 'playing' || !gameRef.current) return
    gameRef.current.pacman.nextDir = dir
  }

  useEffect(() => { initGame(); draw() }, [initGame, draw])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <div className="flex justify-between items-center w-full max-w-xs mb-3">
        <h2 className="text-xl text-white font-bold">👻 Pac-Man</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="text-white mb-2 flex gap-4 items-center">
        <span className="text-lg font-bold">Score: {score}</span>
        <span className="text-yellow-400 text-lg">{'❤️'.repeat(lives)}</span>
      </div>

      <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} className="border-2 border-blue-500 rounded" />

      {/* Game Controls */}
      <div className="flex gap-2 mt-3">
        {gameState === 'ready' && (
          <button onClick={startGame} className="px-6 py-2 rounded-xl bg-yellow-500 text-black font-bold flex items-center gap-2">
            <Play className="w-5 h-5" /> Start
          </button>
        )}
        {(gameState === 'playing' || gameState === 'paused') && (
          <>
            <button onClick={togglePause} className="px-4 py-2 rounded-xl bg-yellow-500 text-black font-bold flex items-center gap-2">
              {gameState === 'playing' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {gameState === 'playing' ? 'Pause' : 'Resume'}
            </button>
            <button onClick={startGame} className="px-4 py-2 rounded-xl bg-gray-600 text-white font-bold flex items-center gap-2">
              <RotateCcw className="w-5 h-5" /> Restart
            </button>
          </>
        )}
        {(gameState === 'over' || gameState === 'won') && (
          <button onClick={startGame} className="px-6 py-2 rounded-xl bg-yellow-500 text-black font-bold flex items-center gap-2">
            <RotateCcw className="w-5 h-5" /> Play Again
          </button>
        )}
      </div>

      {gameState === 'over' && <p className="text-red-400 text-lg mt-2">Game Over! Score: {score}</p>}
      {gameState === 'won' && <p className="text-green-400 text-lg mt-2">🎉 You Won! Score: {score}</p>}

      {/* D-Pad */}
      <div className="mt-4 grid grid-cols-3 gap-1 w-36">
        <div />
        <button onTouchStart={() => handleControl('UP')} onClick={() => handleControl('UP')}
          className="w-12 h-12 rounded-lg bg-yellow-600 flex items-center justify-center text-white text-2xl font-bold active:bg-yellow-500">▲</button>
        <div />
        <button onTouchStart={() => handleControl('LEFT')} onClick={() => handleControl('LEFT')}
          className="w-12 h-12 rounded-lg bg-yellow-600 flex items-center justify-center text-white text-2xl font-bold active:bg-yellow-500">◀</button>
        <button onClick={togglePause} className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
          {gameState === 'playing' ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
        </button>
        <button onTouchStart={() => handleControl('RIGHT')} onClick={() => handleControl('RIGHT')}
          className="w-12 h-12 rounded-lg bg-yellow-600 flex items-center justify-center text-white text-2xl font-bold active:bg-yellow-500">▶</button>
        <div />
        <button onTouchStart={() => handleControl('DOWN')} onClick={() => handleControl('DOWN')}
          className="w-12 h-12 rounded-lg bg-yellow-600 flex items-center justify-center text-white text-2xl font-bold active:bg-yellow-500">▼</button>
        <div />
      </div>
    </div>
  )
}

// Tic-Tac-Toe
// Ice Breaker - 2 Player Game
const IceBreakerGame = ({ onClose, user }) => {
  const [friends, setFriends] = useState([])
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [gameState, setGameState] = useState('invite') // invite, waiting, playing, finished
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [myAnswers, setMyAnswers] = useState([])
  const [theirAnswers, setTheirAnswers] = useState([])
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState({ me: 0, them: 0 })
  
  const questions = [
    { q: "What's your ideal first date?", options: ["Coffee shop chat", "Adventure activity", "Nice dinner", "Movie night"] },
    { q: "Biggest turn-off?", options: ["Bad hygiene", "Arrogance", "Being boring", "Dishonesty"] },
    { q: "Love language?", options: ["Words of affirmation", "Physical touch", "Quality time", "Gifts"] },
    { q: "Ideal weekend?", options: ["Stay home & chill", "Party/socialize", "Outdoor adventure", "Creative project"] },
    { q: "Morning or night person?", options: ["Early bird", "Night owl", "Depends on mood", "Neither"] },
    { q: "Favorite way to flirt?", options: ["Compliments", "Playful teasing", "Deep conversation", "Physical touch"] },
    { q: "Deal breaker in a relationship?", options: ["No ambition", "Too clingy", "Poor communication", "Different values"] },
    { q: "How do you handle conflict?", options: ["Talk it out", "Need space first", "Avoid it", "Direct confrontation"] },
    { q: "What attracts you first?", options: ["Looks", "Personality", "Humor", "Intelligence"] },
    { q: "Relationship pace preference?", options: ["Take it slow", "Jump right in", "Go with the flow", "Depends on connection"] },
  ]

  useEffect(() => {
    // Fetch friends list
    const fetchFriends = async () => {
      try {
        const res = await fetch(`/api/friends/${user.id}`)
        if (res.ok) {
          const data = await res.json()
          setFriends(data.friends || [])
        }
      } catch (err) { console.error('Failed to fetch friends') }
    }
    fetchFriends()
  }, [user.id])

  const inviteFriend = async (friend) => {
    setSelectedFriend(friend)
    // In a real app, this would send a notification to the friend
    // For now, simulate starting the game
    setGameState('playing')
    setCurrentQuestion(questions[0])
  }

  const answerQuestion = (answerIndex) => {
    setMyAnswers([...myAnswers, answerIndex])
    // Simulate other player's answer (random for demo)
    const theirAnswer = Math.floor(Math.random() * 4)
    setTheirAnswers([...theirAnswers, theirAnswer])
    setShowAnswer(true)
    
    // Update score if answers match
    if (answerIndex === theirAnswer) {
      setScore({ ...score, me: score.me + 10, them: score.them + 10 })
    }
  }

  const nextQuestion = () => {
    setShowAnswer(false)
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1)
      setCurrentQuestion(questions[questionIndex + 1])
    } else {
      setGameState('finished')
    }
  }

  const resetGame = () => {
    setGameState('invite')
    setSelectedFriend(null)
    setQuestionIndex(0)
    setMyAnswers([])
    setTheirAnswers([])
    setShowAnswer(false)
    setScore({ me: 0, them: 0 })
  }

  const getCompatibility = () => {
    let matches = 0
    for (let i = 0; i < myAnswers.length; i++) {
      if (myAnswers[i] === theirAnswers[i]) matches++
    }
    return Math.round((matches / myAnswers.length) * 100)
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-lg flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-xl text-white font-bold flex items-center gap-2">
          💘 Ice Breaker
        </h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Invite Screen */}
        {gameState === 'invite' && (
          <div className="space-y-4">
            <p className="text-white text-center mb-6">Invite a friend to play Ice Breaker and discover your compatibility!</p>
            
            {friends.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No friends yet</p>
                <p className="text-gray-500 text-sm mt-1">Add friends to play together</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-amber-400 text-sm font-medium mb-3">Select a friend to invite:</p>
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => inviteFriend(friend)}
                    className="w-full p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center overflow-hidden">
                      {friend.avatar ? (
                        <img src={friend.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-lg">{friend.displayName?.[0] || '?'}</span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{friend.displayName || 'User'}</p>
                      <p className="text-gray-400 text-sm">Tap to invite</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Playing Screen */}
        {gameState === 'playing' && currentQuestion && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center overflow-hidden">
                  {selectedFriend?.avatar ? (
                    <img src={selectedFriend.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm">{selectedFriend?.displayName?.[0] || '?'}</span>
                  )}
                </div>
                <span className="text-white text-sm">Playing with {selectedFriend?.displayName}</span>
              </div>
              <span className="text-amber-400 font-bold">{questionIndex + 1}/{questions.length}</span>
            </div>

            <div className="bg-white/10 rounded-2xl p-6">
              <p className="text-white text-xl font-medium text-center mb-6">{currentQuestion.q}</p>
              
              {!showAnswer ? (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => answerQuestion(i)}
                      className="w-full p-4 rounded-xl bg-white/10 hover:bg-purple-500/30 transition-colors text-white text-left"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-gray-400 text-xs mb-1">Your answer</p>
                      <p className="text-white font-medium">{currentQuestion.options[myAnswers[myAnswers.length - 1]]}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-gray-400 text-xs mb-1">{selectedFriend?.displayName}'s answer</p>
                      <p className="text-white font-medium">{currentQuestion.options[theirAnswers[theirAnswers.length - 1]]}</p>
                    </div>
                  </div>
                  
                  {myAnswers[myAnswers.length - 1] === theirAnswers[theirAnswers.length - 1] && (
                    <p className="text-green-400 text-center font-bold">🎉 Match! +10 points</p>
                  )}
                  
                  <button
                    onClick={nextQuestion}
                    className="w-full p-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold"
                  >
                    {questionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Finished Screen */}
        {gameState === 'finished' && (
          <div className="text-center space-y-6 py-8">
            <div className="text-6xl mb-4">💘</div>
            <h3 className="text-2xl text-white font-bold">Game Complete!</h3>
            
            <div className="bg-white/10 rounded-2xl p-6">
              <p className="text-gray-400 mb-2">Your compatibility with {selectedFriend?.displayName}</p>
              <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                {getCompatibility()}%
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Your Score</p>
                <p className="text-2xl text-amber-400 font-bold">{score.me}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-gray-400 text-sm">{selectedFriend?.displayName}</p>
                <p className="text-2xl text-pink-400 font-bold">{score.them}</p>
              </div>
            </div>

            <button
              onClick={resetGame}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
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
    if (!storedUser) { router.push('/'); return }
    setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [router])

  if (loading || !user) {
    return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="animate-pulse text-white">Loading...</div>
    </div>
  }

  const games = [
    { id: 'icebreaker', name: 'Ice Breaker', desc: '2 Player - Discover compatibility!', icon: '💘', color: 'from-pink-500 to-purple-500' },
    { id: 'snake', name: 'Snake', desc: 'Classic snake game', icon: '🐍', color: 'from-green-500 to-emerald-600' },
    { id: 'pacman', name: 'Pac-Man', desc: 'Eat dots, avoid ghosts!', icon: '👻', color: 'from-yellow-400 to-orange-500' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="flex items-center gap-3 p-4 border-b border-white/10">
        <button onClick={() => router.push('/')} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">Games</h1>
      </header>
      <div className="p-4 space-y-4">
        {games.map(game => (
          <button key={game.id} onClick={() => setActiveGame(game.id)}
            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl`}>
                {game.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-white font-semibold">{game.name}</h3>
                <p className="text-gray-400 text-sm">{game.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      {activeGame === 'icebreaker' && <IceBreakerGame onClose={() => setActiveGame(null)} user={user} />}
      {activeGame === 'snake' && <SnakeGame onClose={() => setActiveGame(null)} />}
      {activeGame === 'pacman' && <PacManGame onClose={() => setActiveGame(null)} />}
    </div>
  )
}
