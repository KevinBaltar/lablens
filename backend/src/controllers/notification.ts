import { Request, Response } from 'express'
import { prisma } from '../index'

export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = req.user?.userId

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return res.json(notifications)
  } catch (error) {
    console.error('Get notifications error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function getUnreadCount(req: Request, res: Response) {
  try {
    const userId = req.user?.userId

    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    })

    return res.json({ count })
  } catch (error) {
    console.error('Get unread count error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const { id } = req.params
    const userId = req.user?.userId

    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return res.status(404).json({ error: 'Notificação não encontrada' })
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: 'Não autorizado' })
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    })

    return res.json({ success: true })
  } catch (error) {
    console.error('Mark as read error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function markAllAsRead(req: Request, res: Response) {
  try {
    const userId = req.user?.userId

    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    })

    return res.json({ success: true })
  } catch (error) {
    console.error('Mark all as read error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function deleteNotification(req: Request, res: Response) {
  try {
    const { id } = req.params
    const userId = req.user?.userId

    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return res.status(404).json({ error: 'Notificação não encontrada' })
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: 'Não autorizado' })
    }

    await prisma.notification.delete({ where: { id } })

    return res.status(204).send()
  } catch (error) {
    console.error('Delete notification error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
