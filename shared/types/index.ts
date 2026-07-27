// User types
export type Role = 'MASTER' | 'FILIAL'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  filialId?: string
  createdAt: Date
  updatedAt: Date
}

// Filial types
export interface Filial {
  id: string
  cnpj: string
  name: string
  address: string
  contact: string
  email: string
  phone: string
  createdAt: Date
  updatedAt: Date
}

// Lens types
export type LensType = 'VISAO_SIMPLES_PRONTA' | 'VISAO_SIMPLES_SURFACADA' | 'PROGRESSIVA' | 'BIFOCAL'
export type GradeCategory = 'POSITIVA' | 'NEGATIVA'

export interface Lens {
  id: string
  name: string
  type: LensType
  addition?: number
  grades: LensGrade[]
  createdAt: Date
  updatedAt: Date
}

export interface LensGrade {
  id: string
  category: GradeCategory
  esfericoMin: number
  esfericoMax: number
  cilindricoMin: number
  cilindricoMax: number
  step: number
}

// Order types
export type OrderStatus = 'PENDENTE' | 'ACEITO' | 'RECUSADO' | 'CANCELADO'
export type OrderType = 'GRADE' | 'PAR_A_PAR' | 'SURFACADO'

export interface Order {
  id: string
  os?: string
  status: OrderStatus
  orderType: OrderType
  quantity: number
  patientName?: string
  notes?: string
  pedidoPor?: string

  // OD
  odEsf?: number
  odCil?: number
  odEixo?: number
  odAdicao?: number
  odCentroOptico?: number
  odDnp?: number

  // OE
  oeEsf?: number
  oeCil?: number
  oeEixo?: number
  oeAdicao?: number
  oeCentroOptico?: number
  oeDnp?: number

  // Frame
  pa?: number
  am?: number
  vertical?: number
  diametro?: number
  frameFormat?: string

  selectedGrade?: string

  lensId: string
  filialId: string
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface StatusHistory {
  id: string
  fromStatus?: OrderStatus
  toStatus: OrderStatus
  reason?: string
  createdAt: Date
}

// Chat types
export interface Chat {
  id: string
  orderId: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  content: string
  senderId: string
  createdAt: Date
}

// Contact types
export interface Contact {
  id: string
  name: string
  department: string
  phone: string
  email?: string
}

// Price Table types
export interface PriceTable {
  id: string
  filename: string
  originalName: string
  path: string
  mimeType: string
  size: number
  active: boolean
  createdAt: Date
}

// Notification types
export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  userId: string
  createdAt: Date
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
