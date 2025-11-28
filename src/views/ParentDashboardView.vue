<template>
  <div class="parent-dashboard-view">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="user-info">
          <h1>Welcome, {{ authStore.userName || 'Parent' }}</h1>
          <p class="email">{{ authStore.user?.email }}</p>
        </div>
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </div>

      <!-- Trial Warning (if applicable) -->
      <div v-if="showTrialWarning" class="trial-warning">
        ⚠️ Your trial expires soon. Consider upgrading to continue learning.
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-main">
      <div class="content-container">
        <!-- Children Section Header -->
        <div class="section-header">
          <h2>Your Children</h2>
          <button @click="openAddChildModal" class="btn-add-child">+ Add Child</button>
        </div>

        <!-- Loading State -->
        <div v-if="studentsStore.loading" class="loading">Loading children...</div>

        <!-- Empty State -->
        <div v-else-if="studentsStore.children.length === 0" class="empty-state">
          <div class="empty-icon">👨‍👩‍👧‍👦</div>
          <h3>No children added yet</h3>
          <p>Create your first child profile to get started with AI-SYNTIA</p>
          <button @click="openAddChildModal" class="btn-primary">Add Your First Child</button>
        </div>

        <!-- Children Grid -->
        <div v-else class="children-grid">
          <div v-for="child in studentsStore.children" :key="child.id" class="child-card">
            <div class="card-header">
              <div class="child-avatar">
                {{ child.display_name.charAt(0).toUpperCase() }}
              </div>
              <div class="child-info">
                <h3>{{ child.display_name }}</h3>
                <p class="username">@{{ child.username }}</p>
              </div>
            </div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">Age:</span>
                <span class="value">{{ child.age }} years</span>
              </div>
              <div class="info-row">
                <span class="label">Grade:</span>
                <span class="value">{{ child.grade_level }}</span>
              </div>
              <div class="info-row">
                <span class="label">Tutor:</span>
                <span class="value character">{{ child.preferred_character }}</span>
              </div>
              <div class="info-row">
                <span class="label">Level:</span>
                <span class="value">{{ child.current_level }} ({{ child.total_xp }} XP)</span>
              </div>
              <div class="info-row">
                <span class="label">Time Limit:</span>
                <span class="value">{{ child.daily_time_limit_minutes }} min/day</span>
              </div>
            </div>

            <div class="card-footer">
              <button @click="openEditChildModal(child)" class="btn-edit">Edit</button>
              <button class="btn-view" disabled>View Progress (Soon)</button>
            </div>
          </div>
        </div>

        <!-- Progress Insights Section -->
        <div v-if="studentsStore.children.length > 0" class="insights-section">
          <h3 class="section-title">📊 Progress Insights</h3>
          <CoachWidget user-type="parent" :user-id="authStore.user?.id" />
        </div>
      </div>
    </main>

    <!-- Add/Edit Child Modal -->
    <ChildFormModal
      v-if="showChildModal"
      :child="selectedChild"
      @close="closeChildModal"
      @save="handleSaveChild"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useStudentsStore } from '@/stores/studentsStore'
import ChildFormModal from '@/components/parent/ChildFormModal.vue'
import CoachWidget from '@/components/dashboard/CoachWidget.vue'

const router = useRouter()
const authStore = useAuthStore()
const studentsStore = useStudentsStore()

const showChildModal = ref(false)
const selectedChild = ref(null)

// Mock trial warning (would come from backend subscription data)
const showTrialWarning = computed(() => {
  // TODO: Check actual subscription status from backend
  return false
})

