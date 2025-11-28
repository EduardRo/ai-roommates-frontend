<template>
  <div class="chat-interface">
    <!-- Character Display -->
    <div class="character-container">
      <TutorCharacter
        ref="tutorCharacterRef"
        :character-id="currentCharacterId"
        :model-path="currentModelPath"
        :muted="isMuted"
      />
    </div>

    <!-- Chat Container -->
    <div class="chat-container">
      <!-- Header -->
      <div class="chat-header">
        <button @click="goBack" class="btn-back">← Back to Dashboard</button>
        <h2>{{ headerTitle }}</h2>
        <div class="header-controls">
          <label class="voice-toggle">
            <input type="checkbox" v-model="isMuted" />
            <span>🔇 Mute Voice</span>
          </label>
          <button @click="clearChat" class="btn-clear">{{ clearButtonText }}</button>
        </div>
      </div>

      <!-- Messages -->
      <div class="messages-container" ref="messagesContainer">
        <MessageBubble v-for="msg in messages" :key="msg.id" :message="msg" :user-type="userType" />

        <!-- Loading indicator -->
        <div v-if="isLoading" class="loading-message">
          <span class="typing-indicator">Coach is thinking...</span>
        </div>
      </div>

      <!-- Input -->
      <div class="input-section">
        <QuickActions v-if="messages.length === 0" :user-type="userType" @select="sendMessage" />
        <div class="input-row">
          <textarea
            v-model="messageInput"
            @keydown.enter.prevent="sendMessage()"
            :placeholder="inputPlaceholder"
            rows="1"
          ></textarea>
          <button
            @click="sendMessage()"
            :disabled="!messageInput.trim() || isLoading"
            class="btn-send"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCoachStore } from '@/stores/coachStore'
import { useAuthStore } from '@/stores/authStore'
import { getCharacterConfig } from '@/config/characterConfig'
import MessageBubble from './MessageBubble.vue'
import QuickActions from './QuickActions.vue'
import TutorCharacter from '@/components/education/TutorCharacter.vue'

const props = defineProps({
  userType: {
    type: String,
    required: true,
    validator: (value) => ['student', 'parent'].includes(value),
  },
  userId: {
    type: Number,
    required: true,
  },
  childId: {
    type: Number,
    default: null,
  },
})

const router = useRouter()
const coachStore = useCoachStore()
const authStore = useAuthStore()
const messageInput = ref('')
const messagesContainer = ref(null)
const isLoading = ref(false)
const isMuted = ref(false)
const tutorCharacterRef = ref(null)

// Character configuration
const currentCharacterId = computed(() => {
  return authStore.user?.preferred_character || 'aria'
})

const currentCharacterConfig = computed(() => {
  return getCharacterConfig(currentCharacterId.value)
})

const currentModelPath = computed(() => {
  return currentCharacterConfig.value.modelPath
})

const messages = computed(() => coachStore.messages)

const headerTitle = computed(() => {
  return props.userType === 'student' ? 'Your Learning Coach' : 'Progress Insights'
})

const clearButtonText = computed(() => {
  return props.userType === 'student' ? 'New Conversation' : 'Clear'
})

const inputPlaceholder = computed(() => {
  return props.userType === 'student' ? 'Ask your coach...' : 'Ask about progress...'
})

function goBack() {
  const route = props.userType === 'student' ? '/student/dashboard' : '/parent/dashboard'
  router.push(route)
}

