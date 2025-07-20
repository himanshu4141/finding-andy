export interface GameState {
  isRunning: boolean;
  score: number;
  level: number;
  timeRemaining: number;
  andyFound: boolean;
}

export interface Character {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isAndy: boolean;
  spriteIndex: number;
}

export interface GameLevel {
  id: number;
  name: string;
  backgroundImage: string;
  characters: Character[];
  timeLimit: number;
  crowdDensity: number;
}

export interface GameSettings {
  canvasWidth: number;
  canvasHeight: number;
  pixelScale: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Point {
  x: number;
  y: number;
}