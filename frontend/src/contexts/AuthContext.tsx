import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../lib/api'

interface User {
  id: string
  email: string
  name: string
  role: 'MASTER' | 'FILIAL'
  filialId?: string
  filialName?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isMaster: boolean
  isFilial: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const skipProfileCheckPaths = ['/']

function shouldSkipProfileCheck(pathname: string): boolean {
  return skipProfileCheckPaths.some(path =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentPath = window.location.pathname
    if (shouldSkipProfileCheck(currentPath)) {
      setIsLoading(false)
      return
    }
    loadUser()
  }, [])

  async function loadUser() {
    try {
      const { data } = await api.get('/auth/profile')
      setUser(data)
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password })
    setUser(data.user)
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
    }
    setUser(null)
  }

  const isMaster = user?.role === 'MASTER'
  const isFilial = user?.role === 'FILIAL'

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isMaster, isFilial }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
