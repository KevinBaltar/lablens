import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { PrismaClient } from '@prisma/client'
import authRoutes from './routes/auth'
import filialRoutes from './routes/filial'
import lensRoutes from './routes/lens'
import userRoutes from './routes/user'
import contactRoutes from './routes/contact'
import priceTableRoutes from './routes/priceTable'
import orderRoutes from './routes/order'
import notificationRoutes from './routes/notification'
import chatRoutes from './routes/chat'
import clientRoutes from './routes/client'
import establishmentRoutes from './routes/establishment'
import { initializeWebSocket } from './websocket'
import { generalLimiter, loginLimiter } from './middleware/rateLimit'
import { securityHeaders, securityLogger } from './middleware/security'
import { ensureMasterUser, ensurePriceTableSchema } from './bootstrap'

dotenv.config()

export const prisma = new PrismaClient()

const app = express()
app.set('trust proxy', 1)
const httpServer = createServer(app)
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())
app.use(securityHeaders)
app.use(securityLogger)

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true
  if (origin.includes('localhost')) return true
  if (origin === process.env.CORS_ORIGIN) return true
  if (origin.endsWith('.vercel.app')) return true
  if (process.env.VERCEL_URL && origin.endsWith(process.env.VERCEL_URL)) return true
  return false
}

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Origem não permitida pelo CORS'))
    }
  },
  credentials: true,
}))

// Body parser + Cookie parser
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

// Rate limiting
app.use('/api/', generalLimiter)
app.use('/api/auth/login', loginLimiter)
app.use('/api/auth/register', loginLimiter)

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbLatency = Date.now() - dbStart

    const totalUsers = await prisma.user.count()
    const masterUsers = await prisma.user.count({ where: { role: 'MASTER' } })
    const filialUsers = await prisma.user.count({ where: { role: 'FILIAL' } })

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        latencyMs: dbLatency,
      },
      users: {
        total: totalUsers,
        master: masterUsers,
        filial: filialUsers,
      },
      env: {
        nodeEnv: process.env.NODE_ENV || 'development',
        isVercel: !!process.env.VERCEL,
      },
    })
  } catch (dbError) {
    console.error('[HEALTH] Database check failed:', dbError)
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      database: { connected: false, error: String(dbError) },
    })
  }
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/filiais', filialRoutes)
app.use('/api/lenses', lensRoutes)
app.use('/api/users', userRoutes)
app.use('/api/contacts', contactRoutes)
app.use('/api/price-table', priceTableRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/establishments', establishmentRoutes)

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

// Initialize WebSocket
initializeWebSocket(httpServer)

// Bootstrap: garante usuário master + conexão DB
async function runBootstrap() {
  try {
    console.log('[BOOTSTRAP] Inicializando backend...')
    console.log(`[BOOTSTRAP] Ambiente: ${process.env.NODE_ENV || 'development'}${process.env.VERCEL ? ' (Vercel)' : ''}`)

    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    console.log(`[BOOTSTRAP] Banco de dados conectado (${Date.now() - dbStart}ms)`)

    await ensureMasterUser(prisma)
    await ensurePriceTableSchema(prisma)
    console.log('[BOOTSTRAP] Bootstrap concluído com sucesso.')
  } catch (err) {
    console.error('[BOOTSTRAP] FALHA CRÍTICA NA INICIALIZAÇÃO:', err)
    if (!process.env.VERCEL) {
      process.exit(1)
    }
  }
}

const bootstrapPromise = runBootstrap()

if (!process.env.VERCEL) {
  bootstrapPromise.then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`)
    })
  })
}

export default app
