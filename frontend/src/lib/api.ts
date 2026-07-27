import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  withCredentials: true, // Enviar cookies automaticamente
})

// Rotas públicas que não devem redirecionar para login
const publicPaths = ['/login', '/forgot-password', '/']

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if not on a public page and not checking profile
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname
      const isPublicPage = publicPaths.some(path =>
        path === '/' ? currentPath === '/' : currentPath.startsWith(path)
      )
      const isProfileCheck = error.config?.url?.includes('/auth/profile')

      // Don't redirect if already on public page or if it's a profile check
      if (!isPublicPage && !isProfileCheck) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
