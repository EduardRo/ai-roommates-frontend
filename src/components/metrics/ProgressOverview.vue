<template>
  <div class="progress-overview">
    <h3>📊 Curriculum Progress</h3>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading progress...</p>
    </div>

    <div v-else class="progress-content">
      <!-- Overall Progress -->
      <div class="overall-progress">
        <div class="progress-header">
          <span class="progress-label">Overall Completion</span>
          <span class="progress-percentage">{{ progress.completion_percentage }}%</span>
        </div>
        <div class="progress-bar-container">
          <div
            class="progress-bar-fill"
            :style="{ width: `${progress.completion_percentage}%` }"
          ></div>
        </div>
        <div class="progress-stats">
          <span>{{ progress.completed_count }} / {{ progress.total_lessons }} lessons</span>
          <span>{{ progress.unlocked_lessons.length }} unlocked</span>
        </div>
      </div>

      <!-- Recent Lessons -->
      <div v-if="recentLessons.length > 0" class="recent-lessons">
        <h4>Recent Completions</h4>
        <div class="lesson-list">
          <div v-for="lesson in recentLessons" :key="lesson.lesson_id" class="lesson-item">
            <div class="lesson-info">
              <span class="lesson-id">{{ lesson.lesson_id }}</span>
              <span class="lesson-date">{{ formatDate(lesson.completed_at) }}</span>
            </div>
            <div class="lesson-score">
              <span class="score-value">{{ lesson.score }}/10</span>
              <div class="stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= lesson.stars }">
                  ⭐
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: {
    type: Object,
    required: true,
    default: () => ({
      total_lessons: 0,
      completed_count: 0,
      completion_percentage: 0,
      lessons: [],
      unlocked_lessons: [],
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const recentLessons = computed(() => {
  return [...props.progress.lessons]
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
    .slice(0, 5)
})

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}
</script>

<style scoped>
.progress-overview {
  background: rgba(26, 26, 37, 0.6);
  border: 1px solid rgba(0, 234, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.progress-overview h3 {
  margin: 0 0 1.5rem 0;
  color: var(--color-cyan, #00eaff);
  font-size: 1.25rem;
  text-shadow: 0 0 10px rgba(0, 234, 255, 0.5);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 234, 255, 0.2);
  border-top-color: var(--color-cyan, #00eaff);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.overall-progress {
  margin-bottom: 2rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.progress-label {
  color: #999;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.progress-percentage {
  color: var(--color-cyan, #00eaff);
  font-size: 1.5rem;
  font-weight: 800;
  text-shadow: 0 0 10px rgba(0, 234, 255, 0.5);
}

.progress-bar-container {
  height: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #b026ff, #00eaff);
  border-radius: 6px;
  transition: width 0.5s ease;
  box-shadow: 0 0 15px rgba(0, 234, 255, 0.5);
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.75rem;
}

.recent-lessons h4 {
  margin: 0 0 1rem 0;
  color: #999;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.lesson-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.lesson-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 234, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s;
}

.lesson-item:hover {
  border-color: rgba(0, 234, 255, 0.3);
  background: rgba(0, 234, 255, 0.05);
}

.lesson-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.lesson-id {
  color: #ccc;
  font-size: 0.875rem;
  font-family: monospace;
}

.lesson-date {
  color: #666;
  font-size: 0.75rem;
}

.lesson-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.score-value {
  color: var(--color-cyan, #00eaff);
  font-weight: 700;
  font-size: 1.125rem;
}

.stars {
  display: flex;
  gap: 0.125rem;
}

.star {
  font-size: 0.75rem;
  opacity: 0.3;
  filter: grayscale(100%);
}

.star.filled {
  opacity: 1;
  filter: grayscale(0%);
}
</style>
