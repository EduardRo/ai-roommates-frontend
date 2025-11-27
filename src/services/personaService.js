export async function getAiResponse(sessionId, userInput) {
  const API_BASE_URL = 'http://127.0.0.1:8000'
  try {
    const response = await fetch(`${API_BASE_URL}/v1/interact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, user_input: userInput }),
    })
    console.log('[Service] AI response:', response)
    if (!response.ok) {
      throw new Error(`Server Error: ${response.status} - ${await response.text()}`)
    }
    return await response.json()
  } catch (error) {
    console.error('[Service] AI request failed:', error)
    throw error
  }
}

/**
 * Handles audio generation with backend-first priority
 * @param {string} text - Text to convert to speech (fallback only)
 * @param {string|null} audioB64 - Base64-encoded audio from backend
 * @returns {Promise<Audio|Object>} Audio object with play/stop methods
 */
/**
 * Handles audio generation with backend-first priority
 * @param {string} text - Text to convert to speech (fallback only)
 * @param {string|null} audioB64 - Base64-encoded audio from backend
 * @param {string[]} voiceKeywords - Keywords to select system voice (e.g. ['male', 'david'])
 * @returns {Promise<Audio|Object>} Audio object with play/stop methods
 */
export async function getAudio(text, audioB64 = null, voiceKeywords = []) {
  console.log('[getAudio] Received text:', text)
  console.log('[getAudio] Backend audio present:', !!audioB64)

  // 🎯 PRIORITY 1: Use backend-generated audio if available
  if (audioB64) {
    try {
      console.log('[getAudio] Using backend-generated TTS')

      // Decode base64 to binary
      const binaryString = atob(audioB64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // Create audio blob and URL
      const audioBlob = new Blob([bytes], { type: 'audio/wav' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      // Wait for metadata to load to get duration
      await new Promise((resolve, reject) => {
        audio.addEventListener('loadedmetadata', resolve, { once: true })
        audio.addEventListener('error', reject, { once: true })
      })

      const duration = audio.duration || text.split(' ').length / 2
      audio.durationSec = duration

      console.log('[getAudio] Backend audio loaded successfully, duration:', duration)
      return audio
    } catch (err) {
      console.warn('[getAudio] Backend audio decode failed, falling back:', err)
      // Continue to fallback options below
    }
  }

  // 🎯 Use browser's built-in TTS (ElevenLabs removed for now)
  console.log('[getAudio] Using system speech synthesis with keywords:', voiceKeywords)
  return createSystemSpeech(text, voiceKeywords)
}

/**
 * Creates an audio object using browser's Web Speech API
 * @param {string} text - Text to speak
 * @param {string[]} voiceKeywords - Keywords to filter voices
 * @returns {Object} Audio-like object with play/stop/durationSec
 */
function createSystemSpeech(text, voiceKeywords = []) {
  let selectedVoice = null

  // Wait for voices to be loaded (they load asynchronously)
  function getVoices() {
    return new Promise((resolve) => {
      const voices = speechSynthesis.getVoices()
      if (voices.length) return resolve(voices)

      // Wait for voiceschanged event if not loaded yet
      speechSynthesis.onvoiceschanged = () => {
        resolve(speechSynthesis.getVoices())
      }
    })
  }

  const audioObj = {
    onended: null,
    onerror: null,
    durationSec: text.split(' ').length / 2, // Rough estimate

    play: async () => {
      const voices = await getVoices()
      console.log(
        '[TTS] Available voices:',
        voices.map((v) => v.name),
      )

      // Try to find a voice matching keywords
      if (voiceKeywords && voiceKeywords.length > 0) {
        for (const keyword of voiceKeywords) {
          const match = voices.find((v) => v.name.toLowerCase().includes(keyword.toLowerCase()))
          if (match) {
            selectedVoice = match
            break
          }
        }
      }

      // Fallback logic if no keyword match
      if (!selectedVoice) {
        selectedVoice =
          voices.find((v) => /female/i.test(v.name) || /woman|girl/i.test(v.name)) ||
          voices.find((v) => v.name.toLowerCase().includes('aria')) ||
          voices.find((v) => v.name.toLowerCase().includes('susan')) ||
          voices[0] // fallback
      }

      console.log('[TTS] Selected voice:', selectedVoice?.name)

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice = selectedVoice
      utterance.rate = 1
      utterance.pitch = 1.05
      utterance.volume = 1

      // Hook up events
      utterance.onend = () => {
        console.log('[TTS] System speech ended')
        if (audioObj.onended) audioObj.onended()
      }

      utterance.onerror = (e) => {
        console.error('[TTS] System speech error:', e)
        if (audioObj.onerror) audioObj.onerror(e)
        // Also call onended to ensure state cleanup
        if (audioObj.onended) audioObj.onended()
      }

      speechSynthesis.cancel() // Clear any previous speech
      console.log('[TTS] Speaking:', text.substring(0, 50) + '...')
      speechSynthesis.speak(utterance)
    },

    stop: () => {
      speechSynthesis.cancel()
      if (audioObj.onended) audioObj.onended()
    },
  }

  return audioObj
}
