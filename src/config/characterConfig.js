/**
 * Character Configuration
 * Defines positioning, scaling, and display settings for each Live2D character
 */

export const characterConfig = {
  aria: {
    name: 'Aria',
    modelPath: '/avatars/aria/BlackWolfGIrl.model3.json',
    // Live2D positioning and scaling
    anchor: { x: 0.7, y: 0.23 },
    position: { x: 0.5, y: 0.3 }, // Relative to canvas (0-1)
    scale: 0.3,
    // Canvas dimensions
    canvasWidth: 500,
    canvasHeight: 400,
    // Voice preferences
    voiceKeywords: ['aria', 'female', 'woman', 'girl'],
  },
  sera: {
    name: 'Sera',
    modelPath: '/avatars/sera/Snow Leopard.model3.json',
    // Live2D positioning and scaling (Snow Leopard is larger)
    anchor: { x: 0.7, y: 0.2 },
    position: { x: 0.5, y: 0.25 },
    scale: 0.14, // Slightly smaller than Aria
    // Canvas dimensions
    canvasWidth: 500,
    canvasHeight: 400,
    // Voice preferences (different from Aria)
    voiceKeywords: ['sera', 'susan', 'female', 'woman'],
  },
  eidon: {
    name: 'Eidon',
    modelPath: '/avatars/eidon/10th.model3.json',
    // Live2D positioning and scaling
    anchor: { x: 0.5, y: 0.15 },
    position: { x: 0.5, y: 0.2 },
    scale: 0.35, // Larger than others
    // Canvas dimensions
    canvasWidth: 500,
    canvasHeight: 400,
    // Voice preferences (Male)
    voiceKeywords: ['male', 'man', 'boy', 'david', 'mark'],
  },
}

/**
 * Get character configuration by ID
 * @param {string} characterId - Character identifier (aria, sera, eidon)
 * @returns {object} Character configuration object
 */
export function getCharacterConfig(characterId) {
  return characterConfig[characterId] || characterConfig.aria
}
