import { defineStore } from 'pinia'
import metricsService from '@/services/metricsService'

export const useMetricsStore = defineStore('metrics', {
  state: () => ({
    sessionToken: null,
    heartbeatInterval: null,
    isTabVisible: true,
    lastHeartbeatTime: null,
    isTracking: false,

    // Behavioral tracking for current lesson
    behaviorData: {
      focusStartTime: null,
      totalFocusTime: 0,
      tabSwitches: 0,
      hintClicks: 0,
      hesitationCount: 0,
      interactionCount: 0,
    },
  }),

  actions: {
    /**
     * Start metrics tracking
     * Called after successful login
     */
    async startTracking() {
      if (this.isTracking) {
        console.log('[MetricsStore] Already tracking')
        return
      }

      try {
        // Get device info
        const deviceInfo = `${navigator.userAgent.split(' ').slice(-2).join(' ')}`

        // Start session
        const response = await metricsService.startSession(deviceInfo)
        this.sessionToken = response.session_token

        console.log('[MetricsStore] Session started:', this.sessionToken)

        // Start heartbeat interval (60 seconds)
        this.startHeartbeat()
        this.isTracking = true
      } catch (error) {
        console.error('[MetricsStore] Failed to start tracking:', error)
      }
    },

    /**
     * Stop metrics tracking
     * Called on logout
     */
    async stopTracking(reason = 'logout') {
      if (!this.isTracking) {
        return
      }

      try {
        // Stop heartbeat
        this.stopHeartbeat()

        // End session
        await metricsService.endSession(reason)

        console.log('[MetricsStore] Session ended:', reason)

        // Reset state
        this.sessionToken = null
        this.isTracking = false
      } catch (error) {
        console.error('[MetricsStore] Failed to stop tracking:', error)
      }
    },

    /**
     * Start the heartbeat interval
     */
    startHeartbeat() {
      if (this.heartbeatInterval) {
        return
      }

      this.lastHeartbeatTime = Date.now()

      this.heartbeatInterval = setInterval(async () => {
        // Only send heartbeat if tab is visible
        if (this.isTabVisible) {
          try {
            const currentTime = Date.now()
            const activeTimeSeconds = Math.round((currentTime - this.lastHeartbeatTime) / 1000)
            const pageUrl = window.location.pathname

            await metricsService.sendHeartbeat(activeTimeSeconds, pageUrl)

            this.lastHeartbeatTime = currentTime
            console.log(`[MetricsStore] Heartbeat sent: ${activeTimeSeconds}s at ${pageUrl}`)
          } catch (error) {
            console.error('[MetricsStore] Heartbeat failed:', error)
            // Don't stop the interval, next heartbeat will retry
          }
        }
      }, 60000) // 60 seconds

      console.log('[MetricsStore] Heartbeat started')
    },

    /**
     * Stop the heartbeat interval
     */
    stopHeartbeat() {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval)
        this.heartbeatInterval = null
        console.log('[MetricsStore] Heartbeat stopped')
      }
    },

    /**
     * Pause tracking when tab is hidden
     */
    pauseTracking() {
      this.isTabVisible = false
      console.log('[MetricsStore] Tracking paused (tab hidden)')
    },

    /**
     * Resume tracking when tab is visible
     */
    resumeTracking() {
      if (!this.isTabVisible) {
        this.isTabVisible = true
        this.lastHeartbeatTime = Date.now() // Reset timer
        console.log('[MetricsStore] Tracking resumed (tab visible)')
      }
    },

    /**
     * Reset behavioral data (call when starting a new lesson)
     */
    resetBehaviorData() {
      this.behaviorData = {
        focusStartTime: Date.now(),
        totalFocusTime: 0,
        tabSwitches: 0,
        hintClicks: 0,
        hesitationCount: 0,
        interactionCount: 0,
      }
      console.log('[MetricsStore] Behavior data reset')
    },

    /**
     * Track a tab switch event
     */
    trackTabSwitch() {
      if (this.behaviorData.focusStartTime) {
        // Add time since last focus to total
        this.behaviorData.totalFocusTime += Date.now() - this.behaviorData.focusStartTime
        this.behaviorData.tabSwitches++
        console.log('[MetricsStore] Tab switch tracked:', this.behaviorData.tabSwitches)
      }
    },

    /**
     * Resume focus tracking after tab switch
     */
    resumeFocus() {
      this.behaviorData.focusStartTime = Date.now()
    },

    /**
     * Track a hint click
     */
    trackHintClick() {
      this.behaviorData.hintClicks++
      console.log('[MetricsStore] Hint click tracked:', this.behaviorData.hintClicks)
    },

    /**
     * Track hesitation (long pause before answering)
     * @param {number} timeMs - Time in milliseconds
     */
    trackHesitation(timeMs) {
      // Consider it hesitation if > 5 seconds
      if (timeMs > 5000) {
        this.behaviorData.hesitationCount++
        console.log('[MetricsStore] Hesitation tracked:', timeMs, 'ms')
      }
    },

    /**
     * Track an interaction (click, answer, etc.)
     */
    trackInteraction() {
      this.behaviorData.interactionCount++
    },

    /**
     * Calculate focus score
     * @param {number} totalLessonTime - Total lesson time in ms
     * @returns {number} Focus score 0.0 to 1.0
     */
    calculateFocusScore(totalLessonTime) {
      // Add current focus time if still focused
      let totalFocus = this.behaviorData.totalFocusTime
      if (this.behaviorData.focusStartTime) {
        totalFocus += Date.now() - this.behaviorData.focusStartTime
      }

      const focusScore = Math.min(1.0, totalFocus / totalLessonTime)
      return Math.round(focusScore * 100) / 100 // Round to 2 decimals
    },

    /**
     * Calculate engagement level based on interactions
     * @param {number} totalLessonTime - Total lesson time in ms
     * @returns {string} 'high', 'medium', or 'low'
     */
    calculateEngagementLevel(totalLessonTime) {
      const totalMinutes = totalLessonTime / 60000
      const interactionsPerMinute = this.behaviorData.interactionCount / totalMinutes

      if (interactionsPerMinute > 2) return 'high'
      if (interactionsPerMinute > 1) return 'medium'
      return 'low'
    },

    /**
     * Send behavioral data to backend
     * @param {string} lessonId - Lesson ID
     * @param {number} totalLessonTime - Total lesson time in ms
     */
    async sendBehaviorData(lessonId, totalLessonTime) {
      try {
        const focusScore = this.calculateFocusScore(totalLessonTime)
        const engagementLevel = this.calculateEngagementLevel(totalLessonTime)

        const data = {
          lesson_id: lessonId,
          focus_score: focusScore,
          engagement_level: engagementLevel,
          help_requests: this.behaviorData.hintClicks,
          hesitation_count: this.behaviorData.hesitationCount,
          tab_switches: this.behaviorData.tabSwitches,
        }

        await metricsService.sendBehaviorData(data)

        console.log('[MetricsStore] Behavior data sent:', data)
      } catch (error) {
        console.error('[MetricsStore] Failed to send behavior data:', error)
      }
    },
  },
})
