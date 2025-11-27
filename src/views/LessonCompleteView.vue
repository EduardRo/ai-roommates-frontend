<template>
  <div class="lesson-complete-view">
    <div class="container">
      <div class="celebration-card">
        <div class="celebration-icon">{{ feedbackIcon }}</div>
        <h1>{{ feedbackTitle }}</h1>

        <div class="score-display">
          <div class="score-number">{{ scoreDisplay }}/10</div>
          <StarRating :score="scoreDisplay" size="large" />
        </div>

        <div class="message-box" :class="messageClass">
          <p>{{ messageText }}</p>
        </div>

        <div class="stats-row">
          <div class="stat">
            <span class="stat-label">Time Spent</span>
            <span class="stat-value">{{ timeSpent }} min</span>
          </div>
          <div class="stat">
            <span class="stat-label">Attempts</span>
            <span class="stat-value">{{ attempts }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <button v-if="nextLessonId" @click="goToNextLesson" class="btn primary-btn">
            Next Lesson →
          </button>
          <button @click="retryLesson" class="btn secondary-btn">🔄 Retry to Improve</button>
          <button @click="backToMenu" class="btn outline-btn">← Back to Menu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEducationStore } from '@/stores/educationStore'
import StarRating from '@/components/education/StarRating.vue'
import confetti from 'canvas-confetti'

const route = useRoute()
const router = useRouter()
const educationStore = useEducationStore()

const lessonId = route.params.lessonId

const scoreDisplay = computed(() => educationStore.sessionScore || 0)

const timeSpent = computed(() => educationStore.getSessionDuration || 0)

const progress = computed(() => educationStore.getLessonProgress(lessonId))

const attempts = computed(() => progress.value?.attempts || 1)

const unlockedLessons = computed(() => educationStore.unlockedLessons)

// Find next lesson
const nextLessonId = computed(() => {
  if (!educationStore.curriculum) return null

  // Find current lesson in curriculum
  for (const unit of educationStore.curriculum.units) {
    for (const chapter of unit.chapters) {
      const lessonIndex = chapter.lessons.findIndex((l) => l.lesson_id === lessonId)
      if (lessonIndex !== -1) {
        // Check if there's a next lesson in this chapter
        if (lessonIndex < chapter.lessons.length - 1) {
          const nextLesson = chapter.lessons[lessonIndex + 1]
          // Only return if it's unlocked
          return unlockedLessons.value.includes(nextLesson.lesson_id) ? nextLesson.lesson_id : null
        }
      }
    }
  }
  return null
})

const feedbackIcon = computed(() => {
  const score = scoreDisplay.value
  if (score > 8) return '🎉'
  if (score >= 6) return '🙂'
  return '😢'
})

const feedbackTitle = computed(() => {
  const score = scoreDisplay.value
  if (score > 8) return 'Lesson Complete!'
  if (score >= 6) return 'Good Effort!'
  return 'Keep Trying!'
})

const messageText = computed(() => {
  const score = scoreDisplay.value
  if (score > 8) return "🌟 Outstanding! You've mastered this lesson!"
  if (score >= 6) return "✅ Good job! You passed, but there's room to improve."
  return "📚 Don't give up! Review the theory and try again."
})

const messageClass = computed(() => {
  const score = scoreDisplay.value
  if (score > 8) return 'excellent'
  if (score >= 6) return 'good'
  return 'retry'
})

const goToNextLesson = () => {
  if (nextLessonId.value) {
    educationStore.resetSession()
    router.push(`/lesson/${nextLessonId.value}`)
  }
}

const retryLesson = () => {
  educationStore.resetSession()
  router.push(`/lesson/${lessonId}`)
}

const backToMenu = () => {
  educationStore.resetSession()
  router.push('/learn/math/grade-4')
}

onMounted(() => {
  // Make sure we have session data
  if (!educationStore.currentLesson) {
    // If no session, redirect back to menu
    router.push('/learn/math/grade-4')
    return
  }

  // Confetti only if score > 8
  if (scoreDisplay.value > 8) {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00eaff', '#a000ff', '#ffd700'], // Cyberpunk colors
    })
  }
})
</script>

<style scoped>
.lesson-complete-view {
  min-height: 100vh;
  /* Background handled by global body style */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  width: 100%;
  max-width: 600px;
}

.celebration-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-neon);
  border-radius: 24px;
  padding: 48px 40px;
  text-align: center;
  box-shadow: 0 0 40px rgba(160, 0, 255, 0.2);
  animation: slideUp 0.6s ease-out;
  backdrop-filter: blur(10px);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.celebration-icon {
  font-size: 5rem;
  animation: bounce 1s ease-in-out infinite;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-cyan);
  margin: 20px 0 32px;
  text-shadow: 0 0 10px var(--color-cyan);
}

.score-display {
  margin-bottom: 24px;
}

.score-number {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--color-neon);
  display: block;
  margin-bottom: 16px;
  text-shadow: 0 0 15px var(--color-neon);
}

.message-box {
  padding: 20px;
  border-radius: 12px;
  margin: 24px 0;
  font-size: 1.2rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.message-box.excellent {
  background: rgba(0, 234, 255, 0.1);
  color: var(--color-cyan);
  border-color: var(--color-cyan);
  box-shadow: 0 0 10px rgba(0, 234, 255, 0.2);
}

.message-box.good {
  background: rgba(160, 0, 255, 0.1);
  color: var(--color-neon);
  border-color: var(--color-neon);
}

.message-box.retry {
  background: rgba(255, 0, 100, 0.1);
  color: #ff0064;
  border-color: #ff0064;
}

.stats-row {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin: 32px 0;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text);
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 32px;
}

.btn {
  padding: 14px 28px;
  border-radius: 24px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.primary-btn {
  background: var(--color-neon);
  color: #000;
  box-shadow: 0 0 15px rgba(160, 0, 255, 0.4);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 25px rgba(160, 0, 255, 0.6);
}

.secondary-btn {
  background: var(--color-cyan);
  color: #000;
  box-shadow: 0 0 10px rgba(0, 234, 255, 0.3);
}

.secondary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 234, 255, 0.5);
}

.outline-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.outline-btn:hover {
  border-color: var(--color-neon);
  color: var(--color-neon);
  box-shadow: 0 0 10px rgba(160, 0, 255, 0.2);
}

@media (max-width: 768px) {
  .celebration-card {
    padding: 32px 24px;
  }

  h1 {
    font-size: 2rem;
  }

  .score-number {
    font-size: 2.5rem;
  }

  .stats-row {
    gap: 32px;
  }
}
</style>
