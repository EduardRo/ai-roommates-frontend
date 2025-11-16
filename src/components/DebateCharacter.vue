<!-- src/components/DebateCharacter.vue (FINAL CORRECTED VERSION) -->
<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { getSharedPixiApp, isInitialized } from '@/composables/usePixiApp';
import { Live2DModel } from '@zennomi/pixi-live2d-display';
import { characterRenderConfig } from '@/config/characterRenderConfig';
import { characterAnimationConfig, defaultSpeakingAnimationConfig, defaultIdleAnimationConfig } from '@/config/characterAnimationConfig.js';
import { getAudio } from '@/services/personaService';

const props = defineProps({
  characterId: { type: String, required: true },
  modelPath: { type: String, required: true },
});
const emit = defineEmits(['playback-finished']);

let live2dModel = null;
const hasAttemptedLoad = ref(false);

// --- STATE MANAGEMENT REFS ---
const isSpeaking = ref(false);
const speakingStartTime = ref(0);
const componentMountTime = ref(0);
let persistentAnimationFrameId = null;

// --- AUDIO HANDLING & STATE TRIGGERING ---
const onReceiveSpeech = async (data) => {
  if (isSpeaking.value) return;

  isSpeaking.value = true;
  speakingStartTime.value = performance.now();

  const { text, audio_b64 } = data;
  if (!text) {
    console.warn(`[DebateCharacter:${props.characterId}] No text received.`);
    finishSpeech();
    return;
  }

  try {
    const audio = await getAudio(text, audio_b64);
    if (!audio) {
      console.warn(`[DebateCharacter:${props.characterId}] No audio generated.`);
      finishSpeech();
      return;
    }

    audio.onended = () => {
      console.log(`[DebateCharacter:${props.characterId}] Audio finished.`);
      finishSpeech();
    };

    await audio.play().catch(err => {
      console.error(`[DebateCharacter:${props.characterId}] Playback failed:`, err);
      finishSpeech();
    });

  } catch (error) {
    console.error(`[DebateCharacter:${props.characterId}] Error during speech setup:`, error);
    finishSpeech();
  }
};

const finishSpeech = () => {
  isSpeaking.value = false;
  emit('playback-finished', { characterId: props.characterId });
  console.log(`[DebateCharacter:${props.characterId}] Speech finished, returning to idle state.`);
};

// --- BEHAVIOR LOOP (THE "BRAIN") ---
const tick = (time) => {
  const coreModel = live2dModel?.internalModel?.coreModel;
  if (!coreModel) {
    persistentAnimationFrameId = requestAnimationFrame(tick);
    return;
  }

  if (isSpeaking.value) {
    // --- SPEAKING ANIMATION LOGIC ---
    const speakingConfig = characterAnimationConfig[props.characterId]?.speaking ?? defaultSpeakingAnimationConfig;
    const elapsed = time - speakingStartTime.value;

    const mouthT = (elapsed % 600) / 600;
    const mouthValue = 0.1 + (0.6 * Math.abs(Math.sin(Math.PI * mouthT)));
    coreModel.setParameterValueById('ParamMouthOpenY', mouthValue);

    const blinkCycle = elapsed % speakingConfig.blinking.cycleMs;
    coreModel.setParameterValueById('ParamEyeLOpen', blinkCycle < speakingConfig.blinking.durationMs ? 0 : 1);
    coreModel.setParameterValueById('ParamEyeROpen', blinkCycle < speakingConfig.blinking.durationMs ? 0 : 1);

    const headTx = (elapsed % speakingConfig.head.x.cycleMs) / speakingConfig.head.x.cycleMs;
    coreModel.setParameterValueById('ParamAngleX', Math.sin(headTx * 2 * Math.PI) * speakingConfig.head.x.amplitude);
    const headTy = (elapsed % speakingConfig.head.y.cycleMs) / speakingConfig.head.y.cycleMs;
    coreModel.setParameterValueById('ParamAngleY', Math.cos(headTy * 2 * Math.PI) * speakingConfig.head.y.amplitude);

    const bodyTz = (elapsed % speakingConfig.body.z.cycleMs) / speakingConfig.body.z.cycleMs;
    coreModel.setParameterValueById('ParamAngleZ', Math.sin(bodyTz * 2 * Math.PI) * speakingConfig.body.z.amplitude);

  } else {
    // --- IDLE ANIMATION LOGIC ---
    const idleConfig = characterAnimationConfig[props.characterId]?.idle ?? defaultIdleAnimationConfig;
    const elapsed = time - componentMountTime.value;

    coreModel.setParameterValueById('ParamMouthOpenY', 0);

    const blinkCycle = elapsed % idleConfig.blinking.cycleMs;
    coreModel.setParameterValueById('ParamEyeLOpen', blinkCycle < idleConfig.blinking.durationMs ? 0 : 1);
    coreModel.setParameterValueById('ParamEyeROpen', blinkCycle < idleConfig.blinking.durationMs ? 0 : 1);

    const bodyTz = (elapsed % idleConfig.body.z.cycleMs) / idleConfig.body.z.cycleMs;
    coreModel.setParameterValueById('ParamAngleZ', Math.sin(bodyTz * 2 * Math.PI) * idleConfig.body.z.amplitude);

    // Smoothly return head to neutral
    coreModel.setParameterValueById('ParamAngleX', coreModel.getParameterValueById('ParamAngleX') * 0.95);
    coreModel.setParameterValueById('ParamAngleY', coreModel.getParameterValueById('ParamAngleY') * 0.95);
  }

  persistentAnimationFrameId = requestAnimationFrame(tick);
};

