<template>
  <div class="student-dashboard-view">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="student-info">
          <div class="avatar">{{ studentInitial }}</div>
          <div class="info-text">
            <h1>Hey, {{ authStore.user?.display_name || 'Student' }}! 👋</h1>
            <p class="level-info">
              Level {{ authStore.user?.current_level || 1 }} •
              {{ authStore.user?.total_xp || 0 }} XP
            </p>
          </div>
        </div>
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-main">
      <div class="content-container">
        <!-- Welcome Card -->
        <div class="welcome-card">
          <div class="character-display">
            <div class="character-icon">
              {{ characterEmoji }}
            </div>
            <p class="character-name">Your tutor: {{ characterName }}</p>
          </div>

          <div class="welcome-message">
            <h2>Ready to learn something awesome today?</h2>
            <p>Let's explore new topics and have fun learning!</p>
          </div>

          <div class="action-buttons">
            <button class="btn-start-learning" @click="startLearning">Start Learning 🚀</button>
            <button class="btn-view-metrics" @click="viewMetrics">View My Progress 📊</button>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📚</div>
            <div class="stat-value">{{ authStore.user?.current_level || 1 }}</div>
            <div class="stat-label">Current Level</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-value">{{ authStore.user?.total_xp || 0 }}</div>
            <div class="stat-label">Total XP</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-value">{{ authStore.user?.grade_level || '-' }}</div>
            <div class="stat-label">Grade Level</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-value">{{ authStore.user?.daily_time_limit_minutes || 60 }}</div>
            <div class="stat-label">Daily Minutes</div>
          </div>
        </div>

        <!-- AI Coach Section -->
        <div class="coach-section">
          <h3 class="section-title">🤖 Your AI Learning Coach</h3>
          <div v-if="studentId">
            <CoachWidget user-type="student" :user-id="studentId" />
            <ReviewWidget :student-id="studentId" />
          </div>
        </div>

        <!-- Coming Soon Section -->
        <div class="coming-soon">
          <h3>Coming Soon! 🎉</h3>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">📖</div>
              <p>Lessons & Chapters</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🏆</div>
              <p>Achievements & Badges</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🎮</div>
              <p>Fun Learning Games</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🌟</div>
              <p>Rewards & Prizes</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import CoachWidget from '@/components/dashboard/CoachWidget.vue'
import ReviewWidget from '@/components/dashboard/ReviewWidget.vue'

const router = useRouter()
const authStore = useAuthStore()

const studentInitial = computed(() => {
  const name = authStore.user?.display_name || 'S'
  return name.charAt(0).toUpperCase()
})

const characterName = computed(() => {
  const char = authStore.user?.preferred_character || 'aria'
  return char.charAt(0).toUpperCase() + char.slice(1)
})

const characterEmoji = computed(() => {
  const char = authStore.user?.preferred_character || 'aria'
  const emojiMap = {
    aria: '💙',
    sera: '🧠',
    eidon: '✨',
  }
  return emojiMap[char] || '🎓'
})

const studentId = computed(() => {
  return (
    authStore.user?.id ||
    authStore.userId ||
    (localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')) : null)
  )
})

onMounted(async () => {
  // Load student info if not already loaded
  if (!authStore.user) {
    await authStore.loadUserInfo()
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/student/login')
}

const startLearning = () => {
  router.push('/learn/math/grade-4')
}

const viewMetrics = () => {
  router.push('/student/metrics')
}
</script>

<style scoped>
.student-dashboard-view {
  min-height: 100vh;
  /* Background handled by global body style */
  padding: 20px;
}

.dashboard-header {
  background: var(--color-card-bg);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  margin-bottom: 30px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-neon) 0%, var(--color-cyan) 100%);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
  box-shadow: 0 0 20px var(--color-neon);
  border: 2px solid var(--color-neon);
}

.info-text h1 {
  margin: 0;
  font-size: 24px;
  color: var(--color-cyan);
  font-weight: 800;
  text-shadow: 0 0 10px var(--color-cyan);
}

.level-info {
  margin: 4px 0 0 0;
  color: var(--color-text-muted);
  font-size: 15px;
  font-weight: 600;
}

.btn-logout {
  padding: 10px 20px;
  background: transparent;
  color: #ff0064;
  border: 1px solid #ff0064;
  border-radius: 24px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: #ff0064;
  color: #000;
  transform: translateY(-2px);
  box-shadow: 0 0 15px #ff0064;
}

.dashboard-main {
  padding: 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.welcome-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-neon);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 0 40px rgba(160, 0, 255, 0.2);
  text-align: center;
  backdrop-filter: blur(10px);
}

.character-display {
  margin-bottom: 30px;
}

.character-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--color-cyan) 0%, var(--color-neon) 100%);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  box-shadow: 0 0 30px var(--color-cyan);
  margin-bottom: 16px;
  border: 2px solid var(--color-cyan);
}

.character-name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-cyan);
  text-shadow: 0 0 8px var(--color-cyan);
}

.welcome-message h2 {
  margin: 0 0 12px 0;
  font-size: 32px;
  color: var(--color-text);
  font-weight: 800;
}

.welcome-message p {
  margin: 0 0 30px 0;
  font-size: 18px;
  color: var(--color-text-muted);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-start-learning {
  padding: 18px 40px;
  background: var(--color-neon);
  color: #000;
  border: none;
  border-radius: 30px;
  font-size: 20px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 25px rgba(160, 0, 255, 0.4);
}

.btn-start-learning:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 0 40px rgba(160, 0, 255, 0.6);
}

.btn-view-metrics {
  padding: 18px 40px;
  background: rgba(0, 234, 255, 0.1);
  color: var(--color-cyan);
  border: 2px solid var(--color-cyan);
  border-radius: 30px;
  font-size: 20px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 15px rgba(0, 234, 255, 0.2);
}

.btn-view-metrics:hover {
  background: rgba(0, 234, 255, 0.2);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 0 30px rgba(0, 234, 255, 0.4);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  box-shadow: var(--shadow-card);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: var(--color-cyan);
  box-shadow: 0 0 20px rgba(0, 234, 255, 0.3);
}

.stat-icon {
  font-size: 40px;
  margin-bottom: 12px;
  filter: drop-shadow(0 0 8px rgba(0, 234, 255, 0.5));
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  color: var(--color-cyan);
  margin-bottom: 8px;
  text-shadow: 0 0 10px var(--color-cyan);
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-muted);
  font-weight: 600;
}

.coming-soon {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  box-shadow: var(--shadow-card);
}

.coming-soon h3 {
  margin: 0 0 30px 0;
  font-size: 28px;
  color: var(--color-heading);
  font-weight: 800;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.feature-card {
  background: rgba(160, 0, 255, 0.1);
  border: 1px solid rgba(160, 0, 255, 0.3);
  border-radius: 16px;
  padding: 30px 20px;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: scale(1.05);
  border-color: var(--color-neon);
  box-shadow: 0 0 15px rgba(160, 0, 255, 0.3);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 12px;
  filter: drop-shadow(0 0 8px rgba(160, 0, 255, 0.5));
}

.feature-card p {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}

.coach-section {
  margin-top: 20px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-cyan);
  margin-bottom: 20px;
  text-shadow: 0 0 10px var(--color-cyan);
}

@media (max-width: 768px) {
  .student-dashboard-view {
    padding: 12px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .welcome-card {
    padding: 30px 20px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
