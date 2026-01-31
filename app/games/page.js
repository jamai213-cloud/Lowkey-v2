'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, X } from 'lucide-react'

// Classic Snake Game
const SnakeGame = ({ onClose }) => {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('ready')
  const [score, setScore] = useState(0)
  const directionRef = useRef('RIGHT')
  const snakeRef = useRef([{x: 5, y: 5}])
  const foodRef = useRef({x: 10, y: 10})
  const gameLoopRef = useRef(null)

  const GRID = 20
  const CELL = 15

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    
    // Clear
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw grid
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
    
    // Draw snake
    snakeRef.current.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#4ade80' : '#22c55e'
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2)
    })
    
    // Draw food
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(foodRef.current.x * CELL + CELL/2, foodRef.current.y * CELL + CELL/2, CELL/2 - 2, 0, Math.PI * 2)
    ctx.fill()
  }, [])

  const spawnFood = useCallback(() => {
    let newFood
    do {
      newFood = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }
    } while (snakeRef.current.some(s => s.x === newFood.x && s.y === newFood.y))
    foodRef.current = newFood
  }, [])

  const gameLoop = useCallback(() => {
    const head = { ...snakeRef.current[0] }
    
    if (directionRef.current === 'UP') head.y--
    if (directionRef.current === 'DOWN') head.y++
    if (directionRef.current === 'LEFT') head.x--
    if (directionRef.current === 'RIGHT') head.x++
    
    // Wall collision
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
      setGameState('over')
      return
    }
    
    // Self collision
    if (snakeRef.current.some(s => s.x === head.x && s.y === head.y)) {
      setGameState('over')
      return
    }
    
    snakeRef.current.unshift(head)
    
    // Eat food
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore(s => s + 10)
      spawnFood()
    } else {
      snakeRef.current.pop()
    }
    
    draw()
  }, [draw, spawnFood])

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, 120)
      return () => clearInterval(gameLoopRef.current)
    }
  }, [gameState, gameLoop])

  useEffect(() => {
    const handleKey = (e) => {
      if (gameState !== 'playing') return
      const key = e.key
      if ((key === 'ArrowUp' || key === 'w') && directionRef.current !== 'DOWN') directionRef.current = 'UP'
      if ((key === 'ArrowDown' || key === 's') && directionRef.current !== 'UP') directionRef.current = 'DOWN'
      if ((key === 'ArrowLeft' || key === 'a') && directionRef.current !== 'RIGHT') directionRef.current = 'LEFT'
      if ((key === 'ArrowRight' || key === 'd') && directionRef.current !== 'LEFT') directionRef.current = 'RIGHT'
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [gameState])

  const startGame = () => {
    snakeRef.current = [{x: 5, y: 5}]
    directionRef.current = 'RIGHT'
    spawnFood()
    setScore(0)
    setGameState('playing')
    draw()
  }

  const handleControl = (dir) => {
    if (gameState !== 'playing') return
    if (dir === 'UP' && directionRef.current !== 'DOWN') directionRef.current = 'UP'
    if (dir === 'DOWN' && directionRef.current !== 'UP') directionRef.current = 'DOWN'
    if (dir === 'LEFT' && directionRef.current !== 'RIGHT') directionRef.current = 'LEFT'
    if (dir === 'RIGHT' && directionRef.current !== 'LEFT') directionRef.current = 'RIGHT'
  }

  useEffect(() => {
    draw()
  }, [draw])

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

      {/* D-Pad Controls */}
      <div className="mt-4 grid grid-cols-3 gap-1 w-36">
        <div />
        <button onTouchStart={() => handleControl('UP')} onClick={() => handleControl('UP')} 
          className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center text-white text-2xl font-bold active:bg-green-500">▲</button>
        <div />
        <button onTouchStart={() => handleControl('LEFT')} onClick={() => handleControl('LEFT')}
          className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center text-white text-2xl font-bold active:bg-green-500">◀</button>
        <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-green-500" />
        </div>
        <button onTouchStart={() => handleControl('RIGHT')} onClick={() => handleControl('RIGHT')}
          className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center text-white text-2xl font-bold active:bg-green-500">▶</button>
        <div />
        <button onTouchStart={() => handleControl('DOWN')} onClick={() => handleControl('DOWN')}
          className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center text-white text-2xl font-bold active:bg-green-500">▼</button>
        <div />
      </div>

      {gameState === 'ready' && (
        <button onClick={startGame} className="mt-4 px-8 py-3 rounded-xl bg-green-500 text-white font-bold text-lg">
          Start Game
        </button>
      )}
      {gameState === 'over' && (
        <div className="mt-4 text-center">
          <p className="text-red-400 text-xl mb-2">Game Over! Score: {score}</p>
          <button onClick={startGame} className="px-8 py-3 rounded-xl bg-green-500 text-white font-bold text-lg">
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}

// Classic Pac-Man with Maze
const PacManGame = ({ onClose }) => {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('ready')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  
  const CELL = 16
  const gameRef = useRef({
    pacman: { x: 1, y: 1, dir: 'RIGHT' },
    ghosts: [],
    dots: [],
    powerMode: false,
    powerTimer: 0
  })

  // Classic Pac-Man maze (1 = wall, 0 = path, 2 = power pellet)
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
    const game = gameRef.current
    game.pacman = { x: 1, y: 1, dir: 'RIGHT', frame: 0 }
    game.ghosts = [
      { x: 9, y: 9, dir: 'UP', color: '#ff0000' },    // Blinky
      { x: 8, y: 9, dir: 'LEFT', color: '#ffb8ff' },  // Pinky
      { x: 10, y: 9, dir: 'RIGHT', color: '#00ffff' }, // Inky
      { x: 9, y: 8, dir: 'DOWN', color: '#ffb852' }   // Clyde
    ]
    game.dots = []
    game.powerMode = false
    game.powerTimer = 0
    
    // Create dots from maze
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (maze[y][x] === 0) {
          game.dots.push({ x, y, power: false })
        } else if (maze[y][x] === 2) {
          game.dots.push({ x, y, power: true })
        }
      }
    }
    
    setScore(0)
    setLives(3)
  }, [])

  const canMove = (x, y) => {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false
    return maze[y][x] !== 1
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const game = gameRef.current
    
    // Clear
    ctx.fillStyle = '#000033'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw maze walls
    ctx.fillStyle = '#0000ff'
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (maze[y][x] === 1) {
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL)
        }
      }
    }
    
    // Draw dots
    game.dots.forEach(dot => {
      ctx.fillStyle = '#ffb8ae'
      const size = dot.power ? 6 : 2
      ctx.beginPath()
      ctx.arc(dot.x * CELL + CELL/2, dot.y * CELL + CELL/2, size, 0, Math.PI * 2)
      ctx.fill()
    })
    
    // Draw Pac-Man
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
    
    // Draw ghosts
    game.ghosts.forEach(ghost => {
      const gx = ghost.x * CELL + CELL/2
      const gy = ghost.y * CELL + CELL/2
      
      // Ghost body color
      ctx.fillStyle = game.powerMode ? '#0000ff' : ghost.color
      
      // Ghost body (rounded top, wavy bottom)
      ctx.beginPath()
      ctx.arc(gx, gy - 2, CELL/2 - 2, Math.PI, 0)
      ctx.lineTo(gx + CELL/2 - 2, gy + CELL/2 - 4)
      // Wavy bottom
      ctx.lineTo(gx + CELL/4, gy + CELL/2 - 7)
      ctx.lineTo(gx, gy + CELL/2 - 4)
      ctx.lineTo(gx - CELL/4, gy + CELL/2 - 7)
      ctx.lineTo(gx - CELL/2 + 2, gy + CELL/2 - 4)
      ctx.closePath()
      ctx.fill()
      
      // Eyes (only if not in power mode)
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
  }, [])

  const moveGhost = useCallback((ghost) => {
    const game = gameRef.current
    const dirs = ['UP', 'DOWN', 'LEFT', 'RIGHT']
    const opposite = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }
    
    // Calculate direction towards/away from pacman
    const dx = game.pacman.x - ghost.x
    const dy = game.pacman.y - ghost.y
    
    let preferred = []
    if (game.powerMode) {
      // Run away
      preferred = dx > 0 ? ['LEFT', 'UP', 'DOWN', 'RIGHT'] : ['RIGHT', 'DOWN', 'UP', 'LEFT']
      if (Math.abs(dy) > Math.abs(dx)) {
        preferred = dy > 0 ? ['UP', 'LEFT', 'RIGHT', 'DOWN'] : ['DOWN', 'RIGHT', 'LEFT', 'UP']
      }
    } else {
      // Chase
      preferred = dx > 0 ? ['RIGHT', 'DOWN', 'UP', 'LEFT'] : ['LEFT', 'UP', 'DOWN', 'RIGHT']
      if (Math.abs(dy) > Math.abs(dx)) {
        preferred = dy > 0 ? ['DOWN', 'RIGHT', 'LEFT', 'UP'] : ['UP', 'LEFT', 'RIGHT', 'DOWN']
      }
    }
    
    // Add randomness
    if (Math.random() < 0.3) {
      preferred = dirs.sort(() => Math.random() - 0.5)
    }
    
    for (const dir of preferred) {
      if (dir === opposite[ghost.dir] && Math.random() > 0.05) continue
      
      let nx = ghost.x, ny = ghost.y
      if (dir === 'UP') ny--
      if (dir === 'DOWN') ny++
      if (dir === 'LEFT') nx--
      if (dir === 'RIGHT') nx++
      
      // Wrap around tunnel
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
    const game = gameRef.current
    
    // Move Pac-Man
    let nx = game.pacman.x, ny = game.pacman.y
    if (game.pacman.dir === 'UP') ny--
    if (game.pacman.dir === 'DOWN') ny++
    if (game.pacman.dir === 'LEFT') nx--
    if (game.pacman.dir === 'RIGHT') nx++
    
    // Wrap around
    if (nx < 0) nx = COLS - 1
    if (nx >= COLS) nx = 0
    
    if (canMove(nx, ny)) {
      game.pacman.x = nx
      game.pacman.y = ny
    }
    game.pacman.frame++
    
    // Move ghosts
    game.ghosts.forEach(ghost => moveGhost(ghost))
    
    // Check dot collision
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
    
    // Power mode timer
    if (game.powerMode) {
      game.powerTimer--
      if (game.powerTimer <= 0) {
        game.powerMode = false
      }
    }
    
    // Ghost collision
    for (let i = 0; i < game.ghosts.length; i++) {
      const ghost = game.ghosts[i]
      if (ghost.x === game.pacman.x && ghost.y === game.pacman.y) {
        if (game.powerMode) {
          // Eat ghost
          setScore(s => s + 200)
          ghost.x = 9
          ghost.y = 9
        } else {
          // Lose life
          setLives(l => {
            if (l <= 1) {
              setGameState('over')
              return 0
            }
            // Reset positions
            game.pacman = { x: 1, y: 1, dir: 'RIGHT', frame: 0 }
            game.ghosts.forEach((g, idx) => {
              g.x = 8 + idx
              g.y = 9
            })
            return l - 1
          })
          return
        }
      }
    }
    
    // Win condition
    if (game.dots.length === 0) {
      setGameState('won')
      return
    }
    
    draw()
  }, [draw, moveGhost, canMove])

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(gameLoop, 150)
      return () => clearInterval(interval)
    }
  }, [gameState, gameLoop])

  useEffect(() => {
    const handleKey = (e) => {
      if (gameState !== 'playing') return
      const game = gameRef.current
      if (e.key === 'ArrowUp' || e.key === 'w') game.pacman.dir = 'UP'
      if (e.key === 'ArrowDown' || e.key === 's') game.pacman.dir = 'DOWN'
      if (e.key === 'ArrowLeft' || e.key === 'a') game.pacman.dir = 'LEFT'
      if (e.key === 'ArrowRight' || e.key === 'd') game.pacman.dir = 'RIGHT'
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [gameState])

  const startGame = () => {
    initGame()
    setGameState('playing')
    setTimeout(draw, 50)
  }

  const handleControl = (dir) => {
    if (gameState !== 'playing') return
    gameRef.current.pacman.dir = dir
  }

  useEffect(() => {
    initGame()
    draw()
  }, [initGame, draw])

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

      {/* D-Pad Controls */}
      <div className="mt-4 grid grid-cols-3 gap-1 w-36">
        <div />
        <button onTouchStart={() => handleControl('UP')} onClick={() => handleControl('UP')}
          className="w-12 h-12 rounded-lg bg-yellow-600 flex items-center justify-center text-white text-2xl font-bold active:bg-yellow-500">▲</button>
        <div />
        <button onTouchStart={() => handleControl('LEFT')} onClick={() => handleControl('LEFT')}
          className="w-12 h-12 rounded-lg bg-yellow-600 flex items-center justify-center text-white text-2xl font-bold active:bg-yellow-500">◀</button>
        <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-yellow-500" />
        </div>
        <button onTouchStart={() => handleControl('RIGHT')} onClick={() => handleControl('RIGHT')}
          className="w-12 h-12 rounded-lg bg-yellow-600 flex items-center justify-center text-white text-2xl font-bold active:bg-yellow-500">▶</button>
        <div />
        <button onTouchStart={() => handleControl('DOWN')} onClick={() => handleControl('DOWN')}
          className="w-12 h-12 rounded-lg bg-yellow-600 flex items-center justify-center text-white text-2xl font-bold active:bg-yellow-500">▼</button>
        <div />
      </div>

      {gameState === 'ready' && (
        <button onClick={startGame} className="mt-4 px-8 py-3 rounded-xl bg-yellow-500 text-black font-bold text-lg">
          Start Game
        </button>
      )}
      {gameState === 'over' && (
        <div className="mt-4 text-center">
          <p className="text-red-400 text-xl mb-2">Game Over! Score: {score}</p>
          <button onClick={startGame} className="px-8 py-3 rounded-xl bg-yellow-500 text-black font-bold text-lg">
            Play Again
          </button>
        </div>
      )}
      {gameState === 'won' && (
        <div className="mt-4 text-center">
          <p className="text-green-400 text-xl mb-2">🎉 You Won! Score: {score}</p>
          <button onClick={startGame} className="px-8 py-3 rounded-xl bg-yellow-500 text-black font-bold text-lg">
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}

// Tic-Tac-Toe
const TicTacToe = ({ onClose }) => {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winner, setWinner] = useState(null)

  const checkWinner = (squares) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
    for (const [a,b,c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  const handleClick = (i) => {
    if (board[i] || winner) return
    const newBoard = [...board]
    newBoard[i] = isXNext ? 'X' : 'O'
    setBoard(newBoard)
    setWinner(checkWinner(newBoard))
    setIsXNext(!isXNext)
  }

  const reset = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setWinner(null)
  }

  const isDraw = !winner && board.every(cell => cell)

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <div className="flex justify-between items-center w-full max-w-xs mb-4">
        <h2 className="text-xl text-white font-bold">⭕ Tic-Tac-Toe</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="text-white mb-4 text-lg">
        {winner ? `Winner: ${winner}! 🎉` : isDraw ? "It's a Draw!" : `Next: ${isXNext ? 'X' : 'O'}`}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <button key={i} onClick={() => handleClick(i)}
            className={`w-20 h-20 rounded-xl text-4xl font-bold flex items-center justify-center
              ${cell ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'}
              ${cell === 'X' ? 'text-amber-400' : 'text-pink-400'}`}>
            {cell}
          </button>
        ))}
      </div>

      {(winner || isDraw) && (
        <button onClick={reset} className="mt-6 px-8 py-3 rounded-xl bg-purple-500 text-white font-bold text-lg">
          Play Again
        </button>
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
  }, [router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  const games = [
    { id: 'snake', name: 'Snake', desc: 'Classic snake game', icon: '🐍', color: 'from-green-500 to-emerald-600' },
    { id: 'pacman', name: 'Pac-Man', desc: 'Eat dots, avoid ghosts!', icon: '👻', color: 'from-yellow-400 to-orange-500' },
    { id: 'tictactoe', name: 'Tic-Tac-Toe', desc: 'Classic X and O', icon: '⭕', color: 'from-purple-500 to-pink-500' }
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

      {activeGame === 'snake' && <SnakeGame onClose={() => setActiveGame(null)} />}
      {activeGame === 'pacman' && <PacManGame onClose={() => setActiveGame(null)} />}
      {activeGame === 'tictactoe' && <TicTacToe onClose={() => setActiveGame(null)} />}
    </div>
  )
}
