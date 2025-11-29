<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed, onMounted, onBeforeUnmount } from 'vue'
import AiTutor from './components/education/AiTutor.vue'
import { useEducationStore } from './stores/educationStore'
import { useAuthStore } from './stores/authStore'
import { useMetricsStore } from './stores/metricsStore'

const route = useRoute()
const educationStore = useEducationStore()
const authStore = useAuthStore()
const metricsStore = useMetricsStore()

// Show tutor only on lesson pages
const showTutor = computed(() => route.path.startsWith('/lesson'))

// Get tutor message from store
const tutorMessage = computed(() => educationStore.tutorMessage)

// Get button state from store
const showButton = computed(() => educationStore.showTutorButton)
const buttonText = computed(() => educationStore.tutorButtonText)

// Handle button click - trigger explanation request
const handleTutorButtonClick = () => {
  educationStore.requestAIExplanation()
}

// Metrics tracking lifecycle
onMounted(() => {
  // Start metrics if user is already logged in
  if (authStore.isAuthenticated) {
    metricsStore.startTracking()
  }

  // Listen for tab visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // End session on browser close
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

function handleVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    metricsStore.pauseTracking()
  } else {
    metricsStore.resumeTracking()
  }
}

function handleBeforeUnload() {
  // End session when browser/tab closes
  metricsStore.stopTracking('close')
}
</script>

<template>
  <RouterView />

  <!-- Global AI Tutor - mounts only on lesson pages to avoid conflicts -->
  <div v-if="showTutor" class="global-tutor-overlay">
    <AiTutor
      :message="tutorMessage"
      :show-button="showButton"
      :button-text="buttonText"
      @button-click="handleTutorButtonClick"
    />
  </div>
</template>

<style>
.global-tutor-overlay {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 9999;
  pointer-events: none; /* Don't block page interactions */
}
</style>
