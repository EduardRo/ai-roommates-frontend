# AI Learning Coach - Frontend Specification

## Overview

Implement **two chat interfaces** for the AI Learning Coach feature:

1. **Student Coach Chat**: For students to discuss their learning
2. **Parent Coach Chat**: For parents to check on their children's progress

---

## Technology Stack

- **Framework**: Vue 3 (Composition API)
- **State Management**: Pinia
- **Styling**: Your existing CSS framework
- **HTTP Client**: Axios (existing)
- **Real-time**: WebSocket (optional for Phase 2)

---

## Component Structure

```
frontend/src/
├── views/
│   ├── StudentCoachView.vue       # Student coach page
│   └── ParentCoachView.vue        # Parent coach page
│
├── components/
│   ├── coach/
│   │   ├── ChatInterface.vue      # Reusable chat component
│   │   ├── MessageBubble.vue      # Individual message
│   │   ├── InsightCard.vue        # Display insights/metrics
│   │   ├── QuickActions.vue       # Suggested questions
│   │   └── PerformanceChart.vue   # Simple chart widget
│   │
│   └── dashboard/
│       ├── CoachWidget.vue        # Dashboard widget for quick access
│       └── ChildSummaryCard.vue   # Parent dashboard - child summary
│
├── stores/
│   ├── coachStore.js              # Coach state management
│   └── analyticsStore.js          # Analytics data
│
└── services/
    ├── coachService.js            # API calls for coach
    └── analyticsService.js        # API calls for analytics
```

---

## API Integration

### **Backend Endpoints to Call**

```javascript
// Student Coach
POST / api / students / { studentId } / coach / chat;
GET / api / students / { studentId } / coach / history;
GET / api / students / { studentId } / coach / insights;

// Parent Coach
POST / api / parents / { parentId } / coach / chat;
GET / api / parents / { parentId } / children / summary;
GET / api / parents / { parentId } / coach / history;
```

### **Request/Response Formats**

#### **Student Coach Chat**

```javascript
// Request
POST /api/students/123/coach/chat
{
  "message": "Why am I struggling with fractions?",
  "conversation_id": "uuid" // optional
}

// Response
{
  "response": "I've analyzed your progress...",
  "insights": {
    "performance_summary": {
      "average_score": 72,
      "trend": "improving",
      "lessons_completed": 12
    },
    "neuroscience_tip": "Your brain needs spaced repetition...",
    "recommendations": [
      "Review lesson 3.2 tomorrow",
      "Practice for 20 minutes, then take a break"
    ]
  },
  "conversation_id": "uuid"
}
```

#### **Parent Coach Chat**

```javascript
// Request
POST /api/parents/456/coach/chat
{
  "message": "How is Emma doing?",
  "child_id": 123, // optional
  "conversation_id": "uuid" // optional
}

// Response
{
  "response": "Emma is doing great! Here's a summary...",
  "summary": {
    "overall_status": "improving",
    "key_strengths": ["Math", "Consistency"],
    "areas_to_support": ["Reading comprehension"],
    "action_items": [
      "Review fractions this weekend",
      "Encourage 5-minute breaks"
    ]
  },
  "conversation_id": "uuid"
}
```

---

## Component Specifications

### 1. **ChatInterface.vue** (Reusable)

**Purpose**: Main chat interface used by both student and parent views

**Props**:

```javascript
{
  userType: 'student' | 'parent',
  userId: Number,
  childId: Number // optional, for parent chat
}
```

**Features**:

- Message history display
- Input field with send button
- Loading state while AI responds
- Auto-scroll to latest message
- Conversation persistence (save/load)

**Template Structure**:

