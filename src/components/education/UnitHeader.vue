<template>
  <div class="unit-header">
    <div class="unit-badge">Unit {{ unit.unit_number }}</div>
    <h2 class="unit-title">{{ unit.title }}</h2>
    <p v-if="unit.description" class="unit-description">{{ unit.description }}</p>

    <div class="unit-stats">
      <div class="stat-item">
        <span class="stat-value">{{ completedLessons }}</span>
        <span class="stat-label">Completed</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ totalLessons }}</span>
        <span class="stat-label">Total Lessons</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ progress }}%</span>
        <span class="stat-label">Progress</span>
      </div>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  unit: {
    type: Object,
    required: true,
  },
  completedLessonsIds: {
    type: Array,
    default: () => [],
  },
})

const totalLessons = computed(() => {
  let count = 0
  for (const chapter of props.unit.chapters) {
    count += chapter.lessons.length
  }
  return count
})

const completedLessons = computed(() => {
  let count = 0
  for (const chapter of props.unit.chapters) {
    for (const lesson of chapter.lessons) {
      if (props.completedLessonsIds.includes(lesson.lesson_id)) {
        count++
      }
    }
  }
  return count
})

const progress = computed(() => {
  if (totalLessons.value === 0) return 0
  return Math.round((completedLessons.value / totalLessons.value) * 100)
})
</script>

<style scoped>
.unit-header {
  background: linear-gradient(135deg, #240038, #0a0a0f);
  border: 1px solid var(--color-neon);
  color: var(--color-text);
  padding: 32px 40px;
  border-radius: 20px;
  margin-bottom: 32px;
  box-shadow: 0 0 20px rgba(160, 0, 255, 0.15);
}

.unit-badge {
  display: inline-block;
  background: var(--color-neon);
  color: #000;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  box-shadow: 0 0 8px var(--color-neon);
}

.unit-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 12px 0;
  line-height: 1.2;
  color: var(--color-cyan);
  text-shadow: 0 0 10px var(--color-cyan);
}

.unit-description {
  font-size: 1.1rem;
  color: var(--color-text-muted);
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.unit-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--color-cyan);
  text-shadow: 0 0 10px var(--color-cyan);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border);
}

.progress-bar {
  height: 8px;
  background: #333344;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-cyan);
  border-radius: 4px;
  transition: width 0.6s ease;
  box-shadow: 0 0 10px var(--color-cyan);
}

@media (max-width: 768px) {
  .unit-header {
    padding: 24px 20px;
  }

  .unit-title {
    font-size: 1.5rem;
  }

  .unit-stats {
    flex-wrap: wrap;
    justify-content: space-around;
  }

  .stat-divider {
    display: none;
  }
}
</style>
