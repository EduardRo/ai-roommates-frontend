<!-- src/components/DebateRoom.vue -->
<template>
  <div class="debate-room">
    <h1>AI Debate Room</h1>

    <!-- The single shared canvas for all characters -->
    <canvas ref="sharedCanvasRef" class="shared-live2d-canvas" />

    <div class="controls">
      <div>
        <label for="topic">Debate Topic:</label>
        <input id="topic" v-model="debateConfig.topic" type="text" :disabled="debateStatus === 'active'" />
      </div>
      <div>
        <label>Characters:</label>
        <span>{{ debateConfig.characters.join(', ') }}</span>
      </div>
      <div>
        <button @click="startDebate" :disabled="debateStatus === 'active'">
          {{ debateStatus === 'active' ? 'Debate Active' : 'Start Debate' }}
        </button>
        <button @click="stopDebate" :disabled="debateStatus !== 'active'">
          Stop Debate
        </button>
      </div>
      <div class="status">
        Status: <strong>{{ debateStatus }}</strong>
        <span v-if="debateId"> | ID: {{ debateId }}</span>
      </div>
    </div>

    <!-- Render the character components (they will add their models to the shared canvas) -->
    <div class="character-placeholders"> <!-- Optional: For UI layout/debugging -->
      <DebateCharacter v-for="config in characterConfigs" :key="config.id"
        :ref="el => registerCharacterRef(config.id, el)" :character-id="config.id" :model-path="config.modelPath" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick } from 'vue';
import DebateCharacter from './DebateCharacter.vue';
// Import the composable to get canvas ref and initialization functions
import { usePixiApp } from '@/composables/usePixiApp';
// Import your service if needed for WebSocket
// import { debateService } from '@/services/debateService';

// Use the composable to get canvas ref and initialization functions
const { canvasRef: sharedCanvasRef, initApp, destroyApp } = usePixiApp();

// Configuration for the debate
const debateConfig = ref({
  topic: 'Is AI consciousness possible?',
  characters: ['aria', 'sera', 'eidon']
});

// Character configurations (model paths, etc.)
const characterConfigs = ref([
  { id: 'aria', modelPath: '/avatars/aria/BlackWolfGIrl.model3.json' },
  { id: 'sera', modelPath: '/avatars/sera/Snow Leopard.model3.json' },
  { id: 'eidon', modelPath: '/avatars/eidon/10th.model3.json' }
]);

const debateStatus = ref('idle'); // idle, active, stopped, error
const debateId = ref(null);
const characterRefs = ref({}); // Object to hold references to child components

// Function to register a child component ref
const registerCharacterRef = (id, componentRef) => {
  if (componentRef) {
    characterRefs.value[id] = componentRef;
    console.log(`[DebateRoom] Registered ref for character: ${id}`, componentRef);
  } else {
    // Handle removal if needed, though unlikely in this case
    delete characterRefs.value[id];
  }
};

// Function to handle messages received from the WebSocket
const handleWebSocketMessage = (message) => {
  console.log('[DebateRoom] Received WebSocket message:', message);

  if (message.type === 'debate_started') {
    debateStatus.value = 'active';
    debateId.value = message.data.debate_id;
    console.log('[DebateRoom] Debate started:', message.data.debate_id);
  } else if (message.type === 'character_speaking' || message.type === 'opening_statement') {
    const characterId = message.data.character_id;
    console.log(`[DebateRoom] Character ${characterId} is speaking`);

    // Find the correct character component using the object ref
    const characterComponent = characterRefs.value[characterId];
    if (characterComponent && typeof characterComponent.onReceiveSpeech === 'function') {
      characterComponent.onReceiveSpeech(message.data);
      console.log(`[DebateRoom] Triggered speech for character: ${characterId}`);
    } else {
      console.warn(`[DebateRoom] No component or onReceiveSpeech method found for character: ${characterId}`);
      console.log('Available refs:', characterRefs.value);
    }
  } else if (message.type === 'debate_ended') {
    debateStatus.value = 'stopped';
    debateId.value = null; // Clear debate ID
    console.log('[DebateRoom] Debate ended:', message.data);
  } else if (message.type === 'error') {
    debateStatus.value = 'error';
    console.error('[DebateRoom] Error from backend:', message.message);
  }
};