onMounted(async () => {
  // Load user info if not already loaded
  if (!authStore.user) {
    await authStore.loadUserInfo()
  }

  // Fetch children
  await studentsStore.fetchChildren()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/parent/login')
}

const openAddChildModal = () => {
  selectedChild.value = null
  showChildModal.value = true
}

const openEditChildModal = (child) => {
  selectedChild.value = child
  showChildModal.value = true
}

const closeChildModal = () => {
  showChildModal.value = false
  selectedChild.value = null
}

const handleSaveChild = async () => {
  await studentsStore.fetchChildren()
  closeChildModal()
}
</script>

<style scoped>
.parent-dashboard-view {
  min-height: 100vh;
  background: var(--color-background, #0a0a0f);
  padding: 20px;
}

.dashboard-header {
  background: var(--color-card-bg, #14141b);
  border: 1px solid var(--color-border, #2a2a35);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 0 30px rgba(160, 0, 255, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info h1 {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-cyan, #00eaff);
  text-shadow: 0 0 10px var(--color-cyan, #00eaff);
}

.email {
  margin: 0;
  color: var(--color-text-muted, #999);
  font-size: 1rem;
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

.trial-warning {
  max-width: 1200px;
  margin: 16px auto 0;
  padding: 12px 20px;
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid #ffc107;
  border-radius: 12px;
  color: #ffc107;
  font-size: 14px;
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.2);
}

.dashboard-main {
  padding: 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header h2 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-cyan, #00eaff);
  text-shadow: 0 0 10px var(--color-cyan, #00eaff);
}

.btn-add-child {
  padding: 12px 24px;
  background: var(--color-neon, #a000ff);
  color: #000;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 20px rgba(160, 0, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-add-child:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(160, 0, 255, 0.6);
  background: var(--color-cyan, #00eaff);
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-muted, #999);
  font-size: 18px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: var(--color-card-bg, #14141b);
  border: 1px solid var(--color-border, #2a2a35);
  border-radius: 20px;
  box-shadow: 0 0 30px rgba(160, 0, 255, 0.1);
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 10px rgba(160, 0, 255, 0.5));
}

.empty-state h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: var(--color-cyan, #00eaff);
  text-shadow: 0 0 10px var(--color-cyan, #00eaff);
}

.empty-state p {
  margin: 0 0 30px 0;
  color: var(--color-text-muted, #999);
  font-size: 16px;
}

.btn-primary {
  padding: 14px 28px;
  background: var(--color-neon, #a000ff);
  color: #000;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 20px rgba(160, 0, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(160, 0, 255, 0.6);
  background: var(--color-cyan, #00eaff);
}

.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.child-card {
  background: var(--color-card-bg, #14141b);
  border: 1px solid var(--color-border, #2a2a35);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 0 20px rgba(160, 0, 255, 0.1);
}

.child-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-neon, #a000ff);
  box-shadow: 0 0 30px rgba(160, 0, 255, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(160, 0, 255, 0.1);
  border-bottom: 1px solid var(--color-border, #2a2a35);
}

.child-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-neon, #a000ff);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  box-shadow: 0 0 20px rgba(160, 0, 255, 0.5);
}

.child-info h3 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-cyan, #00eaff);
  text-shadow: 0 0 5px var(--color-cyan, #00eaff);
}

.username {
  margin: 0;
  color: var(--color-text-muted, #999);
  font-size: 14px;
}

.card-body {
  padding: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border, #2a2a35);
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  color: var(--color-text-muted, #999);
  font-size: 14px;
  font-weight: 500;
}

.info-row .value {
  color: var(--color-text, #e0e0e0);
  font-weight: 600;
  font-size: 14px;
}

.info-row .value.character {
  text-transform: capitalize;
  color: var(--color-neon, #a000ff);
  text-shadow: 0 0 5px var(--color-neon, #a000ff);
}

.card-footer {
  display: flex;
  gap: 12px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
}

.btn-edit,
.btn-view {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.btn-edit {
  background: var(--color-cyan, #00eaff);
  color: #000;
  box-shadow: 0 0 15px rgba(0, 234, 255, 0.3);
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 234, 255, 0.5);
}

.btn-view {
  background: transparent;
  color: var(--color-text-muted, #666);
  border: 1px solid var(--color-border, #2a2a35);
  cursor: not-allowed;
}

.btn-view:disabled {
  cursor: not-allowed;
}

.insights-section {
  margin-top: 40px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-cyan, #00eaff);
  margin-bottom: 20px;
  text-shadow: 0 0 10px var(--color-cyan, #00eaff);
}

@media (max-width: 768px) {
  .parent-dashboard-view {
    padding: 12px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .children-grid {
    grid-template-columns: 1fr;
  }
}
</style>
