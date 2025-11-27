/**
 * Student Management Service
 * Handles student CRUD operations (parent only)
 */

import { apiPost, apiGet, apiPatch } from '@/utils/apiClient'

class StudentService {
  /**
   * Create a new student profile (parent only)
   * @param {object} studentData
   * @param {string} studentData.username - Unique username (min 3 chars, alphanumeric)
   * @param {string} studentData.password - Password (min 4 chars)
   * @param {string} studentData.display_name - Student's display name
   * @param {number} studentData.age - Student's age
   * @param {number} studentData.grade_level - Grade level
   * @param {string} [studentData.preferred_character='aria'] - Preferred tutor character
   * @param {number} [studentData.daily_time_limit_minutes=60] - Daily time limit
   * @returns {Promise<object>} Created student data
   */
  async createStudent(studentData) {
    return await apiPost('/students/create', studentData)
  }

  /**
   * List all children for current parent
   * @returns {Promise<Array>} List of student profiles
   */
  async listStudents() {
    return await apiGet('/students/list')
  }

  /**
   * Update student profile (parent only)
   * @param {number} studentId - Student ID
   * @param {object} updates - Fields to update
   * @returns {Promise<object>} Updated student data
   */
  async updateStudent(studentId, updates) {
    return await apiPatch(`/students/${studentId}`, updates)
  }
}

// Export singleton instance
export const studentService = new StudentService()
