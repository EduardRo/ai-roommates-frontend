// src/stores/personaStore.js
import { defineStore } from 'pinia'
import { getAiResponse } from '@/services/personaService'

export const usePersonaStore = defineStore('persona', {
  state: () => ({
    model: 'companion',
    sessionId: `session_${Date.now()}`,
    isLoading: false,
    isThinking: false,
    responseText: '',
    animationCommands: [],
    audio_b64: null, // 🔥 ADD THIS - stores backend-generated audio
    responseTrigger: 0,
  }),
  actions: {
    setModel(modelName) {
      this.model = modelName
    },
    async ask(userInput) {
      if (this.isLoading) return
      this.isLoading = true
      this.isThinking = true
      this.responseText = '...'
      this.audio_b64 = null // 🔥 ADD THIS - reset audio on new request

      try {
        const response = await getAiResponse(this.sessionId, userInput)
        this.responseText = response.text_response
        this.animationCommands = response.avatar_commands
        this.audio_b64 = response.audio_b64 // 🔥 ADD THIS - store backend audio

        console.log('[PersonaStore] Response received:', {
          text_length: response.text_response?.length,
          commands_count: response.avatar_commands?.length,
          has_audio: !!response.audio_b64,
        })
      } catch (error) {
        this.responseText =
          'A system error occurred. Check Assertions in this document are missing or invalid. Please try again with a valid document. Check the logs: ' +
          error
        this.animationCommands = [{ type: 'error' }]
        this.audio_b64 = null // 🔥 ADD THIS - no audio on error
      } finally {
        this.isLoading = false
        this.isThinking = false
        this.responseTrigger++
      }
    },
  },
})
