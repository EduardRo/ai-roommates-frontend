<!-- src/components/DebateRoom.vue (FINAL VERSION - FIXED BUBBLE) -->
<template>
  <div class="debate-room">
    <h1>AI Debate Room</h1>
    <canvas ref="sharedCanvasRef" class="shared-live2d-canvas" />

    <!-- ✅ 1. The HTML is now simpler. The style binding has been removed. -->
    <div v-if="currentSpeech" class="speech-bubble-container">
      <div class="speech-bubble">
        <span class="character-name">{{ currentSpeech.characterName }}:</span>
        <span class="speech-text">{{ currentSpeech.text }}</span>
      </div>
    </div>

    <div class="controls">
      <!-- (Controls are unchanged) -->
      <div>
        <label for="topic">Debate Topic:</label>
        <input id="topic" v-model="debateConfig.topic" type="text" :disabled="debateStatus === 'active'" />
      </div>
      <div>
        <label>Characters:</label>
        <span>{{ debateConfig.characters.join(', ') }}</span>
      </div>
      <div>
        <button @click="startDebate" :disabled="debateStatus === 'active'">Start Debate</button>
        <button @click="stopDebate" :disabled="debateStatus !== 'active'">Stop Debate</button>
      </div>
      <div class="status">
        Status: <strong>{{ debateStatus }}</strong>
        <span v-if="debateId"> | ID: {{ debateId }}</span>
      </div>
    </div>

    <div class="character-placeholders">
      <DebateCharacter v-for="config in characterConfigs" :key="config.id"
        :ref="el => registerCharacterRef(config.id, el)" :character-id="config.id" :model-path="config.modelPath"
        @playback-finished="handlePlaybackFinished" />
    </div>
  </div>
</template>

<script setup>
// ✅ 2. 'computed' is no longer needed for the bubble, so it's removed from the import.
import { onMounted, onUnmounted, ref, nextTick } from 'vue';
import DebateCharacter from './DebateCharacter.vue';
import { usePixiApp } from '@/composables/usePixiApp';
// ✅ The render config is no longer needed for the bubble's position.
// import { characterRenderConfig } from '@/config/characterRenderConfig';

const { canvasRef: sharedCanvasRef, initApp, destroyApp } = usePixiApp();

const debateConfig = ref({
  topic: 'Is AI consciousness possible?',
  characters: ['aria', 'sera', 'eidon']
});

const characterConfigs = ref([
  { id: 'aria', name: 'Aria', modelPath: '/avatars/aria/BlackWolfGIrl.model3.json' },
  { id: 'sera', name: 'Sera', modelPath: '/avatars/sera/Snow Leopard.model3.json' },
  { id: 'eidon', name: 'Eidon', modelPath: '/avatars/eidon/10th.model3.json' }
]);

const debateStatus = ref('idle');
const debateId = ref(null);
const characterRefs = ref({});
const currentSpeech = ref(null);

// ✅ 3. The entire 'speechBubbleStyle' computed property has been removed.
// All positioning is now handled directly in CSS for simplicity and reliability.

const registerCharacterRef = (id, componentRef) => {
  if (componentRef) characterRefs.value[id] = componentRef;
  else delete characterRefs.value[id];
};

const handlePlaybackFinished = () => {
  currentSpeech.value = null;
  if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return;
  ws.value.send(JSON.stringify({ type: 'playback_finished' }));
};

const handleWebSocketMessage = (message) => {
  if (message.type === 'debate_started') {
    debateStatus.value = 'active';
    debateId.value = message.data.debate_id;
  } else if (message.type === 'character_speaking' || message.type === 'opening_statement') {
    currentSpeech.value = {
      characterId: message.data.character_id,
      characterName: message.data.character_name,
      text: message.data.text,
    };
    const characterComponent = characterRefs.value[message.data.character_id];
    if (characterComponent) characterComponent.onReceiveSpeech(message.data);
  } else if (message.type === 'debate_ended') {
    debateStatus.value = 'stopped';
    debateId.value = null;
    currentSpeech.value = null;
  } else if (message.type === 'error') {
    debateStatus.value = 'error';
  }
};

const ws = ref(null);

const startDebate = async () => {
  if (debateStatus.value === 'active' || !ws.value || ws.value.readyState !== WebSocket.OPEN) return;
  currentSpeech.value = null;
  ws.value.send(JSON.stringify({ type: 'start_debate', data: debateConfig.value }));
};

const stopDebate = () => {
  if (debateStatus.value !== 'active' || !debateId.value || !ws.value || ws.value.readyState !== WebSocket.OPEN) return;
  ws.value.send(JSON.stringify({ type: 'stop_debate', debate_id: debateId.value }));
};

onMounted(() => {
  nextTick(() => initApp());
  const wsUrl = 'ws://127.0.0.1:8000/ws/debate';
  ws.value = new WebSocket(wsUrl);
  ws.value.onopen = () => console.log('[DebateRoom] WebSocket opened.');
  ws.value.onmessage = (event) => {
    try { handleWebSocketMessage(JSON.parse(event.data)); }
    catch (error) { console.error('[DebateRoom] Error parsing message:', error); }
  };
  ws.value.onclose = () => {
    debateStatus.value = 'idle';
    debateId.value = null;
    currentSpeech.value = null;
  };
  ws.value.onerror = () => { debateStatus.value = 'error'; };
});

onUnmounted(() => {
  destroyApp();
  if (ws.value) ws.value.close(1000, "Client disconnecting");
});
</script>

<style scoped>
.debate-room {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: url('/backgrounds/new_background-min.jpg');
}

.shared-live2d-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* ✅ 4. REWRITTEN & SIMPLIFIED CSS for the fixed bubble */

/* This container is now responsible for placing the bubble at the bottom
   of the screen and ensuring it's centered. */
.speech-bubble-container {
  position: absolute;
  bottom: 1%;
  /* Position 5% from the bottom of the screen */
  left: 0;
  right: 0;
  z-index: 20;
  pointer-events: none;
  display: flex;
  /* Using flexbox is the easiest way to center a child */
  justify-content: center;
  /* This horizontally centers the .speech-bubble */
  padding: 0 20px;
  /* Adds space on the sides for very narrow screens */
}

/* The bubble itself now has no positioning logic. It just defines its own appearance. */
.speech-bubble {
  width: auto;
  /* Width is determined by content */
  min-width: 300px;
  max-width: 950px;
  /* Can be wider now that it is centered */
  background-color: rgba(10, 20, 40, 0.9);
  /* Slightly more opaque for readability */
  color: white;
  padding: 15px 25px;
  border-radius: 15px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 18px;
  line-height: 1.5;
  text-align: center;
  /* Center the text inside the bubble */
  border: 1px solid rgba(120, 180, 255, 0.4);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.6);
  transition: opacity 0.3s ease-in-out;
}

/* The little triangle no longer makes sense visually, so it has been removed. */

.speech-bubble .character-name {
  font-weight: 700;
  color: #82c8ff;
  display: block;
  /* Puts the name on its own line */
  margin-bottom: 8px;
  /* Adds space between name and text */
  font-size: 20px;
}

.controls {
  position: relative;
  z-index: 10;
  margin-top: 20px;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 8px;
  max-width: 800px;
}

.status {
  font-style: italic;
  color: #ccc;
}

.character-placeholders {
  display: none;
}
</style>
