<template>
  <div class="stats-summary">
    <div class="stat-card">
      <div class="stat-icon">📚</div>
      <div class="stat-content">
        <h4>Total Lessons</h4>
        <p class="stat-value">{{ stats.total_lessons }}</p>
        <span class="stat-label">Completed</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">🎯</div>
      <div class="stat-content">
        <h4>Average Score</h4>
        <p class="stat-value">{{ stats.avg_score }}<span class="unit">/10</span></p>
        <span class="stat-label">{{ performanceLabel }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">⭐</div>
      <div class="stat-content">
        <h4>Total Stars</h4>
        <p class="stat-value">{{ stats.total_stars }}</p>
        <span class="stat-label">Earned</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">🏆</div>
      <div class="stat-content">
        <h4>Mastered</h4>
        <p class="stat-value">{{ stats.mastered_lessons }}</p>
        <span class="stat-label">Lessons</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
      total_lessons: 0,
      avg_score: 0,
      total_stars: 0,
      mastered_lessons: 0,
    }),
  },
})

const performanceLabel = computed(() => {
  const score = props.stats.avg_score
  if (score >= 9) return 'Excellent!'
  if (score >= 7) return 'Great!'
  if (score >= 5) return 'Good'
  return 'Keep practicing!'
})
</script>

<style scoped>
.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(26, 26, 37, 0.6);
  border: 1px solid rgba(0, 234, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;
}

.stat-card:hover {
  border-color: var(--color-cyan, #00eaff);
  box-shadow: 0 0 20px rgba(0, 234, 255, 0.2);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 0 10px rgba(0, 234, 255, 0.3));
}

.stat-content {
  flex: 1;
}

.stat-content h4 {
  margin: 0 0 0.5rem 0;
  color: #999;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  margin: 0;
  color: var(--color-cyan, #00eaff);
  font-size: 2rem;
  font-weight: 800;
  text-shadow: 0 0 15px rgba(0, 234, 255, 0.5);
  line-height: 1;
}

.stat-value .unit {
  font-size: 1.25rem;
  color: #666;
  font-weight: 600;
}

.stat-label {
  color: #666;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

@media (max-width: 768px) {
  .stats-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-summary {
    grid-template-columns: 1fr;
  }
}
</style>
