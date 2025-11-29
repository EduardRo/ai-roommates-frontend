import { apiPost } from '@/utils/apiClient'

/**
 * Metrics Service
 * Handles all API calls for session tracking and behavioral analytics
 */

export default {
  /**
   * Start a new tracking session
   * @param {string} deviceInfo - Browser/device information
   * @returns {Promise<{session_token: string}>}
   */
  async startSession(deviceInfo = null) {
    const payload = {}
    if (deviceInfo) {
      payload.device_info = deviceInfo
    }

    return await apiPost('/metrics/session/start', payload)
  },

  /**
   * Send heartbeat to update session activity
   * Called every 60 seconds while user is active
   * @param {number} activeTimeSeconds - Time since last heartbeat (usually 60)
   * @param {string} pageUrl - Current page URL
   * @returns {Promise<{status: string}>}
   */
  async sendHeartbeat(activeTimeSeconds, pageUrl = null) {
    const payload = {
      active_time_seconds: activeTimeSeconds,
    }

    if (pageUrl) {
      payload.page_url = pageUrl
    }

    return await apiPost('/metrics/heartbeat', payload)
  },

  /**
   * End the current session
   * @param {string} reason - Reason for ending: 'logout', 'timeout', 'close'
   * @returns {Promise<{status: string}>}
   */
  async endSession(reason = 'logout') {
    return await apiPost('/metrics/session/end', {
      reason,
    })
  },

  /**
   * Send behavioral analytics data for a lesson
   * @param {Object} data - Behavioral data
   * @param {string} data.lesson_id - Lesson ID
   * @param {number} data.focus_score - 0.0 to 1.0
   * @param {string} data.engagement_level - 'high', 'medium', 'low'
   * @param {number} data.help_requests - Number of hints clicked
   * @param {number} data.hesitation_count - Number of long pauses
   * @param {number} data.tab_switches - Number of tab switches
   * @returns {Promise<{status: string}>}
   */
  async sendBehaviorData(data) {
    return await apiPost('/metrics/behavior', data)
  },
}
