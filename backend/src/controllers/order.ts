import { Request, Response } from 'express'
import { prisma } from '../index'
import { CreateOrderInput, UpdateOrderStatusInput, UpdateOrderInput } from '../validations/order'
import { calculateDiameter } from '../utils/diameter'
import { canAccessFilial } from '../utils/authorization'

export async function createOrder(req: Request, res: Response) {
  try {
    const userId = req.user?.userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const data = req.body as CreateOrderInput

    // Master user must specify filialId, filial user uses their own
    let filialId: string | null = user.filialId
    if (user.role === 'MASTER') {
      if (!data.filialId) {
        return res.status(400).json({ error: 'Usuário Master deve selecionar uma filial' })
      }
      filialId = data.filialId
    }

    if (!filialId) {
      return res.status(400).json({ error: 'Filial não especificada' })
    }

    // Verificar se a lente existe
    const lens = await prisma.lens.findUnique({
      where: { id: data.lensId },
    })

    if (!lens) {
      return res.status(404).json({ error: 'Lente não encontrada' })
    }

    // Calcular diâmetro para surfaçado
    let diametro: number | undefined
    if (data.orderType === 'SURFACADO' && data.pa && data.am && data.odDnp && data.oeDnp) {
      diametro = calculateDiameter(data.pa, data.am, data.odDnp, data.oeDnp)
    }

    // Calcular quantity total para pedidos em grade
    let quantity = data.quantity
    let gradeData = data.gradeData
    if (data.orderType === 'GRADE' && data.gradeData) {
      const values = Object.values(data.gradeData) as number[]
      quantity = values.reduce((sum, v) => sum + v, 0)
    }

    // Gerar OS (número sequencial baseado na contagem total)
    const totalOrders = await prisma.order.count()
    const os = (totalOrders + 1).toString().padStart(6, '0')

    const order = await prisma.order.create({
      data: {
        os,
        clientOS: data.clientOS,
        orderType: data.orderType,
        quantity,
        patientName: data.patientName,
        pedidoPor: data.pedidoPor,
        notes: data.notes,
        lensId: data.lensId,
        filialId,
        createdById: userId!,
        selectedGrade: data.selectedGrade,
        gradeData: gradeData || undefined,

        // Dados OD
        odEsf: data.odEsf,
        odCil: data.odCil,
        odEixo: data.odEixo,
        odAdicao: data.odAdicao,
        odCentroOptico: data.odCentroOptico,
        odDnp: data.odDnp,

        // Dados OE
        oeEsf: data.oeEsf,
        oeCil: data.oeCil,
        oeEixo: data.oeEixo,
        oeAdicao: data.oeAdicao,
        oeCentroOptico: data.oeCentroOptico,
        oeDnp: data.oeDnp,

        // Dados Armação
        pa: data.pa,
        am: data.am,
        vertical: data.vertical,
        diametro,
        frameFormat: data.frameFormat,

        // Criar histórico inicial
        statusHistory: {
          create: {
            toStatus: 'PENDENTE',
          },
        },
      },
      include: {
        lens: true,
        filial: true,
        statusHistory: true,
      },
    })

    return res.status(201).json(order)
  } catch (error) {
    console.error('Create order error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function getOrders(req: Request, res: Response) {
  try {
    const userId = req.user?.userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const { filialId, status, startDate, endDate, search } = req.query

    const where: any = {}

    // Filial só vê seus pedidos
    if (user.role === 'FILIAL') {
      where.filialId = user.filialId
    } else if (filialId) {
      where.filialId = filialId as string
    }

    // Filtros
    if (status) {
      where.status = status as string
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string)
      }
    }

    if (search) {
      where.OR = [
        { os: { contains: search as string, mode: 'insensitive' } },
        { clientOS: { contains: search as string, mode: 'insensitive' } },
        { patientName: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        lens: {
          select: { id: true, name: true, type: true },
        },
        filial: {
          select: { id: true, name: true },
        },
        _count: {
          select: { statusHistory: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json(orders)
  } catch (error) {
    console.error('Get orders error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function getOrderById(req: Request, res: Response) {
  try {
    const { id } = req.params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        lens: true,
        filial: {
          select: { id: true, name: true, cnpj: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        chat: {
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
        },
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' })
    }

    if (!canAccessFilial(req.user, order.filialId)) {
      return res.status(403).json({ error: 'Não autorizado' })
    }

    return res.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { status, reason } = req.body as UpdateOrderStatusInput
    const userId = req.user?.userId

    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' })
    }

    if (!canAccessFilial(req.user, order.filialId)) {
      return res.status(403).json({ error: 'Não autorizado' })
    }

    // Validar transições de estado
    const validTransitions: Record<string, string[]> = {
      PENDENTE: ['ACEITO', 'RECUSADO', 'CANCELADO'],
      ACEITO: ['RECUSADO'],
      RECUSADO: ['PENDENTE', 'CANCELADO'],
    }

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ 
        error: `Não é possível alterar de ${order.status} para ${status}` 
      })
    }

    // Apenas matriz pode aceitar/recusar
    if (['ACEITO', 'RECUSADO'].includes(status)) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })
      if (user?.role !== 'MASTER') {
        return res.status(403).json({ error: 'Apenas a matriz pode aceitar/recusar pedidos' })
      }
    }

    // Apenas filial pode cancelar
    if (status === 'CANCELADO') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })
      if (user?.role !== 'FILIAL' || user.filialId !== order.filialId) {
        return res.status(403).json({ error: 'Apenas a filial pode cancelar seus pedidos' })
      }
    }

    // Filial só pode cancelar pedidos pendentes ou recusados
    if (status === 'CANCELADO' && !['PENDENTE', 'RECUSADO'].includes(order.status)) {
      return res.status(400).json({ 
        error: 'Só é possível cancelar pedidos pendentes ou recusados' 
      })
    }

    // Reenvio (RECUSADO -> PENDENTE) usa mesmo ID
    const newStatus = status

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: newStatus,
        statusHistory: {
          create: {
            fromStatus: order.status,
            toStatus: newStatus,
            reason: reason || undefined,
          },
        },
      },
      include: {
        lens: true,
        filial: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    // Criar notificação para filial em caso de recusa
    if (status === 'RECUSADO') {
      const filialUser = await prisma.user.findFirst({
        where: { filialId: order.filialId },
      })

      if (filialUser) {
        await prisma.notification.create({
          data: {
            title: 'Pedido Recusado',
            message: `O pedido #${order.os} foi recusado. Motivo: ${reason}`,
            userId: filialUser.id,
          },
        })
      }
    }

    return res.json(updatedOrder)
  } catch (error) {
    console.error('Update order status error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function updateOrder(req: Request, res: Response) {
  try {
    const { id } = req.params
    const data = req.body as UpdateOrderInput
    const userId = req.user?.userId

    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' })
    }

    // Apenas filial pode editar seus pedidos
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !canAccessFilial(req.user, order.filialId)) {
      return res.status(403).json({ error: 'Não é possível editar pedidos de outra filial' })
    }

    // Filial só pode editar pedidos pendentes ou recusados
    if (user?.role === 'FILIAL' && !['PENDENTE', 'RECUSADO'].includes(order.status)) {
      return res.status(400).json({ 
        error: 'Só é possível editar pedidos pendentes ou recusados' 
      })
    }

    // Recalcular diâmetro se necessário
    let diametro = order.diametro
    if (data.pa && data.am && data.odDnp && data.oeDnp) {
      diametro = calculateDiameter(data.pa, data.am, data.odDnp, data.oeDnp)
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...data,
        diametro,
      },
      include: {
        lens: true,
        filial: true,
      },
    })

    return res.json(updatedOrder)
  } catch (error) {
    console.error('Update order error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function getOrderStats(req: Request, res: Response) {
  try {
    const userId = req.user?.userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const where: any = {}
    if (user.role === 'FILIAL') {
      where.filialId = user.filialId
    }

    const [total, pendentes, aceitos, recusados] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: 'PENDENTE' } }),
      prisma.order.count({ where: { ...where, status: 'ACEITO' } }),
      prisma.order.count({ where: { ...where, status: 'RECUSADO' } }),
    ])

    return res.json({
      total,
      pendentes,
      aceitos,
      recusados,
    })
  } catch (error) {
    console.error('Get order stats error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
