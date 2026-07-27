import { Request, Response } from 'express'
import { prisma } from '../index'
import { canAccessFilial } from '../utils/authorization'

async function assertChatAccess(orderId: string, req: Request, res: Response): Promise<boolean> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { filialId: true } })
  if (!order) {
    res.status(404).json({ error: 'Pedido não encontrado' })
    return false
  }
  if (!canAccessFilial(req.user, order.filialId)) {
    res.status(403).json({ error: 'Não autorizado' })
    return false
  }
  return true
}

export async function getChatByOrder(req: Request, res: Response) {
  try {
    const { orderId } = req.params
    if (!await assertChatAccess(orderId, req, res)) return

    const chat = await prisma.chat.findUnique({
      where: { orderId },
      include: {
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!chat) {
      return res.json({ id: null, orderId, messages: [] })
    }

    return res.json(chat)
  } catch (error) {
    console.error('Get chat error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const { orderId } = req.params
    const { content } = req.body
    const userId = req.user?.userId

    if (!await assertChatAccess(orderId, req, res)) return

    if (typeof content !== 'string' || content.trim().length === 0 || content.length > 2000) {
      return res.status(400).json({ error: 'Mensagem não pode ser vazia' })
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
        senderId: userId!,
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
    })

    return res.status(201).json(message)
  } catch (error) {
    console.error('Send message error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function getChatMessages(req: Request, res: Response) {
  try {
    const { orderId } = req.params
    const { before, limit = '50' } = req.query

    if (!await assertChatAccess(orderId, req, res)) return

    const chat = await prisma.chat.findUnique({
      where: { orderId },
    })

    if (!chat) {
      return res.json([])
    }

    const where: any = { chatId: chat.id }
    if (before) {
      where.createdAt = { lt: new Date(before as string) }
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(parseInt(limit as string, 10) || 50, 1), 100),
    })

    return res.json(messages.reverse())
  } catch (error) {
    console.error('Get chat messages error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
