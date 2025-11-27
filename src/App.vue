<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import AiTutor from './components/education/AiTutor.vue'
import { useEducationStore } from './stores/educationStore'

const route = useRoute()
const educationStore = useEducationStore()

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
