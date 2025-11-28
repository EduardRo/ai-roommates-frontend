<template>
  <div class="coach-widget">
    <div class="widget-header">
      <h3>{{ widgetTitle }}</h3>
    </div>

    <div class="widget-content">
      <!-- Latest insight (Student) -->
      <div v-if="userType === 'student' && topRecommendation" class="latest-insight">
        <p class="insight-label">💡 Recommendation:</p>
        <p class="insight-text">{{ topRecommendation }}</p>
      </div>

      <!-- Quick stats (Student) -->
      <div v-if="userType === 'student'" class="quick-stats">
        <div class="stat">
          <span class="stat-label">This Week:</span>
          <span class="stat-value">{{ weeklyStats.lessons }} lessons</span>
        </div>
        <div class="stat">
          <span class="stat-label">Average:</span>
          <span class="stat-value">{{ weeklyStats.average }}%</span>
        </div>
      </div>

      <!-- Quick stats (Parent) -->
      <div v-if="userType === 'parent'" class="children-summary">
        <div v-for="child in childrenSummary" :key="child.id" class="child-stat">
          <span class="child-name">{{ child.name }}:</span>
          <span :class="['status-badge', child.status]">
            {{ child.status }}
          </span>
        </div>
      </div>

      <!-- CTA Button -->
      <button @click="openCoach" class="coach-button">{{ buttonText }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCoachStore } from '@/stores/coachStore'

const props = defineProps({
  userType: {
    type: String,
    required: true,
  },
  userId: {
    type: Number,
    required: true,
  },
})

const router = useRouter()
const coachStore = useCoachStore()

const recommendations = ref([])
const weeklyStats = ref({ lessons: 0, average: 0 })
const childrenSummary = ref([])

const topRecommendation = computed(() => {
  if (recommendations.value.length > 0) {
    const rec = recommendations.value[0]
    // Format: "Review [lesson_id] (Overdue by X days)"
    return `Review lesson ${rec.lesson_id} (Overdue by ${rec.days_overdue} days)`
  }
  return null
})

const widgetTitle = computed(() => {
  return props.userType === 'student' ? '💬 Your Learning Coach' : '📊 Progress Insights'
})

const buttonText = computed(() => {
  return props.userType === 'student' ? 'Chat with Coach' : 'View Insights'
})

function openCoach() {
  const route = props.userType === 'student' ? '/student/coach' : '/parent/coach'
  router.push(route)
}

onMounted(async () => {
  // Get user ID robustly
  const userId =
    props.userId ||
    coachStore.userId ||
    (localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')) : null)

  if (!userId) {
    console.warn('[CoachWidget] Cannot load insights: User ID missing')
    return
  }

  try {
    // Load quick insights
    console.log('[CoachWidget] Fetching insights for user:', userId)
    const insights = await coachStore.getQuickInsights({
      userType: props.userType,
      userId: userId,
    })
    console.log('[CoachWidget] Received insights:', insights)

    if (props.userType === 'student') {
      recommendations.value = insights.recommendations || []
      weeklyStats.value = insights.weekly_stats || { lessons: 0, average: 0 }
      console.log('[CoachWidget] Set weekly stats:', weeklyStats.value)
    } else {
      childrenSummary.value = insights // Parent endpoint returns array directly
    }
  } catch (err) {
    console.error('[CoachWidget] Failed to load insights:', err)
  }
})
</script>

<style scoped>
.coach-widget {
  background: var(--color-card-bg, #14141b);
  border: 1px solid var(--color-border, #2a2a35);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 0 30px rgba(160, 0, 255, 0.15);
  transition: all 0.3s;
}

.coach-widget:hover {
  border-color: var(--color-neon, #a000ff);
  box-shadow: 0 0 40px rgba(160, 0, 255, 0.25);
}

.widget-header h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-cyan, #00eaff);
  text-shadow: 0 0 10px var(--color-cyan, #00eaff);
}

.latest-insight {
  background: rgba(160, 0, 255, 0.1);
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  border-left: 4px solid var(--color-neon, #a000ff);
  box-shadow: 0 0 15px rgba(160, 0, 255, 0.1);
}

.insight-label {
  font-size: 0.85rem;
  color: var(--color-neon, #a000ff);
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 0 5px var(--color-neon, #a000ff);
}

.insight-text {
  margin: 0;
  color: var(--color-text, #e0e0e0);
  font-size: 0.95rem;
  line-height: 1.5;
}

.quick-stats,
.children-summary {
  margin: 1rem 0;
}

.stat,
.child-stat {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border, #2a2a35);
}

.stat:last-child,
.child-stat:last-child {
  border-bottom: none;
}

.stat-label,
.child-name {
  color: var(--color-text-muted, #999);
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-value {
  color: var(--color-cyan, #00eaff);
  font-weight: 700;
  font-size: 1rem;
  text-shadow: 0 0 5px var(--color-cyan, #00eaff);
}

.status-badge {
  padding: 0.35rem 0.85rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.improving {
  background: rgba(0, 234, 255, 0.2);
  color: var(--color-cyan, #00eaff);
  border: 1px solid var(--color-cyan, #00eaff);
  box-shadow: 0 0 10px rgba(0, 234, 255, 0.3);
}

.status-badge.stable {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
}

.status-badge.declining {
  background: rgba(255, 0, 100, 0.2);
  color: #ff0064;
  border: 1px solid #ff0064;
  box-shadow: 0 0 10px rgba(255, 0, 100, 0.3);
}

.coach-button {
  width: 100%;
  padding: 0.9rem;
  background: var(--color-neon, #a000ff);
  color: #000;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s;
  box-shadow: 0 0 20px rgba(160, 0, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.coach-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(160, 0, 255, 0.6);
  background: var(--color-cyan, #00eaff);
}
</style>
