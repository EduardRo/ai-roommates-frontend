// src/services/debateService.js

/**
 * Service to manage WebSocket connection to the debate backend
 */
export class DebateService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000 // 3 seconds
    this.isOpen = false
    this.messageQueue = [] // Store messages received before handlers are set
    this.onMessageHandler = null
  }

  /**
   * Connect to the debate WebSocket
   * @param {Function} onMessageHandler - Function to handle incoming messages
   */
  connect(onMessageHandler) {
    this.onMessageHandler = onMessageHandler

    return new Promise((resolve, reject) => {
      const wsUrl = 'ws://127.0.0.1:8000/ws/debate'
      console.log('[DebateService] Connecting to:', wsUrl)

      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('[DebateService] WebSocket connected')
        this.isOpen = true
        this.reconnectAttempts = 0 // Reset on successful connect
        resolve()
      }

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        console.log('[DebateService] Received message:', message)

        if (this.onMessageHandler) {
          this.onMessageHandler(message)
        } else {
          // Queue messages if handler isn't set yet
          this.messageQueue.push(message)
        }
      }

      this.ws.onclose = (event) => {
        console.log('[DebateService] WebSocket closed:', event.code, event.reason)
        this.isOpen = false

        // Attempt to reconnect if not manually closed
        if (event.code !== 1000) {
          // 1000 = normal closure
          this.reconnect()
        }
      }

      this.ws.onerror = (error) => {
        console.error('[DebateService] WebSocket error:', error)
        reject(error)
      }
    })
  }

  /**
   * Attempt to reconnect to the WebSocket
   */
  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `[DebateService] Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      )

      setTimeout(() => {
        this.connect(this.onMessageHandler)
      }, this.reconnectDelay)
    } else {
      console.error('[DebateService] Max reconnection attempts reached')
    }
  }

  /**
   * Send a message to the WebSocket
   * @param {Object} message - The message to send
   */
  send(message) {
    if (this.ws && this.isOpen) {
      this.ws.send(JSON.stringify(message))
      console.log('[DebateService] Sent message:', message)
    } else {
      console.warn('[DebateService] WebSocket not open, cannot send message:', message)
    }
  }

  /**
   * Start a new debate
   * @param {string} topic - The debate topic
   * @param {string[]} characterIds - Array of character IDs to participate
   */
  startDebate(topic, characterIds) {
    const message = {
      type: 'start_debate',
      data: {
        topic,
        characters: characterIds,
      },
    }
    this.send(message)
  }

  /**
   * Stop the current debate
   * @param {string} debateId - The debate ID
   */
  stopDebate(debateId) {
    const message = {
      type: 'stop_debate',
      debate_id: debateId,
    }
    this.send(message)
  }

  /**
   * Close the WebSocket connection
   */
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting') // 1000 = normal closure
    }
  }
}

// Export a singleton instance
export const debateService = new DebateService()
