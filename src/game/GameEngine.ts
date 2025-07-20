import type { GameState, GameSettings, Point, Character } from '../types'

interface GameEngineState {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  animationId: number | null
  gameState: GameState
  settings: GameSettings
  lastTime: number
}

// Constants for the enhanced game
const ARENA_WIDTH = 2400  // 3x larger than canvas width
const ARENA_HEIGHT = 1800 // 3x larger than canvas height
const ZOOM_LENS_RADIUS = 80
const ZOOM_MAGNIFICATION = 2.0
const CAMERA_LERP_SPEED = 0.1
const CROWD_DENSITY = 300 // More characters in larger area

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
      andyFound: false,
      camera: {
        x: (ARENA_WIDTH - settings.canvasWidth) / 2,
        y: (ARENA_HEIGHT - settings.canvasHeight) / 2,
        targetX: (ARENA_WIDTH - settings.canvasWidth) / 2,
        targetY: (ARENA_HEIGHT - settings.canvasHeight) / 2,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        dragStartCameraX: 0,
        dragStartCameraY: 0
      },
      zoomLens: {
        x: settings.canvasWidth / 2,
        y: settings.canvasHeight / 2,
        radius: ZOOM_LENS_RADIUS,
        magnification: ZOOM_MAGNIFICATION,
        isActive: false
      },
      arena: {
        width: ARENA_WIDTH,
        height: ARENA_HEIGHT,
        crowdDensity: CROWD_DENSITY,
        characters: []
      }
    }
  }

  // Helper functions
  const generateCrowd = (): Character[] => {
    const characters: Character[] = []
    const charWidth = 40
    const charHeight = 60
    const padding = 10
    
    // Calculate grid dimensions based on arena size  
    const cols = Math.floor((ARENA_WIDTH - padding * 2) / (charWidth + padding))
    const rows = Math.floor((ARENA_HEIGHT - padding * 2) / (charHeight + padding))
    
    const startX = (ARENA_WIDTH - (cols * (charWidth + padding))) / 2
    const startY = (ARENA_HEIGHT - (rows * (charHeight + padding))) / 2
    
    let characterCount = 0
    const andyIndex = Math.floor(Math.random() * (cols * rows))
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (characterCount >= CROWD_DENSITY) break
        
        const x = startX + col * (charWidth + padding)
        const y = startY + row * (charHeight + padding)
        
        characters.push({
          id: `char-${characterCount}`,
          x,
          y,
          width: charWidth,
          height: charHeight,
          isAndy: characterCount === andyIndex,
          spriteIndex: characterCount % 5
        })
        
        characterCount++
      }
      if (characterCount >= CROWD_DENSITY) break
    }
    
    return characters
  }

  // Setup functions
  const setupCanvas = () => {
    resizeCanvas()
    state.ctx.imageSmoothingEnabled = false
  }

  const setupEventListeners = () => {
    const handleResize = () => resizeCanvas()
    
    const handleMouseDown = (event: MouseEvent) => {
      if (!state.gameState.isRunning) return
      
      const point = getCanvasCoordinates(event.clientX, event.clientY)
      state.gameState.camera.isDragging = true
      state.gameState.camera.dragStartX = point.x
      state.gameState.camera.dragStartY = point.y
      state.gameState.camera.dragStartCameraX = state.gameState.camera.x
      state.gameState.camera.dragStartCameraY = state.gameState.camera.y
      state.canvas.style.cursor = 'grabbing'
    }
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!state.gameState.isRunning) return
      
      const point = getCanvasCoordinates(event.clientX, event.clientY)
      
      // Update zoom lens position
      state.gameState.zoomLens.x = point.x
      state.gameState.zoomLens.y = point.y
      state.gameState.zoomLens.isActive = true
      
      // Handle dragging
      if (state.gameState.camera.isDragging) {
        const deltaX = state.gameState.camera.dragStartX - point.x
        const deltaY = state.gameState.camera.dragStartY - point.y
        
        state.gameState.camera.targetX = constrainCamera(
          state.gameState.camera.dragStartCameraX + deltaX, 
          'x'
        )
        state.gameState.camera.targetY = constrainCamera(
          state.gameState.camera.dragStartCameraY + deltaY, 
          'y'
        )
      }
    }
    
    const handleMouseUp = () => {
      state.gameState.camera.isDragging = false
      state.canvas.style.cursor = 'grab'
    }
    
    const handleMouseLeave = () => {
      state.gameState.zoomLens.isActive = false
      state.gameState.camera.isDragging = false
      state.canvas.style.cursor = 'default'
    }
    
    const handleClick = (event: MouseEvent) => {
      if (state.gameState.camera.isDragging) return
      
      const point = getCanvasCoordinates(event.clientX, event.clientY)
      processClick(point)
    }
    
    // Touch event handlers
    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault()
      if (!state.gameState.isRunning) return
      
      const touch = event.touches[0]
      const point = getCanvasCoordinates(touch.clientX, touch.clientY)
      
      state.gameState.camera.isDragging = true
      state.gameState.camera.dragStartX = point.x
      state.gameState.camera.dragStartY = point.y
      state.gameState.camera.dragStartCameraX = state.gameState.camera.x
      state.gameState.camera.dragStartCameraY = state.gameState.camera.y
      
      // Also update zoom lens for touch
      state.gameState.zoomLens.x = point.x
      state.gameState.zoomLens.y = point.y
      state.gameState.zoomLens.isActive = true
    }
    
    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault()
      if (!state.gameState.isRunning) return
      
      const touch = event.touches[0]
      const point = getCanvasCoordinates(touch.clientX, touch.clientY)
      
      // Update zoom lens position
      state.gameState.zoomLens.x = point.x
      state.gameState.zoomLens.y = point.y
      
      // Handle dragging
      if (state.gameState.camera.isDragging) {
        const deltaX = state.gameState.camera.dragStartX - point.x
        const deltaY = state.gameState.camera.dragStartY - point.y
        
        state.gameState.camera.targetX = constrainCamera(
          state.gameState.camera.dragStartCameraX + deltaX, 
          'x'
        )
        state.gameState.camera.targetY = constrainCamera(
          state.gameState.camera.dragStartCameraY + deltaY, 
          'y'
        )
      }
    }
    
    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault()
      
      if (!state.gameState.camera.isDragging && event.changedTouches.length === 1) {
        const touch = event.changedTouches[0]
        const point = getCanvasCoordinates(touch.clientX, touch.clientY)
        processClick(point)
      }
      
      state.gameState.camera.isDragging = false
      state.gameState.zoomLens.isActive = false
    }

    // Set initial cursor style
    state.canvas.style.cursor = 'grab'

    window.addEventListener('resize', handleResize)
    state.canvas.addEventListener('mousedown', handleMouseDown)
    state.canvas.addEventListener('mousemove', handleMouseMove)
    state.canvas.addEventListener('mouseup', handleMouseUp)
    state.canvas.addEventListener('mouseleave', handleMouseLeave)
    state.canvas.addEventListener('click', handleClick)
    state.canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    state.canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    state.canvas.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      window.removeEventListener('resize', handleResize)
      state.canvas.removeEventListener('mousedown', handleMouseDown)
      state.canvas.removeEventListener('mousemove', handleMouseMove)
      state.canvas.removeEventListener('mouseup', handleMouseUp)
      state.canvas.removeEventListener('mouseleave', handleMouseLeave)
      state.canvas.removeEventListener('click', handleClick)
      state.canvas.removeEventListener('touchstart', handleTouchStart)
      state.canvas.removeEventListener('touchmove', handleTouchMove)
      state.canvas.removeEventListener('touchend', handleTouchEnd)
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

  const constrainCamera = (value: number, axis: 'x' | 'y'): number => {
    if (axis === 'x') {
      const maxX = state.gameState.arena.width - state.settings.canvasWidth
      return Math.max(0, Math.min(maxX, value))
    } else {
      const maxY = state.gameState.arena.height - state.settings.canvasHeight
      return Math.max(0, Math.min(maxY, value))
    }
  }

  const processClick = (point: Point) => {
    if (!state.gameState.isRunning) return
    
    // Convert screen coordinates to world coordinates
    const worldX = point.x + state.gameState.camera.x
    const worldY = point.y + state.gameState.camera.y
    
    // Check if click hits Andy
    for (const character of state.gameState.arena.characters) {
      if (character.isAndy && 
          worldX >= character.x && 
          worldX <= character.x + character.width &&
          worldY >= character.y && 
          worldY <= character.y + character.height) {
        state.gameState.andyFound = true
        state.gameState.score += 100
        console.log('Andy found!', { worldX, worldY, character })
        break
      }
    }
  }

  const start = () => {
    if (state.gameState.isRunning) return
    
    state.gameState.isRunning = true
    state.gameState.timeRemaining = 60
    state.gameState.score = 0
    state.gameState.andyFound = false
    
    // Generate new crowd
    state.gameState.arena.characters = generateCrowd()
    
    // Reset camera to center
    state.gameState.camera.x = (ARENA_WIDTH - state.settings.canvasWidth) / 2
    state.gameState.camera.y = (ARENA_HEIGHT - state.settings.canvasHeight) / 2
    state.gameState.camera.targetX = state.gameState.camera.x
    state.gameState.camera.targetY = state.gameState.camera.y
    
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
    
    // Smooth camera interpolation
    const camera = state.gameState.camera
    camera.x += (camera.targetX - camera.x) * CAMERA_LERP_SPEED
    camera.y += (camera.targetY - camera.y) * CAMERA_LERP_SPEED
  }

  const render = () => {
    // Clear canvas
    state.ctx.fillStyle = '#2c3e50'
    state.ctx.fillRect(0, 0, state.settings.canvasWidth, state.settings.canvasHeight)
    
    // Save context for transformations
    state.ctx.save()
    
    // Apply camera offset
    state.ctx.translate(-state.gameState.camera.x, -state.gameState.camera.y)
    
    // Draw arena background
    drawArenaBackground()
    
    // Draw all characters in viewport
    drawCrowd()
    
    // Restore context
    state.ctx.restore()
    
    // Draw UI (not affected by camera)
    drawUI()
    
    // Draw zoom lens last (on top of everything)
    if (state.gameState.zoomLens.isActive) {
      drawZoomLens()
    }
  }

  const drawArenaBackground = () => {
    // Draw a subtle grid pattern for the arena
    state.ctx.fillStyle = '#34495e'
    state.ctx.fillRect(0, 0, state.gameState.arena.width, state.gameState.arena.height)
    
    // Draw grid lines
    state.ctx.strokeStyle = '#3a526b'
    state.ctx.lineWidth = 1
    
    const gridSize = 100
    for (let x = 0; x <= state.gameState.arena.width; x += gridSize) {
      state.ctx.beginPath()
      state.ctx.moveTo(x, 0)
      state.ctx.lineTo(x, state.gameState.arena.height)
      state.ctx.stroke()
    }
    
    for (let y = 0; y <= state.gameState.arena.height; y += gridSize) {
      state.ctx.beginPath()
      state.ctx.moveTo(0, y)
      state.ctx.lineTo(state.gameState.arena.width, y)
      state.ctx.stroke()
    }
  }

  const drawCrowd = () => {
    const camera = state.gameState.camera
    
    // Only draw characters that are visible in the viewport (with some margin)
    const margin = 100
    const viewLeft = camera.x - margin
    const viewRight = camera.x + state.settings.canvasWidth + margin
    const viewTop = camera.y - margin
    const viewBottom = camera.y + state.settings.canvasHeight + margin
    
    for (const character of state.gameState.arena.characters) {
      // Skip characters that are not in view
      if (character.x + character.width < viewLeft || 
          character.x > viewRight || 
          character.y + character.height < viewTop || 
          character.y > viewBottom) {
        continue
      }
      
      drawCharacter(character)
    }
  }

  const drawCharacter = (character: Character) => {
    const { x, y, width, height, isAndy } = character
    
    // Body color
    state.ctx.fillStyle = isAndy ? '#ff6b6b' : '#4ecdc4'
    state.ctx.fillRect(x + 5, y + 10, width - 10, height - 20)
    
    // Head
    state.ctx.fillStyle = '#fdbcb4'
    state.ctx.fillRect(x + 10, y + 5, width - 20, 15)
    
    // Eyes
    state.ctx.fillStyle = '#000000'
    state.ctx.fillRect(x + 12, y + 8, 3, 3)
    state.ctx.fillRect(x + width - 15, y + 8, 3, 3)
    
    // Andy label (only visible when close enough or in zoom lens)
    if (isAndy) {
      state.ctx.fillStyle = '#ffffff'
      state.ctx.font = '10px Arial'
      state.ctx.textAlign = 'center'
      state.ctx.fillText('A', x + width / 2, y + height + 10)
    }
  }

  const drawZoomLens = () => {
    const lens = state.gameState.zoomLens
    const camera = state.gameState.camera
    
    // Calculate the world position that the lens is looking at
    const worldX = lens.x + camera.x
    const worldY = lens.y + camera.y
    
    // Create circular clipping path
    state.ctx.save()
    state.ctx.beginPath()
    state.ctx.arc(lens.x, lens.y, lens.radius, 0, Math.PI * 2)
    state.ctx.clip()
    
    // Fill background
    state.ctx.fillStyle = '#2c3e50'
    state.ctx.fillRect(lens.x - lens.radius, lens.y - lens.radius, lens.radius * 2, lens.radius * 2)
    
    // Apply zoom transformation
    state.ctx.save()
    state.ctx.translate(lens.x, lens.y)
    state.ctx.scale(lens.magnification, lens.magnification)
    state.ctx.translate(-worldX, -worldY)
    
    // Draw magnified content
    drawArenaBackground()
    
    // Draw characters in the lens area
    const lensMargin = lens.radius / lens.magnification + 50
    const lensLeft = worldX - lensMargin
    const lensRight = worldX + lensMargin
    const lensTop = worldY - lensMargin
    const lensBottom = worldY + lensMargin
    
    for (const character of state.gameState.arena.characters) {
      if (character.x + character.width >= lensLeft && 
          character.x <= lensRight && 
          character.y + character.height >= lensTop && 
          character.y <= lensBottom) {
        drawCharacter(character)
      }
    }
    
    state.ctx.restore() // Restore zoom transformation
    
    // Draw lens border
    state.ctx.strokeStyle = '#ffffff'
    state.ctx.lineWidth = 3
    state.ctx.beginPath()
    state.ctx.arc(lens.x, lens.y, lens.radius, 0, Math.PI * 2)
    state.ctx.stroke()
    
    // Draw inner border for better visibility
    state.ctx.strokeStyle = '#000000'
    state.ctx.lineWidth = 1
    state.ctx.beginPath()
    state.ctx.arc(lens.x, lens.y, lens.radius - 2, 0, Math.PI * 2)
    state.ctx.stroke()
    
    state.ctx.restore() // Restore clipping
  }

  const drawUI = () => {
    state.ctx.fillStyle = '#ffffff'
    state.ctx.font = '16px Arial'
    state.ctx.textAlign = 'left'
    state.ctx.fillText(`Score: ${state.gameState.score}`, 20, 30)
    state.ctx.fillText(`Time: ${Math.ceil(state.gameState.timeRemaining)}`, 20, 50)
    state.ctx.fillText(`Level: ${state.gameState.level}`, 20, 70)
    
    // Instructions
    state.ctx.textAlign = 'center'
    state.ctx.font = '14px Arial'
    state.ctx.fillStyle = '#ecf0f1'
    state.ctx.fillText('Drag to explore • Hover for zoom lens', state.settings.canvasWidth / 2, state.settings.canvasHeight - 20)
    
    // Game status indicator
    if (state.gameState.andyFound) {
      state.ctx.fillStyle = '#2ecc71'
      state.ctx.font = 'bold 24px Arial'
      state.ctx.textAlign = 'center'
      state.ctx.fillText('ANDY FOUND! 🎉', state.settings.canvasWidth / 2, state.settings.canvasHeight / 2)
    }
    
    // Drag indicator
    if (state.gameState.camera.isDragging) {
      state.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      state.ctx.font = '12px Arial'
      state.ctx.textAlign = 'right'
      state.ctx.fillText('Dragging...', state.settings.canvasWidth - 20, 30)
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