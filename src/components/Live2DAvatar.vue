<template>
  <div class="container">
    <!-- Background Image Layer -->
    <div class="background-layer"></div>

    <!-- LEFT ZONE: Avatar + Controls -->
    <div class="left-zone">
      <div class="avatar-container">
        <canvas ref="canvas"></canvas>
        <div v-if="!isAudioUnlocked" class="audio-unlock-panel" @click="unlockAudio">
          <button>Awaken Sera</button>
        </div>
        <div class="animation-panel">
          <button @click="triggerAnimation('CuriosityCombo')" :disabled="!canInteract">Curiosity Combo</button>
          <button @click="triggerAnimation('ExcitedWag')" :disabled="!canInteract">Excited Wag</button>
          <button @click="triggerAnimation('ThinkingSequence')" :disabled="!canInteract">Thinking Sequence</button>
        </div>
      </div>
    </div>

    <!-- RIGHT ZONE: Chat Interface -->
    <div class="right-zone">
      <div class="interaction-panel">

        <div class="response-display">
          <p>{{ personaStore.responseText || animationStatus || 'Luna is online.' }}</p>
        </div>
        <div class="input-area">
          <!-- Multi-line textarea instead of single-line input -->
          <textarea v-model="userInput" @keydown.enter.exact.prevent="submit" @keydown.shift.enter="addNewLine"
            placeholder="Transmit directive... (Shift+Enter for new line, Enter to send)" :disabled="!canInteract"
            rows="3"></textarea>
          <button @click="submit" :disabled="!canInteract">
            {{ personaStore.isLoading ? '...' : 'Send' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed, onUnmounted } from 'vue';
import { usePersonaStore } from '@/stores/personaStore';
import { getAudio } from '@/services/personaService';

const selectedModel = ref('companion')
const MODEL_PATH = "/avatars/leopard/Snow Leopard.model3.json";
const canvas = ref(null);
const userInput = ref('');
const personaStore = usePersonaStore();
const isAudioUnlocked = ref(false);
const isThinking = ref(false);
const isSpeaking = ref(false);
const animationStatus = ref('');
const canInteract = computed(() => !personaStore.isLoading && isAudioUnlocked.value);

let live2dModel = null;
let app = null;

// Handle textarea new line (Shift+Enter)
function addNewLine(event) {
  // Allow default behavior for Shift+Enter (adds new line)
  return true;
}

watch(() => personaStore.responseTrigger, (newValue, oldValue) => {
  console.log(`[Watcher] Trigger value changed: ${oldValue} -> ${newValue}`);
  const commands = personaStore.animationCommands;
  if (!commands || commands.length === 0) {
    console.log("[Watcher] No commands to execute");
    isThinking.value = false;
    isSpeaking.value = false;
    return;
  }
  console.log(`[Watcher] Commands: ${commands.length}`);
  if (commands[0].type === 'error') {
    playErrorAnimation();
  } else {
    // Pass audio_b64 to orchestrateSpeech
    orchestrateSpeech(
      personaStore.responseText,
      commands,
      personaStore.audio_b64
    );
  }
  isThinking.value = false;
});



async function triggerAnimation(sequenceName) {
  if (!canInteract.value) return;
  animationStatus.value = `Playing ${sequenceName}`;
  try {
    const response = await fetch('http://127.0.0.1:8000/v1/trigger_animation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sequence_name: sequenceName }),
    });
    if (!response.ok) throw new Error(`Animation Error: ${await response.text()}`);
    const { avatar_commands } = await response.json();
    executeCommandList(avatar_commands, 7000);
    await new Promise(resolve => setTimeout(resolve, 7000));
    animationStatus.value = '';
  } catch (error) {
    console.error(`[Animation] Failed: ${error}`);
    animationStatus.value = 'Animation failed';
    playErrorAnimation();
    await new Promise(resolve => setTimeout(resolve, 2000));
    animationStatus.value = '';
  }
}

async function submit() {
  if (!userInput.value.trim() || !canInteract.value) return;
  console.log(`[Submit] Sending: "${userInput.value}"`);
  isThinking.value = true;
  playThinkingAnimation();
  personaStore.ask(userInput.value);
  userInput.value = '';
}

