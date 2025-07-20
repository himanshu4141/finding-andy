import type { GameState, GameSettings, Point } from '../types'

interface GameEngineState {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  animationId: number | null
  gameState: GameState
  settings: GameSettings
  lastTime: number
}

// Functional approach for game engine creation
export function createGameEngine(canvas: HTMLCanvasElement, settings: GameSettings) {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Unable to get 2D rendering context')
  }

  const state: GameEngineState = {
    canvas,
    ctx,
    animationId: null,
    settings,
    lastTime: 0,
    gameState: {
      isRunning: false,
      score: 0,
      level: 1,
      timeRemaining: 60,
      andyFound: false
    }
  }

  // Setup functions
  const setupCanvas = () => {
    resizeCanvas()
    state.ctx.imageSmoothingEnabled = false
  }

  const setupEventListeners = () => {
    const handleResize = () => resizeCanvas()
    const handleClick = (event: MouseEvent) => {
      const point = getCanvasCoordinates(event.clientX, event.clientY)
      processClick(point)
    }
    const handleTouch = (event: TouchEvent) => {
      event.preventDefault()
      const touch = event.touches[0]
      const point = getCanvasCoordinates(touch.clientX, touch.clientY)
      processClick(point)
    }

    window.addEventListener('resize', handleResize)
    state.canvas.addEventListener('click', handleClick)
    state.canvas.addEventListener('touchstart', handleTouch)

    return () => {
      window.removeEventListener('resize', handleResize)
      state.canvas.removeEventListener('click', handleClick)
      state.canvas.removeEventListener('touchstart', handleTouch)
    }
  }

  const resizeCanvas = () => {
    const container = state.canvas.parentElement
    if (!container) return

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    
    const aspectRatio = state.settings.canvasWidth / state.settings.canvasHeight
    let canvasWidth: number
    let canvasHeight: number
    
    if (containerWidth / containerHeight > aspectRatio) {
      canvasHeight = containerHeight
      canvasWidth = canvasHeight * aspectRatio
    } else {
      canvasWidth = containerWidth
      canvasHeight = canvasWidth / aspectRatio
    }
    
    state.canvas.width = state.settings.canvasWidth
    state.canvas.height = state.settings.canvasHeight
    state.canvas.style.width = `${canvasWidth}px`
    state.canvas.style.height = `${canvasHeight}px`
    
    if (state.gameState.isRunning) {
      render()
    }
  }

  const getCanvasCoordinates = (clientX: number, clientY: number): Point => {
    const rect = state.canvas.getBoundingClientRect()
    const scaleX = state.settings.canvasWidth / rect.width
    const scaleY = state.settings.canvasHeight / rect.height
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    }
  }

  const processClick = (point: Point) => {
    if (!state.gameState.isRunning) return
    
    console.log('Click at:', point)
    // TODO: Add hit detection logic here
  }

  const start = () => {
    if (state.gameState.isRunning) return
    
    state.gameState.isRunning = true
    state.gameState.timeRemaining = 60
    state.gameState.score = 0
    state.gameState.andyFound = false
    
    gameLoop(0)
  }

  const stop = () => {
    state.gameState.isRunning = false
    if (state.animationId) {
      cancelAnimationFrame(state.animationId)
      state.animationId = null
    }
  }

  const pause = () => {
    state.gameState.isRunning = false
    if (state.animationId) {
      cancelAnimationFrame(state.animationId)
      state.animationId = null
    }
  }

  const resume = () => {
    if (!state.gameState.isRunning) {
      state.gameState.isRunning = true
      gameLoop(performance.now())
    }
  }

  const gameLoop = (currentTime: number) => {
    if (!state.gameState.isRunning) return
    
    // Calculate delta time
    const deltaTime = currentTime - state.lastTime
    state.lastTime = currentTime
    
    // Update game logic
    update(deltaTime)
    
    // Render frame
    render()
    
    // Continue loop
    state.animationId = requestAnimationFrame(gameLoop)
  }

  const update = (deltaTime: number) => {
    // Update timer
    if (state.gameState.timeRemaining > 0) {
      state.gameState.timeRemaining -= deltaTime / 1000
      
      if (state.gameState.timeRemaining <= 0) {
        state.gameState.timeRemaining = 0
        stop()
      }
    }
  }

  const render = () => {
    // Clear canvas
    state.ctx.fillStyle = '#2c3e50'
    state.ctx.fillRect(0, 0, state.settings.canvasWidth, state.settings.canvasHeight)
    
    // Draw UI
    drawUI()
    
    // Draw game content
    drawPlaceholderCrowd()
  }

  const drawUI = () => {
    state.ctx.fillStyle = '#ffffff'
    state.ctx.font = '20px Arial'
    state.ctx.textAlign = 'left'
    state.ctx.fillText(`Score: ${state.gameState.score}`, 20, 40)
    state.ctx.fillText(`Time: ${Math.ceil(state.gameState.timeRemaining)}`, 20, 70)
    state.ctx.fillText(`Level: ${state.gameState.level}`, 20, 100)
    
    state.ctx.textAlign = 'center'
    state.ctx.font = '16px Arial'
    state.ctx.fillText('Find Andy in the crowd!', state.settings.canvasWidth / 2, 30)
  }

  const drawPlaceholderCrowd = () => {
    const characters = 50
    const cols = 10
    const rows = 5
    const charWidth = 40
    const charHeight = 60
    
    const startX = (state.settings.canvasWidth - (cols * charWidth)) / 2
    const startY = (state.settings.canvasHeight - (rows * charHeight)) / 2 + 50
    
    for (let i = 0; i < characters; i++) {
      const row = Math.floor(i / cols)
      const col = i % cols
      
      const x = startX + col * charWidth
      const y = startY + row * charHeight
      
      const isAndy = i === 23
      state.ctx.fillStyle = isAndy ? '#ff6b6b' : '#4ecdc4'
      state.ctx.fillRect(x + 5, y + 10, charWidth - 10, charHeight - 20)
      
      state.ctx.fillStyle = '#fdbcb4'
      state.ctx.fillRect(x + 10, y + 5, charWidth - 20, 15)
      
      state.ctx.fillStyle = '#000000'
      state.ctx.fillRect(x + 12, y + 8, 3, 3)
      state.ctx.fillRect(x + charWidth - 15, y + 8, 3, 3)
      
      if (isAndy) {
        state.ctx.fillStyle = '#ffffff'
        state.ctx.font = '12px Arial'
        state.ctx.textAlign = 'center'
        state.ctx.fillText('ANDY', x + charWidth / 2, y + charHeight + 15)
      }
    }
  }

  const getGameState = (): GameState => {
    return { ...state.gameState }
  }

  // Initialize
  setupCanvas()
  const cleanup = setupEventListeners()

  const destroy = () => {
    stop()
    cleanup()
  }

  // Return public API
  return {
    start,
    stop,
    pause,
    resume,
    getGameState,
    destroy
  }
}

// Backward compatibility - keep class interface for now
export class GameEngine {
  private engine: ReturnType<typeof createGameEngine>

  constructor(canvas: HTMLCanvasElement, settings: GameSettings) {
    this.engine = createGameEngine(canvas, settings)
  }

  start() {
    this.engine.start()
  }

  stop() {
    this.engine.stop()
  }

  pause() {
    this.engine.pause()
  }

  resume() {
    this.engine.resume()
  }

  getGameState(): GameState {
    return this.engine.getGameState()
  }

  destroy() {
    this.engine.destroy()
  }
}