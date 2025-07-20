import type { Particle } from '../types'

const CONFETTI_COLORS = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', 
  '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe',
  '#fd79a8', '#fdcb6e', '#e17055', '#00b894'
]

export function createParticle(x: number, y: number): Particle {
  const angle = (Math.random() - 0.5) * Math.PI * 0.8 // Spread upward
  const speed = 3 + Math.random() * 4
  const life = 2000 + Math.random() * 1000 // 2-3 seconds
  
  return {
    id: Math.random().toString(36).substring(7),
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 2, // Initial upward velocity
    life,
    maxLife: life,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 2 + Math.random() * 3
  }
}

export function createConfettiBurst(centerX: number, centerY: number, count: number = 50): Particle[] {
  const particles: Particle[] = []
  
  for (let i = 0; i < count; i++) {
    // Spread particles around center point
    const offsetX = (Math.random() - 0.5) * 100
    const offsetY = (Math.random() - 0.5) * 50
    
    particles.push(createParticle(centerX + offsetX, centerY + offsetY))
  }
  
  return particles
}

export function updateParticles(particles: Particle[], deltaTime: number): Particle[] {
  const gravity = 0.15
  const damping = 0.98
  
  return particles
    .map(particle => {
      // Update physics
      particle.vy += gravity * deltaTime / 16.67 // Normalize to ~60fps
      particle.vx *= damping
      particle.vy *= damping
      
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy
      
      // Update life
      particle.life -= deltaTime
      
      return particle
    })
    .filter(particle => particle.life > 0) // Remove dead particles
}

export function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  ctx.save()
  
  for (const particle of particles) {
    const alpha = particle.life / particle.maxLife
    const size = particle.size * (0.5 + alpha * 0.5) // Shrink as it dies
    
    ctx.globalAlpha = alpha
    ctx.fillStyle = particle.color
    
    // Draw as a simple rectangle (could be improved with shapes)
    ctx.fillRect(
      particle.x - size / 2, 
      particle.y - size / 2, 
      size, 
      size
    )
  }
  
  ctx.restore()
}

export function createCelebrationParticles(canvasWidth: number, canvasHeight: number): Particle[] {
  const particles: Particle[] = []
  const burstCount = 5
  
  // Create multiple bursts across the screen
  for (let i = 0; i < burstCount; i++) {
    const x = (i + 1) * (canvasWidth / (burstCount + 1))
    const y = canvasHeight * 0.3 + Math.random() * canvasHeight * 0.2
    
    particles.push(...createConfettiBurst(x, y, 30))
  }
  
  return particles
}