```vue
<template>
  <div class="chat-interface">
    <!-- Header -->
    <div class="chat-header">
      <h2>{{ headerTitle }}</h2>
      <button @click="clearChat">New Conversation</button>
    </div>

    <!-- Messages -->
    <div class="messages-container" ref="messagesContainer">
      <MessageBubble
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
        :user-type="userType"
      />

      <!-- Loading indicator -->
      <div v-if="isLoading" class="loading-message">
        <span class="typing-indicator">Coach is thinking...</span>
      </div>
    </div>

    <!-- Insights (student only) -->
    <InsightCard
      v-if="userType === 'student' && currentInsights"
      :insights="currentInsights"
    />

    <!-- Summary (parent only) -->
    <div v-if="userType === 'parent' && currentSummary" class="summary-card">
      <h3>Quick Summary</h3>
      <div class="status">Status: {{ currentSummary.overall_status }}</div>
      <div class="strengths">
        Strengths: {{ currentSummary.key_strengths.join(", ") }}
      </div>
      <div class="support">
        Needs Support: {{ currentSummary.areas_to_support.join(", ") }}
      </div>
    </div>

    <!-- Input -->
    <div class="chat-input">
      <QuickActions
        v-if="messages.length === 0"
        :user-type="userType"
        @select="sendMessage"
      />
      <textarea
        v-model="messageInput"
        @keydown.enter.prevent="sendMessage"
        placeholder="Ask your coach..."
        rows="2"
      ></textarea>
      <button
        @click="sendMessage"
        :disabled="!messageInput.trim() || isLoading"
      >
        Send
      </button>
    </div>
  </div>
</template>
```

**Script**:

```javascript
<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useCoachStore } from '@/stores/coachStore'
import MessageBubble from './MessageBubble.vue'
import InsightCard from './InsightCard.vue'
import QuickActions from './QuickActions.vue'

const props = defineProps({
  userType: {
    type: String,
    required: true,
    validator: (value) => ['student', 'parent'].includes(value)
  },
  userId: {
    type: Number,
    required: true
  },
  childId: {
    type: Number,
    default: null
  }
})

const coachStore = useCoachStore()
const messageInput = ref('')
const messagesContainer = ref(null)
const isLoading = ref(false)

const messages = computed(() => coachStore.messages)
const currentInsights = computed(() => coachStore.currentInsights)
const currentSummary = computed(() => coachStore.currentSummary)

const headerTitle = computed(() => {
  return props.userType === 'student'
    ? 'Your Learning Coach'
    : 'Parent Coach'
})

async function sendMessage(text = null) {
  const message = text || messageInput.value.trim()
  if (!message) return

  // Add user message
  coachStore.addMessage({
    role: 'user',
    message: message,
    timestamp: new Date()
  })

  messageInput.value = ''
  isLoading.value = true

  try {
    // Call API
    const response = await coachStore.sendMessage({
      userType: props.userType,
      userId: props.userId,
      childId: props.childId,
      message: message
    })

    // Add coach response
    coachStore.addMessage({
      role: 'coach',
      message: response.response,
      insights: response.insights,
      summary: response.summary,
      timestamp: new Date()
    })

    // Scroll to bottom
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Failed to send message:', error)
    // Show error message
    coachStore.addMessage({
      role: 'system',
      message: 'Sorry, I encountered an error. Please try again.',
      timestamp: new Date()
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
    childId: props.childId
  })
  scrollToBottom()
})
</script>
```

---

### 2. **MessageBubble.vue**

**Purpose**: Display individual chat messages

**Props**:

```javascript
{
  message: {
    role: 'user' | 'coach' | 'system',
    message: String,
    insights: Object, // optional
    summary: Object, // optional
    timestamp: Date
  },
  userType: 'student' | 'parent'
}
```

**Template**:

