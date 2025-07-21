/**
 * Asset Manager for Finding Andy Game
 * Handles loading and managing game assets including procedural crowd backgrounds
 */

export interface CrowdBackgroundOptions {
  width: number
  height: number
  theme: 'concert' | 'festival' | 'stadium'
  density: number
  colors: {
    stage: string
    crowd: string[]
    lights: string[]
    background: string
  }
}

export interface AssetManager {
  createCrowdBackground: (options: CrowdBackgroundOptions) => HTMLCanvasElement
  createTileableCrowdPattern: (tileSize: number, options: CrowdBackgroundOptions) => HTMLCanvasElement
  preloadAssets: () => Promise<void>
  getAsset: (name: string) => HTMLCanvasElement | HTMLImageElement | null
}

// Coldplay concert inspired color palette
const COLDPLAY_COLORS = {
  stage: '#1a1a2e',
  crowd: [
    '#16537e', // Dark blue
    '#2e4a80', // Medium blue  
    '#4d6db5', // Light blue
    '#7b9ac9', // Very light blue
    '#95a9d1', // Pale blue
    '#b8c5db'  // Very pale blue
  ],
  lights: [
    '#ffff00', // Yellow
    '#ff6b6b', // Red
    '#4ecdc4', // Cyan
    '#45b7d1', // Blue
    '#96ceb4', // Green
    '#feca57'  // Orange
  ],
  background: '#0f0f23'
}

