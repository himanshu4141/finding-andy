export interface GameState {
  isRunning: boolean
  score: number
  level: number
  timeRemaining: number
  andyFound: boolean
  camera: Camera
  zoomLens: ZoomLens
  arena: Arena
}

export interface Character {
  id: string
  x: number
  y: number
  width: number
  height: number
  isAndy: boolean
  spriteIndex: number
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