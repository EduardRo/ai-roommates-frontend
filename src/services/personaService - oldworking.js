// src/services/personaService.js
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

/*
export async function getAudio(text) {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
  const voiceId = 'Pt5YrLNyu6d2s3s4CVMg'
  if (!apiKey || !text) return null

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.2, // Lower for more emotional, dynamic delivery
          similarity_boost: 0.75, // Good balance for clarity
          speed: 1.1, // Slightly faster for more energy
        },
      }),
    })
    if (!response.ok) throw new Error(`TTS Error: ${await response.text()}`)

    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)

    // Wait for metadata to get duration
    await new Promise((resolve) => {
      audio.addEventListener('loadedmetadata', resolve, { once: true })
    })
    const duration = audio.duration || text.split().length / 2 // Fallback: ~2 words/sec
    audio.durationSec = duration // Store duration separately
    return audio
  } catch (err) {
    console.error('[Service] TTS request failed:', err)
    return null
  }
} */

export async function getAudio(text) {
  console.log('[getAudio] Received text:', text)
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
  const voiceId = import.meta.env.VITE_VOICEID
  //'Pt5YrLNyu6d2s3s4CVMg' // <- Replace with actual voice ID
  //const voiceId = 'XrExE9yKIg1WjnnlVkGX'
  if (!text) return null

  // Try ElevenLabs first
  if (apiKey) {
    console.log(voiceId)
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.3,
            similarity_boost: 0.8,
            style: 0.6,
            use_speaker_boost: true,
            speed: 1,
          },
        }),
      })

      if (!response.ok) throw new Error(await response.text())
      console.log('[getAudio] Eroare Received ElevenLabs response:', response)
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      await new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', resolve, { once: true })
      })

      const duration = audio.duration || text.split(' ').length / 2
      audio.durationSec = duration
      return audio
    } catch (err) {
      console.warn('[Service] ElevenLabs failed — falling back to system voice:', err)
    }
  }

  // 🗣️ Fallback: Use system speech synthesis (no ElevenLabs credits)
  return createSystemSpeech(text)
}

// Helper to use browser's built-in TTS
/*
function createSystemSpeech(text) {
  return {
    play: () => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.1
      utterance.pitch = 1
      utterance.volume = 1
      speechSynthesis.speak(utterance)
    },
    stop: () => {
      speechSynthesis.cancel()
    },
    durationSec: text.split(' ').length / 2, // crude estimate
  }
}
*/

function createSystemSpeech(text) {
  let selectedVoice = null

  // This function waits for voices to be loaded (since they load async)
  function getVoices() {
    return new Promise((resolve) => {
      const voices = speechSynthesis.getVoices()
      if (voices.length) return resolve(voices)

      // Wait for the voiceschanged event if not loaded yet
      speechSynthesis.onvoiceschanged = () => {
        resolve(speechSynthesis.getVoices())
      }
    })
  }

  async function play() {
    const voices = await getVoices()
    console.log(
      '[TTS] Available voices:',
      voices.map((v) => v.name),
    )
    // Try to find a female voice
    selectedVoice =
      voices.find((v) => /female/i.test(v.name) || /woman|girl/i.test(v.name)) ||
      voices.find((v) => v.name.toLowerCase().includes('aria')) || // Windows female voice
      voices.find((v) => v.name.toLowerCase().includes('susan')) || // MS Aria
      voices[0] // fallback if none found
    console.log('Selected voice:', selectedVoice)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = selectedVoice
    utterance.rate = 1
    utterance.pitch = 1.05
    utterance.volume = 1
    speechSynthesis.cancel()
    console.log('[TTS] About to speak:', text)
    speechSynthesis.speak(utterance)
    console.log('[TTS] speak() called')
  }

  return {
    play,
    stop: () => speechSynthesis.cancel(),
    durationSec: text.split(' ').length / 2,
  }
}
