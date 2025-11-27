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
  background: #f5f7fa;
}

.dashboard-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 20px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.user-info .email {
  margin: 4px 0 0 0;
  color: #666;
  font-size: 14px;
}

.btn-logout {
  padding: 10px 20px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: #d32f2f;
}

.trial-warning {
  max-width: 1200px;
  margin: 16px auto 0;
  padding: 12px 20px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  font-size: 14px;
}

.dashboard-main {
  padding: 40px 20px;
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
  font-size: 28px;
  color: #333;
}

.btn-add-child {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add-child:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 18px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.empty-state p {
  margin: 0 0 30px 0;
  color: #666;
  font-size: 16px;
}

.btn-primary {
  padding: 14px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.child-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.child-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.child-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.child-info h3 {
  margin: 0 0 4px 0;
  font-size: 20px;
  color: #333;
}

.username {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.card-body {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row .label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.info-row .value {
  color: #333;
  font-weight: 600;
  font-size: 14px;
}

.info-row .value.character {
  text-transform: capitalize;
  color: #667eea;
}

.card-footer {
  display: flex;
  gap: 12px;
}

.btn-edit,
.btn-view {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit {
  background: #667eea;
  color: white;
}

.btn-edit:hover {
  background: #5568d3;
}

.btn-view {
  background: #e0e0e0;
  color: #999;
}

.btn-view:disabled {
  cursor: not-allowed;
}
</style>
