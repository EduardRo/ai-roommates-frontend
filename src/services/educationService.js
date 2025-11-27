/**
 * Education Service
 * Handles all curriculum and education-related API calls
 */

import { apiGet, apiPost } from '@/utils/apiClient'

class EducationService {
  /**
   * Get complete curriculum for a discipline and grade level
   * @param {string} discipline - e.g., 'mathematics'
   * @param {number} grade - Grade level (1-12)
   * @returns {Promise<object>} Complete curriculum structure
   */
  async getCurriculum(discipline, grade) {
    return await apiGet(`/education/curriculum/${discipline}/${grade}`)
  }

  /**
   * Get detailed lesson information including theory and practice content
   * @param {string} lessonId - Lesson identifier (e.g., 'lesson_1_1_1')
   * @param {string} discipline - e.g., 'mathematics'
   * @param {number} grade - Grade level
   * @returns {Promise<object>} Lesson data with phase_1_theory and phase_2_practice
   */
  async getLesson(lessonId, discipline = 'mathematics', grade = 4) {
    return await apiGet(`/education/lesson/${lessonId}?discipline=${discipline}&grade=${grade}`)
  }

  /**
   * Get student's progress for a specific curriculum
   * @param {string|number} studentId - Student identifier
   * @param {string} curriculumId - e.g., 'us_math_grade_4'
   * @returns {Promise<{student_id: string, curriculum_id: string, lessons_completed: Array, unlocked_lessons: Array}>}
   */
  async getStudentProgress(studentId, curriculumId) {
    return await apiGet(`/students/${studentId}/progress/${curriculumId}`)
  }

  /**
   * Save student's lesson completion with score
   * @param {string|number} studentId - Student identifier
   * @param {string} lessonId - Lesson identifier
   * @param {object} scoreData - { score: number, time_spent_minutes: number, phase_1_score?: number, phase_2_score?: number }
   * @returns {Promise<{success: boolean, lesson_id: string, score: number, stars: number, message: string}>}
   */
  async saveLessonProgress(studentId, lessonId, scoreData) {
    const payload = {
      score: scoreData.score,
      time_spent_minutes: scoreData.time_spent_minutes || 0,
      phase_1_score: scoreData.phase_1_score,
      phase_2_score: scoreData.phase_2_score,
    }

    return await apiPost(`/students/${studentId}/progress/${lessonId}`, payload)
  }

  /**
   * Check if a lesson is unlocked for a student
   * @param {string|number} studentId - Student identifier
   * @param {string} lessonId - Lesson identifier
   * @returns {Promise<{lesson_id: string, is_unlocked: boolean, reason: string, prerequisites: Array}>}
   */
  async checkUnlockStatus(studentId, lessonId) {
    return await apiGet(`/students/${studentId}/lessons/${lessonId}/unlock-status`)
  }

  /**
   * Calculate star rating from score (0-10 → 0-5 stars)
   * @param {number} score - Score from 0-10
   * @returns {number} Stars from 0-5
   */
  calculateStars(score) {
    if (score < 0 || score > 10) {
      console.warn(`Invalid score: ${score}. Must be 0-10.`)
      return 0
    }
    return score / 2
  }

  /**
   * Helper to check if a lesson is passed (score >= 6)
   * @param {number} score - Score from 0-10
   * @returns {boolean}
   */
  isPassed(score) {
    return score >= 6
  }
}

// Export singleton instance
export const educationService = new EducationService()
