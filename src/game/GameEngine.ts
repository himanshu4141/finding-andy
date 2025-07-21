import type { GameState, GameSettings, Point, Character } from '../types'
import { createAudioManager } from './AudioManager'
import { createCelebrationParticles, updateParticles, renderParticles } from './ParticleSystem'
import { assetManager, COLDPLAY_COLORS, performanceOptimizer, isInViewport, optimizeCanvasForPixelArt } from '../assets'

interface GameEngineState {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  animationId: number | null
  gameState: GameState
  settings: GameSettings
  lastTime: number
  audioManager: ReturnType<typeof createAudioManager>
  crowdBackground: HTMLCanvasElement | null
}

// Constants for the enhanced game
const ARENA_WIDTH = 2400  // 3x larger than canvas width
const ARENA_HEIGHT = 1800 // 3x larger than canvas height
const ZOOM_LENS_RADIUS = 80
const ZOOM_MAGNIFICATION = 2.0
const CAMERA_LERP_SPEED = 0.1
const CROWD_DENSITY = 300 // More characters in larger area
const VICTORY_DURATION = 5000 // 5 seconds of celebration
const SHAKE_DURATION = 300 // 300ms shake on miss

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
    audioManager: createAudioManager(),
    crowdBackground: null,
    gameState: {
      isRunning: false,
      score: 0,
      level: 1,
      timeRemaining: 60,
      andyFound: false,
      companionFound: false,
      bothFound: false,
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
      },
      victory: {
        isActive: false,
        stage: 'none',
        duration: 0,
        particles: [],
        shakeIntensity: 0,
        celebrationStartTime: 0
      },
      feedback: {
        shake: {
          isActive: false,
          duration: 0,
          intensity: 0,
          startTime: 0
        },
        lastMissPosition: null,
        missCount: 0
      }
    }
  }

  // Helper functions
  const initializeCrowdBackground = async () => {
    try {
      // Create concert crowd background
      const crowdBg = assetManager.createCrowdBackground({
        width: ARENA_WIDTH,
        height: ARENA_HEIGHT,
        theme: 'concert',
        density: 0.7,
        colors: COLDPLAY_COLORS
      })
      
      state.crowdBackground = crowdBg
      console.log('Crowd background initialized:', ARENA_WIDTH, 'x', ARENA_HEIGHT)
    } catch (error) {
      console.warn('Failed to initialize crowd background:', error)
      state.crowdBackground = null
    }
  }

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
    
    // Ensure we don't try to place more characters than we can create
    const actualCrowdSize = Math.min(CROWD_DENSITY, cols * rows)
    
    // Choose random indices within the range of characters we'll actually create
    const andyIndex = Math.floor(Math.random() * actualCrowdSize)
    const companionIndex = Math.floor(Math.random() * actualCrowdSize)
    
    // Ensure Andy and companion are different characters
    let adjustedCompanionIndex = companionIndex
    if (companionIndex === andyIndex) {
      adjustedCompanionIndex = (companionIndex + 1) % actualCrowdSize
    }
    
    let characterCount = 0
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (characterCount >= actualCrowdSize) break
        
        const x = startX + col * (charWidth + padding)
        const y = startY + row * (charHeight + padding)
        
        characters.push({
          id: `char-${characterCount}`,
          x,
          y,
          width: charWidth,
          height: charHeight,
          isAndy: characterCount === andyIndex,
          isCompanion: characterCount === adjustedCompanionIndex,
          spriteIndex: characterCount % 5
        })
        
        characterCount++
      }
      if (characterCount >= actualCrowdSize) break
    }
    
    console.log(`Generated ${characters.length} characters. Andy at index ${andyIndex}, Companion at index ${adjustedCompanionIndex}`)
    
    return characters
  }

  // Setup functions
  const setupCanvas = () => {
    resizeCanvas()
    state.ctx.imageSmoothingEnabled = false
    
    // Apply pixel art optimizations
    optimizeCanvasForPixelArt(state.canvas)
    
    // Start performance monitoring
    performanceOptimizer.startMonitoring()
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
    
    let foundCharacter = false
    
    // Check if click hits any special character
    for (const character of state.gameState.arena.characters) {
      if (worldX >= character.x && 
          worldX <= character.x + character.width &&
          worldY >= character.y && 
          worldY <= character.y + character.height) {
        
        if (character.isAndy && !state.gameState.andyFound) {
          state.gameState.andyFound = true
          state.gameState.score += 100
          foundCharacter = true
          state.audioManager.playSound('victory', 0.8)
          console.log('Andy found!', { worldX, worldY, character })
          break
        } else if (character.isCompanion && !state.gameState.companionFound) {
          state.gameState.companionFound = true
          state.gameState.score += 100
          foundCharacter = true
          state.audioManager.playSound('victory', 0.8)
          console.log('Companion found!', { worldX, worldY, character })
          break
        }
      }
    }
    
    // Check if both characters found
    if (state.gameState.andyFound && state.gameState.companionFound && !state.gameState.bothFound) {
      state.gameState.bothFound = true
      triggerVictorySequence()
    }
    
    // If no special character was clicked, trigger miss feedback
    if (!foundCharacter) {
      triggerMissFeedback({ x: worldX, y: worldY })
    }
  }

  const triggerVictorySequence = () => {
    const currentTime = performance.now()
    state.gameState.victory.isActive = true
    state.gameState.victory.stage = 'confetti'
    state.gameState.victory.celebrationStartTime = currentTime
    state.gameState.victory.duration = VICTORY_DURATION
    state.gameState.victory.particles = createCelebrationParticles(
      state.settings.canvasWidth, 
      state.settings.canvasHeight
    )
    
    // Play celebration sounds
    state.audioManager.playSound('applause')
    setTimeout(() => state.audioManager.playSound('confetti'), 500)
    
    // Award bonus points
    state.gameState.score += 500
    
    console.log('Victory sequence triggered!')
  }

  const triggerMissFeedback = (missPosition: Point) => {
    const currentTime = performance.now()
    
    state.gameState.feedback.missCount += 1
    state.gameState.feedback.lastMissPosition = missPosition
    state.gameState.feedback.shake.isActive = true
    state.gameState.feedback.shake.startTime = currentTime
    state.gameState.feedback.shake.duration = SHAKE_DURATION
    state.gameState.feedback.shake.intensity = 5
    
    // Play miss sound
    state.audioManager.playSound('miss')
    
    console.log('Miss feedback triggered at', missPosition)
  }

  const start = () => {
    if (state.gameState.isRunning) return
    
    state.gameState.isRunning = true
    state.gameState.timeRemaining = 60
    state.gameState.score = 0
    state.gameState.andyFound = false
    state.gameState.companionFound = false
    state.gameState.bothFound = false
    
    // Reset victory state
    state.gameState.victory.isActive = false
    state.gameState.victory.stage = 'none'
    state.gameState.victory.duration = 0
    state.gameState.victory.particles = []
    state.gameState.victory.shakeIntensity = 0
    state.gameState.victory.celebrationStartTime = 0
    
    // Reset feedback state
    state.gameState.feedback.shake.isActive = false
    state.gameState.feedback.shake.duration = 0
    state.gameState.feedback.shake.intensity = 0
    state.gameState.feedback.shake.startTime = 0
    state.gameState.feedback.lastMissPosition = null
    state.gameState.feedback.missCount = 0
    
    // Initialize crowd background if not already done
    if (!state.crowdBackground) {
      initializeCrowdBackground()
    }
    
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
    const currentTime = performance.now()
    
    // Update timer
    if (state.gameState.timeRemaining > 0 && !state.gameState.bothFound) {
      state.gameState.timeRemaining -= deltaTime / 1000
      
      if (state.gameState.timeRemaining <= 0) {
        state.gameState.timeRemaining = 0
        stop()
      }
    }
    
    // Update victory animations
    if (state.gameState.victory.isActive) {
      const elapsed = currentTime - state.gameState.victory.celebrationStartTime
      
      // Update particles
      state.gameState.victory.particles = updateParticles(state.gameState.victory.particles, deltaTime)
      
      // Manage victory stages
      if (elapsed > state.gameState.victory.duration) {
        state.gameState.victory.isActive = false
        state.gameState.victory.stage = 'complete'
        // Game continues or could be stopped here
      } else if (elapsed > state.gameState.victory.duration * 0.7) {
        state.gameState.victory.stage = 'celebration'
      }
      
      // Add celebration shake effect
      state.gameState.victory.shakeIntensity = Math.sin(elapsed * 0.01) * 2
    }
    
    // Update shake feedback
    if (state.gameState.feedback.shake.isActive) {
      const elapsed = currentTime - state.gameState.feedback.shake.startTime
      
      if (elapsed > state.gameState.feedback.shake.duration) {
        state.gameState.feedback.shake.isActive = false
        state.gameState.feedback.shake.intensity = 0
      } else {
        // Decrease shake intensity over time
        const progress = elapsed / state.gameState.feedback.shake.duration
        state.gameState.feedback.shake.intensity = 5 * (1 - progress)
      }
    }
    
    // Smooth camera interpolation
    const camera = state.gameState.camera
    camera.x += (camera.targetX - camera.x) * CAMERA_LERP_SPEED
    camera.y += (camera.targetY - camera.y) * CAMERA_LERP_SPEED
  }

  const render = () => {
    // Update performance metrics
    const windowWithMetrics = window as unknown as { updatePerformanceMetrics?: () => void }
    if (windowWithMetrics.updatePerformanceMetrics) {
      windowWithMetrics.updatePerformanceMetrics()
    }
    
    // Apply performance optimizations
    performanceOptimizer.optimizeDrawing(state.canvas, state.ctx)
    
    // Calculate shake offset
    let shakeX = 0
    let shakeY = 0
    
    if (state.gameState.feedback.shake.isActive) {
      shakeX = (Math.random() - 0.5) * state.gameState.feedback.shake.intensity
      shakeY = (Math.random() - 0.5) * state.gameState.feedback.shake.intensity
    }
    
    if (state.gameState.victory.isActive) {
      shakeX += (Math.random() - 0.5) * state.gameState.victory.shakeIntensity
      shakeY += (Math.random() - 0.5) * state.gameState.victory.shakeIntensity
    }
    
    // Clear canvas
    state.ctx.fillStyle = '#2c3e50'
    state.ctx.fillRect(0, 0, state.settings.canvasWidth, state.settings.canvasHeight)
    
    // Save context for transformations
    state.ctx.save()
    
    // Apply shake effect
    state.ctx.translate(shakeX, shakeY)
    
    // Apply camera offset
    state.ctx.translate(-state.gameState.camera.x, -state.gameState.camera.y)
    
    // Draw arena background
    drawArenaBackground()
    
    // Draw all characters in viewport
    drawCrowd()
    
    // Restore context
    state.ctx.restore()
    
    // Draw victory particles (not affected by camera)
    if (state.gameState.victory.isActive && state.gameState.victory.particles.length > 0) {
      state.ctx.save()
      state.ctx.translate(shakeX, shakeY) // Apply shake to particles too
      renderParticles(state.ctx, state.gameState.victory.particles)
      state.ctx.restore()
    }
    
    // Draw UI (not affected by camera or shake for readability)
    drawUI()
    
    // Draw zoom lens last (on top of everything)
    if (state.gameState.zoomLens.isActive) {
      state.ctx.save()
      state.ctx.translate(shakeX, shakeY) // Apply shake to zoom lens
      drawZoomLens()
      state.ctx.restore()
    }
    
    // Show performance metrics in debug mode
    if (state.settings.difficulty === 'easy' && Math.random() < 0.02) {
      const metrics = performanceOptimizer.getMetrics()
      if (metrics.fps > 0) {
        console.log(`Performance: ${metrics.fps}fps, ${metrics.frameTime}ms, Draw calls: ${metrics.drawCalls}`)
      }
    }
  }

  const drawArenaBackground = () => {
    if (state.crowdBackground) {
      // Draw the procedural crowd background
      state.ctx.drawImage(state.crowdBackground, 0, 0)
    } else {
      // Fallback: Concert-themed basic background
      state.ctx.fillStyle = COLDPLAY_COLORS.background
      state.ctx.fillRect(0, 0, state.gameState.arena.width, state.gameState.arena.height)
      
      // Add some basic concert lighting effects as fallback
      state.ctx.globalAlpha = 0.1
      
      // Stage area
      state.ctx.fillStyle = COLDPLAY_COLORS.stage
      state.ctx.fillRect(0, 0, state.gameState.arena.width, state.gameState.arena.height * 0.15)
      
      // Simple crowd suggestion with color bands
      const bandHeight = (state.gameState.arena.height * 0.85) / COLDPLAY_COLORS.crowd.length
      COLDPLAY_COLORS.crowd.forEach((color, index) => {
        state.ctx.fillStyle = color
        const y = state.gameState.arena.height * 0.15 + (index * bandHeight)
        state.ctx.fillRect(0, y, state.gameState.arena.width, bandHeight)
      })
      
      state.ctx.globalAlpha = 1.0
    }
  }

  const drawCrowd = () => {
    const camera = state.gameState.camera
    
    // Optimized viewport culling
    const margin = 100
    let visibleCharacters = 0
    
    for (const character of state.gameState.arena.characters) {
      // Use optimized viewport culling function
      if (!isInViewport(
        character.x, character.y, character.width, character.height,
        camera.x, camera.y, state.settings.canvasWidth, state.settings.canvasHeight,
        margin
      )) {
        continue
      }
      
      drawCharacter(character)
      visibleCharacters++
    }
    
    // Log performance info periodically
    if (Math.random() < 0.01) { // 1% chance per frame
      console.log(`Rendering ${visibleCharacters}/${state.gameState.arena.characters.length} characters`)
    }
  }

  const drawCharacter = (character: Character) => {
    const { x, y, width, height, isAndy, isCompanion } = character
    
    // Body color with better contrast for concert atmosphere
    let bodyColor = '#ffffff' // White for better visibility in crowd
    let outlineColor = '#000000' // Black outline for definition
    
    if (isAndy) {
      bodyColor = '#ff4757' // Bright red for Andy
      outlineColor = '#2f1b14'
    } else if (isCompanion) {
      bodyColor = '#3742fa' // Bright blue for companion  
      outlineColor = '#1e3a8a'
    } else {
      // Randomize crowd colors based on position for consistency
      const seed = (character.x * 31 + character.y * 17) % 100
      if (seed < 20) bodyColor = '#feca57' // Yellow shirts
      else if (seed < 40) bodyColor = '#ff6b6b' // Red shirts
      else if (seed < 60) bodyColor = '#4ecdc4' // Cyan shirts
      else if (seed < 80) bodyColor = '#45b7d1' // Blue shirts
      else bodyColor = '#ffffff' // White shirts
    }
    
    // Draw character outline first for better visibility
    state.ctx.fillStyle = outlineColor
    state.ctx.fillRect(x + 4, y + 9, width - 8, height - 18)
    
    // Draw character body
    state.ctx.fillStyle = bodyColor
    state.ctx.fillRect(x + 5, y + 10, width - 10, height - 20)
    
    // Head with skin tone
    state.ctx.fillStyle = '#fdbcb4'
    state.ctx.fillRect(x + 9, y + 4, width - 18, 16)
    
    // Head outline
    state.ctx.fillStyle = outlineColor
    state.ctx.fillRect(x + 8, y + 3, width - 16, 1) // Top
    state.ctx.fillRect(x + 8, y + 19, width - 16, 1) // Bottom
    state.ctx.fillRect(x + 8, y + 4, 1, 15) // Left
    state.ctx.fillRect(x + width - 9, y + 4, 1, 15) // Right
    
    // Eyes
    state.ctx.fillStyle = '#000000'
    state.ctx.fillRect(x + 12, y + 8, 2, 2)
    state.ctx.fillRect(x + width - 14, y + 8, 2, 2)
    
    // Character labels for special characters only when they haven't been found
    if (isAndy && !state.gameState.andyFound) {
      state.ctx.fillStyle = '#ffffff'
      state.ctx.font = 'bold 8px monospace'
      state.ctx.textAlign = 'center'
      state.ctx.fillText('A', x + width / 2, y + height + 8)
    } else if (isCompanion && !state.gameState.companionFound) {
      state.ctx.fillStyle = '#ffffff'
      state.ctx.font = 'bold 8px monospace'
      state.ctx.textAlign = 'center'
      state.ctx.fillText('C', x + width / 2, y + height + 8)
    }
    
    // Add found indicator with glowing effect
    if ((isAndy && state.gameState.andyFound) || (isCompanion && state.gameState.companionFound)) {
      // Glowing green border effect
      state.ctx.strokeStyle = '#2ecc71'
      state.ctx.lineWidth = 2
      state.ctx.strokeRect(x - 3, y - 3, width + 6, height + 6)
      
      // Inner glow
      state.ctx.strokeStyle = '#a8e6cf'
      state.ctx.lineWidth = 1
      state.ctx.strokeRect(x - 1, y - 1, width + 2, height + 2)
      
      // Checkmark above character
      state.ctx.fillStyle = '#2ecc71'
      state.ctx.font = 'bold 12px monospace'
      state.ctx.textAlign = 'center'
      state.ctx.fillText('✓', x + width / 2, y - 5)
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
    
    // Character found indicators
    const andyStatus = state.gameState.andyFound ? '✓' : '○'
    const companionStatus = state.gameState.companionFound ? '✓' : '○'
    state.ctx.fillText(`Andy: ${andyStatus}`, 20, 90)
    state.ctx.fillText(`Companion: ${companionStatus}`, 20, 110)
    
    // Instructions
    state.ctx.textAlign = 'center'
    state.ctx.font = '14px Arial'
    state.ctx.fillStyle = '#ecf0f1'
    state.ctx.fillText('Drag to explore • Hover for zoom lens • Find both characters!', state.settings.canvasWidth / 2, state.settings.canvasHeight - 20)
    
    // Game status indicators
    if (state.gameState.bothFound && state.gameState.victory.isActive) {
      // Victory message
      state.ctx.fillStyle = '#2ecc71'
      state.ctx.font = 'bold 32px Arial'
      state.ctx.textAlign = 'center'
      
      let message = 'BOTH FOUND!'
      if (state.gameState.victory.stage === 'celebration') {
        message = '🎉 AMAZING! 🎉'
      }
      
      // Add text shadow for better visibility
      state.ctx.fillStyle = '#000000'
      state.ctx.fillText(message, state.settings.canvasWidth / 2 + 2, state.settings.canvasHeight / 2 + 2)
      state.ctx.fillStyle = '#2ecc71'
      state.ctx.fillText(message, state.settings.canvasWidth / 2, state.settings.canvasHeight / 2)
      
      // Bonus message
      state.ctx.font = 'bold 18px Arial'
      state.ctx.fillStyle = '#f1c40f'
      state.ctx.fillText('BONUS: +500 points!', state.settings.canvasWidth / 2, state.settings.canvasHeight / 2 + 40)
      
    } else if (state.gameState.andyFound && !state.gameState.companionFound) {
      state.ctx.fillStyle = '#f39c12'
      state.ctx.font = 'bold 20px Arial'
      state.ctx.textAlign = 'center'
      state.ctx.fillText('Andy found! Find the companion!', state.settings.canvasWidth / 2, state.settings.canvasHeight / 2)
    } else if (state.gameState.companionFound && !state.gameState.andyFound) {
      state.ctx.fillStyle = '#f39c12'
      state.ctx.font = 'bold 20px Arial'
      state.ctx.textAlign = 'center'
      state.ctx.fillText('Companion found! Find Andy!', state.settings.canvasWidth / 2, state.settings.canvasHeight / 2)
    }
    
    // Miss feedback
    if (state.gameState.feedback.missCount > 0) {
      state.ctx.fillStyle = 'rgba(231, 76, 60, 0.7)'
      state.ctx.font = '12px Arial'
      state.ctx.textAlign = 'right'
      state.ctx.fillText(`Misses: ${state.gameState.feedback.missCount}`, state.settings.canvasWidth - 20, 50)
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
  
  // Preload assets for better performance
  assetManager.preloadAssets().catch(console.warn)

  const destroy = () => {
    stop()
    cleanup()
    state.audioManager.cleanup()
    performanceOptimizer.stopMonitoring()
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