// Updated function with audio_b64 parameter
async function orchestrateSpeech(text, animationCommands, audioB64) {
  if (!text || !animationCommands) return;
  isSpeaking.value = true;

  ['ParamAngleX', 'ParamAngleZ', 'PARAM_ANGLE_X', 'PARAM_ANGLE_Z', 'ParamMouthOpenY'].forEach(p => setParameterValue(p, 0));

  // Pass audioB64 to getAudio
  const audio = await getAudio(text, audioB64);
  if (!audio) {
    console.warn("[Orchestrate] No audio generated, skipping animation.");
    isSpeaking.value = false;
    return;
  }

  const playPromise = audio.play();
  const startTime = performance.now();
  const mouthMin = 0.2;
  const mouthMax = 0.8;

  let animIndex = 0;
  const totalCommands = animationCommands.length;
  const stepDuration = 100;
  let animationFrameId = null;
  let isAnimating = true;

  const estimatedDuration = Math.max(3, text.length / 12);
  const maxAnimationTime = estimatedDuration * 1000;

  console.log(`[Orchestrate] Estimated duration: ${estimatedDuration}s for ${text.length} chars`);

  function stopAnimation() {
    if (!isAnimating) return;
    isAnimating = false;
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    setParameterValue('ParamMouthOpenY', 0);
    isSpeaking.value = false;
    console.log("[Orchestrate] Animation stopped");
  }

  function animate(time) {
    if (!isAnimating) return;

    const elapsed = time - startTime;

    if (elapsed > maxAnimationTime) {
      console.log(`[Orchestrate] Reached max animation time (${elapsed}ms)`);
      stopAnimation();
      return;
    }

    if (typeof audio.paused !== 'undefined' && audio.paused) {
      console.log("[Orchestrate] Audio paused detected");
      stopAnimation();
      return;
    }

    if (typeof audio.ended !== 'undefined' && audio.ended) {
      console.log("[Orchestrate] Audio ended detected");
      stopAnimation();
      return;
    }

    const t = (elapsed % 600) / 600;
    const mouthValue = mouthMin + (mouthMax - mouthMin) * Math.abs(Math.sin(Math.PI * t));
    setParameterValue('ParamMouthOpenY', mouthValue);

    const commandsPerStep = Math.ceil(totalCommands / (maxAnimationTime / stepDuration));

    for (let i = 0; i < commandsPerStep && animIndex < totalCommands; i++, animIndex++) {
      const cmd = animationCommands[animIndex];
      if (cmd.type === 'setParameter') {
        setParameterValue(cmd.payload.id, cmd.payload.value);
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  if (playPromise && typeof playPromise.then === 'function') {
    try {
      await playPromise;
    } catch (err) {
      console.error("[Orchestrate] Play failed:", err);
      stopAnimation();
      return;
    }
  }

  animationFrameId = requestAnimationFrame(animate);
}

async function playThinkingAnimation() {
  if (!live2dModel?.internalModel?.coreModel) {
    console.log("[Thinking] Model not ready");
    isThinking.value = false;
    return;
  }
  console.log("[Thinking] Starting animation");
  const params = [
    { id: 'ParamMouthOpenY', value: 0.0 },
    { id: 'ParamAngleZ', value: 15 },
    { id: 'ParamBrowLY', value: -0.8 },
    { id: 'Param38', value: 0.5 },
    { id: 'Param40', value: 0.5 },
  ];
  params.forEach(p => setParameterValue(p.id, p.value));
  await new Promise(res => setTimeout(res, 10));
  setParameterValue('ParamMouthOpenY', 0.3);
  setParameterValue('ParamEyeLOpen', 0.0);
  setParameterValue('ParamEyeROpen', 0.0);
  await new Promise(res => setTimeout(res, 10));
  setParameterValue('ParamMouthOpenY', 0.5);
  setParameterValue('ParamEyeLOpen', 1.0);
  setParameterValue('ParamEyeROpen', 1.0);
  setParameterValue('ParamAngleX', 0);
  await new Promise(res => setTimeout(res, 10));
  setParameterValue('ParamMouthOpenY', 0.7);
  setParameterValue('ParamAngleZ', -3);
  setParameterValue('ParamBodyAngleZ', 1);
  setParameterValue('Param38', -0.5);
  setParameterValue('Param40', -0.5);
  await new Promise(res => setTimeout(res, 100));
  setParameterValue('ParamMouthOpenY', 0.3);
  setParameterValue('ParamEyeLOpen', 0.0);
  setParameterValue('ParamEyeROpen', 0.0);
  setParameterValue('ParamAngleX', -7);
  setParameterValue('ParamBodyAngleZ', -3);
  await new Promise(res => setTimeout(res, 100));
  setParameterValue('ParamMouthOpenY', 0.7);
  setParameterValue('ParamEyeLOpen', 0.6);
  setParameterValue('ParamEyeROpen', 0.6);
  setParameterValue('ParamAngleX', -10);
  setParameterValue('ParamBodyAngleZ', -5);
  await new Promise(res => setTimeout(res, 300));
  if (!isThinking.value) {
    const resetParams = [
      { id: 'ParamMouthOpenY', value: 0.0 },
      { id: 'ParamAngleZ', value: 0 },
      { id: 'ParamBrowLY', value: 0 },
      { id: 'ParamAngleX', value: 0 },
      { id: 'ParamBodyAngleZ', value: 0 },
      { id: 'Param38', value: 0 },
      { id: 'Param40', value: 0 },
    ];
    resetParams.forEach(p => setParameterValue(p.id, p.value));
    console.log("[Thinking] Reset all parameters");
  }
}

async function playErrorAnimation() {
  if (!live2dModel) return;
  setParameterValue('ParamBrowLY', -1);
  setParameterValue('ParamAngleZ', 10);
  await new Promise(res => setTimeout(res, 200));
  setParameterValue('ParamAngleZ', -10);
  await new Promise(res => setTimeout(res, 200));
  setParameterValue('ParamAngleZ', 0);
}

async function executeCommandList(commands, duration) {
  if (!live2dModel) {
    console.log("[Execute] Model not loaded");
    return;
  }
  const start = Date.now();
  for (const cmd of commands) {
    if (Date.now() - start > duration) {
      console.log("[Execute] Duration exceeded");
      break;
    }
    if (cmd.type === 'setParameter') {
      console.log(`[Execute] Applying ${cmd.payload.id}=${cmd.payload.value}`);
      setParameterValue(cmd.payload.id, cmd.payload.value);
    } else if (cmd.type === 'wait') {
      console.log(`[Execute] Waiting ${cmd.payload.duration_ms}ms`);
      await new Promise(res => setTimeout(res, cmd.payload.duration_ms));
    }
  }
  setParameterValue('ParamMouthOpenY', 0.0);
}

function setParameterValue(paramId, value) {
  if (!live2dModel?.internalModel?.coreModel) {
    console.error(`[SetParameter] Model not ready for ${paramId}`);
    return;
  }
  try {
    live2dModel.internalModel.coreModel.setParameterValueById(paramId, value);
    const current = live2dModel.internalModel.coreModel.getParameterValueById(paramId);
    console.log(`[SetParameter] Set ${paramId}=${value}, Current=${current}`);
  } catch (e) {
    console.error(`[SetParameter] Error setting ${paramId}: ${e}`);
  }
}

function unlockAudio() {
  isAudioUnlocked.value = true;
  console.log("[Audio] Context unlocked");
}

onMounted(async () => {
  if (typeof PIXI === 'undefined') {
    console.error("[Mounted] PIXI not loaded");
    return;
  }
  // eslint-disable-next-line no-undef
  app = new PIXI.Application({
    view: canvas.value,
    autoStart: true,
    backgroundAlpha: 0,
    resizeTo: canvas.value.parentElement
  });

  try {
    // eslint-disable-next-line no-undef
    live2dModel = await PIXI.live2d.Live2DModel.from(MODEL_PATH, { autoInteract: false });
    app.stage.addChild(live2dModel);
    live2dModel.anchor.set(0.5, 0.5);
    live2dModel.x = app.screen.width / 2;
    live2dModel.y = app.screen.height * 1.65;
    live2dModel.scale.set(0.30);
    live2dModel.interactionManager.enabled = false;
    console.log("[Mounted] Live2D model loaded");

    const debugParams = live2dModel.parameters || live2dModel.internalModel?.parameters;
    if (!debugParams) {
      console.error("No parameters found");
      return;
    }

    debugParams.ids.forEach((id, index) => {
      console.log(`[Param] ${id}: ${debugParams.values[index]}`);
    });

    const paramIds = [
      'ParamAngleX', 'ParamAngleZ', 'ParamEyeLOpen', 'ParamEyeROpen',
      'ParamBrowLY', 'Param38', 'Param40', 'ParamBodyAngleZ', 'ParamEyeLSmile', 'ParamMouthOpenY'
    ];
    paramIds.forEach(id => {
      try {
        const min = live2dModel.internalModel.coreModel.getParameterMinimumValue(id);
        const max = live2dModel.internalModel.coreModel.getParameterMaximumValue(id);
        const current = live2dModel.internalModel.coreModel.getParameterValueById(id);
        console.log(`[Mounted] ${id}: min=${min}, max=${max}, current=${current}`);
      } catch (e) {
        console.error(`[Mounted] Error getting ${id}: ${e}`);
      }
    });
  } catch (error) {
    console.error(`[Mounted] Model load failed: ${error}`);
  }
});

onUnmounted(() => {
  if (app) {
    app.destroy(true);
    console.log("[Unmounted] PIXI app destroyed");
  }
});
</script>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  background-color: #2c3e50;
  overflow: hidden;
  position: relative;
}

/* Background Image Layer */
.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('public/backgrounds/sera-bg.png');
  /* 🔥 CHANGE THIS PATH */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.9;
  /* Adjust transparency (0.0 to 1.0) */
  z-index: 0;
  pointer-events: none;
  /* Allow clicks to pass through */
}

/* Alternative: Use a gradient instead of image */
/*
.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.2;
  z-index: 0;
  pointer-events: none;
}
*/

/* LEFT ZONE */
.left-zone {
  width: 50%;
  height: 100%;
  position: relative;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
  /* Above background */
}

/* In your <style scoped> section, find and modify these classes: */

.avatar-container {
  width: 100%;
  height: 100%;
  /* Changed from 80% to 100% */
  position: relative;
  display: flex;
  justify-content: flex-end;
  /* Changed from center to flex-end (right align) */
  align-items: flex-end;
  /* Changed from center to flex-end (bottom align) */
}

canvas {
  width: 100%;
  height: 100%;
  max-width: 900px;
  max-height: 800px;
  object-fit: contain;
  display: block;
  /* Optional: Add padding to fine-tune position */
  padding-bottom: 0px;
  /* Adjust if needed (e.g., 20px to lift slightly) */
  padding-right: 0px;
  /* Adjust if needed (e.g., 50px to move left) */
}

.audio-unlock-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  cursor: pointer;
}

