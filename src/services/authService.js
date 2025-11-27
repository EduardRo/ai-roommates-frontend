/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiPost, apiGet } from '@/utils/apiClient'

class AuthService {
  /**
   * Register a new parent account
   * @param {string} email
   * @param {string} password
   * @param {string} parent_name
   * @param {string|null} phone
   * @returns {Promise<{access_token: string, token_type: string, user_type: string, user_id: number, email: string}>}
   */
  async registerParent(email, password, parent_name, phone = null) {
    const data = await apiPost('/auth/register/parent', {
      email,
      password,
      parent_name,
      phone,
    })

    // Store tokens
    this._storeAuthData(data)
    return data
  }

  /**
   * Login as parent
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{access_token: string, token_type: string, user_type: string, user_id: number, email: string}>}
   */
  async loginParent(email, password) {
    const data = await apiPost('/auth/login/parent', {
      email,
      password,
    })

    this._storeAuthData(data)
    return data
  }

  /**
   * Login as student
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{access_token: string, token_type: string, user_type: string, user_id: number, username: string}>}
   */
  async loginStudent(username, password) {
    const data = await apiPost('/auth/login/student', {
      username,
      password,
    })

    console.log('[AuthService] Student login response:', data)

    // WORKAROUND: Force user_type to 'student' if it's missing or wrong
    // This handles the case where backend might return 'parent' or nothing
    if (data.user_type !== 'student') {
      console.warn('[AuthService] Correcting user_type from', data.user_type, 'to student')
      data.user_type = 'student'
    }

    this._storeAuthData(data)
    return data
  }

  /**
   * Get current parent info
   * @returns {Promise<object>} Parent data
   */
  async getParentInfo() {
    return await apiGet('/auth/me/parent')
  }

  /**
   * Get current student info
   * @returns {Promise<object>} Student data
   */
  async getStudentInfo() {
    return await apiGet('/auth/me/student')
  }

  /**
   * Logout - clear all auth data
   */
  logout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userType')
    localStorage.removeItem('userId')
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem('authToken')
  }

  /**
   * Get current auth token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem('authToken')
  }

  /**
   * Get current user type
   * @returns {'parent'|'student'|null}
   */
  getUserType() {
    return localStorage.getItem('userType')
  }

  /**
   * Get current user ID
   * @returns {number|null}
   */
  getUserId() {
    const id = localStorage.getItem('userId')
    return id ? parseInt(id) : null
  }

  /**
   * Store authentication data in localStorage
   * @private
   */
  _storeAuthData(data) {
    localStorage.setItem('authToken', data.access_token)
    localStorage.setItem('userType', data.user_type)
    localStorage.setItem('userId', data.user_id.toString())
  }
}

// Export singleton instance
export const authService = new AuthService()
