// src/config/characterRenderConfig.js

/**
 * Configuration for rendering each character on the shared canvas.
 * Position values (x, y) are fractions of the canvas width/height (0-1).
 * Anchor determines the point of the model used for positioning (e.g., 0.5, 1.0 = bottom center).
 */
export const characterRenderConfig = {
  aria: {
    anchor: { x: 0.86, y: 0.39 }, // Adjust based on Aria's model pivot
    position: { x: 0.4, y: 1.2 }, // Place Aria on the left side
    scale: { x: 0.54, y: 0.64 }, // Adjust scale for Aria
    mouthParam: 'ParamMouthOpenY', // Example parameter name for lip sync
  },
  sera: {
    anchor: { x: 0.55, y: 0.39 }, // Adjust based on Sera's model pivot
    position: { x: 0.5, y: 0.9 }, // Place Sera in the center
    scale: { x: 0.2, y: 0.26 }, // Adjust scale for Sera
    mouthParam: 'ParamMouthForm', // Example parameter name for lip sync
  },
  eidon: {
    anchor: { x: 0.15, y: 0.75 }, // Adjust based on Eidon's model pivot
    position: { x: 0.75, y: 0.78 }, // Place Eidon on the right side
    scale: { x: 0.05, y: 0.06 }, // Adjust scale for Eidon
    mouthParam: 'ParamMouthOpen', // Example parameter name for lip sync
  },
  // Add more characters as needed
}
