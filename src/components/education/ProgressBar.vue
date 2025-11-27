<template>
  <div class="progress-bar-container">
    <div class="progress-header">
      <span class="progress-text">{{ progressText }}</span>
      <span class="progress-percentage">{{ percentageText }}</span>
    </div>
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: percentage + '%' }"
        :class="{ complete: isComplete }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  showPercentage: {
    type: Boolean,
    default: true,
  },
})

const percentage = computed(() => {
  if (props.total === 0) return 0
  return Math.round((props.current / props.total) * 100)
})

const isComplete = computed(() => props.current >= props.total)

const progressText = computed(() => {
  if (isComplete.value) {
    return '🎉 All questions completed!'
  }
  return `Question ${props.current} of ${props.total}`
})

const percentageText = computed(() => {
  return `${percentage.value}%`
})
</script>

<style scoped>
.progress-bar-container {
  margin: 20px 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.progress-percentage {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-cyan);
  text-shadow: 0 0 5px var(--color-cyan);
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #2a2a35;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
}

.progress-fill {
  height: 100%;
  background: var(--color-cyan);
  border-radius: 6px;
  transition:
    width 0.4s ease,
    background 0.3s ease;
  box-shadow: 0 0 10px var(--color-cyan);
}

.progress-fill.complete {
  background: var(--color-neon);
  box-shadow: 0 0 15px var(--color-neon);
}

@keyframes pulse {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.1);
  }
}

.progress-fill.complete {
  animation: pulse 1s ease-in-out;
}
</style>
