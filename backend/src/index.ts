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
import { securityHeaders, securityLogger, verifyRequestOrigin } from './middleware/security'

dotenv.config()

export const prisma = new PrismaClient()

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())
app.use(securityHeaders)
app.use(securityLogger)

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.includes('localhost') || origin === process.env.CORS_ORIGIN || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}))

// Body parser + Cookie parser
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
app.use(verifyRequestOrigin)

// Rate limiting
app.use('/api/', generalLimiter)
app.use('/api/auth/login', loginLimiter)
app.use('/api/auth/register', loginLimiter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
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

if (!process.env.VERCEL) {
  httpServer.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
  })
}

export default app
