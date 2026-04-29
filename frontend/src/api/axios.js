import axios from 'axios'

const apiBaseURL = (import.meta.env.VITE_API_URL?.trim() || '').replace(/\/$/, '')

const api = axios.create({
  baseURL: apiBaseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {}

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (error.response?.status === 429) {
      return Promise.reject({
        ...error,
        message: error.response.data?.detail || 'Too many attempts. Please wait.',
      })
    }

    return Promise.reject(error)
  },
)

export default api
