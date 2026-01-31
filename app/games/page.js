'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Gamepad2, Users, Trophy, X, Check } from 'lucide-react'

// Classic Snake Game Component
const SnakeGame = ({ onClose }) => {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('ready')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  
  const gameRef = useRef({
    snake: [{x: 10, y: 10}],
    food: {x: 15, y: 15},
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    gridSize: 20,
    cellSize: 15
  })

  const generateFood = useCallback(() => {
    const game = gameRef.current
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * game.gridSize),
        y: Math.floor(Math.random() * game.gridSize)
      }
    } while (game.snake.some(seg => seg.x === newFood.x && seg.y === newFood.y))
    return newFood
  }, [])

  const resetGame = useCallback(() => {
    const game = gameRef.current
    game.snake = [{x: 10, y: 10}]
    game.direction = 'RIGHT'
    game.nextDirection = 'RIGHT'
    game.food = generateFood()
    setScore(0)
  }, [generateFood])

  const changeDirection = useCallback((newDir) => {
    const game = gameRef.current
    const opposites = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }
    if (opposites[newDir] !== game.direction) {
      game.nextDirection = newDir
    }
  }, [])

  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const game = gameRef.current

    const gameLoop = setInterval(() => {
      // Update direction
      game.direction = game.nextDirection

      // Calculate new head position
      const head = { ...game.snake[0] }
      if (game.direction === 'UP') head.y--
      if (game.direction === 'DOWN') head.y++
      if (game.direction === 'LEFT') head.x--
      if (game.direction === 'RIGHT') head.x++

      // Check wall collision
      if (head.x < 0 || head.x >= game.gridSize || head.y < 0 || head.y >= game.gridSize) {
        setGameState('over')
        if (score > highScore) setHighScore(score)
        return
      }

      // Check self collision
      if (game.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        setGameState('over')
        if (score > highScore) setHighScore(score)
        return
      }

      // Add new head
      game.snake.unshift(head)

      // Check food collision
      if (head.x === game.food.x && head.y === game.food.y) {
        setScore(s => s + 10)
        game.food = generateFood()
      } else {
        game.snake.pop()
      }

      // Draw
      ctx.fillStyle = '#111827'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      ctx.strokeStyle = '#1f2937'
      for (let i = 0; i <= game.gridSize; i++) {
        ctx.beginPath()
        ctx.moveTo(i * game.cellSize, 0)
        ctx.lineTo(i * game.cellSize, canvas.height)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, i * game.cellSize)
        ctx.lineTo(canvas.width, i * game.cellSize)
        ctx.stroke()
      }

      // Draw snake
      game.snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? '#22c55e' : '#16a34a'
        ctx.fillRect(seg.x * game.cellSize + 1, seg.y * game.cellSize + 1, game.cellSize - 2, game.cellSize - 2)
      })

      // Draw food
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(
        game.food.x * game.cellSize + game.cellSize / 2,
        game.food.y * game.cellSize + game.cellSize / 2,
        game.cellSize / 2 - 2,
        0, Math.PI * 2
      )
      ctx.fill()
    }, 100)

    return () => clearInterval(gameLoop)
  }, [gameState, generateFood, score, highScore])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return
      e.preventDefault()
      if (e.key === 'ArrowUp') changeDirection('UP')
      if (e.key === 'ArrowDown') changeDirection('DOWN')
      if (e.key === 'ArrowLeft') changeDirection('LEFT')
      if (e.key === 'ArrowRight') changeDirection('RIGHT')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, changeDirection])

  const startGame = () => {
    resetGame()
    setGameState('playing')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <div className="flex justify-between items-center w-full max-w-sm mb-4">
        <h2 className="text-xl text-white font-bold">🐍 Snake</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="text-white mb-2 flex gap-4">
        <span className="text-lg font-bold">Score: {score}</span>
        <span className="text-gray-400">Best: {highScore}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="border-2 border-green-500/50 rounded-lg"
      />

      {gameState === 'playing' && (
        <div className="mt-6 relative w-44 h-44">
          <button 
            onTouchStart={(e) => { e.preventDefault(); changeDirection('UP'); }}
            onClick={() => changeDirection('UP')} 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-xl bg-green-500/30 border-2 border-green-500/50 flex items-center justify-center text-white text-2xl font-bold active:bg-green-500/60"
          >▲</button>
          <button 
            onTouchStart={(e) => { e.preventDefault(); changeDirection('DOWN'); }}
            onClick={() => changeDirection('DOWN')} 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-xl bg-green-500/30 border-2 border-green-500/50 flex items-center justify-center text-white text-2xl font-bold active:bg-green-500/60"
          >▼</button>
          <button 
            onTouchStart={(e) => { e.preventDefault(); changeDirection('LEFT'); }}
            onClick={() => changeDirection('LEFT')} 
            className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-xl bg-green-500/30 border-2 border-green-500/50 flex items-center justify-center text-white text-2xl font-bold active:bg-green-500/60"
          >◀</button>
          <button 
            onTouchStart={(e) => { e.preventDefault(); changeDirection('RIGHT'); }}
            onClick={() => changeDirection('RIGHT')} 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-xl bg-green-500/30 border-2 border-green-500/50 flex items-center justify-center text-white text-2xl font-bold active:bg-green-500/60"
          >▶</button>
        </div>
      )}

      {gameState === 'ready' && (
        <button onClick={startGame} className="mt-6 px-8 py-4 rounded-xl bg-green-500 text-white font-bold text-lg">
          Start Game
        </button>
      )}
      
      {gameState === 'over' && (
        <div className="mt-6 text-center">
          <p className="text-red-400 text-xl mb-3">Game Over! Score: {score}</p>
          <button onClick={startGame} className="px-8 py-4 rounded-xl bg-green-500 text-white font-bold text-lg">
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}

// Classic Pac-Man Game with Ghosts
const PacManGame = ({ onClose }) => {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('ready')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  
  const gameRef = useRef({
    pacman: { x: 10, y: 15, direction: 'RIGHT', mouthOpen: true },
    ghosts: [
      { x: 9, y: 9, color: '#ff0000', direction: 'RIGHT' },  // Blinky (red)
      { x: 10, y: 9, color: '#ffb8ff', direction: 'LEFT' },  // Pinky (pink)
      { x: 9, y: 10, color: '#00ffff', direction: 'UP' },    // Inky (cyan)
      { x: 10, y: 10, color: '#ffb852', direction: 'DOWN' }  // Clyde (orange)
    ],
    dots: [],
    powerPellets: [],
    gridSize: 20,
    cellSize: 15,
    powerMode: false,
    powerTimer: 0
  })

  const initGame = useCallback(() => {
    const game = gameRef.current
    game.pacman = { x: 10, y: 15, direction: 'RIGHT', mouthOpen: true }
    game.ghosts = [
      { x: 9, y: 9, color: '#ff0000', direction: 'RIGHT' },
      { x: 10, y: 9, color: '#ffb8ff', direction: 'LEFT' },
      { x: 9, y: 10, color: '#00ffff', direction: 'UP' },
      { x: 10, y: 10, color: '#ffb852', direction: 'DOWN' }
    ]
    game.dots = []
    game.powerPellets = []
    game.powerMode = false
    game.powerTimer = 0
    
    // Create dots grid (avoiding ghost house area)
    for (let x = 0; x < game.gridSize; x++) {
      for (let y = 0; y < game.gridSize; y++) {
        // Skip ghost house area (center)
        if (x >= 8 && x <= 11 && y >= 8 && y <= 11) continue
        // Skip pac-man start position
        if (x === 10 && y === 15) continue
        game.dots.push({ x, y })
      }
    }
    
    // Add power pellets in corners
    game.powerPellets = [
      { x: 1, y: 1 },
      { x: 18, y: 1 },
      { x: 1, y: 18 },
      { x: 18, y: 18 }
    ]
    // Remove power pellet positions from dots
    game.dots = game.dots.filter(d => 
      !game.powerPellets.some(p => p.x === d.x && p.y === d.y)
    )
    
    setScore(0)
    setLives(3)
  }, [])

  const changeDirection = useCallback((newDir) => {
    if (gameRef.current) {
      gameRef.current.pacman.direction = newDir
    }
  }, [])

  const moveGhost = useCallback((ghost) => {
    const game = gameRef.current
    const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT']
    const opposites = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }
    
    // Try to move towards pac-man sometimes, random otherwise
    const dx = game.pacman.x - ghost.x
    const dy = game.pacman.y - ghost.y
    
    let preferredDirs = []
    if (!game.powerMode) {
      // Chase pac-man
      if (Math.abs(dx) > Math.abs(dy)) {
        preferredDirs = dx > 0 ? ['RIGHT', 'DOWN', 'UP', 'LEFT'] : ['LEFT', 'UP', 'DOWN', 'RIGHT']
      } else {
        preferredDirs = dy > 0 ? ['DOWN', 'RIGHT', 'LEFT', 'UP'] : ['UP', 'LEFT', 'RIGHT', 'DOWN']
      }
    } else {
      // Run away from pac-man
      if (Math.abs(dx) > Math.abs(dy)) {
        preferredDirs = dx > 0 ? ['LEFT', 'UP', 'DOWN', 'RIGHT'] : ['RIGHT', 'DOWN', 'UP', 'LEFT']
      } else {
        preferredDirs = dy > 0 ? ['UP', 'LEFT', 'RIGHT', 'DOWN'] : ['DOWN', 'RIGHT', 'LEFT', 'UP']
      }
    }
    
    // Add randomness
    if (Math.random() < 0.3) {
      preferredDirs = directions.sort(() => Math.random() - 0.5)
    }
    
    for (const dir of preferredDirs) {
      if (dir === opposites[ghost.direction] && Math.random() > 0.1) continue // Avoid reversing
      
      let newX = ghost.x, newY = ghost.y
      if (dir === 'UP') newY--
      if (dir === 'DOWN') newY++
      if (dir === 'LEFT') newX--
      if (dir === 'RIGHT') newX++
      
      // Check bounds
      if (newX >= 0 && newX < game.gridSize && newY >= 0 && newY < game.gridSize) {
        ghost.x = newX
        ghost.y = newY
        ghost.direction = dir
        break
      }
    }
  }, [])

  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const game = gameRef.current
    let frameCount = 0

    const gameLoop = setInterval(() => {
      frameCount++
      
      // Move pac-man
      let newX = game.pacman.x, newY = game.pacman.y
      if (game.pacman.direction === 'UP') newY--
      if (game.pacman.direction === 'DOWN') newY++
      if (game.pacman.direction === 'LEFT') newX--
      if (game.pacman.direction === 'RIGHT') newX++
      
      // Wrap around
      if (newX < 0) newX = game.gridSize - 1
      if (newX >= game.gridSize) newX = 0
      if (newY < 0) newY = game.gridSize - 1
      if (newY >= game.gridSize) newY = 0
      
      game.pacman.x = newX
      game.pacman.y = newY
      game.pacman.mouthOpen = frameCount % 6 < 3
      
      // Move ghosts (every 2 frames for slower speed)
      if (frameCount % 2 === 0) {
        game.ghosts.forEach(ghost => moveGhost(ghost))
      }
      
      // Check dot collision
      const dotIndex = game.dots.findIndex(d => d.x === game.pacman.x && d.y === game.pacman.y)
      if (dotIndex !== -1) {
        game.dots.splice(dotIndex, 1)
        setScore(s => s + 10)
      }
      
      // Check power pellet collision
      const pelletIndex = game.powerPellets.findIndex(p => p.x === game.pacman.x && p.y === game.pacman.y)
      if (pelletIndex !== -1) {
        game.powerPellets.splice(pelletIndex, 1)
        game.powerMode = true
        game.powerTimer = 100 // ~5 seconds
        setScore(s => s + 50)
      }
      
      // Power mode timer
      if (game.powerMode) {
        game.powerTimer--
        if (game.powerTimer <= 0) {
          game.powerMode = false
        }
      }
      
      // Check ghost collision
      for (let i = 0; i < game.ghosts.length; i++) {
        const ghost = game.ghosts[i]
        if (ghost.x === game.pacman.x && ghost.y === game.pacman.y) {
          if (game.powerMode) {
            // Eat ghost
            setScore(s => s + 200)
            ghost.x = 9 + (i % 2)
            ghost.y = 9 + Math.floor(i / 2)
          } else {
            // Lose life
            setLives(l => {
              if (l <= 1) {
                setGameState('over')
                return 0
              }
              // Reset positions
              game.pacman = { x: 10, y: 15, direction: 'RIGHT', mouthOpen: true }
              game.ghosts.forEach((g, idx) => {
                g.x = 9 + (idx % 2)
                g.y = 9 + Math.floor(idx / 2)
              })
              return l - 1
            })
          }
        }
      }
      
      // Check win condition
      if (game.dots.length === 0 && game.powerPellets.length === 0) {
        setGameState('won')
        return
      }
      
      // Draw
      ctx.fillStyle = '#000033'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw dots
      ctx.fillStyle = '#ffffff'
      game.dots.forEach(dot => {
        ctx.beginPath()
        ctx.arc(
          dot.x * game.cellSize + game.cellSize / 2,
          dot.y * game.cellSize + game.cellSize / 2,
          2, 0, Math.PI * 2
        )
        ctx.fill()
      })
      
      // Draw power pellets (blinking)
      if (frameCount % 10 < 7) {
        ctx.fillStyle = '#ffffff'
        game.powerPellets.forEach(pellet => {
          ctx.beginPath()
          ctx.arc(
            pellet.x * game.cellSize + game.cellSize / 2,
            pellet.y * game.cellSize + game.cellSize / 2,
            5, 0, Math.PI * 2
          )
          ctx.fill()
        })
      }
      
      // Draw pac-man
      ctx.fillStyle = '#ffff00'
      ctx.beginPath()
      const pacX = game.pacman.x * game.cellSize + game.cellSize / 2
      const pacY = game.pacman.y * game.cellSize + game.cellSize / 2
      const startAngle = game.pacman.mouthOpen ? 0.2 : 0.05
      const endAngle = game.pacman.mouthOpen ? -0.2 : -0.05
      let rotation = 0
      if (game.pacman.direction === 'LEFT') rotation = Math.PI
      if (game.pacman.direction === 'UP') rotation = -Math.PI / 2
      if (game.pacman.direction === 'DOWN') rotation = Math.PI / 2
      ctx.arc(pacX, pacY, game.cellSize / 2 - 1, rotation + startAngle * Math.PI, rotation + (2 - endAngle) * Math.PI)
      ctx.lineTo(pacX, pacY)
      ctx.fill()
      
      // Draw ghosts
      game.ghosts.forEach(ghost => {
        ctx.fillStyle = game.powerMode ? (frameCount % 10 < 5 ? '#0000ff' : '#ffffff') : ghost.color
        const gx = ghost.x * game.cellSize + game.cellSize / 2
        const gy = ghost.y * game.cellSize + game.cellSize / 2
        
        // Ghost body
        ctx.beginPath()
        ctx.arc(gx, gy - 2, game.cellSize / 2 - 2, Math.PI, 0)
        ctx.lineTo(gx + game.cellSize / 2 - 2, gy + game.cellSize / 2 - 2)
        // Wavy bottom
        for (let i = 0; i < 3; i++) {
          const wx = gx + game.cellSize / 2 - 2 - (i + 1) * (game.cellSize - 4) / 3
          ctx.lineTo(wx, gy + game.cellSize / 2 - 5 + (i % 2) * 3)
        }
        ctx.lineTo(gx - game.cellSize / 2 + 2, gy + game.cellSize / 2 - 2)
        ctx.closePath()
        ctx.fill()
        
        // Eyes
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
      
      // Draw ghost house outline
      ctx.strokeStyle = '#0000ff'
      ctx.lineWidth = 2
      ctx.strokeRect(8 * game.cellSize, 8 * game.cellSize, 4 * game.cellSize, 4 * game.cellSize)
      
    }, 100)

    return () => clearInterval(gameLoop)
  }, [gameState, moveGhost])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return
      e.preventDefault()
      if (e.key === 'ArrowUp') changeDirection('UP')
      if (e.key === 'ArrowDown') changeDirection('DOWN')
      if (e.key === 'ArrowLeft') changeDirection('LEFT')
      if (e.key === 'ArrowRight') changeDirection('RIGHT')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, changeDirection])

  const startGame = () => {
    initGame()
    setGameState('playing')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <div className="flex justify-between items-center w-full max-w-sm mb-4">
        <h2 className="text-xl text-white font-bold">👻 Pac-Man</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="text-white mb-2 flex gap-4 items-center">
        <span className="text-lg font-bold">Score: {score}</span>
        <span className="text-yellow-400">{'🟡'.repeat(lives)}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="border-2 border-blue-500/50 rounded-lg"
      />

      {gameState === 'playing' && (
        <div className="mt-6 relative w-44 h-44">
          <button 
            onTouchStart={(e) => { e.preventDefault(); changeDirection('UP'); }}
            onClick={() => changeDirection('UP')} 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-xl bg-yellow-500/30 border-2 border-yellow-500/50 flex items-center justify-center text-white text-2xl font-bold active:bg-yellow-500/60"
          >▲</button>
          <button 
            onTouchStart={(e) => { e.preventDefault(); changeDirection('DOWN'); }}
            onClick={() => changeDirection('DOWN')} 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-xl bg-yellow-500/30 border-2 border-yellow-500/50 flex items-center justify-center text-white text-2xl font-bold active:bg-yellow-500/60"
          >▼</button>
          <button 
            onTouchStart={(e) => { e.preventDefault(); changeDirection('LEFT'); }}
            onClick={() => changeDirection('LEFT')} 
            className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-xl bg-yellow-500/30 border-2 border-yellow-500/50 flex items-center justify-center text-white text-2xl font-bold active:bg-yellow-500/60"
          >◀</button>
          <button 
            onTouchStart={(e) => { e.preventDefault(); changeDirection('RIGHT'); }}
            onClick={() => changeDirection('RIGHT')} 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-xl bg-yellow-500/30 border-2 border-yellow-500/50 flex items-center justify-center text-white text-2xl font-bold active:bg-yellow-500/60"
          >▶</button>
        </div>
      )}

      {gameState === 'ready' && (
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm mb-4">Eat all dots! Grab power pellets to eat ghosts!</p>
          <button onClick={startGame} className="px-8 py-4 rounded-xl bg-yellow-500 text-black font-bold text-lg">
            Start Game
          </button>
        </div>
      )}
      
      {gameState === 'over' && (
        <div className="mt-6 text-center">
          <p className="text-red-400 text-xl mb-3">Game Over! Score: {score}</p>
          <button onClick={startGame} className="px-8 py-4 rounded-xl bg-yellow-500 text-black font-bold text-lg">
            Play Again
          </button>
        </div>
      )}

      {gameState === 'won' && (
        <div className="mt-6 text-center">
          <p className="text-green-400 text-xl mb-3">🎉 You Won! Score: {score}</p>
          <button onClick={startGame} className="px-8 py-4 rounded-xl bg-yellow-500 text-black font-bold text-lg">
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}

// Tic-Tac-Toe Component
const TicTacToe = ({ user, onClose }) => {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [gameState, setGameState] = useState('playing') // playing, won, draw

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ]
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  const handleClick = (i) => {
    if (board[i] || gameState !== 'playing') return
    
    const newBoard = [...board]
    newBoard[i] = isXNext ? 'X' : 'O'
    setBoard(newBoard)
    
    const winner = calculateWinner(newBoard)
    if (winner) {
      setGameState('won')
    } else if (newBoard.every(cell => cell)) {
      setGameState('draw')
    } else {
      setIsXNext(!isXNext)
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setGameState('playing')
  }

  const winner = calculateWinner(board)

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <div className="flex justify-between items-center w-full max-w-sm mb-4">
        <h2 className="text-xl text-white font-bold">⭕ Tic-Tac-Toe</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="text-white mb-4 text-lg">
        {gameState === 'playing' && `Next: ${isXNext ? 'X' : 'O'}`}
        {gameState === 'won' && `Winner: ${winner}! 🎉`}
        {gameState === 'draw' && "It's a Draw!"}
      </div>

      <div className="grid grid-cols-3 gap-2 w-64">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`w-20 h-20 rounded-xl text-4xl font-bold flex items-center justify-center transition-all
              ${cell ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'}
              ${cell === 'X' ? 'text-amber-400' : 'text-pink-400'}`}
          >
            {cell}
          </button>
        ))}
      </div>

      {gameState !== 'playing' && (
        <button
          onClick={resetGame}
          className="mt-6 px-8 py-4 rounded-xl bg-purple-500 text-white font-bold text-lg"
        >
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
            </div>
          </button>
        ))}
      </div>

      {activeGame === 'snake' && <SnakeGame onClose={() => setActiveGame(null)} />}
      {activeGame === 'pacman' && <PacManGame onClose={() => setActiveGame(null)} />}
      {activeGame === 'tictactoe' && <TicTacToe user={user} onClose={() => setActiveGame(null)} />}
    </div>
  )
}
