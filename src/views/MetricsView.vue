<template>
  <div class="metrics-view">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <button @click="goBack" class="back-button">← Back</button>
        <h1>📊 My Learning Progress</h1>
        <p class="subtitle">Track your performance and growth</p>
      </div>

      <!-- Loading State -->
      <div v-if="initialLoading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading your metrics...</p>
      </div>

      <!-- Content -->
      <div v-else class="metrics-content">
        <!-- Stats Summary Cards -->
        <StatsSummary :stats="overallStats" />

        <!-- Performance Chart -->
        <PerformanceChart
          :chart-data="performanceData"
          :loading="performanceLoading"
          :selected-range="selectedTimeRange"
          @range-change="handleRangeChange"
        />

        <!-- Progress Overview -->
        <ProgressOverview :progress="progressData" :loading="progressLoading" />

        <!-- Insights Section -->
        <div v-if="insights.length > 0" class="insights-section">
          <h3>💡 Insights & Recommendations</h3>
          <div class="insights-list">
            <div v-for="(insight, index) in insights" :key="index" class="insight-card">
              <span class="insight-icon">{{ insight.icon }}</span>
              <p>{{ insight.message }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import metricsDataService from '@/services/metricsDataService'
import StatsSummary from '@/components/metrics/StatsSummary.vue'
import PerformanceChart from '@/components/metrics/PerformanceChart.vue'
import ProgressOverview from '@/components/metrics/ProgressOverview.vue'

const router = useRouter()
const authStore = useAuthStore()

const initialLoading = ref(true)
const performanceLoading = ref(false)
const progressLoading = ref(false)

const selectedTimeRange = ref('30d')
const overallStats = ref({
  total_lessons: 0,
  avg_score: 0,
  total_stars: 0,
  mastered_lessons: 0,
})

const performanceData = ref({
  dates: [],
  scores: [],
  lessons: [],
  stars: [],
  attempts: [],
})

const progressData = ref({
  total_lessons: 0,
  completed_count: 0,
  completion_percentage: 0,
  lessons: [],
  unlocked_lessons: [],
})

const insights = computed(() => {
  const result = []

  // Generate insights based on data
  if (overallStats.value.avg_score >= 8) {
    result.push({
      icon: '🌟',
      message: "Excellent performance! You're mastering the material.",
    })
  } else if (overallStats.value.avg_score < 6) {
    result.push({
      icon: '📚',
      message: 'Consider reviewing previous lessons to strengthen your foundation.',
    })
  }

  if (overallStats.value.total_lessons >= 10) {
    result.push({
      icon: '🏆',
      message: `Great progress! You've completed ${overallStats.value.total_lessons} lessons.`,
    })
  }

  if (progressData.value.completion_percentage >= 50) {
    result.push({
      icon: '🎯',
      message: "You're halfway through the curriculum! Keep it up!",
    })
  }

  return result
})

onMounted(async () => {
  await loadAllMetrics()
  initialLoading.value = false
})

async function loadAllMetrics() {
  const studentId = authStore.user?.id || authStore.userId

  if (!studentId) {
    console.error('[MetricsView] No student ID available')
    return
  }

  try {
    // Load all metrics in parallel
    await Promise.all([
      loadOverallStats(studentId),
      loadPerformanceData(studentId),
      loadProgressData(studentId),
    ])
  } catch (error) {
    console.error('[MetricsView] Failed to load metrics:', error)
  }
}

async function loadOverallStats(studentId) {
  try {
    overallStats.value = await metricsDataService.getOverallStats(studentId)
  } catch (error) {
    console.error('[MetricsView] Failed to load overall stats:', error)
  }
}

async function loadPerformanceData(studentId) {
  performanceLoading.value = true
  try {
    performanceData.value = await metricsDataService.getPerformanceTrend(
      studentId,
      selectedTimeRange.value,
    )
  } catch (error) {
    console.error('[MetricsView] Failed to load performance data:', error)
  } finally {
    performanceLoading.value = false
  }
}

async function loadProgressData(studentId) {
  progressLoading.value = true
  try {
    progressData.value = await metricsDataService.getProgressBreakdown(studentId)
  } catch (error) {
    console.error('[MetricsView] Failed to load progress data:', error)
  } finally {
    progressLoading.value = false
  }
}

async function handleRangeChange(newRange) {
  selectedTimeRange.value = newRange
  const studentId = authStore.user?.id || authStore.userId
  await loadPerformanceData(studentId)
}

function goBack() {
  router.push('/student/dashboard')
}
</script>

<style scoped>
.metrics-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a25 0%, #0d0d15 100%);
  padding: 2rem 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  position: relative;
}

.back-button {
  background: rgba(0, 234, 255, 0.1);
  border: 1px solid rgba(0, 234, 255, 0.3);
  border-radius: 8px;
  color: var(--color-cyan, #00eaff);
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 1rem;
}

.back-button:hover {
  background: rgba(0, 234, 255, 0.2);
  box-shadow: 0 0 15px rgba(0, 234, 255, 0.3);
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  color: var(--color-cyan, #00eaff);
  font-size: 2.5rem;
  text-shadow: 0 0 20px rgba(0, 234, 255, 0.5);
}

.subtitle {
  margin: 0;
  color: #999;
  font-size: 1.125rem;
}

.loading-container {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
}

.spinner {
  width: 60px;
  height: 60px;
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

.metrics-content {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.insights-section {
  background: rgba(26, 26, 37, 0.6);
  border: 1px solid rgba(176, 38, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.insights-section h3 {
  margin: 0 0 1rem 0;
  color: var(--color-purple, #b026ff);
  font-size: 1.25rem;
  text-shadow: 0 0 10px rgba(176, 38, 255, 0.5);
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.insight-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(176, 38, 255, 0.05);
  border: 1px solid rgba(176, 38, 255, 0.2);
  border-radius: 12px;
  transition: all 0.3s;
}

.insight-card:hover {
  border-color: var(--color-purple, #b026ff);
  box-shadow: 0 0 15px rgba(176, 38, 255, 0.2);
}

.insight-icon {
  font-size: 2rem;
  filter: drop-shadow(0 0 10px rgba(176, 38, 255, 0.3));
}

.insight-card p {
  margin: 0;
  color: #ccc;
  font-size: 1rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .metrics-view {
    padding: 1rem 0.5rem;
  }
}
</style>
