<template>
  <div class="curriculum-view">
    <div class="container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your curriculum...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h2>Oops! Something went wrong</h2>
        <p>{{ error }}</p>
        <button @click="initialize" class="retry-btn">Try Again</button>
      </div>

      <!-- Curriculum Content -->
      <div v-else-if="curriculum" class="curriculum-content">
        <!-- Page Header -->
        <nav class="top-nav">
          <button @click="$router.push('/student/dashboard')" class="back-btn">
            ← Back to Dashboard
          </button>
          <h1 class="page-title">📚 My Learning Journey</h1>
          <p class="page-subtitle">Grade 4 Mathematics</p>
        </nav>

        <!-- Overall Progress Card -->
        <section class="card progress-card">
          <h2>Your Progress</h2>

          <div class="progress-stats">
            <div class="stat-item">
              <h3>{{ completedCount }}</h3>
              <p>Lessons Completed</p>
            </div>
            <div class="stat-item">
              <h3>{{ totalProgress }}%</h3>
              <p>Overall Progress</p>
            </div>
          </div>

          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: totalProgress + '%' }"></div>
          </div>
        </section>

        <!-- Units and Chapters -->
        <div v-for="unit in curriculum.units" :key="unit.unit_id" class="unit-section">
          <UnitHeader :unit="unit" :completed-lessons-ids="completedLessonIds" />

          <div class="chapters-container">
            <ChapterSection
              v-for="chapter in unit.chapters"
              :key="chapter.chapter_id"
              :chapter="chapter"
              :completed-lessons="completedLessons"
              :unlocked-lessons="unlockedLessons"
              @lesson-click="handleLessonClick"
            />
          </div>
        </div>
      </div>

      <!-- Empty State (no curriculum) -->
      <div v-else class="empty-state">
        <div class="empty-icon">📖</div>
        <h2>No curriculum available</h2>
        <p>Please contact your teacher or administrator.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEducationStore } from '@/stores/educationStore'
import UnitHeader from '@/components/education/UnitHeader.vue'
import ChapterSection from '@/components/education/ChapterSection.vue'

const router = useRouter()
const educationStore = useEducationStore()

const loading = ref(true)
const error = ref(null)

const curriculum = computed(() => educationStore.curriculum)
const completedLessons = computed(() => educationStore.completedLessons)
const unlockedLessons = computed(() => educationStore.unlockedLessons)

const completedLessonIds = computed(() => completedLessons.value.map((l) => l.lesson_id))

const completedCount = computed(() => completedLessons.value.length)

const totalProgress = computed(() => educationStore.getTotalProgress)

/**
 * Initialize curriculum and progress
 */
const initialize = async () => {
  // Skip if curriculum is already loaded
  if (curriculum.value) {
    console.log('[CurriculumView] Curriculum already loaded, skipping initialization')
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    // Create a timeout promise
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out. Please check your connection.')), 10000)
    })

    // Race between initialization and timeout
    await Promise.race([educationStore.initialize('mathematics', 4), timeout])
  } catch (err) {
    console.error('Failed to load curriculum:', err)
    error.value = err.message || 'Failed to load curriculum. Please try again.'
  } finally {
    loading.value = false
  }
}

/**
 * Handle lesson click
 */
const handleLessonClick = (lessonId) => {
  router.push(`/lesson/${lessonId}`)
}

onMounted(() => {
  initialize()
})
</script>

<style scoped>
.curriculum-view {
  min-height: 100vh;
  /* Background handled by global body style, but we can add subtle pattern if needed */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 80px 20px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #2a2a35;
  border-top: 4px solid var(--color-neon);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
  box-shadow: 0 0 15px var(--color-neon);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: var(--color-text-muted);
  font-size: 1.1rem;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 80px 20px;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  text-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
}

.retry-btn {
  background: transparent;
  color: var(--color-neon);
  border: 1px solid var(--color-neon);
  padding: 12px 32px;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.retry-btn:hover {
  background: var(--color-neon);
  color: #000;
  box-shadow: 0 0 15px var(--color-neon);
}

/* Page Header */
.top-nav {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 0;
  background: transparent;
  border: 1px solid var(--color-neon);
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-neon);
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: var(--color-neon);
  color: #000;
  box-shadow: 0 0 12px var(--color-neon);
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 8px;
  color: var(--color-cyan);
  text-shadow: 0 0 12px var(--color-cyan);
}

.page-subtitle {
  font-size: 1.2rem;
  color: var(--color-text-muted);
}

/* Overall Progress Card */
.progress-card h2 {
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.progress-stats {
  display: flex;
  gap: 60px;
  margin-bottom: 24px;
}

.stat-item h3 {
  font-size: 2.5rem;
  color: var(--color-cyan);
  text-shadow: 0 0 10px var(--color-cyan);
  line-height: 1;
  margin-bottom: 8px;
}

.stat-item p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.progress-bar {
  height: 10px;
  background: #2a2a35;
  border-radius: 20px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-neon);
  border-radius: 20px;
  box-shadow: 0 0 10px var(--color-neon);
  transition: width 0.6s ease;
}

/* Unit Section */
.unit-section {
  margin-bottom: 40px;
}

.chapters-container {
  margin-top: 24px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  opacity: 0.7;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .top-nav {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .back-btn {
    position: static;
    align-self: flex-start;
  }

  .progress-stats {
    gap: 30px;
  }
}
</style>
