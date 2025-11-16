// src/config/characterAnimationConfig.js (FINAL VERSION - IDLE UPDATE)

/**
 * Defines the animation parameters for each character to give them a unique personality.
 * - cycleMs: How long one full animation cycle takes in milliseconds. Larger numbers mean slower movement.
 * - amplitude: How far the parameter moves. Larger numbers mean more exaggerated movement.
 */
export const characterAnimationConfig = {
  aria: {
    speaking: {
      blinking: { cycleMs: 3500, durationMs: 120 },
      head: {
        x: { amplitude: 20, cycleMs: 2800 },
        y: { amplitude: 12, cycleMs: 3200 },
      },
      body: {
        z: { amplitude: 15, cycleMs: 4500 },
      },
    },
    // ✅ NEW: Idle animation configuration
    idle: {
      blinking: { cycleMs: 4000, durationMs: 100 },
      // Subtle breathing/swaying motion
      body: {
        z: { amplitude: 3, cycleMs: 8000 },
      },
    },
  },
  sera: {
    speaking: {
      blinking: { cycleMs: 5000, durationMs: 50 },
      head: {
        x: { amplitude: 4, cycleMs: 6000 },
        y: { amplitude: 4, cycleMs: 5500 },
      },
      body: {
        z: { amplitude: 3, cycleMs: 8000 },
        x: { amplitude: 3, cycleMs: 3000 },
        y: { amplitude: 1, cycleMs: 8000 },
      },
    },
    // ✅ NEW: Idle animation configuration
    idle: {
      blinking: { cycleMs: 5500, durationMs: 100 },
      // Very calm, almost no sway
      body: {
        z: { amplitude: 1.5, cycleMs: 10000 },
      },
    },
  },
  eidon: {
    speaking: {
      blinking: { cycleMs: 2800, durationMs: 100 },
      head: {
        x: { amplitude: 12, cycleMs: 4000 },
        y: { amplitude: 15, cycleMs: 2500 },
      },
      body: {
        z: { amplitude: 10, cycleMs: 6000 },
        x: { amplitude: 10, cycleMs: 3000 },
        y: { amplitude: 10, cycleMs: 8000 },
      },
    },
    // ✅ NEW: Idle animation configuration
    idle: {
      blinking: { cycleMs: 3200, durationMs: 90 }, // Blinks a bit faster
      body: {
        z: { amplitude: 4, cycleMs: 6000 }, // A little more restless
      },
    },
  },
}

// ✅ NEW: Default configs for both states
export const defaultSpeakingAnimationConfig = {
  blinking: { cycleMs: 4000, durationMs: 100 },
  head: {
    x: { amplitude: 10, cycleMs: 5000 },
    y: { amplitude: 8, cycleMs: 4500 },
  },
  body: {
    z: { amplitude: 8, cycleMs: 7000 },
  },
}

export const defaultIdleAnimationConfig = {
  blinking: { cycleMs: 4500, durationMs: 100 },
  body: {
    z: { amplitude: 2, cycleMs: 9000 },
  },
}
