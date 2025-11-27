/**
 * API Client with automatic token injection and error handling
 */

const API_BASE = 'http://localhost:8000/api'

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/auth/login/parent')
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('authToken')

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config)

    // Handle token expiration
    if (response.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userType')
      localStorage.removeItem('userId')
      window.location.href = '/parent/login'
      throw new Error('Session expired. Please log in again.')
    }

    // Handle subscription expiration
    if (response.status === 402) {
      throw new Error('Subscription expired. Please renew to continue.')
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API Request failed:', error)
    throw error
  }
}

/**
 * Simple GET request
 */
export async function apiGet(endpoint) {
  return apiRequest(endpoint, { method: 'GET' })
}

/**
 * Simple POST request
 */
export async function apiPost(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Simple PATCH request
 */
export async function apiPatch(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}
