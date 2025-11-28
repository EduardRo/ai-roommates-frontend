<template>
  <div class="review-widget" v-if="reviews.length > 0">
    <div class="widget-header">
      <h3>🧠 Memory Boost</h3>
      <span class="badge">{{ reviews.length }} due</span>
    </div>

    <div class="review-list">
      <div v-for="review in reviews" :key="review.lesson_id" class="review-item">
        <div class="review-info">
          <span class="lesson-id">{{ formatLessonId(review.lesson_id) }}</span>
          <span class="overdue-tag" :class="{ urgent: review.urgency > 20 }">
            {{ formatOverdue(review.days_overdue) }}
          </span>
        </div>
        <button @click="startReview(review.lesson_id)" class="review-btn">Review</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCoachStore } from '@/stores/coachStore'

const props = defineProps({
  studentId: { type: Number, required: true },
})

const router = useRouter()
const coachStore = useCoachStore()
const reviews = ref([])

function formatLessonId(id) {
  // Convert "math_3_2" to "Math 3.2"
  return id
    .replace(/_/g, ' ')
    .replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase())
}

function formatOverdue(days) {
  if (days <= 0) return 'Due today'
  return `${days} day${days > 1 ? 's' : ''} overdue`
}

function startReview(lessonId) {
  router.push({
    name: 'lesson',
    params: { lessonId },
    query: { mode: 'review' },
  })
}

onMounted(async () => {
  reviews.value = await coachStore.getReviewRecommendations(props.studentId)
})
</script>

<style scoped>
.review-widget {
  background: var(--color-card-bg, #14141b);
  border: 1px solid var(--color-border, #2a2a35);
  border-radius: 20px;
  padding: 1.5rem;
  margin-top: 1rem;
  border-left: 4px solid var(--color-neon, #a000ff);
  box-shadow: 0 0 30px rgba(160, 0, 255, 0.15);
  transition: all 0.3s;
}

.review-widget:hover {
  border-color: var(--color-neon, #a000ff);
  box-shadow: 0 0 40px rgba(160, 0, 255, 0.25);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.widget-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-neon, #a000ff);
  text-shadow: 0 0 10px var(--color-neon, #a000ff);
}

.badge {
  background: var(--color-neon, #a000ff);
  color: #000;
  padding: 0.35rem 0.85rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 0 15px rgba(160, 0, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--color-border, #2a2a35);
  transition: all 0.2s;
}

.review-item:hover {
  padding-left: 0.5rem;
  border-left: 3px solid var(--color-cyan, #00eaff);
}

.review-item:last-child {
  border-bottom: none;
}

.review-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.lesson-id {
  font-weight: 700;
  color: var(--color-text, #e0e0e0);
  font-size: 1rem;
}

.overdue-tag {
  font-size: 0.8rem;
  color: var(--color-text-muted, #999);
}

.overdue-tag.urgent {
  color: #ff0064;
  font-weight: 700;
  text-shadow: 0 0 5px #ff0064;
}

.review-btn {
  padding: 0.5rem 1.2rem;
  background: transparent;
  border: 1px solid var(--color-cyan, #00eaff);
  color: var(--color-cyan, #00eaff);
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.review-btn:hover {
  background: var(--color-cyan, #00eaff);
  color: #000;
  box-shadow: 0 0 15px rgba(0, 234, 255, 0.5);
  transform: translateY(-2px);
}
</style>
