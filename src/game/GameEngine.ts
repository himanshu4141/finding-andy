import type { GameState, GameSettings, Point } from '../types';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private gameState: GameState;
  private settings: GameSettings;
  private lastTime = 0;
  
  constructor(canvas: HTMLCanvasElement, settings: GameSettings) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to get 2D rendering context');
    }
    this.ctx = ctx;
    this.settings = settings;
    
    // Initialize game state
    this.gameState = {
      isRunning: false,
      score: 0,
      level: 1,
      timeRemaining: 60,
      andyFound: false
    };

    // Setup canvas
    this.setupCanvas();
    this.setupEventListeners();
  }

  private setupCanvas(): void {
    this.resizeCanvas();
    
    // Set up pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
  }

  private setupEventListeners(): void {
    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Handle canvas clicks
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
  }

  private handleResize(): void {
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const container = this.canvas.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Calculate scale to maintain aspect ratio
    const aspectRatio = this.settings.canvasWidth / this.settings.canvasHeight;
    let canvasWidth, canvasHeight;
    
    if (containerWidth / containerHeight > aspectRatio) {
      canvasHeight = containerHeight;
      canvasWidth = canvasHeight * aspectRatio;
    } else {
      canvasWidth = containerWidth;
      canvasHeight = canvasWidth / aspectRatio;
    }
    
    // Set canvas size
    this.canvas.width = this.settings.canvasWidth;
    this.canvas.height = this.settings.canvasHeight;
    this.canvas.style.width = `${canvasWidth}px`;
    this.canvas.style.height = `${canvasHeight}px`;
    
    // Redraw if game is running
    if (this.gameState.isRunning) {
      this.render();
    }
  }

  private handleClick(event: MouseEvent): void {
    const point = this.getCanvasCoordinates(event.clientX, event.clientY);
    this.processClick(point);
  }

  private handleTouch(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    const point = this.getCanvasCoordinates(touch.clientX, touch.clientY);
    this.processClick(point);
  }

  private getCanvasCoordinates(clientX: number, clientY: number): Point {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.settings.canvasWidth / rect.width;
    const scaleY = this.settings.canvasHeight / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  private processClick(point: Point): void {
    if (!this.gameState.isRunning) return;
    
    console.log('Click at:', point);
    // TODO: Implement character hit detection
  }

  public start(): void {
    if (this.gameState.isRunning) return;
    
    this.gameState.isRunning = true;
    this.gameState.timeRemaining = 60;
    this.gameState.score = 0;
    this.gameState.andyFound = false;
    
    this.gameLoop(0);
  }

  public stop(): void {
    this.gameState.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public pause(): void {
    this.gameState.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public resume(): void {
    if (!this.gameState.isRunning) {
      this.gameState.isRunning = true;
      this.gameLoop(performance.now());
    }
  }

  private gameLoop(currentTime: number): void {
    if (!this.gameState.isRunning) return;

    // Calculate delta time
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update game logic
    this.update(deltaTime);
    
    // Render the game
    this.render();
    
    // Schedule next frame
    this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(deltaTime: number): void {
    // Update timer
    if (this.gameState.timeRemaining > 0) {
      this.gameState.timeRemaining -= deltaTime / 1000;
      
      if (this.gameState.timeRemaining <= 0) {
        this.gameState.timeRemaining = 0;
        this.stop();
      }
    }
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillRect(0, 0, this.settings.canvasWidth, this.settings.canvasHeight);
    
    // Draw game elements
    this.drawBackground();
    this.drawUI();
    
    // Draw placeholder crowd
    this.drawPlaceholderCrowd();
  }

  private drawBackground(): void {
    // Draw a simple gradient background for now
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.settings.canvasHeight);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#4682B4');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.settings.canvasWidth, this.settings.canvasHeight);
  }

  private drawUI(): void {
    // Draw score and timer
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.gameState.score}`, 20, 40);
    this.ctx.fillText(`Time: ${Math.ceil(this.gameState.timeRemaining)}`, 20, 70);
    this.ctx.fillText(`Level: ${this.gameState.level}`, 20, 100);
    
    // Draw instructions
    this.ctx.textAlign = 'center';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('Find Andy in the crowd!', this.settings.canvasWidth / 2, 30);
  }

  private drawPlaceholderCrowd(): void {
    // Draw some placeholder characters until we have actual sprites
    const characters = 50;
    const cols = 10;
    const rows = 5;
    const charWidth = 40;
    const charHeight = 60;
    
    const startX = (this.settings.canvasWidth - (cols * charWidth)) / 2;
    const startY = (this.settings.canvasHeight - (rows * charHeight)) / 2 + 50;
    
    for (let i = 0; i < characters; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      const x = startX + col * charWidth;
      const y = startY + row * charHeight;
      
      // Draw character as simple colored rectangle
      const isAndy = i === 23; // Arbitrary position for Andy
      this.ctx.fillStyle = isAndy ? '#ff6b6b' : '#4ecdc4';
      this.ctx.fillRect(x + 5, y + 10, charWidth - 10, charHeight - 20);
      
      // Draw head
      this.ctx.fillStyle = '#fdbcb4';
      this.ctx.fillRect(x + 10, y + 5, charWidth - 20, 15);
      
      // Draw eyes
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(x + 12, y + 8, 3, 3);
      this.ctx.fillRect(x + charWidth - 15, y + 8, 3, 3);
      
      // Add Andy indicator (for testing)
      if (isAndy) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ANDY', x + charWidth / 2, y + charHeight + 15);
      }
    }
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public destroy(): void {
    this.stop();
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.canvas.removeEventListener('click', this.handleClick.bind(this));
    this.canvas.removeEventListener('touchstart', this.handleTouch.bind(this));
  }
}