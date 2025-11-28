<template>
  <div class="quick-actions">
    <p class="quick-actions-label">{{ labelText }}:</p>
    <div class="action-buttons">
      <button
        v-for="action in actions"
        :key="action"
        @click="$emit('select', action)"
        class="action-button"
      >
        {{ action }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  userType: {
    type: String,
    required: true,
  },
})

defineEmits(['select'])

const labelText = computed(() => {
  return props.userType === 'student' ? 'Quick questions' : 'Common questions'
})

const actions = computed(() => {
  if (props.userType === 'student') {
    return [
      'How am I doing overall?',
      'What should I study next?',
      'Why am I struggling with this topic?',
      'How can I remember things better?',
      'Am I studying too fast or too slow?',
    ]
  } else {
    return [
      'How is my child progressing?',
      'What topics are they working on?',
      'Are there any areas of concern?',
      'What are their strengths?',
      'How can I support their learning?',
    ]
  }
})
</script>

<style scoped>
.quick-actions {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #221232;
  border-radius: 8px;
}

.quick-actions-label {
  font-size: 0.875rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.action-button {
  padding: 0.5rem 1rem;
  background: rgba(43, 29, 104, 0.432);
  border: 1px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  color: #ffffff;
}

.action-button:hover {
  background: #007bff;
  color: white;
  border-color: #007bff;
}
</style>
