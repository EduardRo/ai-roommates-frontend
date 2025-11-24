<!-- src/components/DebateRoom.vue -->
<template>
  <div class="debate-room">
    <canvas ref="sharedCanvasRef" class="shared-live2d-canvas" />

    <div v-if="currentSpeech" class="speech-bubble-container">
      <div class="speech-bubble" :class="{ 'intervention-response': isInterventionResponse }">
        <div v-if="isInterventionResponse" class="reply-indicator">
          Replying to {{ currentSpeech.contextRef.source }}: "{{
            currentSpeech.contextRef.original_text
          }}"
        </div>
        <span class="character-name">{{ currentSpeech.characterName }}:</span>
        <span class="speech-text">{{ currentSpeech.text }}</span>
      </div>
    </div>

    <div class="controls">
      <!-- TOPIC INPUT -->
      <div class="control-group">
        <label for="topic">Debate Topic:</label>
        <textarea
          id="topic"
          v-model="debateConfig.topic"
          rows="2"
          :disabled="debateStatus === 'active'"
          placeholder="Enter a complex or detailed topic here..."
        ></textarea>
      </div>

      <!-- STYLE & CHARACTERS -->
      <div class="control-row">
        <div class="control-group half-width">
          <label>Style:</label>
          <select v-model="debateConfig.style" :disabled="debateStatus === 'active'">
            <option value="balanced">Balanced</option>
            <option value="heated">Heated</option>
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
          </select>
        </div>
        <div class="control-group half-width">
          <label>Characters:</label>
          <div class="character-select">
            <label v-for="char in availableCharacters" :key="char.id" class="checkbox-label">
              <input
                type="checkbox"
                :value="char.id"
                v-model="debateConfig.characters"
                :disabled="debateStatus === 'active'"
              />
              {{ char.name }}
            </label>
          </div>
        </div>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="other-controls">
        <div class="status">
          Status: <strong>{{ debateStatus }}</strong>
          <span v-if="debateId"> | ID: {{ debateId }}</span>
        </div>
        <div>
          <button @click="startDebate" :disabled="debateStatus === 'active'" class="primary-btn">
            Start Debate
          </button>
          <button @click="stopDebate" :disabled="debateStatus !== 'active'" class="danger-btn">
            Stop Debate
          </button>
        </div>
      </div>
    </div>

    <div class="character-placeholders">
      <DebateCharacter
        v-for="config in activeCharacterConfigs"
        :key="config.id"
        :ref="(el) => registerCharacterRef(config.id, el)"
        :character-id="config.id"
        :model-path="config.modelPath"
        @playback-finished="handlePlaybackFinished"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue'
import DebateCharacter from './DebateCharacter.vue'
import { usePixiApp } from '@/composables/usePixiApp'

const { canvasRef: sharedCanvasRef, initApp, destroyApp } = usePixiApp()

// --- CONFIGURATION & STATE ---
const availableCharacters = ref([]) // Loaded from API
const debateConfig = ref({
  topic: 'Is AI consciousness possible?',
  characters: [], // Selected IDs
  style: 'balanced',
})

const debateStatus = ref('idle')
const debateId = ref(null)
const characterRefs = ref({})
const currentSpeech = ref(null)

// Computed property to get the full config objects for selected characters
const activeCharacterConfigs = computed(() => {
  return availableCharacters.value.filter((c) => debateConfig.value.characters.includes(c.id))
})

const isInterventionResponse = computed(() => {
  return currentSpeech.value?.contextRef?.type === 'intervention_response'
})

// --- API & WEBSOCKET ---
const ws = ref(null)

const fetchCharacters = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/characters/list')
    if (!response.ok) throw new Error('Failed to fetch characters')
    const data = await response.json()
    availableCharacters.value = data
    // Default selection: select first 2
    if (data.length >= 2) {
      debateConfig.value.characters = [data[0].id, data[1].id]
    }
  } catch (error) {
    console.error('[DebateRoom] Error fetching characters:', error)
    // Fallback for testing if API fails
    availableCharacters.value = [
      { id: 'aria', name: 'Aria', modelPath: '/avatars/aria/BlackWolfGIrl.model3.json' },
      { id: 'sera', name: 'Sera', modelPath: '/avatars/sera/Snow Leopard.model3.json' },
      { id: 'eidon', name: 'Eidon', modelPath: '/avatars/eidon/10th.model3.json' },
    ]
    debateConfig.value.characters = ['aria', 'sera']
  }
}

const registerCharacterRef = (id, componentRef) => {
  if (componentRef) characterRefs.value[id] = componentRef
  else delete characterRefs.value[id]
}

const handlePlaybackFinished = () => {
  currentSpeech.value = null
  if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return
  ws.value.send(JSON.stringify({ type: 'playback_finished' }))
}

