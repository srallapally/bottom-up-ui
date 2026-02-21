/**
 * Role Mining UI - API Service Layer
 *
 * Axios instance with request/response interceptors
 * Error handling with user-friendly messages
 */

import axios from 'axios'
import auth from '@/auth'

// ============================================================================
// AXIOS INSTANCE
// ============================================================================

const api = axios.create({
  baseURL:'/api',
  timeout: 180000, // 3 minutes for mining operations
  withCredentials: true, // Include session cookies
})

// ============================================================================
// REQUESTS use HttpOnly session cookies (withCredentials: true)
// ============================================================================

// ============================================================================
// RESPONSE INTERCEPTOR - Error Handling
// ============================================================================

api.interceptors.response.use(
    (response) => {
      console.log(`[API] Response ${response.config.url}:`, response.status)
      return response
    },
    (error) => {
      const userMessage = extractUserMessage(error)

      // Attach user-friendly message to error
      error.userMessage = userMessage

      console.error('[API] Response error:', {
        url: error.config?.url,
        status: error.response?.status,
        userMessage
      })

      // Trigger toast notification
      showErrorToast(userMessage)
      // Hard redirect on auth failure
      if (error.response?.status === 401) {
        auth.logout()
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
)

// ============================================================================
// ERROR MESSAGE EXTRACTION
// ============================================================================

function extractUserMessage (error) {
  // Network error (timeout, connection refused, CORS)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. The operation is taking longer than expected.'
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Unable to connect to server. Please check your connection.'
    }
    return 'Network error. Please try again.'
  }

  const { status, data } = error.response

  // Backend sent structured error with message
  if (data?.message) return data.message

  // Backend sent error field only
  if (data?.error) return data.error

  // HTTP status-based messages
  switch (status) {
    case 400: return 'Invalid request. Please check your input.'
    case 401: return 'Authentication required. Please log in.'
    case 403: return 'Access denied. You do not have permission.'
    case 404: return 'Resource not found.'
    case 409: return 'Conflict detected. Please resolve and try again.'
    case 422: return 'Validation failed. Please check your data.'
    case 500: return 'Server error. Please try again later.'
    case 502: return 'Backend service unavailable. Please try again later.'
    case 503: return 'Service temporarily unavailable. Please try again.'
    default: return `Request failed: ${error.response.statusText || 'Unknown error'}`
  }
}

// ============================================================================
// TOAST NOTIFICATION
// ============================================================================

function showErrorToast (message) {
  // Create toast container if it doesn't exist
  let container = document.getElementById('toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    container.className = 'toast-container position-fixed top-0 end-0 p-3'
    container.style.zIndex = '9999'
    document.body.appendChild(container)
  }

  // Create toast element
  const toastId = `toast-${Date.now()}`
  const toastEl = document.createElement('div')
  toastEl.id = toastId
  toastEl.className = 'toast align-items-center text-bg-danger border-0'
  toastEl.setAttribute('role', 'alert')
  toastEl.setAttribute('aria-live', 'assertive')
  toastEl.setAttribute('aria-atomic', 'true')

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <strong>Error:</strong> ${escapeHtml(message)}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `

  container.appendChild(toastEl)

  // Initialize and show toast (Bootstrap 5)
  if (window.bootstrap && window.bootstrap.Toast) {
    const toast = new window.bootstrap.Toast(toastEl, {
      autohide: true,
      delay: 5000
    })

    toast.show()

    // Remove from DOM after hidden
    toastEl.addEventListener('hidden.bs.toast', () => {
      toastEl.remove()
    })
  } else {
    toastEl.classList.add('show')
    setTimeout(() => {
      toastEl.classList.remove('show')
      setTimeout(() => toastEl.remove(), 300)
    }, 5000)
  }
}

function escapeHtml (text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// ============================================================================
// API METHODS
// ============================================================================

const apiService = {
  // Health check
  async health () {
    const { data } = await api.get('/health')
    return data
  },

  // Session management
  async getSessions () {
    const { data } = await api.get('/sessions')
    return data
  },

  async createSession () {
    const { data } = await api.post('/sessions')
    return data
  },

  async deleteSession (sessionId) {
    const { data } = await api.delete(`/sessions/${sessionId}`)
    return data
  },

  async getSessionStatus (sessionId) {
    const { data } = await api.get(`/sessions/${sessionId}/status`)
    return data
  },

  // Upload
  async uploadFiles (sessionId, formData) {
    const { data } = await api.post(`/sessions/${sessionId}/upload`, formData, {
      timeout: 300000
    })
    return data
  },

  // Session file processing
  async processFiles (sessionId) {
    const { data } = await api.post(`/sessions/${sessionId}/process`)
    return data
  },

  async getConfig (sessionId) {
    const { data } = await api.get(`/sessions/${sessionId}/config`)
    return data
  },

  async saveConfig (sessionId, configOverrides) {
    const { data } = await api.put(`/sessions/${sessionId}/config`, configOverrides)
    return data
  },

  // Mining
  async mine (sessionId, configOverrides = {}) {
    const { data } = await api.post(`/sessions/${sessionId}/mine`, configOverrides, {
      timeout: 300000
    })
    return data
  },

  async getMiningResults (sessionId) {
    const { data } = await api.get(`/sessions/${sessionId}/results`)
    return data
  },

  async exportRoles (sessionId) {
    const response = await api.get(`/sessions/${sessionId}/export`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Recommendations
  async getRecommendations (userId) {
    const { data } = await api.get(`/recommendations/${userId}`)
    return data
  },

  // Over-provisioned
  async getOverProvisioned () {
    const { data } = await api.get('/over-provisioned')
    return data
  },

  // Browse processed data
  async browseData (sessionId, fileType, params = undefined) {
    const { data } = await api.get(`/sessions/${sessionId}/browse/${fileType}`, params ? { params } : undefined)
    return data
  },

  // Assignments
  async getAssignments (params) {
    const { data } = await api.get('/assignments', { params })
    return data
  }
}

export default apiService
export { api }
