# AI Debate Application - Technical Documentation

## Table of Contents

1. [Application Overview](#application-overview)
2. [Purpose & Features](#purpose--features)
3. [Architecture](#architecture)
4. [Technical Stack](#technical-stack)
5. [Project Structure](#project-structure)
6. [Core Components](#core-components)
7. [Data Flow](#data-flow)
8. [WebSocket Communication](#websocket-communication)
9. [Character System](#character-system)
10. [Development Setup](#development-setup)
11. [Deployment](#deployment)

---

## Application Overview

**AI-SYNTIA-V4** is an interactive AI debate platform that brings debates to life through animated Live2D characters. The application enables users to orchestrate real-time debates between AI-powered characters, each with unique personalities, visual appearances, and speaking styles. The system supports multiple debate modes (Balanced, Chaotic, Academic, Dramatic) and includes administrative intervention capabilities.

**Project Name**: `ai-avatar` / `ai-roommates-frontend`  
**Type**: Single Page Application (SPA)  
**Primary Use Case**: Educational debates, AI character interactions, demonstration platform

---

## Purpose & Features

### Core Features

#### 1. **AI-Powered Debate System**

- Real-time debates between multiple AI characters
- Debate topic customization
- Multiple debate styles: Balanced, Chaotic, Academic, Dramatic
- Character selection (Aria, Sera, Eidon, and others)
- Start/Stop debate controls
- Turn-based speaking system

#### 2. **Live2D Character Rendering**

- Animated 2D characters using Live2D Cubism models
- Character-specific animations (idle, speaking, blinking)
- Synchronized lip-sync with Text-to-Speech (TTS)
- Custom animation configurations per character
- Shared canvas rendering for optimal performance

#### 3. **Text-to-Speech (TTS) Integration**

- Real-time audio generation for character speech
- Edge TTS backend integration
- Synchronized audio playback with character animations
- Base64 audio streaming from backend

#### 4. **Admin Intervention System**

- Dedicated admin interface at `/admin/chat`
- Real-time message injection into debates
- Intervention queue system
- Visual indicators for intervention responses
- WebSocket-based communication

#### 5. **ChromaDB Integration**

- AI-generated debate summaries
- Log-based summarization feature
- Vector database storage for context

#### 6. **AI Tutor Features** (Extended Functionality)

- Lesson-based learning system
- Free practice mode
- Progress tracking
- Parent-set prizes and in-app incentives
- Theory review options

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Vue 3 + Vite + Vue Router                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │ DebateView   │  │ AdminChatView│  │ HomeView   │ │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  PIXI.js + Live2D Display                        │ │  │
│  │  │  - Shared Canvas                                 │ │  │
│  │  │  - Character Models (model3.json)                │ │  │
│  │  │  - Animation System                              │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket (ws://127.0.0.1:8000/ws/debate)
                              │
┌─────────────────────────────────────────────────────────────┐
│                         Backend                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Python (FastAPI/Similar)                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │ WebSocket    │  │ Character    │  │ AI Service │ │  │
│  │  │ Manager      │  │ Manager      │  │ (OpenRouter│ │  │
│  │  │              │  │              │  │  / Similar)│ │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │  │
│  │  ┌──────────────┐  ┌──────────────┐                 │  │
│  │  │ Edge TTS     │  │ ChromaDB     │                 │  │
│  │  │              │  │              │                 │  │
│  │  └──────────────┘  └──────────────┘                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

**Framework**: Vue 3 (Composition API with `<script setup>`)  
**Bundler**: Vite  
**Rendering Engine**: PIXI.js 7.4.3  
**Live2D**: @zennomi/pixi-live2d-display 0.4.1  
**State Management**: Pinia 3.0.3  
**Routing**: Vue Router 4.5.1

### Backend Architecture

**Language**: Python  
**WebSocket Server**: FastAPI (inferred)  
**Endpoint**: `ws://127.0.0.1:8000/ws/debate`  
**Character Assets**: Served from `/avatars/<id>/<model_file>`  
**TTS Engine**: Edge TTS  
**AI Provider**: OpenRouter (configurable parameters: temperature, frequency_penalty, presence_penalty)  
**Database**: ChromaDB (for summarization storage)

---

## Technical Stack

### Frontend Dependencies

```json
{
  "dependencies": {
    "@zennomi/pixi-live2d-display": "^0.4.1",
    "pinia": "^3.0.3",
    "pixi.js": "^7.4.3",
    "vue": "^3.5.17",
    "vue-router": "^4.5.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.29.0",
    "@vitejs/plugin-vue": "^6.0.0",
    "@vue/eslint-config-prettier": "^10.2.0",
    "eslint": "^9.29.0",
    "eslint-plugin-vue": "~10.2.0",
    "globals": "^16.2.0",
    "prettier": "3.5.3",
    "vite": "^7.0.0",
    "vite-plugin-vue-devtools": "^7.7.7"
  }
}
```

### Backend Dependencies (Inferred)

- **FastAPI**: WebSocket server framework
- **Edge TTS**: Text-to-speech generation
- **OpenRouter**: AI model provider
- **ChromaDB**: Vector database for summaries
- **Python AsyncIO**: Asynchronous WebSocket handling

---

## Project Structure

```
e:\AI-SYNTIA-V4\
├── frontend/
│   ├── public/
│   │   ├── avatars/           # Live2D character models
│   │   ├── backgrounds/        # Background assets
│   │   ├── debates/            # Debate-related resources
│   │   └── live2d/             # Live2D SDK files
│   ├── src/
│   │   ├── assets/             # Images, fonts, styles
│   │   ├── components/
│   │   │   ├── AdminChat.vue         # Admin intervention interface
│   │   │   ├── DebateCharacter.vue   # Individual character controller
│   │   │   ├── DebateRoom.vue        # Main debate interface
│   │   │   ├── Live2DAvatar.vue      # Live2D rendering component
│   │   │   └── icons/                # Icon components
│   │   ├── composables/
│   │   │   └── usePixiApp.js         # Shared PIXI.js application
│   │   ├── config/
│   │   │   ├── characterAnimationConfig.js  # Animation parameters
│   │   │   └── characterRenderConfig.js     # Positioning/scaling
│   │   ├── router/
│   │   │   └── index.js              # Vue Router configuration
│   │   ├── services/
│   │   │   ├── debateService.js      # WebSocket debate service
│   │   │   └── personaService.js     # Character/AI interactions
│   │   ├── stores/
│   │   │   ├── counter.js            # Example store
│   │   │   └── personaStore.js       # Character state management
│   │   ├── views/
│   │   │   ├── AboutView.vue         # About page
│   │   │   ├── AdminChatView.vue     # Admin chat page wrapper
│   │   │   ├── DebateView.vue        # Debate page
│   │   │   └── HomeView.vue          # Home page
│   │   ├── App.vue                    # Root component
│   │   └── main.js                    # Application entry point
│   ├── index.html                     # HTML entry point
│   ├── package.json                   # Frontend dependencies
│   └── vite.config.js                 # Vite configuration
│
└── backend/                           # (assumed location)
    ├── main.py                        # FastAPI entry point
    ├── character_manager.py           # Character management
    ├── characters/
    │   └── profiles/                  # Character JSON profiles
    └── [other backend modules]
```

---

## Core Components

### Frontend Components

#### 1. **DebateRoom.vue** (Main Debate Interface)

**Path**: `src/components/DebateRoom.vue`  
**Purpose**: Orchestrates the entire debate experience  
**Key Features**:

- Debate topic input (textarea)
- Character selection (checkboxes for Aria, Sera, Eidon, etc.)
- Debate style selection (Balanced, Chaotic, Academic, Dramatic)
- Start/Stop debate controls
- Real-time speech bubble display
- WebSocket connection management
- Shared PIXI.js canvas for all characters
- Intervention response indicators

**Key State**:

```javascript
const debateConfig = ref({
  topic: "Should AI have rights?",
  characters: [],
  style: "balanced",
});
const debateStatus = ref("idle"); // 'idle' | 'active'
const debateId = ref(null);
const currentSpeech = ref(null);
```

**WebSocket Events Handled**:

- `debate_started`: Receives debate ID
- `speech`: Character speech with text, audio, and character ID
- `debate_finished`: Debate completion notification
- `intervention_queued`: Admin intervention acknowledgment
- `intervention_response`: Character's response to admin message

---

#### 2. **DebateCharacter.vue** (Character Controller)

**Path**: `src/components/DebateCharacter.vue`  
**Purpose**: Controls individual character animations and audio playback  
**Key Features**:

- Live2D model loading and lifecycle management
- Speaking/idle animation states
- Lip-sync animation (mouth movement)
- Blinking animation
- Head and body movement animations
- Audio playback synchronization
- PIXI.js ticker integration

**Animation System**:

- **Speaking State**: Rapid mouth movement, active head/body animations
- **Idle State**: Subtle breathing, slow blinking, smooth return to neutral position
- **Custom Animations**: Character-specific animation parameters from `characterAnimationConfig.js`

**Exposed Methods**:

```javascript
defineExpose({
  onReceiveSpeech, // Triggers speech with audio
  characterId,
});
```

---

#### 3. **AdminChat.vue** (Admin Intervention)

**Path**: `src/components/AdminChat.vue`  
**Purpose**: Allows admins to inject messages into active debates  
**Key Features**:

- Real-time WebSocket connection to backend
- Message input with Enter key support
- Intervention history display
- Connection status indicator (connected/disconnected/error)
- Intervention status tracking (sent/queued)
- Auto-reconnection on disconnect

**Message Format**:

```javascript
{
  type: 'post_intervention',
  debate_id: debateId.value,
  data: {
    text: 'Your message',
    source: 'admin',
    user_name: 'Admin'
  }
}
```

---

#### 4. **Live2DAvatar.vue** (Legacy Component)

**Path**: `src/components/Live2DAvatar.vue`  
**Purpose**: Alternative Live2D rendering component (18,869 bytes)  
**Note**: Appears to be superseded by `DebateCharacter.vue` for debate functionality

---

### Services

#### 1. **debateService.js**

**Path**: `src/services/debateService.js`  
**Purpose**: Manages WebSocket connection to the debate backend  
**Key Features**:

- Singleton WebSocket service
- Auto-reconnection (max 5 attempts, 3s delay)
- Message queue for unhandled messages
- Connection state management

**Methods**:

```javascript
connect(onMessageHandler); // Establish WebSocket connection
send(message); // Send JSON message
startDebate(topic, characterIds); // Start new debate
stopDebate(debateId); // Stop active debate
disconnect(); // Close connection
```

---

#### 2. **personaService.js**

**Path**: `src/services/personaService.js`  
**Purpose**: Handles character AI interactions and audio management  
**Key Features**:

- Fetches AI responses from backend
- Processes base64-encoded audio from backend
- Converts base64 to audio playback
- TTS audio generation

**Functions**:

```javascript
getAiResponse(sessionId, userInput); // Get AI response
getAudio(text, audio_b64); // Process audio from backend
```

---

### Stores (Pinia)

#### **personaStore.js**

**Path**: `src/stores/personaStore.js`  
**Purpose**: Manages character state and AI interactions  
**State**:

```javascript
{
  model: 'companion',
  sessionId: `session_${Date.now()}`,
  isLoading: false,
  isThinking: false,
  responseText: '',
  animationCommands: [],
  audio_b64: null,  // Backend-generated audio
  responseTrigger: 0
}
```

---

### Configuration Files

#### 1. **characterAnimationConfig.js**

**Path**: `src/config/characterAnimationConfig.js`  
**Purpose**: Defines animation parameters for each character  
**Structure**:

```javascript
export const characterAnimationConfig = {
  aria: {
    speaking: {
      blinking: { cycleMs: 3500, durationMs: 120 },
      head: { x: { amplitude: 20, cycleMs: 2800 }, ... },
      body: { z: { amplitude: 15, cycleMs: 4500 } }
    },
    idle: {
      blinking: { cycleMs: 4000, durationMs: 100 },
      body: { z: { amplitude: 3, cycleMs: 8000 } }
    }
  },
  sera: { ... },
  eidon: { ... }
}
```

**Parameters**:

- `cycleMs`: Duration of one full animation cycle (larger = slower)
- `durationMs`: Duration of specific action (e.g., blink)
- `amplitude`: Movement magnitude (larger = more exaggerated)

---

#### 2. **characterRenderConfig.js**

**Path**: `src/config/characterRenderConfig.js`  
**Purpose**: Defines positioning and scaling for each character  
**Structure**:

```javascript
export const characterRenderConfig = {
  aria: {
    anchor: { x: 0.5, y: 0.5 },
    position: { x: 0.25, y: 0.5 },  // Percentage of canvas
    scale: { x: 0.3, y: 0.3 }
  },
  sera: { ... },
  eidon: { ... }
}
```

---

### Composables

#### **usePixiApp.js**

**Path**: `src/composables/usePixiApp.js`  
**Purpose**: Provides shared PIXI.js application instance  
**Key Features**:

- Singleton PIXI application
- Shared canvas for all characters
- Initialization state tracking
- Canvas lifecycle management

**Exports**:

```javascript
{
  initApp, // Initialize PIXI app
    destroyApp, // Destroy PIXI app
    getSharedPixiApp, // Get app instance
    isInitialized; // Reactive initialization state
}
```

---

## Data Flow

### Debate Flow

```
1. User Configuration
   │
   ├─→ User enters topic (e.g., "Should AI have rights?")
   ├─→ User selects characters (Aria, Sera, Eidon)
   ├─→ User selects debate style (Balanced, Chaotic, etc.)
   └─→ User clicks "Start Debate"

2. WebSocket Initiation
   │
   └─→ DebateRoom.vue sends:
       {
         type: 'start_debate',
         data: {
           topic: 'Should AI have rights?',
           characters: ['aria', 'sera', 'eidon']
         }
       }

3. Backend Processing
   │
   ├─→ Backend creates debate session
   ├─→ Assigns character turns
   └─→ Generates AI responses via OpenRouter

4. Real-time Speech Events
   │
   └─→ Backend streams messages:
       {
         type: 'speech',
         data: {
           character_id: 'aria',
           text: 'I believe AI should have rights because...',
           audio_b64: 'base64_encoded_audio_data',
           contextRef: { type: 'normal', original_text: '...' }
         }
       }

5. Frontend Rendering
   │
   ├─→ DebateRoom.vue receives speech event
   ├─→ Displays speech bubble with character name and text
   ├─→ Calls characterRef.onReceiveSpeech(data)
   │
   └─→ DebateCharacter.vue:
       ├─→ Converts base64 audio to Audio object
       ├─→ Plays audio
       ├─→ Triggers speaking animation
       ├─→ Animates mouth, head, body movements
       └─→ Returns to idle state when audio ends

6. Debate Completion
   │
   └─→ Backend sends:
       {
         type: 'debate_finished',
         data: { summary: '...' }
       }
```

---

### Admin Intervention Flow

```
1. Admin Opens Admin Chat
   │
   └─→ Navigates to `/admin/chat`

2. Admin Sends Intervention
   │
   └─→ AdminChat.vue sends:
       {
         type: 'post_intervention',
         debate_id: 'debate_123',
         data: {
           text: 'What about ethical considerations?',
           source: 'admin',
           user_name: 'Admin'
         }
       }

3. Backend Queues Message
   │
   └─→ Backend sends acknowledgment:
       {
         type: 'intervention_queued',
         data: { queue_position: 1 }
       }

4. Character Addresses Intervention
   │
   └─→ Backend sends speech with intervention marker:
       {
         type: 'speech',
         data: {
           character_id: 'aria',
           text: 'Great point about ethics...',
           audio_b64: '...',
           contextRef: {
             type: 'intervention_response',
             original_text: 'What about ethical considerations?'
           }
         }
       }

5. Frontend Display
   │
   └─→ DebateRoom.vue shows golden border on speech bubble
       └─→ Displays "↩ Replying to: What about ethical considerations?"
```

---

## WebSocket Communication

### Connection Details

**URL**: `ws://127.0.0.1:8000/ws/debate`  
**Protocol**: WebSocket (JSON messages)  
**Auto-Reconnection**: Yes (max 5 attempts, 3s delay)

---

### Message Types

#### Client → Server

##### 1. Start Debate

```json
{
  "type": "start_debate",
  "data": {
    "topic": "Should AI have rights?",
    "characters": ["aria", "sera", "eidon"]
  }
}
```

##### 2. Stop Debate

```json
{
  "type": "stop_debate",
  "debate_id": "debate_123"
}
```

##### 3. Post Intervention

```json
{
  "type": "post_intervention",
  "debate_id": "debate_123",
  "data": {
    "text": "What about ethical considerations?",
    "source": "admin",
    "user_name": "Admin"
  }
}
```

---

#### Server → Client

##### 1. Debate Started

```json
{
  "type": "debate_started",
  "data": {
    "debate_id": "debate_123",
    "topic": "Should AI have rights?",
    "characters": ["aria", "sera", "eidon"]
  }
}
```

##### 2. Speech Event

```json
{
  "type": "speech",
  "data": {
    "character_id": "aria",
    "text": "I believe AI should have rights...",
    "audio_b64": "base64_encoded_audio_data",
    "contextRef": {
      "type": "normal",
      "original_text": ""
    }
  }
}
```

##### 3. Intervention Response

```json
{
  "type": "speech",
  "data": {
    "character_id": "sera",
    "text": "Regarding the admin's question...",
    "audio_b64": "...",
    "contextRef": {
      "type": "intervention_response",
      "original_text": "What about ethical considerations?"
    }
  }
}
```

##### 4. Intervention Queued

```json
{
  "type": "intervention_queued",
  "data": {
    "queue_position": 1
  }
}
```

##### 5. Debate Finished

```json
{
  "type": "debate_finished",
  "data": {
    "summary": "The debate covered various aspects..."
  }
}
```

---

## Character System

### Available Characters

Based on configuration files, the application supports the following characters:

1. **Aria**

   - **Personality**: Energetic, expressive
   - **Animation Style**: Moderate head movement, active body language
   - **Idle Behavior**: Subtle breathing, regular blinking (4s cycle)

2. **Sera**

   - **Personality**: Calm, composed
   - **Animation Style**: Minimal movement, slow blinks
   - **Idle Behavior**: Very calm, almost no sway (10s cycle)

3. **Eidon**
   - **Personality**: Energetic, restless
   - **Animation Style**: Active head movement, dynamic body language
   - **Idle Behavior**: Faster blinking, more restless (6s cycle)

---

### Character Assets

**Location**: `public/avatars/`  
**Format**: Live2D Cubism 3.0 models  
**Required Files**:

- `model3.json`: Model definition
- Texture files (`.png`)
- Motion files (`.json`)
- Physics files (`.physics3.json`)

**Serving Path**: `/avatars/<character_id>/<model_file>`

---

### Character Profile Structure

**Location**: `backend/characters/profiles/<character_id>.json`  
**Expected Fields**:

```json
{
  "id": "aria",
  "name": "Aria",
  "meta": {
    "model_file": "aria.model3.json",
    "description": "...",
    "personality": "..."
  }
}
```

---

## Development Setup

### Prerequisites

- **Node.js**: v18+ recommended
- **npm**: v9+ or compatible package manager
- **Python**: 3.9+ (for backend)
- **Git**: For version control

---

### Frontend Setup

```bash
# Navigate to frontend directory
cd e:\AI-SYNTIA-V4\frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

**Development Server**: `http://localhost:5173` (default Vite port)

---

### Backend Setup

```bash
# Navigate to backend directory
cd e:\AI-SYNTIA-V4\backend

# Install Python dependencies
pip install -r requirements.txt

# Run backend server
python main.py
# or
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**WebSocket Server**: `ws://127.0.0.1:8000/ws/debate`

---

### Environment Configuration

**Frontend** (`.env` - gitignored):

```env
VITE_WEBSOCKET_URL=ws://127.0.0.1:8000/ws/debate
VITE_API_BASE_URL=http://127.0.0.1:8000
```

**Backend** (environment variables):

```env
OPENROUTER_API_KEY=your_api_key
EDGE_TTS_VOICE=en-US-AriaNeural
CHROMADB_PATH=./chromadb
```

---

## Deployment

### Frontend Deployment

#### Option 1: Static Hosting (Netlify, Vercel, etc.)

```bash
# Build production bundle
npm run build

# Output directory: dist/
# Upload contents to hosting provider
```

**Configuration**:

- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18.x

---

#### Option 2: Docker

```dockerfile
# Dockerfile for frontend
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### Backend Deployment

#### Docker Deployment

```dockerfile
# Dockerfile for backend
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### Full Stack Deployment (Docker Compose)

```yaml
version: "3.8"
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - VITE_WEBSOCKET_URL=ws://backend:8000/ws/debate
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    volumes:
      - ./backend/characters:/app/characters
      - chromadb_data:/app/chromadb

volumes:
  chromadb_data:
```

---

## Development Workflow

### Adding a New Character

1. **Create Live2D Model Assets**

   - Place model files in `frontend/public/avatars/<character_id>/`
   - Ensure `model3.json` is present

2. **Create Character Profile**

   - Add `backend/characters/profiles/<character_id>.json`

   ```json
   {
     "id": "new_character",
     "name": "New Character",
     "meta": {
       "model_file": "new_character.model3.json"
     }
   }
   ```

3. **Configure Animations**

   - Edit `frontend/src/config/characterAnimationConfig.js`
   - Add speaking and idle configurations

4. **Configure Rendering**

   - Edit `frontend/src/config/characterRenderConfig.js`
   - Set anchor, position, and scale

5. **Update Character Selection**
   - Add character to `DebateRoom.vue` checkbox list

---

### Debugging WebSocket Issues

```javascript
// Enable verbose WebSocket logging
// In debateService.js or component:
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log("[WebSocket] Received:", message);
};

ws.onerror = (error) => {
  console.error("[WebSocket] Error:", error);
};

ws.onclose = (event) => {
  console.log("[WebSocket] Closed:", event.code, event.reason);
};
```

---

### Common Issues

#### 1. **Live2D Model Not Loading**

- **Check**: Model files are in `public/avatars/<id>/`
- **Check**: `modelPath` prop matches backend response
- **Check**: Console for 404 errors
- **Fix**: Ensure character profiles have correct `model_file` field

#### 2. **No Audio Playback**

- **Check**: Backend TTS service is running
- **Check**: `audio_b64` is present in speech message
- **Check**: Browser console for audio autoplay policy errors
- **Fix**: User must interact with page before audio plays

#### 3. **Animation Not Working**

- **Check**: PIXI application initialized (`isInitialized` is true)
- **Check**: `characterAnimationConfig.js` has entry for character
- **Check**: `tick()` function is running (console.log in tick)
- **Fix**: Ensure `app.ticker.add()` is called after model loads

#### 4. **Repetitive AI Responses**

- **Check**: OpenRouter parameters (temperature, frequency_penalty, presence_penalty)
- **Fix**: Increase `frequency_penalty` (0.5-1.0) and `presence_penalty` (0.5-1.0)

---

## Technical Notes

### Performance Considerations

- **Shared Canvas**: All characters render on a single PIXI canvas for optimal performance
- **Animation Loop**: Uses `requestAnimationFrame` for smooth 60fps animations
- **Audio Streaming**: Base64 audio from backend reduces file size overhead
- **WebSocket**: Persistent connection reduces latency vs. HTTP polling

---

### Browser Compatibility

- **Recommended**: Chrome 90+, Firefox 88+, Edge 90+
- **WebGL**: Required for PIXI.js rendering
- **Web Audio API**: Required for TTS playback
- **WebSocket**: Required for real-time communication

---

### Security Considerations

- **Admin Interface**: No authentication currently (add auth for production)
- **WebSocket**: Unencrypted (use `wss://` for production)
- **Input Validation**: Frontend validates debate topics and character selections
- **CORS**: Configure backend CORS for production deployment

---

## Future Enhancements

- User authentication system
- Multi-debate support (multiple rooms)
- Debate history and replay
- Character customization UI
- Mobile responsive design
- Voice input for admin interventions
- Real-time collaboration (multiple admins)
- Analytics dashboard

---

## Support & Contact

For technical questions or contributions, refer to the project's internal documentation or contact the development team.

**Repository**: `EduardRo/ai-roommates-frontend`  
**Last Updated**: 2025-11-24

---

## Conclusion

This application represents a sophisticated blend of AI, animation, and real-time communication technologies. The modular architecture allows for easy extension of characters, debate styles, and AI capabilities. The Live2D integration provides a unique visual experience that brings AI interactions to life.

For developers working on this codebase, familiarize yourself with:

1. Vue 3 Composition API patterns
2. PIXI.js rendering pipeline
3. WebSocket message protocols
4. Live2D Cubism model structure
5. Pinia state management

Happy coding! 🚀