const handleWebSocketMessage = (message) => {
  console.log('[DebateRoom] WS Message:', message.type, message)

  switch (message.type) {
    case 'debate_started':
      debateStatus.value = 'active'
      debateId.value = message.data.debate_id
      break

    case 'character_speaking':
    case 'opening_statement': {
      currentSpeech.value = {
        characterId: message.data.character_id,
        characterName: message.data.character_name,
        text: message.data.text,
        contextRef: message.data.context_ref, // Capture context for UI
      }

      const characterComponent = characterRefs.value[message.data.character_id]
      if (characterComponent) {
        characterComponent.onReceiveSpeech(message.data)
      } else {
        console.warn(`[DebateRoom] Character ref not found for: ${message.data.character_id}`)
        // If character not found, we still need to ack to keep debate moving
        setTimeout(() => handlePlaybackFinished(), 2000)
      }
      break
    }

    case 'debate_ended':
      debateStatus.value = 'stopped'
      debateId.value = null
      currentSpeech.value = null
      break

    case 'error':
      console.error('[DebateRoom] Backend Error:', message.error)
      debateStatus.value = 'error'
      break
  }
}

const connectWebSocket = () => {
  return new Promise((resolve, reject) => {
    const wsUrl = 'ws://localhost:8000/ws/debate'
    ws.value = new WebSocket(wsUrl)

    ws.value.onopen = () => {
      console.log('[DebateRoom] WebSocket opened.')
      resolve(ws.value)
    }

    ws.value.onmessage = (event) => {
      try {
        handleWebSocketMessage(JSON.parse(event.data))
      } catch (error) {
        console.error('[DebateRoom] Error parsing message:', error)
      }
    }

    ws.value.onclose = () => {
      console.log('[DebateRoom] WebSocket closed.')
      if (debateStatus.value === 'active') {
        debateStatus.value = 'error'
      } else {
        debateStatus.value = 'idle'
      }
      debateId.value = null
      currentSpeech.value = null
    }

    ws.value.onerror = (error) => {
      console.error('[DebateRoom] WebSocket error:', error)
      debateStatus.value = 'error'
      reject(error)
    }
  })
}

const startDebate = async () => {
  if (debateStatus.value === 'active') return

  // Ensure WebSocket is connected
  if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
    console.log('[DebateRoom] WebSocket not open, attempting to connect...')
    try {
      await connectWebSocket()
    } catch (e) {
      console.error('[DebateRoom] Failed to reconnect:', e)
      return
    }
  }

  currentSpeech.value = null

  const payload = {
    type: 'start_debate',
    data: {
      topic: debateConfig.value.topic,
      characters: debateConfig.value.characters,
      style: debateConfig.value.style,
    },
  }

  ws.value.send(JSON.stringify(payload))
}

const stopDebate = () => {
  if (debateStatus.value !== 'active' || !debateId.value || !ws.value) return
  ws.value.send(JSON.stringify({ type: 'stop_debate', debate_id: debateId.value }))
}

onMounted(() => {
  nextTick(() => initApp())
  fetchCharacters()
  connectWebSocket().catch((e) => console.error('Initial connection failed:', e))
})

onUnmounted(() => {
  destroyApp()
  if (ws.value) ws.value.close(1000, 'Client disconnecting')
})
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
  background-size: cover;
  background-position: center;
}

.shared-live2d-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* SPEECH BUBBLES */
.speech-bubble-container {
  position: absolute;
  bottom: 5px;
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
  max-width: 900px;
  background-color: rgba(10, 20, 40, 0.6);
  color: white;
  padding: 20px 30px;
  border-radius: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 18px;
  line-height: 1.6;
  text-align: center;
  border: 1px solid rgba(120, 180, 255, 0.4);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.speech-bubble.intervention-response {
  border-color: #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.reply-indicator {
  font-size: 0.8em;
  color: #ffd700;
  margin-bottom: 8px;
  font-style: italic;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  padding-bottom: 4px;
}

.speech-bubble .character-name {
  font-weight: 800;
  color: #82c8ff;
  display: block;
  margin-bottom: 8px;
  font-size: 22px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* CONTROLS */
.controls {
  position: absolute;
  top: 3px;
  z-index: 30;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
}

.control-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.control-row {
  display: flex;
  gap: 20px;
}

.half-width {
  flex: 1;
}

label {
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

textarea,
input[type='text'],
select {
  width: 100%;
  background-color: rgba(30, 30, 30, 0.8);
  color: #eee;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 10px;
  font-size: 15px;
  font-family: inherit;
  transition: border-color 0.2s;
}

textarea:focus,
input[type='text']:focus,
select:focus {
  border-color: #82c8ff;
  outline: none;
}

.character-select {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  background: rgba(30, 30, 30, 0.5);
  padding: 8px;
  border-radius: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: normal;
  color: #ddd;
  cursor: pointer;
  text-transform: none;
  margin: 0;
}

/* BUTTONS */
button {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn {
  background-color: #2196f3;
  color: white;
}
.primary-btn:hover:not(:disabled) {
  background-color: #1976d2;
}

.danger-btn {
  background-color: #f44336;
  color: white;
}
.danger-btn:hover:not(:disabled) {
  background-color: #d32f2f;
}

button:disabled {
  background-color: #555;
  color: #888;
  cursor: not-allowed;
}

.other-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
}

.status {
  font-size: 14px;
  color: #888;
}

.character-placeholders {
  display: none;
}
</style>