```vue
<template>
  <div :class="['message-bubble', message.role]">
    <div class="message-content">
      <div class="message-text" v-html="formattedMessage"></div>

      <!-- Insights (student coach only) -->
      <div v-if="message.insights" class="message-insights">
        <div class="insight-item">
          <strong>📊 Performance:</strong>
          {{ message.insights.performance_summary.average_score }}% average ({{
            message.insights.performance_summary.trend
          }})
        </div>
        <div
          v-if="message.insights.neuroscience_tip"
          class="insight-item neuroscience"
        >
          <strong>🧠 Neuroscience Tip:</strong>
          {{ message.insights.neuroscience_tip }}
        </div>
        <div
          v-if="message.insights.recommendations?.length"
          class="recommendations"
        >
          <strong>💡 Recommendations:</strong>
          <ul>
            <li v-for="(rec, i) in message.insights.recommendations" :key="i">
              {{ rec }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Summary (parent coach only) -->
      <div v-if="message.summary" class="message-summary">
        <div class="summary-status">
          Status:
          <span :class="message.summary.overall_status">
            {{ message.summary.overall_status }}
          </span>
        </div>
        <div v-if="message.summary.action_items?.length" class="action-items">
          <strong>Action Items:</strong>
          <ul>
            <li v-for="(item, i) in message.summary.action_items" :key="i">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="message-timestamp">
      {{ formatTime(message.timestamp) }}
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
});

const formattedMessage = computed(() => {
  // Convert markdown-style formatting to HTML
  return props.message.message
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
});

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
</script>

<style scoped>
.message-bubble {
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 12px;
  max-width: 80%;
}

.message-bubble.user {
  margin-left: auto;
  background: #007bff;
  color: white;
}

.message-bubble.coach {
  margin-right: auto;
  background: #f0f0f0;
  color: #333;
}

.message-bubble.system {
  margin: 0 auto;
  background: #fff3cd;
  color: #856404;
  text-align: center;
  max-width: 60%;
}

.message-insights,
.message-summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.insight-item,
.summary-status {
  margin: 0.5rem 0;
}

.neuroscience {
  background: rgba(108, 117, 255, 0.1);
  padding: 0.5rem;
  border-radius: 6px;
  margin-top: 0.5rem;
}

.recommendations ul,
.action-items ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.message-timestamp {
  font-size: 0.75rem;
  opacity: 0.6;
  margin-top: 0.5rem;
}

.overall_status.improving {
  color: #28a745;
  font-weight: bold;
}

.overall_status.stable {
  color: #ffc107;
  font-weight: bold;
}

.overall_status.declining {
  color: #dc3545;
  font-weight: bold;
}
</style>
```

---

### 3. **QuickActions.vue**

**Purpose**: Suggested conversation starters

**Props**:

```javascript
{
  userType: "student" | "parent";
}
```

**Template**:

```vue
<template>
  <div class="quick-actions">
    <p class="quick-actions-label">Quick questions:</p>
    <div class="action-buttons">
      <button
        v-for="action in actions"
        :key="action"
        @click="$emit('select', action)"
        class="action-button"
      >
        {{ action }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  userType: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["select"]);

const actions = computed(() => {
  if (props.userType === "student") {
    return [
      "How am I doing overall?",
      "What should I study next?",
      "Why am I struggling with this topic?",
      "How can I remember things better?",
      "Am I studying too fast or too slow?",
    ];
  } else {
    return [
      "How is my child doing?",
      "What should we focus on this week?",
      "Is my child studying enough?",
      "How can I help with homework?",
      "Should I be worried about anything?",
    ];
  }
});
</script>

<style scoped>
.quick-actions {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.quick-actions-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.action-button {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.action-button:hover {
  background: #007bff;
  color: white;
  border-color: #007bff;
}
</style>
```

---

### 4. **CoachWidget.vue** (Dashboard)

**Purpose**: Quick access widget on student/parent dashboard

**Template**:

```vue
<template>
  <div class="coach-widget">
    <div class="widget-header">
      <h3>💬 Your Learning Coach</h3>
    </div>

    <div class="widget-content">
      <!-- Latest insight -->
      <div v-if="latestInsight" class="latest-insight">
        <p class="insight-text">{{ latestInsight }}</p>
      </div>

      <!-- Quick stats (student) -->
      <div v-if="userType === 'student'" class="quick-stats">
        <div class="stat">
          <span class="stat-label">This Week:</span>
          <span class="stat-value">{{ weeklyStats.lessons }} lessons</span>
        </div>
        <div class="stat">
          <span class="stat-label">Average:</span>
          <span class="stat-value">{{ weeklyStats.average }}%</span>
        </div>
      </div>

      <!-- Quick stats (parent) -->
      <div v-if="userType === 'parent'" class="children-summary">
        <div
          v-for="child in childrenSummary"
          :key="child.id"
          class="child-stat"
        >
          <span class="child-name">{{ child.name }}:</span>
          <span :class="['status-badge', child.status]">
            {{ child.status }}
          </span>
        </div>
      </div>

      <!-- CTA Button -->
      <button @click="openCoach" class="coach-button">Chat with Coach</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCoachStore } from "@/stores/coachStore";

const props = defineProps({
  userType: {
    type: String,
    required: true,
  },
  userId: {
    type: Number,
    required: true,
  },
});

const router = useRouter();
const coachStore = useCoachStore();

const latestInsight = ref("");
const weeklyStats = ref({ lessons: 0, average: 0 });
const childrenSummary = ref([]);

function openCoach() {
  const route =
    props.userType === "student" ? "/student/coach" : "/parent/coach";
  router.push(route);
}

onMounted(async () => {
  // Load quick insights
  const insights = await coachStore.getQuickInsights({
    userType: props.userType,
    userId: props.userId,
  });

  if (props.userType === "student") {
    latestInsight.value = insights.latest_tip;
    weeklyStats.value = insights.weekly_stats;
  } else {
    childrenSummary.value = insights.children_summary;
  }
});
</script>

<style scoped>
.coach-widget {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.widget-header h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
}

.latest-insight {
  background: #f0f7ff;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #007bff;
}

.quick-stats,
.children-summary {
  margin: 1rem 0;
}

.stat,
.child-stat {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
}

.status-badge.improving {
  background: #d4edda;
  color: #155724;
}

.status-badge.stable {
  background: #fff3cd;
  color: #856404;
}

.status-badge.declining {
  background: #f8d7da;
  color: #721c24;
}

.coach-button {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s;
}

.coach-button:hover {
  background: #0056b3;
}
</style>
```

