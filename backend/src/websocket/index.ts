import { Server, Socket } from 'socket.io'
import { Server as HttpServer } from 'http'
import { verifyToken } from '../utils/token'
import { prisma } from '../index'
import cookie from 'cookie'
import { canAccessFilial } from '../utils/authorization'

let io: Server

interface SocketData {
  userId: string
  userRole: string
  filialId?: string
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {}
  return cookie.parse(cookieHeader)
}

export function initializeWebSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  })

  // Middleware de autenticação - lê token do cookie
  io.use(async (socket: Socket & { data: SocketData }, next) => {
    try {
      // Tentar ler do cookie primeiro
      const cookieHeader = socket.handshake.headers.cookie
      const cookies = parseCookies(cookieHeader)
      let token = cookies.token

      // Fallback para auth.token (para compatibilidade)
      if (!token) {
        token = socket.handshake.auth.token
      }

      if (!token) {
        return next(new Error('Token não fornecido'))
      }

      const payload = verifyToken(token)
      const user = await prisma.user.findUnique({ where: { id: payload.userId } })
      if (!user) {
        return next(new Error('Sessão inválida'))
      }
      socket.data.userId = user.id
      socket.data.userRole = user.role
      socket.data.filialId = user.filialId ?? undefined
      next()
    } catch (error) {
      next(new Error('Token inválido'))
    }
  })

  io.on('connection', (socket: Socket & { data: SocketData }) => {
    console.log(`Usuário conectado: ${socket.data.userId}`)

    // Entrar na sala do usuário
    socket.join(`user:${socket.data.userId}`)

    // Se for filial, entrar na sala da filial
    if (socket.data.filialId) {
      socket.join(`filial:${socket.data.filialId}`)
    }

    // Se for master, entrar na sala de admin
    if (socket.data.userRole === 'MASTER') {
      socket.join('admin')
    }

    // Entrar em sala de chat específica
    socket.on('join-chat', async (orderId: string) => {
      if (typeof orderId !== 'string') return
      const order = await prisma.order.findUnique({ where: { id: orderId }, select: { filialId: true } })
      if (!order || !canAccessFilial({ userId: socket.data.userId, email: '', role: socket.data.userRole as 'MASTER' | 'FILIAL', filialId: socket.data.filialId }, order.filialId)) {
        socket.emit('error', { message: 'Não autorizado' })
        return
      }
      socket.join(`chat:${orderId}`)
    })

    // Sair de sala de chat
    socket.on('leave-chat', (orderId: string) => {
      socket.leave(`chat:${orderId}`)
    })

    // Enviar mensagem no chat
    socket.on('send-message', async (data: { orderId: string; content: string }) => {
      try {
        const { orderId, content } = data

        if (typeof orderId !== 'string' || typeof content !== 'string' || content.trim().length === 0 || content.length > 2000) {
          socket.emit('error', { message: 'Mensagem inválida' })
          return
        }

        const order = await prisma.order.findUnique({ where: { id: orderId }, select: { filialId: true } })
        if (!order || !canAccessFilial({ userId: socket.data.userId, email: '', role: socket.data.userRole as 'MASTER' | 'FILIAL', filialId: socket.data.filialId }, order.filialId)) {
          socket.emit('error', { message: 'Não autorizado' })
          return
        }

        // Verificar se o chat existe, senão criar
        let chat = await prisma.chat.findUnique({
          where: { orderId },
        })

        if (!chat) {
          chat = await prisma.chat.create({
            data: { orderId },
          })
        }

        // Criar mensagem
        const message = await prisma.chatMessage.create({
          data: {
            content: content.trim(),
            chatId: chat.id,
            senderId: socket.data.userId,
          },
          include: {
            sender: {
              select: { id: true, name: true, role: true },
            },
          },
        })

        // Enviar para todos na sala do chat
        io.to(`chat:${orderId}`).emit('new-message', {
          orderId,
          message,
        })
      } catch (error) {
        console.error('Error sending message:', error)
        socket.emit('error', { message: 'Erro ao enviar mensagem' })
      }
    })

    socket.on('disconnect', () => {
      console.log(`Usuário desconectado: ${socket.data.userId}`)
    })
  })

  return io
}

export function getIO() {
  if (!io) {
    throw new Error('WebSocket não inicializado')
  }
  return io
}

// Funções auxiliares para emitir eventos
export function emitNotification(userId: string, notification: any) {
  io.to(`user:${userId}`).emit('notification', notification)
}

export function emitOrderUpdate(filialId: string, order: any) {
  io.to(`filial:${filialId}`).emit('order-update', order)
  io.to('admin').emit('order-update', order)
}
