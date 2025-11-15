<!-- src/components/DebateCharacter.vue -->
<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
// Import the function to get the shared app and the reactive flag
import { getSharedPixiApp, isInitialized } from '@/composables/usePixiApp';
// ✅ Direct import of Live2DModel (avoids global PIXI.live2d registration issues)
import { Live2DModel } from '@zennomi/pixi-live2d-display';
// Import your character-specific rendering config
import { characterRenderConfig } from '@/config/characterRenderConfig'; // Adjust path as needed
// Import your existing audio service
import { getAudio } from '@/services/personaService'; // Adjust path as needed

const props = defineProps({
  characterId: {
    type: String,
    required: true
  },
  modelPath: {
    type: String,
    required: true
  },
});

let live2dModel = null;
const hasAttemptedLoad = ref(false); // Flag to prevent multiple load attempts
let isSpeaking = ref(false); // Reactive state to track if this character is speaking

// Function to handle incoming speech data for this character
// This will be called by the parent component (DebateRoom.vue) when a message arrives for this character
const onReceiveSpeech = async (data) => {
  console.log(`[DebateCharacter:${props.characterId}] onReceiveSpeech called with data:`, data);
  const { text, audio_b64 /*, audio_url */ } = data; // Destructure the received data

  // Check if the character is already speaking to prevent overlap
  if (isSpeaking.value) {
    console.warn(`[DebateCharacter:${props.characterId}] Already speaking, ignoring new speech data.`);
    return; // Exit if already processing speech
  }

  if (!text) {
    console.warn(`[DebateCharacter:${props.characterId}] Received speech data with no text.`);
    return; // Exit if no text to speak
  }

  console.log(`[DebateCharacter:${props.characterId}] Processing speech:`, text.substring(0, 50) + '...');

  // Set speaking flag
  isSpeaking.value = true;

  try {
    // Use your existing getAudio function - it handles audio_b64 and audio_url internally
    const audio = await getAudio(text, audio_b64);
    if (!audio) {
      console.warn(`[DebateCharacter:${props.characterId}] No audio generated, skipping animation.`);
      isSpeaking.value = false; // Reset flag
      return;
    }

    // Start playing audio
    const playPromise = audio.play();
    const startTime = performance.now();
    const mouthMin = 0.1; // <--- 🔥 THESE VALUES CONTROL THE MOUTH MOVEMENT AMPLITUDE
    const mouthMax = 0.7; // <--- 🔥

    let animIndex = 0;
    // Assuming animationCommands are sent in the message, which they currently are not.
    // We'll focus on basic lip-sync for now using the text.
    // If animation commands are sent later, they can be used here.
    const animationCommands = []; // Placeholder - you might receive these in the future
    const totalCommands = animationCommands.length;
    const stepDuration = 100; // <--- 🔥 THIS CONTROLS THE TIMING OF COMMAND PROCESSING (IF USED)
    let animationFrameId = null;
    let isAnimating = true;

    // Estimate duration based on text length if audio duration is unavailable
    const estimatedDuration = Math.max(3, text.length / 12); // <--- 🔥 ESTIMATED DURATION BASED ON TEXT LENGTH
    const maxAnimationTime = estimatedDuration * 1000;      // <--- 🔥 CONVERTED TO MILLISECONDS

    console.log(`[DebateCharacter:${props.characterId}] Estimated duration: ${estimatedDuration}s for ${text.length} chars`);

    const stopAnimation = () => {
      if (!isAnimating) return;
      isAnimating = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      // Reset mouth parameter when animation stops
      if (live2dModel && live2dModel.internalModel?.coreModel) {
        const currentValue = live2dModel.internalModel.coreModel.getParameterValueById('ParamMouthOpenY');
        if (currentValue > 0) { // Only reset if it was open
          live2dModel.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', 0);
          console.log(`[DebateCharacter:${props.characterId}] Reset mouth parameter`);
        }
      }
      isSpeaking.value = false; // Reset speaking flag
      console.log(`[DebateCharacter:${props.characterId}] Animation stopped`);
    };

    const animate = (time) => {
      if (!isAnimating) return;

      const elapsed = time - startTime;

      if (elapsed > maxAnimationTime) {
        console.log(`[DebateCharacter:${props.characterId}] Reached max animation time (${elapsed}ms)`);
        stopAnimation();
        return;
      }

      // Check if audio has ended
      if (audio.ended || (typeof audio.paused !== 'undefined' && audio.paused && elapsed > 1000)) { // Small delay to account for play() async
        console.log(`[DebateCharacter:${props.characterId}] Audio ended detected`);
        stopAnimation();
        return;
      }

      // Basic lip-sync based on time - this creates a simple open/close oscillation
      const t = (elapsed % 600) / 600; // Oscillate every 600ms
      const mouthValue = mouthMin + (mouthMax - mouthMin) * Math.abs(Math.sin(Math.PI * t));

      // Apply the mouth parameter to the Live2D model
      if (live2dModel && live2dModel.internalModel?.coreModel) {
        live2dModel.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', mouthValue);
        // console.log(`[DebateCharacter:${props.characterId}] Set mouth to ${mouthValue}`); // Optional: remove for performance
      }

      // Process animation commands if available (placeholder for future use)
      if (totalCommands > 0) {
        const commandsPerStep = Math.ceil(totalCommands / (maxAnimationTime / stepDuration));
        for (let i = 0; i < commandsPerStep && animIndex < totalCommands; i++, animIndex++) {
          const cmd = animationCommands[animIndex];
          if (cmd.type === 'setParameter' && live2dModel && live2dModel.internalModel?.coreModel) {
            live2dModel.internalModel.coreModel.setParameterValueById(cmd.payload.id, cmd.payload.value);
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    if (playPromise && typeof playPromise.then === 'function') {
      try {
        await playPromise;
      } catch (err) {
        console.error(`[DebateCharacter:${props.characterId}] Play failed:`, err);
        stopAnimation();
        return;
      }
    }

    animationFrameId = requestAnimationFrame(animate);

  } catch (error) {
    console.error(`[DebateCharacter:${props.characterId}] Error during speech:`, error);
    isSpeaking.value = false; // Ensure flag is reset on error
  }
};


// Function to load and setup the model
const loadModel = async () => {
  if (hasAttemptedLoad.value) return; // Prevent running multiple times
  hasAttemptedLoad.value = true;

  const app = getSharedPixiApp();
  if (!app) {
    console.error(`[DebateCharacter:${props.characterId}] Shared PixiJS app not available during load attempt.`);
    // Reset flag to allow retry if app becomes available later (though unlikely in this flow)
    hasAttemptedLoad.value = false;
    return;
  }

  console.log(`[DebateCharacter:${props.characterId}] Attempting to load model: ${props.modelPath}`);

  try {
    // ✅ Direct use of imported Live2DModel.from (no global reference needed)
    live2dModel = await Live2DModel.from(props.modelPath, { autoInteract: false });

    if (!live2dModel) {
      throw new Error(`Failed to load model from ${props.modelPath}`);
    }

    // --- CRITICAL FIX: Disable interaction on the model instance itself ---
    // This prevents the PixiJS EventBoundary error by ensuring the root model object
    // and its children are not considered interactive by the PixiJS event system.
    live2dModel.eventMode = 'none'; // Modern PixiJS v7 way
    // live2dModel.interactiveChildren = false; // Legacy PixiJS v6 way

    // --- Apply Character-Specific Configuration ---
    const config = characterRenderConfig[props.characterId];
    if (config) {
      // Apply anchor point (determines which part of the model is positioned)
      live2dModel.anchor.set(config.anchor.x, config.anchor.y);

      // Get the dimensions of the shared application's view (the canvas)
      // These should be available if the app is truly initialized
      const appWidth = app.screen.width;
      const appHeight = app.screen.height;

      // Calculate position based on the shared app's dimensions and the config
      live2dModel.x = appWidth * config.position.x; // e.g., config.position.x = 0.25 for 25% from left
      live2dModel.y = appHeight * config.position.y; // e.g., config.position.y = 0.8 for 80% from top

      // Apply scale
      live2dModel.scale.set(config.scale.x, config.scale.y);

      console.log(`[DebateCharacter:${props.characterId}] Applied config: pos (${live2dModel.x}, ${live2dModel.y}), scale (${live2dModel.scale.x}, ${live2dModel.scale.y})`);
    } else {
      console.warn(`[DebateCharacter:${props.characterId}] No render config found in characterRenderConfig.js, using defaults.`);
      // Apply some sensible defaults if no config is found
      live2dModel.anchor.set(0.5, 1.0); // Bottom center anchor
      live2dModel.x = app.screen.width / 2; // Center horizontally
      live2dModel.y = app.screen.height * 0.8; // Near bottom vertically
      live2dModel.scale.set(0.3); // Default scale
    }
    // --- End Configuration ---

    // Add the loaded model to the SHARED stage
    app.stage.addChild(live2dModel);

    // --- Interaction Manager Safety Check (FIXED) ---
    // Check if the interactionManager property exists on the live2dModel object itself
    // before trying to access or modify its properties.
    // The error log shows: TypeError: Cannot set properties of undefined (setting 'enabled')
    // This means live2dModel.interactionManager was undefined, but the code still tried to access .enabled
    // We need to check if live2dModel.interactionManager itself exists and is an object.
    // Inside DebateCharacter.vue loadModel function, replacing the problematic block
    if (live2dModel.interactionManager && typeof live2dModel.interactionManager === 'object') {
      console.log(`[DebateCharacter:${props.characterId}] Attempting to disable interactionManager.`);
      // Check if the 'enabled' property exists AND is not undefined/null before trying to set it
      if (Object.prototype.hasOwnProperty.call(live2dModel.interactionManager, 'enabled') &&
        typeof live2dModel.interactionManager.enabled !== 'undefined' &&
        live2dModel.interactionManager.enabled !== null) {
        // Perform the assignment with an extra check to ensure interactionManager still exists
        if (live2dModel.interactionManager && typeof live2dModel.interactionManager === 'object') {
          try {
            live2dModel.interactionManager.enabled = false;
            console.log(`[DebateCharacter:${props.characterId}] interactionManager.enabled set to false.`);
          } catch (e) {
            console.warn(`[DebateCharacter:${props.characterId}] Could not set interactionManager.enabled:`, e.message);
          }
        } else {
          console.warn(`[DebateCharacter:${props.characterId}] interactionManager disappeared during assignment attempt.`);
        }
      } else {
        console.log(`[DebateCharacter:${props.characterId}] interactionManager.enabled property does not exist or is undefined/null on the interactionManager object.`);
      }
    } else {
      console.log(`[DebateCharacter:${props.characterId}] interactionManager not found or not an object on model, skipping disable.`);
    }
    // --- End Safety Check ---

    // ✅ Add ticker for animation (ensures models update/animate)
    app.ticker.add((delta) => {
      if (live2dModel) {
        live2dModel.update(delta);
      }
    });

    console.log(`[DebateCharacter:${props.characterId}] Live2D model loaded and added to shared stage successfully`);

  } catch (error) {
    console.error(`[DebateCharacter:${props.characterId}] Error loading Live2D model:`, error);
    // Reset flag on error to allow retry if needed (e.g., if network issue)
    hasAttemptedLoad.value = false;
  }
};

// Watch for the shared app initialization
// This will run when isInitialized becomes true
watch(isInitialized, (initialized) => {
  if (initialized) {
    console.log(`[DebateCharacter:${props.characterId}] Shared app is now initialized, attempting to load model.`);
    loadModel(); // Attempt to load the model now that the app is ready
  }
}, { immediate: true }); // immediate: true ensures the watcher runs immediately when component is created

// Setup Live2D model (this is now just a placeholder or for cleanup)
onMounted(async () => {
  // The actual loading is handled by the watch on isInitialized
  // This hook can be used for other setup if needed, but model loading is deferred
  console.log(`[DebateCharacter:${props.characterId}] Mounted, waiting for shared app...`);
});

onUnmounted(() => {
  // Get the shared app instance again
  const app = getSharedPixiApp(); // Use the helper function
  if (app && live2dModel) {
    // Remove the model from the shared stage
    if (app.stage.children.includes(live2dModel)) {
      app.stage.removeChild(live2dModel);
    }
    // Destroy the model's resources
    live2dModel.destroy({ children: true, texture: true }); // v7 destroy options
    console.log(`[DebateCharacter:${props.characterId}] Model removed from stage and destroyed`);
  }
});

// Expose the onReceiveSpeech method so the parent can call it
defineExpose({
  onReceiveSpeech,
  // Add other methods you might need to expose to the parent
  characterId: props.characterId, // Example: expose character ID
});
</script>

<template>
  <!-- This component no longer renders its own canvas -->
  <!-- You can add UI elements here if needed, but the visual model is on the shared canvas -->
  <div class="character-ui-placeholder" :data-character-id="characterId">
    <!-- Example: Character name, status indicator -->
    <h4>{{ characterId }}</h4>
    <!-- Add other UI elements if required -->
  </div>
</template>

<style scoped>
.character-ui-placeholder {
  /* Style for the character's UI placeholder if shown */
  display: inline-block;
  margin: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
  background-color: #f9f9f9;
  /* Hide by default if you don't want these boxes */
  display: none;
}

.character-ui-placeholder h4 {
  margin: 0;
  font-size: 1em;
}
</style>