// WebSocket connection management
const ws = ref(null);

// Function to start the debate
const startDebate = async () => {
  if (debateStatus.value === 'active') {
    console.warn('[DebateRoom] Debate already active');
    return;
  }

  // Ensure WebSocket is connected
  if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
    console.error('[DebateRoom] WebSocket not connected!');
    return;
  }

  try {
    console.log('[DebateRoom] Attempting to start debate via WebSocket...');
    const message = {
      type: 'start_debate',
      data: {
        topic: debateConfig.value.topic,
        characters: debateConfig.value.characters
      }
    };
    ws.value.send(JSON.stringify(message));
    // Status update will be handled by the 'debate_started' message
  } catch (error) {
    console.error('[DebateRoom] Failed to send start debate message:', error);
    debateStatus.value = 'error';
  }
};

// Function to stop the debate
const stopDebate = () => {
  if (debateStatus.value !== 'active' || !debateId.value || !ws.value || ws.value.readyState !== WebSocket.OPEN) {
    console.warn('[DebateRoom] Cannot stop debate - status:', debateStatus.value, 'Debate ID:', debateId.value, 'WS readyState:', ws.value?.readyState);
    return;
  }

  console.log('[DebateRoom] Attempting to stop debate via WebSocket...');
  const message = {
    type: 'stop_debate',
    debate_id: debateId.value
  };
  ws.value.send(JSON.stringify(message));
  // The status will be updated by the handleWebSocketMessage when 'debate_ended' is received
};

// Setup and cleanup
onMounted(() => {
  console.log('[DebateRoom] Component mounted, initializing shared Pixi app and WebSocket.');

  // Initialize the shared PixiJS app
  nextTick(() => initApp());

  // Initialize WebSocket connection
  const wsUrl = 'ws://127.0.0.1:8000/ws/debate'; // Update if your backend runs elsewhere
  console.log('[DebateRoom] Attempting to connect to WebSocket:', wsUrl);
  ws.value = new WebSocket(wsUrl);

  ws.value.onopen = () => {
    console.log('[DebateRoom] WebSocket connection opened.');
    // You could potentially auto-start the debate here if needed, or just enable the button
  };

  ws.value.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    } catch (error) {
      console.error('[DebateRoom] Error parsing WebSocket message:', error, event.data);
    }
  };

  ws.value.onclose = (event) => {
    console.log('[DebateRoom] WebSocket connection closed:', event.code, event.reason);
    debateStatus.value = 'idle'; // Reset status on close
    debateId.value = null; // Clear debate ID
    // Potentially implement reconnection logic here if needed
  };

  ws.value.onerror = (error) => {
    console.error('[DebateRoom] WebSocket error:', error);
    debateStatus.value = 'error';
  };
});

onUnmounted(() => {
  console.log('[DebateRoom] Component unmounted, destroying shared Pixi app and closing WebSocket.');
  destroyApp();

  if (ws.value) {
    ws.value.close(1000, "Client disconnecting"); // 1000 = normal closure
    ws.value = null;
  }
});
</script>

<style scoped>
.debate-room {
  position: relative;
  /* Needed for absolute canvas positioning */
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  /* Prevent scrollbars if canvas overflows */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.shared-live2d-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  /* Behind other UI elements */
  pointer-events: none;
  /* So UI elements can be clicked over the canvas */
}

.controls {
  position: relative;
  z-index: 10;
  /* Above canvas */
  margin-bottom: 20px;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  text-align: center;
}

.status {
  font-style: italic;
  color: #ccc;
}

.character-placeholders {
  position: relative;
  z-index: 5;
  /* Above canvas, below controls */
  display: flex;
  justify-content: space-around;
  width: 100%;
  /* Hide if you don't want placeholder UI boxes */
  display: none;
}
</style>
