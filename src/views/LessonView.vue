<template>
  <div class="lesson-view">
    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading lesson...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h2>Error Loading Lesson</h2>
      <p>{{ error }}</p>
      <button @click="$router.back()" class="back-btn">Go Back</button>
    </div>

    <!-- Start Overlay -->
    <div v-else-if="!started" class="start-overlay">
      <div class="start-content">
        <h2>Ready to Learn?</h2>
        <p>Click below to start the lesson and enable the AI Tutor's voice.</p>
        <button @click="startLessonInteraction" class="start-btn">Start Lesson ▶</button>
      </div>
    </div>

    <!-- Lesson Content -->
    <div v-else-if="currentLesson" class="lesson-container">
      <!-- Header -->
      <div class="lesson-header">
        <button @click="handleBack" class="back-button">← Back</button>
        <div class="lesson-info">
          <h1>{{ currentLesson.title }}</h1>
          <div class="lesson-objectives">
            <strong>Learning Objectives:</strong>
            <ul>
              <li v-for="(obj, idx) in currentLesson.learning_objectives" :key="idx">{{ obj }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Phase 1: Theory -->
      <div v-if="currentPhase === 'theory'" class="phase-container">
        <div class="phase-header">
          <span class="phase-badge">Phase 1</span>
          <h2>📖 Learning Theory</h2>
        </div>

        <div class="theory-content">
          <div class="explanation-box">
            <h3>Let's Learn!</h3>
            <p class="explanation-text">{{ currentLesson.phase_1_theory.explanation_content }}</p>
          </div>

          <!-- Comprehension Questions -->
          <div
            v-if="currentLesson.phase_1_theory.comprehension_questions.length > 0"
            class="comprehension-section"
          >
            <h3>Check Your Understanding</h3>
            <QuestionCard
              v-for="(question, idx) in currentLesson.phase_1_theory.comprehension_questions"
              :key="idx"
              :question="question"
              :question-number="idx + 1"
              :selected-index="theoryAnswers[idx]"
              :show-feedback="theoryAnswers[idx] !== undefined"
              @select="(answerIdx) => handleTheoryAnswer(idx, answerIdx, question)"
            />
          </div>

          <!-- Example Exercises -->
          <div
            v-if="currentLesson.phase_1_theory.example_exercises.length > 0"
            class="examples-section"
          >
            <h3>📝 Example</h3>
            <div
              v-for="(example, idx) in currentLesson.phase_1_theory.example_exercises"
              :key="idx"
              class="example-box"
            >
              <p><strong>Problem:</strong> {{ example.problem }}</p>
              <p><strong>Solution:</strong> {{ example.solution }}</p>
              <p class="worked-solution">{{ example.worked_solution }}</p>
            </div>
          </div>

          <button @click="startPractice" class="continue-btn">Continue to Practice →</button>
        </div>
      </div>

      <!-- Phase 2: Practice -->
      <div v-else-if="currentPhase === 'practice'" class="phase-container">
        <div class="phase-header">
          <span class="phase-badge phase-2">Phase 2</span>
          <h2>✏️ Practice & Assessment</h2>
        </div>

        <ProgressBar :current="currentQuestionIndex + 1" :total="totalQuestions" />

        <div v-if="currentQuestionIndex < totalQuestions" class="practice-content">
          <QuestionCard
            :question="currentQuestion"
            :question-number="currentQuestionIndex + 1"
            :selected-index="practiceAnswers[currentQuestionIndex]"
            :show-feedback="practiceAnswers[currentQuestionIndex] !== undefined"
            :disabled="practiceAnswers[currentQuestionIndex] !== undefined"
            @select="(answerIdx) => handlePracticeAnswer(answerIdx)"
          />

          <div class="navigation-buttons">
            <button
              v-if="currentQuestionIndex > 0"
              @click="previousQuestion"
              class="nav-btn secondary"
            >
              ← Previous
            </button>
            <button
              v-if="currentQuestionIndex < totalQuestions - 1"
              @click="nextQuestion"
              class="nav-btn"
              :disabled="practiceAnswers[currentQuestionIndex] === undefined"
            >
              Next →
            </button>
            <button
              v-else
              @click="submitLesson"
              class="nav-btn submit-btn"
              :disabled="!allQuestionsAnswered"
            >
              Submit Answers ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEducationStore } from '@/stores/educationStore'
import QuestionCard from '@/components/education/QuestionCard.vue'
import ProgressBar from '@/components/education/ProgressBar.vue'
import {
  getWelcomeMessage,
  getPracticeStartMessage,
  getCorrectAnswerMessage,
  getWrongAnswerMessage,
  getMilestoneMessage,
  getLastQuestionMessage,
  getCompletionMessage,
} from '@/utils/tutorMessages'

const route = useRoute()
const router = useRouter()
const educationStore = useEducationStore()

const loading = ref(true)
const error = ref(null)
const theoryAnswers = ref([])
const practiceAnswers = ref([])
const currentQuestionIndex = ref(0)

const currentLesson = computed(() => educationStore.currentLesson)
const currentPhase = computed(() => educationStore.currentPhase)

