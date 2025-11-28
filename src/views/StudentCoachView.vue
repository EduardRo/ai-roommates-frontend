<template>
  <div class="student-coach-view">
    <div v-if="authStore.userId" class="coach-container">
      <ChatInterface user-type="student" :user-id="authStore.userId" />
    </div>
    <div v-else class="loading">Loading...</div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import ChatInterface from '@/components/coach/ChatInterface.vue'

const authStore = useAuthStore()
</script>

<style scoped>
.student-coach-view {
  min-height: 100vh;
  background: var(--color-background, #0a0a0f);
  padding: 2rem;
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
