<template>
  <div class="ai-tutor-container">
    <!-- Live2D Character -->
    <TutorCharacter
      ref="tutorCharacterRef"
      :character-id="currentCharacterId"
      :model-path="currentModelPath"
    />

    <!-- Speech Bubble -->
    <div v-if="currentMessage" class="speech-bubble">
      <div class="bubble-content">
        <span class="character-name">{{ characterName }}:</span>
        <p class="message-text" v-html="formattedMessage"></p>

        <!-- Close button -->
        <button class="close-button" @click="closeBubble">✕</button>

        <!-- Interactive Buttons for mode selection -->
        <div class="mode-checklist" v-if="showButton">
          <label> <input type="radio" value="concise" v-model="selectedMode" /> Concise </label>
          <label> <input type="radio" value="detailed" v-model="selectedMode" /> Detailed </label>
          <label>
            <input type="radio" value="alternative" v-model="selectedMode" /> Alternative
          </label>
        </div>
        <button v-if="showButton" @click="handleButtonClick" class="help-button">
          {{ buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import TutorCharacter from '@/components/education/TutorCharacter.vue'
import { useEducationStore } from '@/stores/educationStore'
import { useAuthStore } from '@/stores/authStore'
import { getCharacterConfig } from '@/config/characterConfig'

const props = defineProps({
  message: {
    type: String,
    default: '',
  },
  showButton: {
    type: Boolean,
    default: false,
  },
  buttonText: {
    type: String,
    default: '💡 Need more help?',
  },
})

const educationStore = useEducationStore()
const authStore = useAuthStore()

const selectedMode = ref('concise')

// Get current character from auth store (now persisted in localStorage)
const currentCharacterId = computed(() => {
  // First try the persisted character, then user object, then default to 'aria'
  return authStore.preferredCharacter || authStore.user?.preferred_character || 'aria'
})

const currentCharacterConfig = computed(() => {
  return getCharacterConfig(currentCharacterId.value)
})

const currentModelPath = computed(() => {
  return currentCharacterConfig.value.modelPath
})

const characterName = computed(() => {
  return currentCharacterConfig.value.name
})

// Sync selected mode with store via watch (no explicit update function needed)

const emit = defineEmits(['button-click'])

const currentMessage = ref(props.message)
const initialMessage = ref('')

const tutorCharacterRef = ref(null)

const triggerSpeech = (text) => {
  if (!tutorCharacterRef.value) return

  // Clean text for TTS (remove HTML/Markdown/Emojis)
  const cleanText = text
    .replace(/\u003c[^\u003e]*\u003e/g, '') // Remove HTML tags
    .replace(/\*\*/g, '') // Remove markdown bold
    .replace(/\*/g, '') // Remove markdown italic
    // Remove emojis using regex (covers most common emoji ranges)
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '') // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '') // Variation Selectors
    .replace(/[\u{200D}]/gu, '') // Zero Width Joiner
    .trim()

  if (cleanText.length < 150) {
    // Short message: Speak it directly
    tutorCharacterRef.value.speak(cleanText)
  } else {
    // Long message: Speak generic phrase
    tutorCharacterRef.value.speak(
      "Read with attention the theory or ask for more if you don't understand.",
    )
  }
}

// Watch for message changes
watch(
  () => props.message,
  (newMessage, oldMessage) => {
    console.log('[AiTutor] Received new message:', newMessage)
    if (newMessage) {
      currentMessage.value = newMessage
      // Capture the first non-empty message as the initial/welcome message
      if (!initialMessage.value) {
        initialMessage.value = newMessage
      }

      // --- SPEECH TRIGGER LOGIC ---
      // 1. Detect streaming: If new message starts with old message, it's likely a stream update.
      //    We generally don't want to restart speech on every character.
      //    However, if it's the *start* of a stream (oldMessage is empty), we DO want to speak.
      const isStreamingUpdate = oldMessage && newMessage.startsWith(oldMessage)

      if (!isStreamingUpdate) {
        triggerSpeech(newMessage)
      }
    }
  },
  { immediate: true },
)

// characterName is now a computed property defined above

const handleButtonClick = () => {
  emit('button-click')
}

const formattedMessage = computed(() => {
  let msg = currentMessage.value || ''
  // Replace ### heading with bold colored text
  msg = msg.replace(/###\s*(.*)/g, '<strong class="heading">$1</strong>')
  // Remove stray ** markers
  msg = msg.replace(/\*\*/g, '')
  return msg
})

const closeBubble = () => {
  // Revert to the initial welcome message instead of closing completely
  if (initialMessage.value) {
    educationStore.setTutorMessage(initialMessage.value)
    currentMessage.value = initialMessage.value
  }
}
</script>

<style scoped>
.ai-tutor-container {
  position: relative;
  width: 500px;
  height: 400px;
  pointer-events: none;
}

.speech-bubble {
  position: absolute;
  bottom: 20px;
  left: 400px;
  transform: translateX(-50%);
  max-width: 100%;
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  background: rgba(20, 20, 27, 0.95);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 0 20px rgba(160, 0, 255, 0.2);
  border: 2px solid var(--color-neon);
  z-index: 10;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  pointer-events: auto;
  backdrop-filter: blur(10px);
}

.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: var(--color-neon) transparent transparent transparent;
}

.character-name {
  display: block;
  font-weight: 800;
  color: var(--color-neon);
  font-size: 0.9rem;
  margin-bottom: 4px;
  text-transform: uppercase;
  text-shadow: 0 0 5px var(--color-neon);
}

.message-text {
  margin: 0;
  color: var(--color-text);
  font-size: 1rem;
  line-height: 1.4;
  margin-bottom: 12px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  max-width: 100%;
}

.help-button {
  background: var(--color-neon);
  color: #000;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(160, 0, 255, 0.3);
  pointer-events: auto;
  width: 100%;
  margin-top: 8px;
}

.heading {
  color: var(--color-cyan);
  font-weight: 800;
}

.close-button {
  position: absolute;
  top: 4px;
  right: 6px;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--color-text-muted);
}

.close-button:hover {
  color: var(--color-neon);
  text-shadow: 0 0 5px var(--color-neon);
}

.mode-checklist {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 12px;
  color: var(--color-text);
}

.mode-checklist label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
}

.mode-checklist input[type='radio'] {
  accent-color: var(--color-neon);
  cursor: pointer;
}

.help-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(160, 0, 255, 0.5);
}

.help-button:active {
  transform: translateY(0);
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
