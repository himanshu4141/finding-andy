export interface GameState {
  isRunning: boolean
  score: number
  level: number
  timeRemaining: number
  andyFound: boolean
  companionFound: boolean
  bothFound: boolean
  camera: Camera
  zoomLens: ZoomLens
  arena: Arena
  victory: VictoryState
  feedback: FeedbackState
}

export interface Character {
  id: string
  x: number
  y: number
  width: number
  height: number
  isAndy: boolean
  isCompanion: boolean
  spriteIndex: number
  isDiscovered: boolean
  hideFaceAnimation: {
    isActive: boolean
    startTime: number
    duration: number
    progress: number
  }
}

export interface GameLevel {
  id: number
  name: string
  backgroundImage: string
  characters: Character[]
  timeLimit: number
  crowdDensity: number
}

export interface GameSettings {
  canvasWidth: number
  canvasHeight: number
  pixelScale: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface Point {
  x: number
  y: number
}

export interface Viewport {
  x: number
  y: number
  width: number
  height: number
}

export interface Camera {
  x: number
  y: number
  targetX: number
  targetY: number
  isDragging: boolean
  dragStartX: number
  dragStartY: number
  dragStartCameraX: number
  dragStartCameraY: number
}

export interface ZoomLens {
  x: number
  y: number
  radius: number
  magnification: number
  isActive: boolean
}

export interface Arena {
  width: number
  height: number
  crowdDensity: number
  characters: Character[]
}

export interface VictoryState {
  isActive: boolean
  stage: 'confetti' | 'celebration' | 'complete' | 'none'
  duration: number
  particles: Particle[]
  shakeIntensity: number
  celebrationStartTime: number
}

export interface FeedbackState {
  shake: ShakeEffect
  lastMissPosition: Point | null
  missCount: number
}

export interface ShakeEffect {
  isActive: boolean
  duration: number
  intensity: number
  startTime: number
}

export interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

export interface SoundEffect {
  name: string
  url: string
  volume: number
  loop: boolean
}

export interface AudioManager {
  sounds: Map<string, HTMLAudioElement>
  volume: number
  muted: boolean
  playSound: (name: string, volumeOverride?: number) => Promise<void>
  setVolume: (volume: number) => void
  toggleMute: () => boolean
  cleanup: () => void
}