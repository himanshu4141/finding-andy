import { useState } from 'react'
import { GameCanvas } from './components'
import type { GameSettings, GameState } from './types'
import './App.css'

const DEFAULT_SETTINGS: GameSettings = {
  canvasWidth: 800,
  canvasHeight: 600,
  pixelScale: 1,
  difficulty: 'medium'
}

function App() {
  const [gameState, setGameState] = useState<GameState>({
    isRunning: false,
    score: 0,
    level: 1,
    timeRemaining: 0, // No longer used as countdown
    findStartTime: null,
    findTime: 0,
    levelCompleted: false,
    nextLevelReady: false,
    andyFound: false,
    companionFound: false,
    bothFound: false,
    camera: {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      dragStartCameraX: 0,
      dragStartCameraY: 0
    },
    zoomLens: {
      x: 0,
      y: 0,
      radius: 80,
      magnification: 2,
      isActive: false
    },
    arena: {
      width: 0,
      height: 0,
      crowdDensity: 0,
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
  })

  const handleGameStateChange = (newGameState: GameState) => {
    setGameState(newGameState)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Finding Andy</h1>
        <p>Can you spot Andy in the crowd? Click on him to score points!</p>
      </header>

      <main className="app-main">
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Score:</span>
            <span className="stat-value">{gameState.score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Level:</span>
            <span className="stat-value">{gameState.level}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Find Time:</span>
            <span className="stat-value">
              {gameState.findStartTime && !gameState.bothFound 
                ? `${gameState.findTime.toFixed(1)}s` 
                : gameState.bothFound 
                  ? `${gameState.findTime.toFixed(1)}s` 
                  : '0.0s'
              }
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Andy:</span>
            <span className={`stat-value ${gameState.andyFound ? 'found' : 'missing'}`}>
              {gameState.andyFound ? '✓ Found' : '○ Missing'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Companion:</span>
            <span className={`stat-value ${gameState.companionFound ? 'found' : 'missing'}`}>
              {gameState.companionFound ? '✓ Found' : '○ Missing'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Status:</span>
            <span className="stat-value">
              {gameState.bothFound 
                ? gameState.nextLevelReady 
                  ? '🎉 Level Complete!'
                  : '✅ Victory!' 
                : gameState.isRunning 
                  ? 'Searching...' 
                  : 'Ready'
              }
            </span>
          </div>
        </div>

        <GameCanvas 
          settings={DEFAULT_SETTINGS}
          onGameStateChange={handleGameStateChange}
        />
      </main>

      <footer className="app-footer">
        <p>Built with React, TypeScript, and HTML5 Canvas</p>
        <p>Mobile-ready with Capacitor support</p>
      </footer>
    </div>
  )
}

export default App
