import { Request, Response } from 'express'
import { prisma } from '../index'
import { CreateFilialInput, UpdateFilialInput } from '../validations/filial'
import { canAccessFilial } from '../utils/authorization'

export async function createFilial(req: Request, res: Response) {
  try {
    const data = req.body as CreateFilialInput

    const existingFilial = await prisma.filial.findUnique({
      where: { cnpj: data.cnpj },
    })

    if (existingFilial) {
      return res.status(400).json({ error: 'CNPJ já cadastrado' })
    }

    const filial = await prisma.filial.create({ data })

    return res.status(201).json(filial)
  } catch (error) {
    console.error('Create filial error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function getFiliais(req: Request, res: Response) {
  try {
    const filiais = await prisma.filial.findMany({
      include: {
        _count: {
          select: { users: true, orders: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return res.json(filiais)
  } catch (error) {
    console.error('Get filiais error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function getFilialById(req: Request, res: Response) {
  try {
    const { id } = req.params
    if (!canAccessFilial(req.user, id)) {
      return res.status(403).json({ error: 'Não autorizado' })
    }

    const filial = await prisma.filial.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: {
          select: { orders: true },
        },
      },
    })

    if (!filial) {
      return res.status(404).json({ error: 'Filial não encontrada' })
    }

    return res.json(filial)
  } catch (error) {
    console.error('Get filial error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function updateFilial(req: Request, res: Response) {
  try {
    const { id } = req.params
    const data = req.body as UpdateFilialInput

    const filial = await prisma.filial.findUnique({
      where: { id },
    })

    if (!filial) {
      return res.status(404).json({ error: 'Filial não encontrada' })
    }

    if (data.cnpj && data.cnpj !== filial.cnpj) {
      const existingFilial = await prisma.filial.findUnique({
        where: { cnpj: data.cnpj },
      })

      if (existingFilial) {
        return res.status(400).json({ error: 'CNPJ já cadastrado' })
      }
    }

    const updated = await prisma.filial.update({
      where: { id },
      data,
    })

    return res.json(updated)
  } catch (error) {
    console.error('Update filial error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function deleteFilial(req: Request, res: Response) {
  try {
    const { id } = req.params

    const filial = await prisma.filial.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true, orders: true },
        },
      },
    })

    if (!filial) {
      return res.status(404).json({ error: 'Filial não encontrada' })
    }

    if (filial._count.users > 0) {
      return res.status(400).json({ error: 'Não é possível excluir filial com usuários vinculados' })
    }

    if (filial._count.orders > 0) {
      return res.status(400).json({ error: 'Não é possível excluir filial com pedidos vinculados' })
    }

    await prisma.filial.delete({ where: { id } })

    return res.status(204).send()
  } catch (error) {
    console.error('Delete filial error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
