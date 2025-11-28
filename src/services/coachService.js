import { apiPost, apiGet } from '@/utils/apiClient'

export default {
  async sendMessage({ userType, userId, childId, message, conversationId }) {
    const endpoint =
      userType === 'student' ? `/students/${userId}/coach/chat` : `/parents/${userId}/coach/chat`

    const payload = {
      message,
      conversation_id: conversationId,
    }

    if (userType === 'parent' && childId) {
      payload.child_id = childId
    }

    return await apiPost(endpoint, payload)
  },

  async getHistory({ userType, userId, childId }) {
    const endpoint =
      userType === 'student'
        ? `/students/${userId}/coach/history`
        : `/parents/${userId}/coach/history`

    const queryParams = childId ? `?child_id=${childId}` : ''
    return await apiGet(`${endpoint}${queryParams}`)
  },

  async getQuickInsights({ userType, userId }) {
    const endpoint =
      userType === 'student'
        ? `/students/${userId}/coach/insights`
        : `/parents/${userId}/children/summary`

    return await apiGet(endpoint)
  },

  async getReviewRecommendations(studentId) {
    return await apiGet(`/students/${studentId}/reviews/recommended`)
  },

  async trackQuestionAttempt({
    studentId,
    lessonId,
    questionId,
    selectedAnswer,
    correctAnswer, // Explicitly passed
    isCorrect,
    timeSpent,
    sessionId,
  }) {
    return await apiPost(`/students/${studentId}/questions/attempt`, {
      lesson_id: lessonId,
      question_id: questionId,
      student_answer: String(selectedAnswer),
      correct_answer: String(correctAnswer), // Use explicit correct answer
      is_correct: isCorrect,
      time_spent: timeSpent,
      session_id: sessionId || null,
    })
  },

  async trackLessonReview({ studentId, lessonId }) {
    return await apiPost(`/students/${studentId}/tracking/review`, {
      lesson_id: lessonId,
      reviewed_at: new Date().toISOString(),
    })
  },
}