---

## Store Implementation

### **coachStore.js**

```javascript
import { defineStore } from "pinia";
import coachService from "@/services/coachService";

export const useCoachStore = defineStore("coach", {
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
      });
    },

    clearMessages() {
      this.messages = [];
      this.currentConversationId = null;
      this.currentInsights = null;
      this.currentSummary = null;
    },

    async sendMessage({ userType, userId, childId, message }) {
      this.isLoading = true;
      try {
        const response = await coachService.sendMessage({
          userType,
          userId,
          childId,
          message,
          conversationId: this.currentConversationId,
        });

        this.currentConversationId = response.conversation_id;

        if (userType === "student") {
          this.currentInsights = response.insights;
        } else {
          this.currentSummary = response.summary;
        }

        return response;
      } finally {
        this.isLoading = false;
      }
    },

    async loadHistory({ userType, userId, childId }) {
      try {
        const history = await coachService.getHistory({
          userType,
          userId,
          childId,
        });

        this.messages = history.messages || [];
        this.currentConversationId = history.conversation_id;
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    },

    async getQuickInsights({ userType, userId }) {
      try {
        return await coachService.getQuickInsights({
          userType,
          userId,
        });
      } catch (error) {
        console.error("Failed to get insights:", error);
        return {};
      }
    },
  },
});
```

---

## Service Implementation

### **coachService.js**

```javascript
import apiClient from "./apiClient";

export default {
  async sendMessage({ userType, userId, childId, message, conversationId }) {
    const endpoint =
      userType === "student"
        ? `/api/students/${userId}/coach/chat`
        : `/api/parents/${userId}/coach/chat`;

    const payload = {
      message,
      conversation_id: conversationId,
    };

    if (userType === "parent" && childId) {
      payload.child_id = childId;
    }

    const response = await apiClient.post(endpoint, payload);
    return response.data;
  },

  async getHistory({ userType, userId, childId }) {
    const endpoint =
      userType === "student"
        ? `/api/students/${userId}/coach/history`
        : `/api/parents/${userId}/coach/history`;

    const params = childId ? { child_id: childId } : {};
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  },

  async getQuickInsights({ userType, userId }) {
    const endpoint =
      userType === "student"
        ? `/api/students/${userId}/coach/insights`
        : `/api/parents/${userId}/children/summary`;

    const response = await apiClient.get(endpoint);
    return response.data;
  },
};
```

---

## Routing

### **Add to router/index.js**

```javascript
{
  path: '/student/coach',
  name: 'StudentCoach',
  component: () => import('@/views/StudentCoachView.vue'),
  meta: { requiresAuth: true, userType: 'student' }
},
{
  path: '/parent/coach',
  name: 'ParentCoach',
  component: () => import('@/views/ParentCoachView.vue'),
  meta: { requiresAuth: true, userType: 'parent' }
}
```

---

## View Implementation

### **StudentCoachView.vue**

