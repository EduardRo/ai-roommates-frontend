// src/composables/usePixiApp.js

import { ref } from 'vue'
import * as PIXI from 'pixi.js' // ✅ Full namespace import for v7 (resolves common Vite issues)

let sharedApp = null
const canvasRef = ref(null)
const isInitialized = ref(false)

export function usePixiApp() {
  const initApp = () => {
    // ✅ Synchronous for v7 (no async needed)
    if (sharedApp || !canvasRef.value) {
      console.warn('[usePixiApp] App already initialized or canvas ref not available.')
      return
    }

    console.log('[usePixiApp] Initializing shared PixiJS application (v7).')

    try {
      // ✅ v7: Direct constructor with options (no deprecation)
      sharedApp = new PIXI.Application({
        view: canvasRef.value, // Attach to existing <canvas>
        backgroundAlpha: 0,
        antialias: true,
        resizeTo: canvasRef.value.parentElement, // Auto-resize
        // resolution: window.devicePixelRatio, // Optional
      })

      // Verify (immediate in v7)
      if (!sharedApp.screen || !sharedApp.renderer) {
        throw new Error('PixiJS app initialized but screen/renderer not available')
      }

      console.log('[usePixiApp] App screen dimensions:', {
        width: sharedApp.screen.width,
        height: sharedApp.screen.height,
      })
      console.log('[usePixiApp] PixiJS version:', PIXI.VERSION) // Confirm v7

      isInitialized.value = true
      console.log('[usePixiApp] Shared PixiJS application initialized successfully.')
    } catch (error) {
      console.error('[usePixiApp] Failed to initialize PixiJS application:', error)
      if (sharedApp && typeof sharedApp.destroy === 'function') {
        sharedApp.destroy(true)
      }
      sharedApp = null
      isInitialized.value = false
    }
  }

  const destroyApp = () => {
    // ✅ Synchronous for v7
    if (sharedApp && typeof sharedApp.destroy === 'function') {
      console.log('[usePixiApp] Destroying shared PixiJS application.')
      sharedApp.destroy(true)
      sharedApp = null
      isInitialized.value = false
    }
  }

  return {
    canvasRef,
    isInitialized,
    initApp,
    destroyApp,
  }
}

export function getSharedPixiApp() {
  if (!isInitialized.value || !sharedApp) {
    return null
  }
  return sharedApp
}

export { isInitialized }
