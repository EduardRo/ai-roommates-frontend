<!-- src/components/DebateRoom.vue (FINAL VERSION - LARGER INPUT) -->
<template>
  <div class="debate-room">

    <canvas ref="sharedCanvasRef" class="shared-live2d-canvas" />

    <div v-if="currentSpeech" class="speech-bubble-container">
      <div class="speech-bubble">
        <span class="character-name">{{ currentSpeech.characterName }}:</span>
        <span class="speech-text">{{ currentSpeech.text }}</span>
      </div>
    </div>

    <div class="controls">
      <!-- ✅ 1. The input is now wrapped in a div for better layout -->
      <div class="topic-input-group">
        <label for="topic">Debate Topic:</label>
        <!-- The <input> has been replaced with a <textarea> -->
        <textarea id="topic" v-model="debateConfig.topic" rows="3" :disabled="debateStatus === 'active'"
          placeholder="Enter a complex or detailed topic here..."></textarea>
      </div>

      <!-- The rest of the controls -->
      <div class="other-controls">
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
    </div>

    <div class="character-placeholders">
      <DebateCharacter v-for="config in characterConfigs" :key="config.id"
        :ref="el => registerCharacterRef(config.id, el)" :character-id="config.id" :model-path="config.modelPath"
        @playback-finished="handlePlaybackFinished" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick } from 'vue';
import DebateCharacter from './DebateCharacter.vue';
import { usePixiApp } from '@/composables/usePixiApp';

// The <script> section is completely unchanged from our last version.
// All logic for WebSocket, state management, etc., remains the same.

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

.speech-bubble-container {
  position: absolute;
  bottom: 5%;
  left: 0;
  right: 0;
  z-index: 20;
  pointer-events: none;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

.speech-bubble {
  width: auto;
  min-width: 300px;
  max-width: 1200px;
  background-color: rgba(10, 20, 40, 0.9);
  color: white;
  padding: 15px 25px;
  border-radius: 15px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 18px;
  line-height: 1.5;
  text-align: center;
  border: 1px solid rgba(120, 180, 255, 0.4);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.6);
  transition: opacity 0.3s ease-in-out;
}

.speech-bubble .character-name {
  font-weight: 700;
  color: #82c8ff;
  display: block;
  margin-bottom: 8px;
  font-size: 20px;
}

/* ✅ 2. CSS updates for the controls and new textarea */

.controls {
  position: relative;
  z-index: 10;
  margin-top: 1px;
  /* More space from the top */
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  /* Slightly darker */
  color: white;
  border-radius: 12px;
  width: 90%;
  /* Use more of the screen width */
  max-width: 950px;
  /* Increased max-width */
  display: flex;
  flex-direction: column;
  gap: 15px;
  /* Adds space between control groups */
}

/* This is the new wrapper for the topic input */
.topic-input-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.topic-input-group label {
  margin-bottom: 8px;
  font-weight: bold;
  text-align: left;
  font-size: 16px;
}

.controls textarea {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: #e0e0e0;
  border: 1px solid #555;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-family: sans-serif;
  resize: vertical;
  /* Allow vertical resizing, but not horizontal */
  min-height: 80px;
  /* A good default minimum height */
  box-sizing: border-box;
  /* Ensures padding doesn't break width */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.controls textarea::placeholder {
  color: #888;
}

.controls textarea:focus {
  border-color: #82c8ff;
  /* Highlight with the theme color */
  box-shadow: 0 0 5px rgba(130, 200, 255, 0.5);
  outline: none;
  /* Remove default browser outline */
}

.controls textarea:disabled {
  background-color: rgba(30, 30, 30, 0.5);
  cursor: not-allowed;
}

/* This helps organize the other buttons and status text */
.other-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 20px;
}

.status {
  font-style: italic;
  color: #ccc;
}

.character-placeholders {
  display: none;
}
</style>
