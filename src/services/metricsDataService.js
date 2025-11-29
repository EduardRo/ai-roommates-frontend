import { apiGet } from '@/utils/apiClient'

/**
 * Metrics Data Service
 * Fetches and aggregates student metrics and analytics data
 */

export default {
  /**
   * Get performance trend data for charts
   * @param {number} studentId - Student ID
   * @param {string} timeRange - '7d', '30d', 'all'
   * @returns {Promise<{dates: string[], scores: number[], lessons: string[]}>}
   */
  async getPerformanceTrend(studentId, timeRange = '30d') {
    // This would ideally be a dedicated endpoint, but we can derive it from progress data
    const progress = await apiGet(`/students/${studentId}/progress/us_math_grade_4`)

    if (!progress.lessons_completed || progress.lessons_completed.length === 0) {
      return { dates: [], scores: [], lessons: [] }
    }

    // Sort by date
    const sorted = [...progress.lessons_completed].sort(
      (a, b) => new Date(a.completed_at) - new Date(b.completed_at),
    )

    // Filter by time range
    const now = new Date()
    const cutoffDate = new Date()
    if (timeRange === '7d') {
      cutoffDate.setDate(now.getDate() - 7)
    } else if (timeRange === '30d') {
      cutoffDate.setDate(now.getDate() - 30)
    } else {
      cutoffDate.setFullYear(2000) // All time
    }

    const filtered = sorted.filter((lesson) => new Date(lesson.completed_at) >= cutoffDate)

    return {
      dates: filtered.map((l) => new Date(l.completed_at).toLocaleDateString()),
      scores: filtered.map((l) => l.score || 0),
      lessons: filtered.map((l) => l.lesson_id),
      stars: filtered.map((l) => l.stars || 0),
      attempts: filtered.map((l) => l.total_attempts || 1),
    }
  },

  /**
   * Get study time data
   * @param {number} studentId - Student ID
   * @param {string} timeRange - '7d', '30d', 'all'
   * @returns {Promise<{daily: Array, weekly_total: number, monthly_total: number}>}
   */
  async getStudyTimeData(studentId, timeRange = '30d') {
    // Note: This endpoint might not exist yet, adjust based on actual backend
    try {
      const data = await apiGet(`/students/${studentId}/metrics/study-time?range=${timeRange}`)
      return data
    } catch (error) {
      console.warn('[MetricsDataService] Study time endpoint not available, using mock data')
      // Return mock data structure for now
      return {
        daily: [],
        weekly_total: 0,
        monthly_total: 0,
      }
    }
  },

  /**
   * Get behavioral analytics summary
   * @param {number} studentId - Student ID
   * @returns {Promise<{avgFocus: number, avgEngagement: string, totalHesitations: number, totalTabSwitches: number}>}
   */
  async getBehavioralSummary(studentId) {
    try {
      const data = await apiGet(`/students/${studentId}/metrics/behavioral-summary`)
      return data
    } catch (error) {
      console.warn(
        '[MetricsDataService] Behavioral summary endpoint not available, using mock data',
      )
      return {
        avg_focus_score: 0,
        avg_engagement: 'medium',
        total_hesitations: 0,
        total_tab_switches: 0,
        improvement_areas: [],
      }
    }
  },

  /**
   * Get progress breakdown by curriculum
   * @param {number} studentId - Student ID
   * @param {string} curriculumId - Curriculum ID
   * @returns {Promise<{chapters: Array, totalLessons: number, completed: number}>}
   */
  async getProgressBreakdown(studentId, curriculumId = 'us_math_grade_4') {
    const progress = await apiGet(`/students/${studentId}/progress/${curriculumId}`)

    // Calculate chapter-level progress
    const completedLessons = progress.lessons_completed || []
    const totalLessons = progress.total_lessons || 0

    return {
      total_lessons: totalLessons,
      completed_count: completedLessons.length,
      completion_percentage:
        totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0,
      lessons: completedLessons,
      unlocked_lessons: progress.unlocked_lessons || [],
    }
  },

  /**
   * Get overall statistics summary
   * @param {number} studentId - Student ID
   * @returns {Promise<{totalLessons: number, avgScore: number, totalStudyTime: number, currentStreak: number}>}
   */
  async getOverallStats(studentId) {
    const progress = await apiGet(`/students/${studentId}/progress/us_math_grade_4`)

    const lessons = progress.lessons_completed || []
    const avgScore =
      lessons.length > 0 ? lessons.reduce((sum, l) => sum + (l.score || 0), 0) / lessons.length : 0

    const totalStars = lessons.reduce((sum, l) => sum + (l.stars || 0), 0)

    return {
      total_lessons: lessons.length,
      avg_score: Math.round(avgScore * 10) / 10,
      total_stars: Math.round(totalStars * 10) / 10,
      total_attempts: lessons.reduce((sum, l) => sum + (l.total_attempts || 1), 0),
      mastered_lessons: lessons.filter((l) => l.is_mastered).length,
    }
  },
}