function createAssetManager(): AssetManager {
  const assetCache = new Map<string, HTMLCanvasElement | HTMLImageElement>()

  const createCrowdBackground = (options: CrowdBackgroundOptions): HTMLCanvasElement => {
    const canvas = document.createElement('canvas')
    canvas.width = options.width
    canvas.height = options.height
    const ctx = canvas.getContext('2d')!
    
    // Disable smoothing for pixel art
    ctx.imageSmoothingEnabled = false
    
    // For very large arenas, use tiled approach for better performance
    if (options.width > 3000 || options.height > 3000) {
      return createTiledCrowdBackground(canvas, ctx, options)
    }
    
    // Fill background
    ctx.fillStyle = options.colors.background
    ctx.fillRect(0, 0, options.width, options.height)
    
    // Create concert venue atmosphere
    drawConcertVenue(ctx, options)
    
    return canvas
  }

  const createTiledCrowdBackground = (
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    options: CrowdBackgroundOptions
  ): HTMLCanvasElement => {
    // Create base tile
    const tileSize = 400
    const baseTile = createTileableCrowdPattern(tileSize, options)
    
    // Tile the pattern across the entire canvas
    for (let x = 0; x < options.width; x += tileSize) {
      for (let y = 0; y < options.height; y += tileSize) {
        ctx.drawImage(baseTile, x, y)
      }
    }
    
    // Add stage area overlay
    const stageHeight = options.height * 0.15
    ctx.fillStyle = options.colors.stage
    ctx.fillRect(0, 0, options.width, stageHeight)
    
    console.log('Created tiled crowd background for performance')
    return canvas
  }

  const createTileableCrowdPattern = (tileSize: number, options: CrowdBackgroundOptions): HTMLCanvasElement => {
    const canvas = document.createElement('canvas')
    canvas.width = tileSize
    canvas.height = tileSize
    const ctx = canvas.getContext('2d')!
    
    ctx.imageSmoothingEnabled = false
    
    // Create a tileable crowd pattern
    drawTileableCrowdSection(ctx, tileSize, tileSize, options)
    
    return canvas
  }

  const drawConcertVenue = (ctx: CanvasRenderingContext2D, options: CrowdBackgroundOptions) => {
    const { width, height } = options
    
    // Draw stage area at the top
    drawStage(ctx, width, height, options)
    
    // Draw crowd sections
    drawCrowdSections(ctx, width, height, options)
    
    // Add lighting effects
    drawLightingEffects(ctx, width, height, options)
    
    // Add concert atmosphere details
    drawAtmosphereDetails(ctx, width, height, options)
  }

  const drawStage = (ctx: CanvasRenderingContext2D, width: number, height: number, options: CrowdBackgroundOptions) => {
    const stageHeight = height * 0.15
    
    // Stage platform
    ctx.fillStyle = options.colors.stage
    ctx.fillRect(0, 0, width, stageHeight)
    
    // Stage lighting structure
    ctx.fillStyle = '#2c2c54'
    for (let x = 0; x < width; x += 120) {
      ctx.fillRect(x + 40, 0, 8, stageHeight * 0.8)
    }
    
    // Add some stage equipment silhouettes
    ctx.fillStyle = '#1a1a2e'
    // Drum kit outline
    ctx.fillRect(width * 0.6, stageHeight * 0.4, 60, 40)
    // Microphone stands
    ctx.fillRect(width * 0.3, stageHeight * 0.3, 4, 50)
    ctx.fillRect(width * 0.5, stageHeight * 0.3, 4, 50)
  }

  const drawCrowdSections = (ctx: CanvasRenderingContext2D, width: number, height: number, options: CrowdBackgroundOptions) => {
    const stageHeight = height * 0.15
    const crowdHeight = height - stageHeight
    
    // Create depth with different crowd sections
    const sections = [
      { start: stageHeight, height: crowdHeight * 0.3, density: 0.9, scale: 1.0 }, // Front section
      { start: stageHeight + crowdHeight * 0.3, height: crowdHeight * 0.4, density: 0.7, scale: 0.8 }, // Middle section  
      { start: stageHeight + crowdHeight * 0.7, height: crowdHeight * 0.3, density: 0.5, scale: 0.6 }  // Back section
    ]
    
    sections.forEach((section) => {
      drawCrowdSection(ctx, width, section.start, section.height, options, section.density, section.scale)
    })
  }

  const drawCrowdSection = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    startY: number, 
    height: number, 
    options: CrowdBackgroundOptions,
    density: number,
    scale: number
  ) => {
    const pixelSize = Math.floor(4 * scale)
    const spacing = Math.floor(6 * scale)
    
    for (let y = startY; y < startY + height; y += spacing) {
      for (let x = 0; x < width; x += spacing) {
        if (Math.random() < density) {
          // Random crowd member color
          const colorIndex = Math.floor(Math.random() * options.colors.crowd.length)
          ctx.fillStyle = options.colors.crowd[colorIndex]
          
          // Add some random variation in position for organic feel
          const offsetX = Math.floor(Math.random() * 3 - 1)
          const offsetY = Math.floor(Math.random() * 3 - 1)
          
          // Draw crowd member as small pixel blocks
          ctx.fillRect(x + offsetX, y + offsetY, pixelSize, pixelSize * 1.5)
          
          // Occasionally add raised hands or phones (lighter pixels on top)
          if (Math.random() < 0.3) {
            ctx.fillStyle = options.colors.lights[Math.floor(Math.random() * options.colors.lights.length)]
            ctx.fillRect(x + offsetX, y + offsetY - pixelSize, pixelSize, pixelSize)
          }
        }
      }
    }
  }

  const drawTileableCrowdSection = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    options: CrowdBackgroundOptions
  ) => {
    ctx.fillStyle = options.colors.background
    ctx.fillRect(0, 0, width, height)
    
    const pixelSize = 3
    const spacing = 5
    
    for (let y = 0; y < height; y += spacing) {
      for (let x = 0; x < width; x += spacing) {
        if (Math.random() < 0.6) {
          const colorIndex = Math.floor(Math.random() * options.colors.crowd.length)
          ctx.fillStyle = options.colors.crowd[colorIndex]
          
          // Ensure seamless tiling by handling edge cases
          const drawX = x % width
          const drawY = y % height
          
          ctx.fillRect(drawX, drawY, pixelSize, pixelSize * 1.5)
          
          // Add raised hands/phones
          if (Math.random() < 0.2) {
            ctx.fillStyle = options.colors.lights[Math.floor(Math.random() * options.colors.lights.length)]
            ctx.fillRect(drawX, drawY - pixelSize, pixelSize, pixelSize)
          }
        }
      }
    }
  }

  const drawLightingEffects = (ctx: CanvasRenderingContext2D, width: number, height: number, options: CrowdBackgroundOptions) => {
    const stageHeight = height * 0.15
    
    // Stage spotlights
    ctx.globalAlpha = 0.3
    
    const lightPositions = [
      { x: width * 0.2, y: stageHeight * 0.1 },
      { x: width * 0.4, y: stageHeight * 0.1 },
      { x: width * 0.6, y: stageHeight * 0.1 },
      { x: width * 0.8, y: stageHeight * 0.1 }
    ]
    
    lightPositions.forEach((pos, index) => {
      const lightColor = options.colors.lights[index % options.colors.lights.length]
      
      // Create a simple radial gradient effect
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 150)
      gradient.addColorStop(0, lightColor)
      gradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = gradient
      ctx.fillRect(pos.x - 150, pos.y, 300, height - stageHeight)
    })
    
    ctx.globalAlpha = 1.0
  }

  const drawAtmosphereDetails = (ctx: CanvasRenderingContext2D, width: number, height: number, options: CrowdBackgroundOptions) => {
    // Add some sparkle/phone light effects scattered throughout crowd
    ctx.globalAlpha = 0.8
    
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width
      const y = height * 0.15 + Math.random() * (height * 0.85)
      
      ctx.fillStyle = options.colors.lights[Math.floor(Math.random() * options.colors.lights.length)]
      ctx.fillRect(Math.floor(x), Math.floor(y), 2, 2)
    }
    
    ctx.globalAlpha = 1.0
  }

  const preloadAssets = async (): Promise<void> => {
    // Create and cache default crowd background
    const defaultOptions: CrowdBackgroundOptions = {
      width: 2400,
      height: 1800,
      theme: 'concert',
      density: 0.7,
      colors: COLDPLAY_COLORS
    }
    
    const crowdBg = createCrowdBackground(defaultOptions)
    assetCache.set('crowd-background-main', crowdBg)
    
    // Create tileable pattern for performance optimization
    const tilePattern = createTileableCrowdPattern(200, defaultOptions)
    assetCache.set('crowd-pattern-tile', tilePattern)
    
    console.log('Assets preloaded:', assetCache.size, 'items')
  }

  const getAsset = (name: string): HTMLCanvasElement | HTMLImageElement | null => {
    return assetCache.get(name) || null
  }

  return {
    createCrowdBackground,
    createTileableCrowdPattern,
    preloadAssets,
    getAsset
  }
}

export const assetManager = createAssetManager()
export { COLDPLAY_COLORS }