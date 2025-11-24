<!-- src/components/AdminChat.vue -->
<template>
  <div class="admin-chat">
    <div class="header">
      <h2>Admin Intervention</h2>
      <div class="connection-status" :class="connectionStatus">
        {{ connectionStatus }}
      </div>
    </div>

    <div class="history-panel">
      <div v-if="interventions.length === 0" class="empty-state">No interventions sent yet.</div>
      <div
        v-for="(item, index) in interventions"
        :key="index"
        class="intervention-item"
        :class="{ queued: item.status === 'queued', sent: item.status === 'sent' }"
      >
        <div class="message-text">{{ item.text }}</div>
        <div class="message-meta">
          <span class="timestamp">{{ item.time }}</span>
          <span class="status-badge">{{ item.status }}</span>
        </div>
      </div>
    </div>

    <div class="input-area">
      <div class="input-wrapper">
        <input
          v-model="messageText"
          type="text"
          placeholder="Type your message here..."
          @keyup.enter="sendMessage"
          :disabled="connectionStatus !== 'connected'"
        />
        <button
          @click="sendMessage"
          :disabled="connectionStatus !== 'connected' || !messageText.trim()"
        >
          Send
        </button>
      </div>
      <div class="helper-text">
        Messages are queued and will be addressed by characters in their next turn.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const messageText = ref('')
const connectionStatus = ref('disconnected')
const interventions = ref([])
const ws = ref(null)
const debateId = ref(null) // We need to capture this from the stream if possible, or just send without it if backend allows

const connectWebSocket = () => {
  const wsUrl = 'ws://localhost:8000/ws/debate'
  ws.value = new WebSocket(wsUrl)

  ws.value.onopen = () => {
    connectionStatus.value = 'connected'
    console.log('[AdminChat] Connected to WebSocket')
  }

  ws.value.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data)
      handleMessage(message)
    } catch (e) {
      console.error('[AdminChat] Error parsing message:', e)
    }
  }

  ws.value.onclose = () => {
    connectionStatus.value = 'disconnected'
    console.log('[AdminChat] Disconnected. Reconnecting in 3s...')
    setTimeout(connectWebSocket, 3000)
  }

  ws.value.onerror = (error) => {
    console.error('[AdminChat] WebSocket error:', error)
    connectionStatus.value = 'error'
  }
}

const handleMessage = (message) => {
  switch (message.type) {
    case 'debate_started':
      debateId.value = message.data.debate_id
      break
    case 'intervention_queued': {
      // Find the last "sent" message and mark it as queued
      // In a real app we'd use IDs, but for now we assume FIFO
      const lastSent = interventions.value.find((i) => i.status === 'sent')
      if (lastSent) {
        lastSent.status = 'queued'
        lastSent.queuePosition = message.data.queue_position
      }
      break
    }
  }
}

const sendMessage = () => {
  if (!messageText.value.trim() || !ws.value) return

  const text = messageText.value.trim()

  // Optimistically add to history
  interventions.value.unshift({
    text: text,
    time: new Date().toLocaleTimeString(),
    status: 'sent',
  })

  const payload = {
    type: 'post_intervention',
    debate_id: debateId.value, // Might be null if we joined late, backend should handle or we need to fetch active debate
    data: {
      text: text,
      source: 'admin',
      user_name: 'Admin',
    },
  }

  ws.value.send(JSON.stringify(payload))
  messageText.value = ''
}

onMounted(() => {
  connectWebSocket()
})

onUnmounted(() => {
  if (ws.value) {
    ws.value.close()
  }
})
</script>

<style scoped>
.admin-chat {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1a1a1a;
  color: #e0e0e0;
  font-family: 'Segoe UI', sans-serif;
}

.header {
  padding: 20px;
  background-color: #252525;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #fff;
}

.connection-status {
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: bold;
}

.connection-status.connected {
  background-color: #2e7d32;
  color: #fff;
}
.connection-status.disconnected {
  background-color: #c62828;
  color: #fff;
}
.connection-status.error {
  background-color: #f57f17;
  color: #000;
}

.history-panel {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column-reverse; /* Newest at bottom visually if we didn't use unshift, but we use unshift so let's stick to standard flow or reverse? Let's keep newest at top for admin control */
}

.empty-state {
  text-align: center;
  color: #666;
  margin-top: 40px;
}

.intervention-item {
  background-color: #333;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border-left: 4px solid #555;
}

.intervention-item.queued {
  border-left-color: #ffd700;
}
.intervention-item.sent {
  border-left-color: #2196f3;
}

.message-text {
  font-size: 1rem;
  margin-bottom: 8px;
  color: #fff;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #888;
}

.status-badge {
  text-transform: uppercase;
  font-weight: bold;
}

.input-area {
  padding: 20px;
  background-color: #252525;
  border-top: 1px solid #333;
}

.input-wrapper {
  display: flex;
  gap: 10px;
}

input {
  flex: 1;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #444;
  background-color: #1a1a1a;
  color: #fff;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #2196f3;
}

button {
  padding: 0 25px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #1976d2;
}

button:disabled {
  background-color: #444;
  cursor: not-allowed;
  color: #888;
}

.helper-text {
  margin-top: 8px;
  font-size: 0.8rem;
  color: #666;
}
</style>
