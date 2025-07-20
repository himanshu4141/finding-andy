# Finding Andy 🎯

A pixel-art style "Where's Waldo" game built with React, TypeScript, and HTML5 Canvas. Help players find Andy in crowded scenes inspired by the viral meme!

**🌐 [Play the game live on GitHub Pages!](https://himanshu4141.github.io/finding-andy/)**

## 🚀 Features

- **Cross-Platform**: Built with React and Capacitor for web, iOS, and Android
- **Pixel Perfect**: HTML5 Canvas with pixel-art rendering for retro aesthetics
- **Responsive Design**: Scales beautifully on all screen sizes
- **TypeScript**: Fully typed codebase with strict mode enabled
- **Game Loop**: Smooth 60fps animation using requestAnimationFrame
- **Mobile Ready**: Touch and click interactions optimized for all devices

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript 5.8
- **Rendering**: HTML5 Canvas API
- **Build Tool**: Vite for fast development and builds
- **Mobile**: Capacitor for iOS/Android deployment
- **Styling**: Modern CSS with responsive design
- **Linting**: ESLint with React and TypeScript rules

## 🎮 Game Mechanics

Players must find "Andy" (inspired by the viral incident) hidden in crowds of pixel-art characters. Features include:

- **Scoring System**: Points awarded for finding Andy quickly
- **Timer**: Race against the clock in each level
- **Multiple Levels**: Increasing difficulty with larger crowds
- **Responsive Controls**: Click/tap to interact

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── GameCanvas.tsx   # Main canvas component
│   ├── GameCanvas.css   # Canvas styling
│   └── index.ts         # Component exports
├── game/                # Game logic and engine
│   ├── GameEngine.ts    # Core game loop and logic
│   └── index.ts         # Game exports
├── assets/              # Images, sounds, and other assets
├── types/               # TypeScript type definitions
│   ├── game.ts          # Game-related types
│   └── index.ts         # Type exports
├── App.tsx              # Main App component
├── App.css              # App styling
└── main.tsx             # App entry point
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/himanshu4141/finding-andy.git
cd finding-andy
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## 🎯 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

### Mobile Development

#### Setup Capacitor (first time only):
```bash
# Add platforms
npx cap add ios
npx cap add android
```

#### Build and Run:

**iOS:**
```bash
npm run cap:ios
# Opens Xcode - requires macOS and Xcode installed
```

**Android:**
```bash
npm run cap:android  
# Opens Android Studio - requires Android Studio installed
```

**Web Preview:**
```bash
npm run cap:serve
```

### Code Quality

The project uses:
- **TypeScript Strict Mode**: Full type safety
- **ESLint**: Code quality and consistency
- **Modern ES2022**: Latest JavaScript features
- **CSS Grid/Flexbox**: Modern responsive layouts

## 🎨 Game Design

Based on the viral "Finding Andy" meme, the game features:

- **Character Design**: Inspired by the original incident photos
- **Pixel Art Style**: Retro 8-bit aesthetic similar to classic arcade games
- **Crowd Mechanics**: Procedurally arranged characters in various scenes
- **Visual Feedback**: Immediate response to player interactions

## 🔧 Configuration

### Canvas Settings

Adjust game settings in `src/App.tsx`:

```typescript
const DEFAULT_SETTINGS: GameSettings = {
  canvasWidth: 800,    // Game resolution width
  canvasHeight: 600,   // Game resolution height  
  pixelScale: 1,       // Pixel scaling factor
  difficulty: 'medium' // Game difficulty
};
```

### Capacitor Config

Mobile app settings in `capacitor.config.ts`:
- App ID: `com.findingandygame.app`
- App Name: "Finding Andy"
- Splash screen and theme configuration

## 📱 Mobile Considerations

- **Touch Optimized**: Tap interactions work seamlessly
- **Responsive Canvas**: Scales to fit all screen sizes
- **Performance**: Optimized for mobile GPUs
- **Battery Friendly**: Efficient game loop with proper cleanup

## 🚀 Deployment

### GitHub Pages (Live Demo)

The app is automatically deployed to GitHub Pages at: **https://himanshu4141.github.io/finding-andy/**

#### Initial Setup (One-time)
To enable GitHub Pages deployment, the repository owner needs to:
1. Go to repository **Settings** → **Pages**
2. Under "Source", select "**GitHub Actions**"
3. The deployment workflow will handle the rest automatically

#### Automatic Deployment
- **Trigger**: Pushes to the `main` branch automatically trigger deployment
- **Workflow**: GitHub Actions builds and deploys the app
- **Build Process**: 
  1. Install dependencies with `npm ci`
  2. Run ESLint for code quality
  3. Build production bundle with `npm run build`
  4. Deploy `dist` folder to GitHub Pages

#### Manual Deployment
To trigger a manual deployment:
1. Go to **Actions** tab in the GitHub repository
2. Select "Deploy to GitHub Pages" workflow  
3. Click "Run workflow" → "Run workflow"

### Local Development Deployment

1. Build the project:
```bash
npm run build
```

2. Preview locally:
```bash
npm run preview
```

3. Deploy the `dist` folder to your hosting provider

### Mobile Deployment

1. Build and sync:
```bash
npm run cap:build
```

2. Follow platform-specific deployment guides:
   - [iOS App Store](https://capacitorjs.com/docs/ios/deploying-to-app-store)
   - [Google Play Store](https://capacitorjs.com/docs/android/deploying-to-google-play)

## 🐛 Troubleshooting

### Common Issues

**Canvas not rendering:**
- Check browser console for errors
- Ensure canvas dimensions are set properly
- Verify WebGL/Canvas support in browser

**Mobile build issues:**
- Ensure platform tools are installed (Xcode/Android Studio)
- Check Capacitor CLI version compatibility
- Verify platform-specific requirements

**Performance issues:**
- Monitor browser dev tools for frame drops
- Check for memory leaks in game loop
- Optimize canvas draw operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the viral "Finding Andy" meme
- Built with modern web technologies
- Thanks to the React and Capacitor communities

---

**Happy Andy Hunting! 🕵️‍♀️**