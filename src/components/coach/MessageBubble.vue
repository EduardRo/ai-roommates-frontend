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
        <div v-if="message.insights.neuroscience_tip" class="insight-item neuroscience">
          <strong>🧠 Neuroscience Tip:</strong>
          {{ message.insights.neuroscience_tip }}
        </div>
        <div v-if="message.insights.recommendations?.length" class="recommendations">
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
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
})

const formattedMessage = computed(() => {
  // Convert markdown-style formatting to HTML
  return props.message.message
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
})

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.message-bubble {
  margin-bottom: 1.5rem;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.message-content.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
  box-shadow: 0 0 15px rgba(160, 0, 255, 0.5);
}

.avatar.user {
  background: var(--color-cyan, #00eaff);
  color: #000;
}

.avatar.coach {
  background: var(--color-neon, #a000ff);
  color: #000;
}

.avatar.system {
  background: rgba(255, 193, 7, 0.8);
  color: #000;
}

.bubble {
  max-width: 70%;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  position: relative;
}

.bubble.user {
  background: rgba(0, 234, 255, 0.15);
  border: 1px solid var(--color-cyan, #00eaff);
  box-shadow: 0 0 15px rgba(0, 234, 255, 0.2);
}

.bubble.coach {
  background: rgba(160, 0, 255, 0.15);
  border: 1px solid var(--color-neon, #a000ff);
  box-shadow: 0 0 15px rgba(160, 0, 255, 0.2);
}

.bubble.system {
  background: rgba(255, 193, 7, 0.15);
  border: 1px solid #ffc107;
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.2);
}

.message-text {
  margin: 0;
  color: var(--color-text, #e0e0e0);
  line-height: 1.6;
  font-size: 0.95rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.timestamp {
  font-size: 0.75rem;
  color: var(--color-text-muted, #666);
  margin-top: 0.5rem;
  text-align: right;
}

.insights-section,
.summary-section {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border-left: 3px solid var(--color-cyan, #00eaff);
}

.section-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-cyan, #00eaff);
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 0 5px var(--color-cyan, #00eaff);
}

.insight-item,
.summary-item {
  margin-bottom: 0.75rem;
  padding-left: 1rem;
  border-left: 2px solid rgba(160, 0, 255, 0.3);
}

.insight-item:last-child,
.summary-item:last-child {
  margin-bottom: 0;
}

.insight-label,
.summary-label {
  font-size: 0.8rem;
  color: var(--color-neon, #a000ff);
  font-weight: 600;
  margin-bottom: 0.25rem;
  text-shadow: 0 0 5px var(--color-neon, #a000ff);
}

.insight-value,
.summary-value {
  color: var(--color-text, #e0e0e0);
  font-size: 0.9rem;
}

.recommendations,
.action-items {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
}

.recommendations li,
.action-items li {
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  background: rgba(160, 0, 255, 0.1);
  border-radius: 8px;
  border-left: 3px solid var(--color-neon, #a000ff);
  color: var(--color-text, #e0e0e0);
  font-size: 0.9rem;
}

.recommendations li:last-child,
.action-items li:last-child {
  margin-bottom: 0;
}
</style>
