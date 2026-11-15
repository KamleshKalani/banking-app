import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally — redirect to login if token expires
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 from login/register means bad credentials, not an expired
    // session — let the page show the error instead of reloading.
    const isAuthRequest = error.config?.url?.startsWith('/auth/')
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    // Validation errors arrive as { field: message }; pages render
    // `message` directly, so flatten it to a string here.
    const message = error.response?.data?.message
    if (message && typeof message === 'object') {
      error.response.data.message = Object.values(message).join('. ')
    }
    return Promise.reject(error)
  }
)

export default api