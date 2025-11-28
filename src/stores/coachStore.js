import { defineStore } from 'pinia'
import coachService from '@/services/coachService'

export const useCoachStore = defineStore('coach', {
  state: () => ({
    messages: [],
    currentConversationId: null,
    currentInsights: null,
    currentSummary: null,
    isLoading: false,
  }),

  actions: {
    addMessage(message) {
      this.messages.push({
        id: Date.now(),
        ...message,
      })
    },

    clearMessages() {
      this.messages = []
      this.currentConversationId = null
      this.currentInsights = null
      this.currentSummary = null
    },

    async sendMessage({ userType, userId, childId, message }) {
      this.isLoading = true
      try {
        const response = await coachService.sendMessage({
          userType,
          userId,
          childId,
          message,
          conversationId: this.currentConversationId,
        })

        this.currentConversationId = response.conversation_id

        if (userType === 'student') {
          this.currentInsights = response.insights
        } else {
          this.currentSummary = response.summary
        }

        return response
      } finally {
        this.isLoading = false
      }
    },

    async loadHistory({ userType, userId, childId }) {
      try {
        const history = await coachService.getHistory({
          userType,
          userId,
          childId,
        })

        this.messages = history.messages || []
        this.currentConversationId = history.conversation_id
      } catch (error) {
        console.error('Failed to load history:', error)
      }
    },

    async getQuickInsights({ userType, userId }) {
      try {
        return await coachService.getQuickInsights({
          userType,
          userId,
        })
      } catch (error) {
        console.error('Failed to get insights:', error)
        return {}
      }
    },

    async getReviewRecommendations(studentId) {
      try {
        const response = await coachService.getReviewRecommendations(studentId)
        return response
      } catch (error) {
        console.error('Failed to get reviews:', error)
        return []
      }
    },
  },
})
