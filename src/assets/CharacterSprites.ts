/**
 * Character Sprites for Finding Andy Game
 * Based on uploaded pixel art reference images
 * Provides consistent pixel art character generation
 */

export interface PixelArtCharacter {
  id: string
  name: string
  hairColor: string
  skinColor: string
  shirtColor: string
  pantsColor: string
  isSpecial?: boolean // For Andy and companion
}

// Character variations based on the uploaded reference image
// These match the exact pixel art style shown in the reference
export const PIXEL_ART_CHARACTERS: PixelArtCharacter[] = [
  // Andy - Red shirt, dark hair (main character)
  {
    id: 'andy',
    name: 'Andy',
    hairColor: '#2c1810', // Dark brown/black hair
    skinColor: '#fdbcb4', // Skin tone from reference
    shirtColor: '#ff4757', // Red shirt
    pantsColor: '#2c3e50', // Dark pants
    isSpecial: true
  },
  
  // Companion - Teal shirt, brown hair  
  {
    id: 'companion',
    name: 'Companion',
    hairColor: '#8b4513', // Brown hair
    skinColor: '#fdbcb4', // Same skin tone
    shirtColor: '#4ecdc4', // Teal shirt
    pantsColor: '#2c3e50', // Dark pants
    isSpecial: true
  },
  
  // Crowd variations - maintaining exact reference style
  {
    id: 'crowd_1',
    name: 'Crowd Member 1',
    hairColor: '#2c1810', // Dark hair
    skinColor: '#fdbcb4',
    shirtColor: '#45b7d1', // Blue shirt
    pantsColor: '#2c3e50'
  },
  
  {
    id: 'crowd_2', 
    name: 'Crowd Member 2',
    hairColor: '#654321', // Medium brown
    skinColor: '#fdbcb4',
    shirtColor: '#ff6b6b', // Light red shirt
    pantsColor: '#2c3e50'
  },
  
  {
    id: 'crowd_3',
    name: 'Crowd Member 3', 
    hairColor: '#8b4513', // Brown hair
    skinColor: '#fdbcb4',
    shirtColor: '#96ceb4', // Light green shirt
    pantsColor: '#2c3e50'
  },
  
  {
    id: 'crowd_4',
    name: 'Crowd Member 4',
    hairColor: '#2c1810', // Dark hair
    skinColor: '#fdbcb4', 
    shirtColor: '#feca57', // Yellow shirt
    pantsColor: '#2c3e50'
  },
  
  {
    id: 'crowd_5',
    name: 'Crowd Member 5',
    hairColor: '#654321', // Medium brown
    skinColor: '#fdbcb4',
    shirtColor: '#a55eea', // Purple shirt  
    pantsColor: '#2c3e50'
  },
  
  {
    id: 'crowd_6',
    name: 'Crowd Member 6',
    hairColor: '#8b4513', // Brown hair
    skinColor: '#fdbcb4',
    shirtColor: '#26de81', // Green shirt
    pantsColor: '#2c3e50'
  }
]

/**
 * Draw a pixel art character based on the uploaded reference style
 * This replaces the old procedural generation with consistent pixel art
 */
