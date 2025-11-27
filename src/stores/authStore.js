/**
 * Authentication Store
 * Manages authentication state and user info
 */

import { defineStore } from 'pinia'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('authToken') || null,
    userType: localStorage.getItem('userType') || null, // 'parent' or 'student'
    userId: localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')) : null,
    user: null, // Full user object from /auth/me
    isAuthenticated: !!localStorage.getItem('authToken'),
    loading: false,
    error: null,
  }),

  getters: {
    /**
     * Check if current user is a parent
     */
    isParent: (state) => state.userType === 'parent',

    /**
     * Check if current user is a student
     */
    isStudent: (state) => state.userType === 'student',

    /**
     * Get user display name
     */
    userName: (state) => {
      if (!state.user) return null
      return state.isParent ? state.user.parent_name : state.user.display_name
    },
  },

  actions: {
    /**
     * Register a new parent
     */
    async registerParent(email, password, parent_name, phone = null) {
      this.loading = true
      this.error = null

      try {
        const data = await authService.registerParent(email, password, parent_name, phone)
        this._setAuthData(data)
        await this.loadUserInfo()
        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Login as parent
     */
    async loginParent(email, password) {
      this.loading = true
      this.error = null

      try {
        const data = await authService.loginParent(email, password)
        this._setAuthData(data)
        await this.loadUserInfo()
        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Login as student
     */
    async loginStudent(username, password) {
      this.loading = true
      this.error = null

      try {
        const data = await authService.loginStudent(username, password)
        this._setAuthData(data)
        await this.loadUserInfo()
        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Load current user information
     */
    async loadUserInfo() {
      if (!this.isAuthenticated) return

      try {
        if (this.isParent) {
          this.user = await authService.getParentInfo()
        } else if (this.isStudent) {
          this.user = await authService.getStudentInfo()
        }
      } catch (error) {
        console.error('Failed to load user info:', error)
        // If loading user info fails, token might be invalid
        this.logout()
      }
    },

    /**
     * Logout current user
     */
    logout() {
      authService.logout()
      this.token = null
      this.userType = null
      this.userId = null
      this.user = null
      this.isAuthenticated = false
      this.error = null
    },

    /**
     * Check if token is still valid
     */
    async checkAuth() {
      if (!this.isAuthenticated) return false

      try {
        await this.loadUserInfo()
        return true
      } catch (error) {
        this.logout()
        return false
      }
    },

    /**
     * Set authentication data in state
     * @private
     */
    _setAuthData(data) {
      this.token = data.access_token
      this.userType = data.user_type
      this.userId = data.user_id
      this.isAuthenticated = true
    },
  },
})
