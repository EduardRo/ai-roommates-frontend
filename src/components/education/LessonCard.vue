<template>
  <div
    class="lesson-card"
    :class="{
      locked: !isUnlocked,
      completed: isCompleted,
    }"
    @click="handleClick"
  >
    <div class="lesson-content">
      <div class="lesson-title">
        <span class="lesson-number">{{ lesson.lesson_number }}.</span>
        <span class="title-text">{{ lesson.title }}</span>
      </div>

      <div class="lesson-meta">
        <span class="difficulty-badge" :class="`difficulty-${lesson.difficulty}`">
          {{ lesson.difficulty }}
        </span>
        <span v-if="lesson.estimated_duration_minutes" class="duration">
          {{ lesson.estimated_duration_minutes }} min
        </span>
      </div>
    </div>

    <div class="lesson-status">
      <StarRating v-if="progress" :score="progress.score" size="small" />
      <span v-else-if="!isUnlocked" class="lock-icon" title="Complete previous lesson first">
        🔒
      </span>
      <span v-else class="new-badge">New</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import StarRating from './StarRating.vue'

const props = defineProps({
  lesson: {
    type: Object,
    required: true,
  },
  progress: {
    type: Object, // { lesson_id, score, stars, completed_at, attempts }
    default: null,
  },
  isUnlocked: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const isCompleted = computed(() => !!props.progress)

const handleClick = () => {
  // Allow clicking all lessons - supporting open exploration
  emit('click', props.lesson.lesson_id)
}
</script>

<style scoped>
.lesson-card {
  background: #111118;
  border: 1px solid #24242f;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.lesson-card:hover {
  border-color: var(--color-neon);
  box-shadow: 0 0 15px rgba(160, 0, 255, 0.3);
  transform: translateY(-2px);
}

.lesson-card.locked {
  opacity: 0.5;
  background: #0e0e12;
}

.lesson-card.completed {
  border-color: var(--color-cyan);
  background: linear-gradient(to right, #111118, #1a1a24);
}

.lesson-content {
  flex: 1;
}

.lesson-title {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 8px;
}

.lesson-number {
  font-weight: 700;
  color: var(--color-neon);
  font-size: 1.25rem;
}

.title-text {
  font-weight: 700;
  color: var(--color-text);
  font-size: 1.1rem;
}

.lesson-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-left: 35px; /* Align with title text */
}

.difficulty-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
  text-transform: capitalize;
  border: 1px solid transparent;
}

.difficulty-beginner {
  background: rgba(0, 234, 255, 0.2);
  color: var(--color-cyan);
  border-color: var(--color-cyan);
}

.difficulty-intermediate {
  background: rgba(160, 0, 255, 0.2);
  color: var(--color-neon);
  border-color: var(--color-neon);
}

.difficulty-advanced {
  background: rgba(255, 0, 100, 0.2);
  color: #ff0064;
  border-color: #ff0064;
}

.duration {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.lesson-status {
  display: flex;
  align-items: center;
  min-width: 150px;
  justify-content: flex-end;
}

.lock-icon {
  font-size: 1.25rem;
  color: var(--color-neon);
}

.new-badge {
  background: var(--color-cyan);
  color: #000;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 0 8px var(--color-cyan);
}

@media (max-width: 768px) {
  .lesson-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .lesson-status {
    width: 100%;
    justify-content: flex-start;
  }

  .lesson-meta {
    margin-left: 0;
  }
}
</style>