```vue
<template>
  <div class="student-coach-view">
    <div class="coach-container">
      <ChatInterface user-type="student" :user-id="currentStudent.id" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import ChatInterface from "@/components/coach/ChatInterface.vue";

const authStore = useAuthStore();
const currentStudent = computed(() => authStore.currentUser);
</script>

<style scoped>
.student-coach-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.coach-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
</style>
```

### **ParentCoachView.vue**

```vue
<template>
  <div class="parent-coach-view">
    <!-- Child selector (if multiple children) -->
    <div v-if="children.length > 1" class="child-selector">
      <label>Discuss about:</label>
      <select v-model="selectedChildId">
        <option :value="null">All children</option>
        <option v-for="child in children" :key="child.id" :value="child.id">
          {{ child.display_name }}
        </option>
      </select>
    </div>

    <div class="coach-container">
      <ChatInterface
        user-type="parent"
        :user-id="currentParent.id"
        :child-id="selectedChildId"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import ChatInterface from "@/components/coach/ChatInterface.vue";

const authStore = useAuthStore();
const currentParent = computed(() => authStore.currentUser);
const children = computed(() => authStore.children || []);
const selectedChildId = ref(null);
</script>

<style scoped>
.parent-coach-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.child-selector {
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.child-selector select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.coach-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
</style>
```

---

## Design Guidelines

### **Colors**

- **Primary**: #007bff (coach messages, buttons)
- **User Messages**: #007bff background, white text
- **Coach Messages**: #f0f0f0 background, #333 text
- **Success/Improving**: #28a745
- **Warning/Stable**: #ffc107
- **Danger/Declining**: #dc3545

### **Typography**

- **Message Text**: 1rem, line-height 1.5
- **Timestamps**: 0.75rem, opacity 0.6
- **Headers**: 1.25rem - 1.5rem, bold

### **Spacing**

- **Message Padding**: 1rem
- **Message Margin**: 1rem vertical
- **Container Padding**: 1.5rem - 2rem

### **Responsive**

- **Desktop**: Max-width 900px, centered
- **Tablet**: Full width with padding
- **Mobile**: Reduce padding, stack insights vertically

---

## Testing Checklist

### **Functionality**

- [ ] Send message and receive response
- [ ] Display insights (student) / summary (parent)
- [ ] Quick actions work
- [ ] Conversation history loads
- [ ] Clear chat works
- [ ] Auto-scroll to latest message
- [ ] Loading states display correctly

### **UI/UX**

- [ ] Messages display correctly
- [ ] Responsive on mobile
- [ ] Insights/summary cards readable
- [ ] Buttons have hover states
- [ ] Error messages display
- [ ] Empty state (no messages)

### **Integration**

- [ ] API calls work
- [ ] Authentication required
- [ ] Parent can select child
- [ ] Student sees own data only
- [ ] Dashboard widget links correctly

---

## Error Handling

```javascript
// In ChatInterface.vue
try {
  const response = await coachStore.sendMessage(...)
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
    router.push('/login')
  } else if (error.response?.status === 429) {
    // Rate limit
    alert('Too many requests. Please wait a moment.')
  } else {
    // Generic error
    coachStore.addMessage({
      role: 'system',
      message: 'Sorry, I encountered an error. Please try again.',
      timestamp: new Date()
    })
  }
}
```

---

## Performance Optimization

1. **Lazy Loading**: Load conversation history on mount, not on every render
2. **Debounce**: Prevent rapid message sending
3. **Virtual Scrolling**: If conversation gets very long (100+ messages)
4. **Cache**: Store recent conversations in localStorage

---

## Accessibility

- [ ] Keyboard navigation (Tab, Enter to send)
- [ ] ARIA labels on buttons
- [ ] Screen reader friendly
- [ ] Focus management
- [ ] Color contrast meets WCAG AA

---

## Next Steps

1. **Review** this specification
2. **Implement** components in order:
   - MessageBubble.vue
   - QuickActions.vue
   - ChatInterface.vue
   - Views
   - Store & Services
3. **Test** with mock data first
4. **Integrate** with backend API
5. **Polish** UI/UX

---

## Questions?

If you need clarification on:

- Component structure
- API integration
- Styling approach
- State management

Please ask before starting implementation!