.audio-unlock-panel button {
  padding: 20px 40px;
  font-size: 1.5em;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.audio-unlock-panel button:hover {
  background-color: #35a372;
  transform: scale(1.05);
}

.animation-panel {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 800px;
  padding: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
  z-index: 10;
}

.animation-panel button {
  padding: 10px 20px;
  font-size: 1em;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.animation-panel button:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-2px);
}

.animation-panel button:disabled {
  background-color: #555;
  cursor: not-allowed;
  opacity: 0.5;
}

/* RIGHT ZONE */
.right-zone {
  width: 50%;
  height: 100%;
  position: relative;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(26, 37, 47, 0.85);
  /* Semi-transparent */
  backdrop-filter: blur(10px);
  /* Glass effect */
  z-index: 1;
  /* Above background */
}

.interaction-panel {
  width: 100%;
  max-width: 600px;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 10;
}

.model-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-size: 1.1em;
}

.model-selector select {
  padding: 8px 15px;
  border-radius: 8px;
  border: none;
  background-color: #34495e;
  color: white;
  font-size: 1em;
  cursor: pointer;
}

.response-display {
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 20px;
  border-radius: 12px;
  min-height: 650px;
  text-align: center;
  font-family: sans-serif;
  font-size: 1.1em;
  overflow-y: auto;
  max-height: 300px;
  line-height: 1.6;
}

