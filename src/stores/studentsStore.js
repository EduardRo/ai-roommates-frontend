/**
 * Students Store
 * Manages student profiles (children) for parent dashboard
 */

import { defineStore } from 'pinia'
import { studentService } from '@/services/studentService'

export const useStudentsStore = defineStore('students', {
  state: () => ({
    children: [], // List of student profiles
    selectedChild: null, // Currently selected child for editing
    loading: false,
    error: null,
  }),

  getters: {
    /**
     * Get total number of children
     */
    childrenCount: (state) => state.children.length,

    /**
     * Get student by ID
     */
    getChildById: (state) => {
      return (id) => state.children.find((child) => child.id === id)
    },
  },

  actions: {
    /**
     * Fetch all children for current parent
     */
    async fetchChildren() {
      this.loading = true
      this.error = null

      try {
        this.children = await studentService.listStudents()
        return this.children
      } catch (error) {
        this.error = error.message
        console.error('Failed to fetch children:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Create a new child profile
     */
    async createChild(studentData) {
      this.loading = true
      this.error = null

      try {
        const newChild = await studentService.createStudent(studentData)
        this.children.push(newChild)
        return newChild
      } catch (error) {
        this.error = error.message
        console.error('Failed to create child:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update child profile
     */
    async updateChild(studentId, updates) {
      this.loading = true
      this.error = null

      try {
        const updatedChild = await studentService.updateStudent(studentId, updates)

        // Update in local array
        const index = this.children.findIndex((child) => child.id === studentId)
        if (index !== -1) {
          this.children[index] = updatedChild
        }

        return updatedChild
      } catch (error) {
        this.error = error.message
        console.error('Failed to update child:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Select a child for editing
     */
    selectChild(studentId) {
      this.selectedChild = this.getChildById(studentId)
    },

    /**
     * Clear selected child
     */
    clearSelection() {
      this.selectedChild = null
    },
  },
})
