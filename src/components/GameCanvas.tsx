import React, { useRef, useEffect, useState } from 'react';
import { GameEngine } from '../game';
import type { GameSettings, GameState } from '../types';
import './GameCanvas.css';

interface GameCanvasProps {
  settings: GameSettings;
  onGameStateChange?: (gameState: GameState) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  settings, 
  onGameStateChange 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      // Initialize game engine
      gameEngineRef.current = new GameEngine(canvasRef.current, settings);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize game');
      setIsLoading(false);
    }

    // Cleanup on unmount
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
        gameEngineRef.current = null;
      }
    };
  }, [settings]);

  // Game state polling effect
  useEffect(() => {
    if (!gameEngineRef.current || !onGameStateChange) return;

    const interval = setInterval(() => {
      if (gameEngineRef.current) {
        const gameState = gameEngineRef.current.getGameState();
        onGameStateChange(gameState);
      }
    }, 100); // Poll every 100ms

    return () => clearInterval(interval);
  }, [onGameStateChange]);

  const startGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.start();
    }
  };

  const stopGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.stop();
    }
  };

  const pauseGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.pause();
    }
  };

  const resumeGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.resume();
    }
  };

  if (error) {
    return (
      <div className="game-canvas-error">
        <h3>Game Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Reload Game
        </button>
      </div>
    );
  }

  return (
    <div className="game-canvas-container">
      {isLoading && (
        <div className="game-loading">
          <p>Loading Finding Andy...</p>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="game-canvas"
        style={{ 
          display: isLoading ? 'none' : 'block',
          maxWidth: '100%',
          maxHeight: '100%',
          imageRendering: 'pixelated'
        }}
      />
      
      {!isLoading && (
        <div className="game-controls">
          <button onClick={startGame} className="game-btn start-btn">
            Start Game
          </button>
          <button onClick={pauseGame} className="game-btn pause-btn">
            Pause
          </button>
          <button onClick={resumeGame} className="game-btn resume-btn">
            Resume
          </button>
          <button onClick={stopGame} className="game-btn stop-btn">
            Stop
          </button>
        </div>
      )}
    </div>
  );
};