.input-area {
  display: flex;
  gap: 10px;
  width: 100%;
  align-items: flex-end;
}

/* Multi-line textarea styling */
.input-area textarea {
  flex-grow: 1;
  border: none;
  padding: 15px;
  border-radius: 12px;
  font-size: 1em;
  font-family: sans-serif;
  background: #34495e;
  color: white;
  outline: none;
  resize: vertical;
  /* Allow vertical resizing */
  min-height: 60px;
  max-height: 200px;
  line-height: 1.5;
  transition: all 0.3s ease;
}

.input-area textarea:focus {
  background: #3d566e;
  box-shadow: 0 0 0 2px #42b983;
}

.input-area textarea::placeholder {
  color: #95a5a6;
  font-style: italic;
}

.input-area textarea:disabled {
  background: #2c3e50;
  cursor: not-allowed;
  opacity: 0.6;
}

.input-area button {
  border: none;
  padding: 15px 30px;
  background-color: #42b983;
  color: white;
  font-size: 1em;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  height: fit-content;
}

.input-area button:hover:not(:disabled) {
  background-color: #35a372;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 185, 131, 0.3);
}

.input-area button:disabled {
  background-color: #555;
  cursor: not-allowed;
  opacity: 0.5;
}

/* Scrollbar styling for webkit browsers */
.response-display::-webkit-scrollbar,
.input-area textarea::-webkit-scrollbar {
  width: 8px;
}

.response-display::-webkit-scrollbar-track,
.input-area textarea::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.response-display::-webkit-scrollbar-thumb,
.input-area textarea::-webkit-scrollbar-thumb {
  background: #42b983;
  border-radius: 10px;
}

.response-display::-webkit-scrollbar-thumb:hover,
.input-area textarea::-webkit-scrollbar-thumb:hover {
  background: #35a372;
}

.animation-panel {
  display: none;
  /* Hides the entire panel */
}
</style>
