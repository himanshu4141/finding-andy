/**
 * Performance optimization utilities for Finding Andy game
 */

export interface PerformanceMetrics {
  fps: number
  frameTime: number
  drawCalls: number
  memoryUsage: number
}

export interface PerformanceOptimizer {
  startMonitoring: () => void
  stopMonitoring: () => void
  getMetrics: () => PerformanceMetrics
  shouldOptimize: () => boolean
  optimizeDrawing: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void
}

function createPerformanceOptimizer(): PerformanceOptimizer {
  let isMonitoring = false
  let frameCount = 0
  let lastTime = 0
  let fpsHistory: number[] = []
  let drawCallCount = 0
  
  const MAX_FPS_HISTORY = 60 // Store last 60 frames
  const LOW_FPS_THRESHOLD = 30

  const startMonitoring = () => {
    isMonitoring = true
    frameCount = 0
    lastTime = performance.now()
    fpsHistory = []
    console.log('Performance monitoring started')
  }

  const stopMonitoring = () => {
    isMonitoring = false
    console.log('Performance monitoring stopped')
  }

  const updateMetrics = () => {
    if (!isMonitoring) return
    
    const currentTime = performance.now()
    frameCount++
    
    if (currentTime - lastTime >= 1000) { // Every second
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
      fpsHistory.push(fps)
      
      if (fpsHistory.length > MAX_FPS_HISTORY) {
        fpsHistory.shift()
      }
      
      frameCount = 0
      lastTime = currentTime
      
      // Log performance warnings
      if (fps < LOW_FPS_THRESHOLD) {
        console.warn(`Low FPS detected: ${fps}fps`)
      }
    }
  }

  const getMetrics = (): PerformanceMetrics => {
    const avgFps = fpsHistory.length > 0 
      ? fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length 
      : 0
    
    const frameTime = avgFps > 0 ? 1000 / avgFps : 0
    
    // Estimate memory usage (rough approximation)
    // Chrome-specific API, safely access with type guard
    const memoryUsage = 'memory' in performance && performance.memory
      ? (performance.memory as { usedJSHeapSize: number }).usedJSHeapSize / 1024 / 1024 
      : 0

    return {
      fps: Math.round(avgFps),
      frameTime: Math.round(frameTime * 100) / 100,
      drawCalls: drawCallCount,
      memoryUsage: Math.round(memoryUsage * 100) / 100
    }
  }

  const shouldOptimize = (): boolean => {
    const metrics = getMetrics()
    return metrics.fps < LOW_FPS_THRESHOLD && fpsHistory.length >= 10
  }

  const optimizeDrawing = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    // Enable optimizations for better performance
    ctx.imageSmoothingEnabled = false
    
    // Optimize canvas for performance
    if (canvas.style.willChange !== 'auto') {
      canvas.style.willChange = 'auto' // Let browser decide
    }
    
    drawCallCount++
  }

  // Make updateMetrics available globally for GameEngine to call
  ;(window as unknown as { updatePerformanceMetrics: () => void }).updatePerformanceMetrics = updateMetrics

  return {
    startMonitoring,
    stopMonitoring,
    getMetrics,
    shouldOptimize,
    optimizeDrawing
  }
}

export const performanceOptimizer = createPerformanceOptimizer()

// Viewport culling utility
export function isInViewport(
  objectX: number, 
  objectY: number, 
  objectWidth: number, 
  objectHeight: number,
  viewX: number, 
  viewY: number, 
  viewWidth: number, 
  viewHeight: number,
  margin: number = 50
): boolean {
  return (
    objectX + objectWidth >= viewX - margin &&
    objectX <= viewX + viewWidth + margin &&
    objectY + objectHeight >= viewY - margin &&
    objectY <= viewY + viewHeight + margin
  )
}

// Color utilities for consistent rendering
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Canvas optimization utilities
export function optimizeCanvasForPixelArt(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // Disable anti-aliasing for pixel art
  ctx.imageSmoothingEnabled = false
  
  // Set CSS for crisp pixel rendering
  canvas.style.imageRendering = 'pixelated'
  canvas.style.imageRendering = 'crisp-edges'
  canvas.style.imageRendering = '-moz-crisp-edges'
  canvas.style.imageRendering = '-webkit-optimize-contrast'
  
  console.log('Canvas optimized for pixel art rendering')
}