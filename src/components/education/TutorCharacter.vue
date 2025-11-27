<template>
  <canvas ref="canvasRef" class="tutor-canvas" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import * as PIXI from 'pixi.js'
import { Live2DModel } from '@zennomi/pixi-live2d-display'
import { getAudio } from '@/services/personaService'
import { getCharacterConfig } from '@/config/characterConfig'

const props = defineProps({
  characterId: { type: String, default: 'aria' },
  modelPath: { type: String, required: true },
})

const canvasRef = ref(null)
let pixiApp = null
let live2dModel = null
let animationFrameId = null
const isSpeaking = ref(false)
const speakingStartTime = ref(0)
const componentMountTime = ref(0)

// Get character configuration
const charConfig = computed(() => getCharacterConfig(props.characterId))

// --- SPEECH HANDLING ---
const speak = async (text) => {
  if (isSpeaking.value) return

  console.log(`[TutorCharacter] Speaking: "${text}"`)
  isSpeaking.value = true
  speakingStartTime.value = performance.now()

  try {
    const audio = await getAudio(text, null, charConfig.value.voiceKeywords)
    if (!audio) {
      console.warn('[TutorCharacter] No audio generated.')
      isSpeaking.value = false
      return
    }

    audio.onended = () => {
      console.log('[TutorCharacter] Audio finished.')
      isSpeaking.value = false
    }

    await audio.play().catch((err) => {
      console.error('[TutorCharacter] Playback failed:', err)
      isSpeaking.value = false
    })
  } catch (error) {
    console.error('[TutorCharacter] Error during speech setup:', error)
    isSpeaking.value = false
  }
}

// --- ANIMATION LOOP ---
const tick = (time) => {
  const coreModel = live2dModel?.internalModel?.coreModel
  if (!coreModel) {
    animationFrameId = requestAnimationFrame(tick)
    return
  }

  const elapsed = time - componentMountTime.value

  if (isSpeaking.value) {
    // --- SPEAKING ANIMATION ---
    const speakElapsed = time - speakingStartTime.value
    const mouthT = (speakElapsed % 200) / 200 // Faster mouth movement
    const mouthValue = 0.1 + 0.7 * Math.abs(Math.sin(Math.PI * mouthT))
    coreModel.setParameterValueById('ParamMouthOpenY', mouthValue)
  } else {
    // --- IDLE ANIMATION ---
    coreModel.setParameterValueById('ParamMouthOpenY', 0)

    // Blinking
    const blinkCycle = elapsed % 3000
    const isBlinking = blinkCycle < 150
    coreModel.setParameterValueById('ParamEyeLOpen', isBlinking ? 0 : 1)
    coreModel.setParameterValueById('ParamEyeROpen', isBlinking ? 0 : 1)

    // Breathing / Subtle movement
    const breathT = (elapsed % 2000) / 2000
    coreModel.setParameterValueById('ParamBreath', Math.sin(breathT * 2 * Math.PI))
  }

  // Update model
  if (live2dModel) {
    live2dModel.update(16.66) // Approx 60fps delta
  }

  animationFrameId = requestAnimationFrame(tick)
}

// --- MODEL LOADING ---
const loadModel = async () => {
  if (!pixiApp) return

  // Cleanup existing model
  if (live2dModel) {
    pixiApp.stage.removeChild(live2dModel)
    live2dModel.destroy({ children: true, texture: true })
    live2dModel = null
  }

  const config = charConfig.value
  console.log(`[TutorCharacter] Loading model for: ${props.characterId}`, config)

  try {
    // Disable mipmaps for large textures
    const originalMipmap = PIXI.BaseTexture.defaultOptions.mipmap
    PIXI.BaseTexture.defaultOptions.mipmap = PIXI.MIPMAP_MODES.OFF

    live2dModel = await Live2DModel.from(props.modelPath, { autoInteract: false })

    PIXI.BaseTexture.defaultOptions.mipmap = originalMipmap
    live2dModel.eventMode = 'none'

    // Position character using config
    live2dModel.anchor.set(config.anchor.x, config.anchor.y)
    live2dModel.x = pixiApp.screen.width * config.position.x
    live2dModel.y = pixiApp.screen.height * config.position.y
    live2dModel.scale.set(config.scale, config.scale)

    pixiApp.stage.addChild(live2dModel)
    console.log('[TutorCharacter] Model loaded successfully:', props.characterId)
  } catch (error) {
    console.error('[TutorCharacter] Error loading model:', error)
  }
}

// Watch for character changes
watch(
  () => props.characterId,
  async (newId, oldId) => {
    if (newId !== oldId) {
      console.log(`[TutorCharacter] Character changed from ${oldId} to ${newId}`)
      await loadModel()
    }
  },
)

onMounted(async () => {
  componentMountTime.value = performance.now()

  const config = charConfig.value

  // Create dedicated PixiJS app with character-specific dimensions
  pixiApp = new PIXI.Application({
    view: canvasRef.value,
    width: config.canvasWidth,
    height: config.canvasHeight,
    backgroundAlpha: 0,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  })

  Live2DModel.registerTicker(PIXI.Ticker)

  // Initial load
  await loadModel()

  // Start animation loop
  animationFrameId = requestAnimationFrame(tick)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  if (live2dModel) {
    live2dModel.destroy({ children: true, texture: true })
  }
  if (pixiApp) {
    pixiApp.destroy(true, { children: true, texture: true })
  }
})

defineExpose({ speak })
</script>

<style scoped>
.tutor-canvas {
  width: 100%;
  height: 100%;
}
</style>
