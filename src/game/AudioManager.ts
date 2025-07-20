import type { SoundEffect, AudioManager } from '../types'

// Sound effect configurations
const SOUND_EFFECTS: SoundEffect[] = [
  {
    name: 'victory',
    url: '/sounds/victory.mp3',
    volume: 0.7,
    loop: false
  },
  {
    name: 'applause',
    url: '/sounds/applause.mp3',
    volume: 0.8,
    loop: false
  },
  {
    name: 'confetti',
    url: '/sounds/confetti.mp3',
    volume: 0.6,
    loop: false
  },
  {
    name: 'miss',
    url: '/sounds/miss.mp3',
    volume: 0.5,
    loop: false
  },
  {
    name: 'click',
    url: '/sounds/click.mp3',
    volume: 0.4,
    loop: false
  }
]

export function createAudioManager(): AudioManager {
  const sounds = new Map<string, HTMLAudioElement>()
  let volume = 0.7
  let muted = false

  // Initialize all sound effects
  for (const soundEffect of SOUND_EFFECTS) {
    const audio = new Audio()
    audio.preload = 'auto'
    audio.volume = soundEffect.volume * volume
    audio.loop = soundEffect.loop
    
    // Handle loading errors gracefully
    audio.addEventListener('error', () => {
      console.warn(`Failed to load sound: ${soundEffect.name}`)
    })
    
    // Try to load the sound, but don't fail if it doesn't exist
    audio.src = soundEffect.url
    sounds.set(soundEffect.name, audio)
  }

  const playSound = (name: string, volumeOverride?: number): Promise<void> => {
    return new Promise((resolve) => {
      if (muted) {
        resolve()
        return
      }

      const audio = sounds.get(name)
      if (!audio) {
        console.warn(`Sound not found: ${name}`)
        resolve()
        return
      }

      // Reset audio to beginning
      audio.currentTime = 0
      
      // Set volume
      if (volumeOverride !== undefined) {
        audio.volume = volumeOverride * volume
      }

      // Play with error handling
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => resolve())
          .catch((error) => {
            // Auto-play might be blocked - this is normal
            console.log(`Audio play blocked for ${name}:`, error)
            resolve()
          })
      } else {
        resolve()
      }
    })
  }

  const setVolume = (newVolume: number) => {
    volume = Math.max(0, Math.min(1, newVolume))
    
    // Update all loaded sounds
    for (const [name, audio] of sounds.entries()) {
      const soundEffect = SOUND_EFFECTS.find(s => s.name === name)
      if (soundEffect) {
        audio.volume = soundEffect.volume * volume
      }
    }
  }

  const toggleMute = () => {
    muted = !muted
    return muted
  }

  const cleanup = () => {
    for (const audio of sounds.values()) {
      audio.pause()
      audio.currentTime = 0
    }
    sounds.clear()
  }

  return {
    sounds,
    volume,
    muted,
    playSound,
    setVolume,
    toggleMute,
    cleanup
  }
}