const totalQuestions = computed(() => {
  return currentLesson.value?.phase_2_practice?.questions?.length || 0
})

const currentQuestion = computed(() => {
  if (!currentLesson.value?.phase_2_practice?.questions) return null
  return currentLesson.value.phase_2_practice.questions[currentQuestionIndex.value]
})

const allQuestionsAnswered = computed(() => {
  return (
    practiceAnswers.value.length === totalQuestions.value &&
    practiceAnswers.value.every((answer) => answer !== undefined)
  )
})

/**
 * Initialize lesson
 */
const initializeLesson = async () => {
  loading.value = true
  error.value = null

  // Hide tutor button during initialization
  educationStore.setTutorButton(false)

  try {
    const lessonId = route.params.lessonId
    await educationStore.startLesson(lessonId)

    // Initialize answer arrays
    theoryAnswers.value = []
    practiceAnswers.value = new Array(totalQuestions.value).fill(undefined)

    // Store theory content but DON'T show button yet (wait for user to click "Start Lesson")
    if (currentLesson.value && currentLesson.value.phase_1_theory) {
      educationStore.currentTheoryContent = currentLesson.value.phase_1_theory.explanation_content
    }

    // Note: Welcome message and button are triggered by startLessonInteraction
  } catch (err) {
    console.error('Failed to start lesson:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const started = ref(false)

const startLessonInteraction = () => {
  started.value = true

  // Now show the tutor button since lesson has actually started
  educationStore.setTutorButton(true, '💡 Want me to explain this differently?')

  // Welcome message from AI tutor - Triggered here to allow audio playback (requires user interaction)
  if (currentLesson.value) {
    educationStore.setTutorMessage(getWelcomeMessage(currentLesson.value.title))
  }
}

/**
 * Handle back button click
 */
const handleBack = () => {
  if (currentPhase.value === 'practice') {
    // If in practice phase, go back to theory
    educationStore.currentPhase = 'theory'
    // Restore tutor button for theory phase
    educationStore.setTutorButton(true, '💡 Want me to explain this differently?')
    // Optional: Restore welcome message or keep current
    if (currentLesson.value) {
      educationStore.setTutorMessage(getWelcomeMessage(currentLesson.value.title))
    }
  } else {
    // Clear tutor state when leaving lesson
    educationStore.setTutorButton(false)
    educationStore.setTutorMessage('')
    // Go back to previous page
    router.back()
  }
}

/**
 * Handle theory comprehension answer
 */
const handleTheoryAnswer = (questionIndex, answerIdx, question) => {
  theoryAnswers.value[questionIndex] = answerIdx

  // Check if answer is correct and give feedback
  if (question) {
    const isCorrect = answerIdx === question.correct_index
    if (isCorrect) {
      educationStore.setTutorMessage(getCorrectAnswerMessage())
    } else {
      educationStore.setTutorMessage(getWrongAnswerMessage())
    }
  }
}

/**
 * Start practice phase
 */
const startPractice = () => {
  educationStore.startPracticePhase()
  currentQuestionIndex.value = 0

  // Hide help button in practice phase
  educationStore.setTutorButton(false)

  // Practice start message
  educationStore.setTutorMessage(getPracticeStartMessage())
}

/**
 * Handle practice answer
 */
const handlePracticeAnswer = (answerIndex) => {
  // Prevent changing answer if already answered
  if (practiceAnswers.value[currentQuestionIndex.value] !== undefined) {
    console.log('[LessonView] Answer already selected, ignoring new selection')
    return
  }

  console.log('[LessonView] Answer selected:', answerIndex)
  practiceAnswers.value[currentQuestionIndex.value] = answerIndex
  educationStore.submitAnswer(currentQuestionIndex.value, answerIndex)

  // Check if answer is correct and celebrate/encourage
  const question = currentQuestion.value
  console.log('[LessonView] Current question:', question)
  if (question) {
    const isCorrect = answerIndex === question.correct_index
    console.log(
      '[LessonView] Answer correct?',
      isCorrect,
      'Selected:',
      answerIndex,
      'Correct:',
      question.correct_index,
    )
    if (isCorrect) {
      const message = getCorrectAnswerMessage()
      console.log('[LessonView] Setting correct message:', message)
      educationStore.setTutorMessage(message)
    } else {
      const message = getWrongAnswerMessage()
      console.log('[LessonView] Setting wrong message:', message)
      educationStore.setTutorMessage(message)
    }
  }
}

/**
 * Navigate questions
 */
const nextQuestion = () => {
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    currentQuestionIndex.value++

    // Milestone message at halfway point
    const halfway = Math.floor(totalQuestions.value / 2)
    if (currentQuestionIndex.value === halfway) {
      educationStore.setTutorMessage(getMilestoneMessage())
    }
    // Last question message
    else if (currentQuestionIndex.value === totalQuestions.value - 1) {
      educationStore.setTutorMessage(getLastQuestionMessage())
    }
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

/**
 * Submit lesson
 */
const submitLesson = async () => {
  loading.value = true

  try {
    await educationStore.completeLesson()

    // Celebration message based on score
    const score = educationStore.sessionScore
    educationStore.setTutorMessage(getCompletionMessage(score))

    router.push(`/lesson/${route.params.lessonId}/complete`)
  } catch (err) {
    console.error('Failed to submit lesson:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initializeLesson()
})
</script>

<style scoped>
.lesson-view {
  min-height: 100vh;
  /* Background handled by global body style */
  padding: 20px;
  padding-bottom: 100px; /* Space for tutor */
}

.loading-container,
.error-container {
  text-align: center;
  padding: 80px 20px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #2a2a35;
  border-top: 4px solid var(--color-neon);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
  box-shadow: 0 0 15px var(--color-neon);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  text-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
}

.lesson-container {
  max-width: 900px;
  margin: 0 auto;
}

.lesson-header {
  margin-bottom: 32px;
}

.back-button {
  background: transparent;
  border: 1px solid var(--color-neon);
  padding: 10px 20px;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-neon);
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.back-button:hover {
  background: var(--color-neon);
  color: #000;
  box-shadow: 0 0 12px var(--color-neon);
}

.lesson-info h1 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-cyan);
  text-shadow: 0 0 10px var(--color-cyan);
  margin-bottom: 16px;
}

.lesson-objectives {
  background: rgba(0, 234, 255, 0.1);
  padding: 16px 20px;
  border-radius: 12px;
  border-left: 4px solid var(--color-cyan);
}

.lesson-objectives ul {
  margin: 8px 0 0 20px;
}

.lesson-objectives li {
  color: var(--color-text);
  margin-bottom: 4px;
}

.phase-container {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 32px;
  box-shadow: var(--shadow-card);
}

.phase-header {
  margin-bottom: 24px;
}

.phase-badge {
  display: inline-block;
  background: var(--color-neon);
  color: #000;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 12px;
  box-shadow: 0 0 8px var(--color-neon);
}

.phase-badge.phase-2 {
  background: var(--color-cyan);
  box-shadow: 0 0 8px var(--color-cyan);
}

.phase-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  text-shadow: none;
}

.explanation-box {
  background: #1d1d26;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 32px;
  border: 1px solid var(--color-border);
}

.explanation-box h3 {
  color: var(--color-cyan);
  margin-bottom: 12px;
}

.explanation-text {
  line-height: 1.8;
  color: var(--color-text);
  font-size: 1.05rem;
}

.comprehension-section,
.examples-section {
  margin-bottom: 32px;
}

.comprehension-section h3,
.examples-section h3 {
  font-size: 1.3rem;
  margin-bottom: 16px;
  color: var(--color-heading);
}

.example-box {
  background: rgba(160, 0, 255, 0.1);
  border-left: 4px solid var(--color-neon);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.worked-solution {
  color: var(--color-text-muted);
  font-style: italic;
  margin-top: 8px;
}

.continue-btn {
  width: 100%;
  background: var(--color-neon);
  color: #000;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 24px;
  box-shadow: 0 0 15px rgba(160, 0, 255, 0.4);
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 25px rgba(160, 0, 255, 0.6);
}

.practice-content {
  margin-top: 24px;
}

.navigation-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
}

.nav-btn {
  background: var(--color-cyan);
  color: #000;
  border: none;
  padding: 12px 28px;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 0 10px rgba(0, 234, 255, 0.3);
}

.nav-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(0, 234, 255, 0.5);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #333;
  color: #666;
  box-shadow: none;
}

.nav-btn.secondary {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  box-shadow: none;
}

.nav-btn.secondary:hover {
  border-color: var(--color-cyan);
  color: var(--color-cyan);
}

.nav-btn.submit-btn {
  background: var(--color-neon);
  box-shadow: 0 0 10px rgba(160, 0, 255, 0.3);
}

.nav-btn.submit-btn:hover:not(:disabled) {
  box-shadow: 0 0 15px rgba(160, 0, 255, 0.5);
}

.tutor-overlay {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 9999;
}

@media (max-width: 768px) {
  .lesson-view {
    padding: 12px;
    padding-bottom: 180px;
  }

  .phase-container {
    padding: 20px;
  }

  .navigation-buttons {
    flex-direction: column;
  }

  .nav-btn {
    width: 100%;
  }

  .tutor-overlay {
    right: 50%;
    transform: translateX(50%);
    bottom: -50px;
  }
}

.start-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 10, 15, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.start-content {
  text-align: center;
  background: var(--color-card-bg);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 0 30px rgba(160, 0, 255, 0.2);
  max-width: 400px;
  width: 90%;
  border: 1px solid var(--color-neon);
}

.start-content h2 {
  color: var(--color-cyan);
  margin-bottom: 16px;
  font-size: 2rem;
  text-shadow: 0 0 10px var(--color-cyan);
}

.start-content p {
  color: var(--color-text);
  margin-bottom: 32px;
  font-size: 1.1rem;
  line-height: 1.5;
}

.start-btn {
  background: var(--color-neon);
  color: #000;
  border: none;
  padding: 16px 48px;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 20px rgba(160, 0, 255, 0.4);
}

.start-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 0 30px rgba(160, 0, 255, 0.6);
}
</style>