// --- MODEL LOADING & LIFECYCLE ---
const loadModel = async () => {
  if (hasAttemptedLoad.value) return;
  hasAttemptedLoad.value = true;
  const app = getSharedPixiApp();
  if (!app) {
    console.error(`[DebateCharacter:${props.characterId}] Pixi app not available.`);
    hasAttemptedLoad.value = false;
    return;
  }
  try {
    live2dModel = await Live2DModel.from(props.modelPath, { autoInteract: false });
    live2dModel.eventMode = 'none';

    const config = characterRenderConfig[props.characterId];
    if (config) {
      live2dModel.anchor.set(config.anchor.x, config.anchor.y);
      live2dModel.x = app.screen.width * config.position.x;
      live2dModel.y = app.screen.height * config.position.y;
      live2dModel.scale.set(config.scale.x, config.scale.y);
    }

    app.stage.addChild(live2dModel);

    // ✅ THE CRITICAL FIX: Re-introduce the PIXI.js ticker (The "Engine")
    // This calls the model's internal update function. It is ESSENTIAL for
    // applying parameters, calculating physics, and making the model move.
    app.ticker.add((delta) => {
      if (live2dModel) {
        live2dModel.update(delta);
      }
    });

    // START THE PERSISTENT BEHAVIOR LOOP (The "Brain")
    componentMountTime.value = performance.now();
    persistentAnimationFrameId = requestAnimationFrame(tick);

    console.log(`[DebateCharacter:${props.characterId}] Model loaded and ALL animation loops started.`);
  } catch (error) {
    console.error(`[DebateCharacter:${props.characterId}] Error loading model:`, error);
    hasAttemptedLoad.value = false;
  }
};

watch(isInitialized, (initialized) => {
  if (initialized) loadModel();
}, { immediate: true });

onMounted(() => {
  console.log(`[DebateCharacter:${props.characterId}] Mounted.`);
});

onUnmounted(() => {
  if (persistentAnimationFrameId) {
    cancelAnimationFrame(persistentAnimationFrameId);
  }
  const app = getSharedPixiApp();
  if (app && live2dModel) {
    app.stage.removeChild(live2dModel);
    live2dModel.destroy({ children: true, texture: true });
    console.log(`[DebateCharacter:${props.characterId}] Model destroyed and animation stopped.`);
  }
});

defineExpose({ onReceiveSpeech, characterId: props.characterId });
</script>

<template>
  <div class="character-ui-placeholder" />
</template>

<style scoped>
.character-ui-placeholder {
  display: none;
}
</style>```

This change should restore all movement. Both the idle and speaking animations will now function correctly.
