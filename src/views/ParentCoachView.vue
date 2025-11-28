<template>
  <div class="parent-coach-view">
    <!-- Child selector (if multiple children) -->
    <div v-if="children.length > 1" class="child-selector">
      <label>View insights for:</label>
      <select v-model="selectedChildId">
        <option :value="null">All children</option>
        <option v-for="child in children" :key="child.id" :value="child.id">
          {{ child.display_name }}
        </option>
      </select>
    </div>

    <div v-if="authStore.userId" class="coach-container">
      <ChatInterface user-type="parent" :user-id="authStore.userId" :child-id="selectedChildId" />
    </div>
    <div v-else class="loading">Loading...</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import ChatInterface from '@/components/coach/ChatInterface.vue'

const authStore = useAuthStore()
const children = computed(() => authStore.user?.children || [])
const selectedChildId = ref(null)
</script>

<style scoped>
.parent-coach-view {
  min-height: 100vh;
  background: var(--color-background, #0a0a0f);
  padding: 2rem;
}

.child-selector {
  max-width: 1000px;
  margin: 0 auto 1.5rem;
  padding: 1rem 1.5rem;
  background: var(--color-card-bg, #14141b);
  border: 1px solid var(--color-border, #2a2a35);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 0 20px rgba(160, 0, 255, 0.1);
}

.child-selector label {
  color: var(--color-cyan, #00eaff);
  font-weight: 600;
  text-shadow: 0 0 5px var(--color-cyan, #00eaff);
}

.child-selector select {
  flex: 1;
  padding: 0.75rem;
  background: rgba(20, 20, 27, 0.8);
  border: 1px solid var(--color-border, #2a2a35);
  border-radius: 8px;
  color: var(--color-text, #e0e0e0);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.child-selector select:focus {
  outline: none;
  border-color: var(--color-cyan, #00eaff);
  box-shadow: 0 0 10px rgba(0, 234, 255, 0.3);
}

.coach-container {
  max-width: 1000px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: var(--color-text-muted, #999);
  font-size: 1.2rem;
}
</style>