export function drawPixelArtCharacter(
  ctx: CanvasRenderingContext2D,
  character: PixelArtCharacter,
  x: number,
  y: number,
  width: number,
  height: number,
  hideFaceAnimation?: {
    isActive: boolean
    progress: number
  }
): void {
  // Ensure pixel-perfect rendering
  ctx.imageSmoothingEnabled = false
  
  // Calculate pixel-perfect dimensions based on reference image proportions
  const pixelSize = 2 // Base pixel size for consistency
  const headWidth = Math.floor(width * 0.6)
  const headHeight = Math.floor(height * 0.35)
  const bodyWidth = Math.floor(width * 0.7)
  const bodyHeight = Math.floor(height * 0.45)
  
  // Center character in the given bounds
  const centerX = x + Math.floor((width - bodyWidth) / 2)
  const centerY = y + Math.floor(height * 0.1)
  
  // Draw character outline (black border for pixel art effect)
  ctx.fillStyle = '#000000'
  ctx.fillRect(centerX - 1, centerY - 1, bodyWidth + 2, height - Math.floor(height * 0.1) + 2)
  
  // Draw pants (lower body)
  ctx.fillStyle = character.pantsColor
  const pantsY = centerY + headHeight + bodyHeight - Math.floor(height * 0.15)
  const pantsHeight = height - (pantsY - y) - Math.floor(height * 0.05)
  ctx.fillRect(centerX + 2, pantsY, bodyWidth - 4, pantsHeight)
  
  // Draw shirt (upper body)
  ctx.fillStyle = character.shirtColor
  const shirtY = centerY + headHeight
  const shirtHeight = bodyHeight - Math.floor(height * 0.05)
  ctx.fillRect(centerX + 1, shirtY, bodyWidth - 2, shirtHeight)
  
  // Draw arms
  ctx.fillStyle = character.shirtColor
  const armWidth = Math.floor(width * 0.15)
  const armHeight = Math.floor(height * 0.25)
  const armY = shirtY + Math.floor(shirtHeight * 0.1)
  
  // Left arm
  ctx.fillRect(centerX - armWidth + 1, armY, armWidth, armHeight)
  // Right arm  
  ctx.fillRect(centerX + bodyWidth - 1, armY, armWidth, armHeight)
  
  // Draw hands
  ctx.fillStyle = character.skinColor
  const handSize = Math.floor(width * 0.1)
  const handY = armY + armHeight - 2
  
  // Left hand
  ctx.fillRect(centerX - armWidth + 1, handY, handSize, handSize)
  // Right hand
  ctx.fillRect(centerX + bodyWidth - 1, handY, handSize, handSize)
  
  // Draw head background
  ctx.fillStyle = character.skinColor
  const headX = centerX + Math.floor((bodyWidth - headWidth) / 2)
  ctx.fillRect(headX, centerY, headWidth, headHeight)
  
  // Draw hair
  ctx.fillStyle = character.hairColor
  const hairHeight = Math.floor(headHeight * 0.6)
  ctx.fillRect(headX, centerY, headWidth, hairHeight)
  
  // Draw face features (unless hidden by animation)
  if (!hideFaceAnimation?.isActive || hideFaceAnimation.progress <= 0.3) {
    // Eyes - simple black pixels
    ctx.fillStyle = '#000000'
    const eyeSize = pixelSize
    const eyeY = centerY + Math.floor(headHeight * 0.5)
    const eyeOffset = Math.floor(headWidth * 0.25)
    
    // Left eye
    ctx.fillRect(headX + eyeOffset, eyeY, eyeSize, eyeSize)
    // Right eye
    ctx.fillRect(headX + headWidth - eyeOffset - eyeSize, eyeY, eyeSize, eyeSize)
    
    // Mouth - small black pixel
    const mouthY = centerY + Math.floor(headHeight * 0.75)
    const mouthX = headX + Math.floor(headWidth / 2) - 1
    ctx.fillRect(mouthX, mouthY, pixelSize, 1)
  }
  
  // Handle hide face animation
  if (hideFaceAnimation?.isActive && hideFaceAnimation.progress > 0.3) {
    const animationProgress = Math.min(hideFaceAnimation.progress, 1.0)
    const handOffset = Math.floor(animationProgress * headWidth * 0.3)
    
    // Draw hands covering face
    ctx.fillStyle = character.skinColor
    const handCoverY = centerY + Math.floor(headHeight * 0.4)
    const handCoverSize = Math.floor(headWidth * 0.3)
    
    // Left hand covering face
    ctx.fillRect(headX + handOffset, handCoverY, handCoverSize, handCoverSize)
    // Right hand covering face
    ctx.fillRect(headX + headWidth - handOffset - handCoverSize, handCoverY, handCoverSize, handCoverSize)
  }
}

/**
 * Get character sprite by index (for crowd generation)
 */
export function getCharacterSpriteByIndex(index: number): PixelArtCharacter {
  // Exclude special characters (Andy and companion) from crowd generation
  const crowdCharacters = PIXEL_ART_CHARACTERS.filter(char => !char.isSpecial)
  return crowdCharacters[index % crowdCharacters.length]
}

/**
 * Get Andy character sprite
 */
export function getAndyCharacter(): PixelArtCharacter {
  return PIXEL_ART_CHARACTERS.find(char => char.id === 'andy')!
}

/**
 * Get companion character sprite  
 */
export function getCompanionCharacter(): PixelArtCharacter {
  return PIXEL_ART_CHARACTERS.find(char => char.id === 'companion')!
}