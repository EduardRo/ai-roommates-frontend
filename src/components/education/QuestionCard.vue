<template>
  <div class="question-card">
    <div class="question-header">
      <span class="question-number">Question {{ questionNumber }}</span>
      <span
        v-if="showFeedback && feedback"
        class="feedback-badge"
        :class="feedback.isCorrect ? 'correct' : 'incorrect'"
      >
        {{ feedback.isCorrect ? '✓ Correct' : '✗ Incorrect' }}
      </span>
    </div>

    <div class="question-text">
      {{ question.question }}
    </div>

    <div class="options">
      <div
        v-for="(option, index) in question.options"
        :key="index"
        class="option"
        :class="{
          selected: selectedIndex === index,
          correct: showFeedback && index === question.correct_index,
          incorrect: showFeedback && selectedIndex === index && index !== question.correct_index,
          disabled: disabled,
        }"
        @click="handleSelect(index)"
      >
        <span class="option-letter">{{ getOptionLetter(index) }}</span>
        <span class="option-text">{{ option }}</span>
        <span v-if="showFeedback && index === question.correct_index" class="check-icon">✓</span>
      </div>
    </div>

    <div v-if="showFeedback && question.explanation" class="explanation">
      <div class="explanation-header">💡 Explanation</div>
      <p>{{ question.explanation }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  question: {
    type: Object, // { question, options, correct_index, explanation }
    required: true,
  },
  questionNumber: {
    type: Number,
    required: true,
  },
  selectedIndex: {
    type: Number,
    default: null,
  },
  showFeedback: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])

const feedback = computed(() => {
  if (!props.showFeedback || props.selectedIndex === null) return null
  return {
    isCorrect: props.selectedIndex === props.question.correct_index,
  }
})

const handleSelect = (index) => {
  if (!props.disabled) {
    emit('select', index)
  }
}

const getOptionLetter = (index) => {
  return String.fromCharCode(65 + index) // A, B, C, D...
}
</script>

<style scoped>
.question-card {
  background: #1d1d26;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--color-border);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.question-number {
  font-weight: 700;
  color: var(--color-neon);
  font-size: 1.1rem;
  text-shadow: 0 0 5px var(--color-neon);
}

.feedback-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.feedback-badge.correct {
  background: rgba(0, 234, 255, 0.2);
  color: var(--color-cyan);
  border: 1px solid var(--color-cyan);
  box-shadow: 0 0 8px var(--color-cyan);
}

.feedback-badge.incorrect {
  background: rgba(255, 0, 100, 0.2);
  color: #ff0064;
  border: 1px solid #ff0064;
  box-shadow: 0 0 8px #ff0064;
}

.question-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 20px;
  line-height: 1.6;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.03);
}

.option:hover:not(.disabled) {
  border-color: var(--color-neon);
  background: rgba(160, 0, 255, 0.1);
  box-shadow: 0 0 10px rgba(160, 0, 255, 0.2);
}

.option.selected {
  border-color: var(--color-cyan);
  background: rgba(0, 234, 255, 0.1);
  box-shadow: 0 0 10px rgba(0, 234, 255, 0.2);
}

.option.correct {
  border-color: var(--color-cyan);
  background: rgba(0, 234, 255, 0.2);
  box-shadow: 0 0 15px rgba(0, 234, 255, 0.3);
}

.option.incorrect {
  border-color: #ff0064;
  background: rgba(255, 0, 100, 0.2);
  box-shadow: 0 0 15px rgba(255, 0, 100, 0.3);
}

.option.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.option-letter {
  font-weight: 700;
  color: var(--color-text);
  min-width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
  transition: all 0.2s;
}

.option:hover:not(.disabled) .option-letter {
  background: var(--color-neon);
  color: #000;
}

.option.selected .option-letter,
.option.correct .option-letter {
  background: var(--color-cyan);
  color: #000;
  box-shadow: 0 0 8px var(--color-cyan);
}

.option.incorrect .option-letter {
  background: #ff0064;
  color: white;
  box-shadow: 0 0 8px #ff0064;
}

.option-text {
  flex: 1;
  color: var(--color-text);
  font-size: 1rem;
}

.check-icon {
  color: var(--color-cyan);
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 0 0 5px var(--color-cyan);
}

.explanation {
  margin-top: 20px;
  padding: 16px;
  background: rgba(0, 234, 255, 0.05);
  border-left: 4px solid var(--color-cyan);
  border-radius: 8px;
}

.explanation-header {
  font-weight: 700;
  color: var(--color-cyan);
  margin-bottom: 8px;
  font-size: 1rem;
}

.explanation p {
  margin: 0;
  color: var(--color-text);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .question-card {
    padding: 16px;
  }

  .option {
    padding: 12px;
  }
}
</style>