async function sendMessage(text = null) {
  const message = text || messageInput.value.trim()
  if (!message) return

  // Add user message
  coachStore.addMessage({
    role: 'user',
    message: message,
    timestamp: new Date(),
  })

  messageInput.value = ''
  isLoading.value = true

  try {
    // Prepare request payload
    const requestPayload = {
      userType: props.userType,
      userId: props.userId,
      childId: props.childId,
      message: message,
    }

    console.log('=== COACH CHAT REQUEST ===')
    console.log('User Type:', props.userType)
    console.log('User ID:', props.userId)
    console.log('Child ID:', props.childId)
    console.log('Message:', message)
    console.log('Full Payload:', requestPayload)

    // Call API
    const response = await coachStore.sendMessage(requestPayload)

    console.log('=== COACH CHAT RESPONSE ===')
    console.log('Full Response:', response)
    console.log('AI Response Text:', response.response)
    console.log('Insights:', response.insights)
    console.log('Summary:', response.summary)
    console.log('Conversation ID:', response.conversation_id)

    // Check if performance data is included
    if (props.userType === 'student' && response.insights) {
      console.log('=== STUDENT PERFORMANCE DATA ===')
      console.log('Performance Summary:', response.insights.performance_summary)
      console.log('Average Score:', response.insights.performance_summary?.avg_score)
      console.log('Trend:', response.insights.performance_summary?.trend)
      console.log('Strengths:', response.insights.performance_summary?.strengths)
      console.log('Weaknesses:', response.insights.performance_summary?.weaknesses)
    }

    if (props.userType === 'parent' && response.summary) {
      console.log('=== PARENT SUMMARY DATA ===')
      console.log('Overall Status:', response.summary.overall_status)
      console.log('Key Strengths:', response.summary.key_strengths)
      console.log('Areas to Support:', response.summary.areas_to_support)
    }

    // Add coach response
    coachStore.addMessage({
      role: 'coach',
      message: response.response,
      insights: response.insights,
      summary: response.summary,
      timestamp: new Date(),
    })

    // Trigger character speech if not muted
    if (!isMuted.value && tutorCharacterRef.value) {
      const cleanText = response.response
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\*\*/g, '') // Remove markdown bold
        .replace(/\*/g, '') // Remove markdown italic
        .trim()

      if (cleanText.length < 150) {
        tutorCharacterRef.value.speak(cleanText)
      } else {
        tutorCharacterRef.value.speak(
          "I've provided a detailed response. Please read it carefully.",
        )
      }
    }

    // Scroll to bottom
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Failed to send message:', error)
    // Show error message
    coachStore.addMessage({
      role: 'system',
      message: 'Sorry, I encountered an error. Please try again.',
      timestamp: new Date(),
    })
  } finally {
    isLoading.value = false
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function clearChat() {
  if (confirm('Start a new conversation? This will clear the current chat.')) {
    coachStore.clearMessages()
  }
}

onMounted(async () => {
  // Load conversation history
  await coachStore.loadHistory({
    userType: props.userType,
    userId: props.userId,
    childId: props.childId,
  })
  scrollToBottom()
})
</script>

<style scoped>
.chat-interface {
  display: flex;
  gap: 2rem;
  height: 80vh;
  max-width: 1400px;
  margin: 0 auto;
}

.character-container {
  flex-shrink: 0;
  /* width: 400px;*/
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-card-bg, #14141b);
  border: 1px solid var(--color-border, #2a2a35);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(160, 0, 255, 0.2);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(160, 0, 255, 0.1);
  border-bottom: 1px solid var(--color-border, #2a2a35);
  gap: 1rem;
}

.chat-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-cyan, #00eaff);
  text-shadow: 0 0 10px var(--color-cyan, #00eaff);
  flex: 1;
  text-align: center;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.voice-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text, #e0e0e0);
  font-size: 0.85rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s;
}

.voice-toggle:hover {
  color: var(--color-cyan, #00eaff);
}

.voice-toggle input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-neon, #a000ff);
}

.voice-toggle span {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-back {
  padding: 0.5rem 1.2rem;
  background: transparent;
  border: 1px solid var(--color-cyan, #00eaff);
  color: var(--color-cyan, #00eaff);
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.btn-back:hover {
  background: var(--color-cyan, #00eaff);
  color: #000;
  box-shadow: 0 0 15px rgba(0, 234, 255, 0.5);
  transform: translateY(-2px);
}

.btn-clear {
  padding: 0.5rem 1.2rem;
  background: transparent;
  border: 1px solid var(--color-neon, #a000ff);
  color: var(--color-neon, #a000ff);
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.btn-clear:hover {
  background: var(--color-neon, #a000ff);
  color: #000;
  box-shadow: 0 0 15px rgba(160, 0, 255, 0.5);
  transform: translateY(-2px);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: var(--color-background, #0a0a0f);
}

.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.messages-container::-webkit-scrollbar-thumb {
  background: var(--color-neon, #a000ff);
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: var(--color-cyan, #00eaff);
}

.loading-message {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted, #999);
  font-style: italic;
}

.input-section {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid var(--color-border, #2a2a35);
}

.quick-actions-wrapper {
  margin-bottom: 1rem;
}

.input-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.input-row textarea {
  flex: 1;
  padding: 1rem;
  background: rgba(20, 20, 27, 0.8);
  border: 1px solid var(--color-border, #2a2a35);
  border-radius: 12px;
  color: var(--color-text, #e0e0e0);
  font-size: 1rem;
  resize: none;
  min-height: 50px;
  max-height: 150px;
  font-family: inherit;
  transition: all 0.3s;
}

.input-row textarea:focus {
  outline: none;
  border-color: var(--color-cyan, #00eaff);
  box-shadow: 0 0 15px rgba(0, 234, 255, 0.3);
}

.input-row textarea::placeholder {
  color: var(--color-text-muted, #666);
}

.btn-send {
  padding: 1rem 2rem;
  background: var(--color-neon, #a000ff);
  color: #000;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s;
  box-shadow: 0 0 20px rgba(160, 0, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.9rem;
}

.btn-send:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(160, 0, 255, 0.6);
  background: var(--color-cyan, #00eaff);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.insights-display,
.summary-display {
  margin-top: 1rem;
}
</style>
