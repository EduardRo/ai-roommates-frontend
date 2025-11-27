/**
 * Education Store
 * Manages curriculum, student progress, and lesson session state
 */

import { defineStore } from 'pinia'
import { educationService } from '@/services/educationService'
import { useAuthStore } from '@/stores/authStore'

export const useEducationStore = defineStore('education', {
  state: () => ({
    // Curriculum data
    curriculum: null,
    curriculumLoading: false,
    curriculumError: null,

    // Student progress
    studentProgress: null,
    completedLessons: [], // Array of { lesson_id, score, stars, completed_at, attempts }
    unlockedLessons: [], // Array of lesson_ids that student can access
    progressLoading: false,
    progressError: null,

    // Current lesson session
    currentLesson: null, // Full lesson object with phase_1 and phase_2
    currentLessonId: null,
    currentPhase: null, // 'theory', 'practice', or 'complete'

    // Session tracking
    sessionAnswers: [], // Array of student answers for current lesson
    sessionQuestionTimes: [], // Array of time spent per question (in seconds)
    sessionStartTime: null,
    sessionScore: 0,
    sessionLoading: false,
    sessionError: null,
    prerequisiteWarning: false, // True if current lesson has unmet prerequisites

    // AI Tutor
    tutorMessage: '', // Current message from AI tutor
    showTutorButton: false, // Show interactive button in speech bubble
    tutorButtonText: '💡 Need more help?', // Button text
    currentTheoryContent: null, // Store theory content for AI explanation
    explanationMode: 'concise', // 'concise' | 'detailed' | 'alternative'
  }),

  getters: {
    /**
     * Get progress data for a specific lesson
     * @param {string} lessonId
     * @returns {object|null} Progress object or null if not completed
     */
    getLessonProgress: (state) => (lessonId) => {
      return state.completedLessons.find((l) => l.lesson_id === lessonId) || null
    },

    /**
     * Get star rating for a specific lesson
     * @param {string} lessonId
     * @returns {number} Stars (0-5), or 0 if not completed
     */
    getLessonStars: (state) => (lessonId) => {
      const progress = state.completedLessons.find((l) => l.lesson_id === lessonId)
      return progress ? progress.stars : 0
    },

    /**
     * Get score for a specific lesson
     * @param {string} lessonId
     * @returns {number} Score (0-10), or 0 if not completed
     */
    getLessonScore: (state) => (lessonId) => {
      const progress = state.completedLessons.find((l) => l.lesson_id === lessonId)
      return progress ? progress.score : 0
    },

    /**
     * Check if a lesson is unlocked for the student
     * @param {string} lessonId
     * @returns {boolean}
     */
    isLessonUnlocked: (state) => (lessonId) => {
      // A lesson is unlocked if it's in the unlocked list OR if it's already completed
      return (
        state.unlockedLessons.includes(lessonId) ||
        state.completedLessons.some((l) => l.lesson_id === lessonId)
      )
    },

    /**
     * Check if a lesson is completed
     * @param {string} lessonId
     * @returns {boolean}
     */
    isLessonCompleted: (state) => (lessonId) => {
      return state.completedLessons.some((l) => l.lesson_id === lessonId)
    },

    /**
     * Get chapter progress (percentage)
     * @param {string} chapterId
     * @returns {number} Percentage (0-100)
     */
    getChapterProgress: (state) => (chapterId) => {
      if (!state.curriculum) return 0

      // Find all lessons in this chapter
      const lessons = []
      for (const unit of state.curriculum.units) {
        for (const chapter of unit.chapters) {
          if (chapter.chapter_id === chapterId) {
            for (const lesson of chapter.lessons) {
              lessons.push(lesson.lesson_id)
            }
          }
        }
      }

      if (lessons.length === 0) return 0

      // Count completed lessons
      const completedCount = lessons.filter((lessonId) =>
        state.completedLessons.some((l) => l.lesson_id === lessonId),
      ).length

      return Math.round((completedCount / lessons.length) * 100)
    },

    /**
     * Get total curriculum progress (percentage)
     * @returns {number} Percentage (0-100)
     */
    getTotalProgress: (state) => {
      if (!state.curriculum) return 0

      // Count all lessons
      let totalLessons = 0
      for (const unit of state.curriculum.units) {
        for (const chapter of unit.chapters) {
          totalLessons += chapter.lessons.length
        }
      }

      if (totalLessons === 0) return 0

      return Math.round((state.completedLessons.length / totalLessons) * 100)
    },

    /**
     * Check if currently in a lesson session
     * @returns {boolean}
     */
    isInSession: (state) => {
      return state.currentLesson !== null
    },

    /**
     * Get session duration in minutes
     * @returns {number}
     */
    getSessionDuration: (state) => {
      if (!state.sessionStartTime) return 0
      const now = new Date()
      const diff = now - state.sessionStartTime
      return Math.round(diff / 1000 / 60) // Convert to minutes
    },
  },

  actions: {
    /**
     * Shuffle question answers to randomize correct answer position
     * @param {object} question - Question object with options and correct_index
     * @returns {object} Question with shuffled options and updated correct_index
     */
    shuffleQuestionAnswers(question) {
      const { options, correct_index } = question

      // Create array of indices
      const indices = options.map((_, i) => i)

      // Fisher-Yates shuffle
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[indices[i], indices[j]] = [indices[j], indices[i]]
      }

      // Reorder options based on shuffled indices
      const shuffledOptions = indices.map((i) => options[i])

      // Find new position of correct answer
      const newCorrectIndex = indices.indexOf(correct_index)

      return {
        ...question,
        options: shuffledOptions,
        correct_index: newCorrectIndex,
      }
    },

    /**
     * Load complete curriculum for student's grade level
     * @param {string} discipline - e.g., 'mathematics'
     * @param {number} grade - Grade level
     */
    async loadCurriculum(discipline = 'mathematics', grade = 4) {
      this.curriculumLoading = true
      this.curriculumError = null

      try {
        this.curriculum = await educationService.getCurriculum(discipline, grade)
        return this.curriculum
      } catch (error) {
        this.curriculumError = error.message
        console.error('Failed to load curriculum:', error)
        throw error
      } finally {
        this.curriculumLoading = false
      }
    },

    /**
     * Load student progress for a specific curriculum
     * @param {string|number} studentId - Student ID
     * @param {string} curriculumId - e.g., 'us_math_grade_4'
     */
    async loadProgress(studentId, curriculumId = 'us_math_grade_4') {
      this.progressLoading = true
      this.progressError = null

      try {
        const progress = await educationService.getStudentProgress(studentId, curriculumId)

        this.studentProgress = progress
        this.completedLessons = progress.lessons_completed || []
        this.unlockedLessons = progress.unlocked_lessons || []

        return progress
      } catch (error) {
        this.progressError = error.message
        console.error('Failed to load progress:', error)
        throw error
      } finally {
        this.progressLoading = false
      }
    },

    /**
     * Initialize curriculum and progress for current student
     * @param {string} discipline
     * @param {number} grade
     */
    async initialize(discipline = 'mathematics', grade = 4) {
      const authStore = useAuthStore()

      if (!authStore.userId) {
        throw new Error('No student logged in')
      }

      // Load both curriculum and progress
      await Promise.all([
        this.loadCurriculum(discipline, grade),
        this.loadProgress(authStore.userId),
      ])
    },

    /**
     * Start a new lesson session
     * @param {string} lessonId - Lesson to start
     */
    async startLesson(lessonId) {
      // Check if lesson has unmet prerequisites (for warning, not blocking)
      const hasPrerequisites = !this.isLessonUnlocked(lessonId)

      // Store prerequisite warning state (can be used by UI to show gentle warning)
      this.prerequisiteWarning = hasPrerequisites

      // Check cache first
      if (this.lessonCache && this.lessonCache[lessonId]) {
        this.currentLesson = this.lessonCache[lessonId]
        this.currentLessonId = lessonId
        this.currentPhase = 'theory'

        // Reset session data
        this.sessionAnswers = []
        this.sessionQuestionTimes = []
        this.sessionStartTime = new Date()
        this.sessionScore = 0

        return this.currentLesson
      }

      this.sessionLoading = true
      this.sessionError = null

      try {
        // Fetch full lesson data
        this.currentLesson = await educationService.getLesson(lessonId)

        // Shuffle practice question answers to randomize correct answer position
        if (this.currentLesson?.phase_2_practice?.questions) {
          this.currentLesson.phase_2_practice.questions =
            this.currentLesson.phase_2_practice.questions.map((question) => {
              return this.shuffleQuestionAnswers(question)
            })
        }

        this.currentLessonId = lessonId
        this.currentPhase = 'theory'

        // Cache the lesson
        if (!this.lessonCache) this.lessonCache = {}
        this.lessonCache[lessonId] = this.currentLesson

        // Reset session data
        this.sessionAnswers = []
        this.sessionQuestionTimes = []
        this.sessionStartTime = new Date()
        this.sessionScore = 0

        return this.currentLesson
      } catch (error) {
        this.sessionError = error.message
        console.error('Failed to start lesson:', error)
        throw error
      } finally {
        this.sessionLoading = false
      }
    },

    /**
     * Move to practice phase
     */
    startPracticePhase() {
      if (!this.currentLesson) {
        throw new Error('No active lesson')
      }
      this.currentPhase = 'practice'
    },

    /**
     * Submit an answer for the current question
     * @param {number} questionIndex - Index in phase_2_practice.questions array
     * @param {number} answerIndex - Selected answer index
     * @param {number} timeSpent - Time spent on this question in seconds
     */
    submitAnswer(questionIndex, answerIndex, timeSpent = 0) {
      if (!this.currentLesson || this.currentPhase !== 'practice') {
        throw new Error('Not in practice phase')
      }

      const question = this.currentLesson.phase_2_practice.questions[questionIndex]
      if (!question) {
        throw new Error('Invalid question index')
      }

      // Store time spent
      this.sessionQuestionTimes[questionIndex] = timeSpent

      // Store answer
      this.sessionAnswers[questionIndex] = {
        questionIndex,
        answerIndex,
        isCorrect: answerIndex === question.correct_index,
      }
    },

    /**
     * Calculate final score from session answers
     * @returns {number} Score from 0-10
     */
    calculateSessionScore() {
      if (this.sessionAnswers.length === 0) return 0

      const correctCount = this.sessionAnswers.filter((a) => a.isCorrect).length
      const totalQuestions = this.sessionAnswers.length

      // Score is: (correct / total) * 10
      this.sessionScore = Math.round((correctCount / totalQuestions) * 10 * 10) / 10
      return this.sessionScore
    },

    /**
     * Complete the current lesson and save progress
     */
    async completeLesson() {
      if (!this.currentLesson || !this.currentLessonId) {
        throw new Error('No active lesson to complete')
      }

      const authStore = useAuthStore()
      if (!authStore.userId) {
        throw new Error('No student logged in')
      }

      this.sessionLoading = true
      this.sessionError = null

      try {
        // Calculate final score
        const score = this.calculateSessionScore()
        const timeSpentMinutes = this.getSessionDuration

        // Save to backend
        const result = await educationService.saveLessonProgress(
          authStore.userId,
          this.currentLessonId,
          {
            score,
            time_spent_minutes: timeSpentMinutes,
            phase_2_score: score, // For now, only phase 2 is scored
            question_times: this.sessionQuestionTimes,
            num_questions: this.sessionAnswers.length,
          },
        )

        // Update local progress state
        const existingIndex = this.completedLessons.findIndex(
          (l) => l.lesson_id === this.currentLessonId,
        )

        const lessonProgress = {
          lesson_id: this.currentLessonId,
          score: result.score, // Mastery score (avg of last 10)
          stars: result.stars,
          completed_at: new Date().toISOString(),
          attempts: result.total_attempts || 1,
          mastery_progress: result.mastery_progress || 0,
          is_mastered: result.is_mastered || false,
          average_score_last_10: result.score,
        }

        if (existingIndex >= 0) {
          // Update existing
          this.completedLessons[existingIndex] = lessonProgress
        } else {
          // Add new
          this.completedLessons.push(lessonProgress)
        }

        // Refresh unlocked lessons (backend may have unlocked next lesson)
        await this.loadProgress(authStore.userId)

        this.currentPhase = 'complete'

        return result
      } catch (error) {
        this.sessionError = error.message
        console.error('Failed to complete lesson:', error)
        throw error
      } finally {
        this.sessionLoading = false
      }
    },

    /**
     * Reset current session (for retrying or exiting)
     */
    resetSession() {
      this.currentLesson = null
      this.currentLessonId = null
      this.currentPhase = null
      this.sessionAnswers = []
      this.sessionQuestionTimes = []
      this.sessionStartTime = null
      this.sessionScore = 0
      this.sessionError = null

      // Clear tutor state
      this.tutorMessage = ''
      this.showTutorButton = false
      this.currentTheoryContent = null
    },

    /**
     * Clear all education data (on logout)
     */
    clearAll() {
      this.curriculum = null
      this.studentProgress = null
      this.completedLessons = []
      this.unlockedLessons = []
      this.resetSession()
      this.curriculumError = null
      this.progressError = null

      // Clear tutor state (redundant with resetSession but explicit)
      this.tutorMessage = ''
      this.showTutorButton = false
      this.currentTheoryContent = null
    },

    /**
     * Update AI tutor message
     * @param {string} message - Message to display
     */
    setTutorMessage(message) {
      console.log('[EducationStore] Setting tutor message:', message)
      this.tutorMessage = message
    },

    /**
     * Set tutor button visibility and text
     */
    setTutorButton(show, text = '💡 Need more help?') {
      this.showTutorButton = show
      this.tutorButtonText = text
    },

    /**
     * Set the explanation mode for the AI tutor
     * @param {string} mode - 'concise', 'detailed', 'alternative'
     */
    setExplanationMode(mode) {
      if (['concise', 'detailed', 'alternative'].includes(mode)) {
        this.explanationMode = mode
      }
    },

    /**
     * Request AI-generated explanation for current theory
     */
    async requestAIExplanation() {
      if (!this.currentTheoryContent) {
        console.warn('[EducationStore] No theory content available for explanation')
        return
      }

      this.setTutorMessage('Let me think of a way to explain this in MORE detail... 🤔')
      this.showTutorButton = false

      try {
        // Create WebSocket connection
        const ws = new WebSocket('ws://localhost:8000/ws/tutor/explain')

        let fullExplanation = ''

        ws.onopen = () => {
          console.log('[EducationStore] WebSocket connected for explanation')

          // Send explanation request
          ws.send(
            JSON.stringify({
              type: 'explain',
              content: {
                theory_content: this.currentTheoryContent,
                lesson_title: this.currentLesson?.title || 'Current Topic',
                topic: this.currentLesson?.topic || 'General',
              },
            }),
          )
        }

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data)

          if (message.type === 'explanation_start') {
            console.log('[EducationStore] Explanation generation started')
            fullExplanation = ''
            this.setTutorMessage('Thinking...')
          } else if (message.type === 'explanation_chunk') {
            // Streaming: append chunks as they arrive
            // Note: chunk is directly in the message, not in a data object
            if (message.chunk) {
              fullExplanation += message.chunk
              this.setTutorMessage(fullExplanation)
            }
          } else if (message.type === 'explanation_complete') {
            console.log('[EducationStore] Explanation complete')
            ws.close()
          } else if (message.type === 'error') {
            console.error('[EducationStore] AI explanation error:', message.message)
            this.setTutorMessage('Hmm, I had trouble with that. Try asking your teacher! 😊')
            ws.close()
          } else {
            console.warn('[EducationStore] Unknown message type:', message.type)
          }
        }

        ws.onerror = (error) => {
          console.error('[EducationStore] WebSocket error:', error)
          this.setTutorMessage('Oops! I had trouble connecting. Try again later! 😊')
        }

        ws.onclose = () => {
          console.log('[EducationStore] WebSocket closed')

          // Show button again after 5 seconds
          setTimeout(() => {
            this.showTutorButton = true
          }, 5000)
        }
      } catch (error) {
        console.error('[EducationStore] Failed to connect WebSocket:', error)
        this.setTutorMessage('Oops! I had trouble connecting. Try again later! 😊')

        setTimeout(() => {
          this.showTutorButton = true
        }, 5000)
      }
    },
  },
})
