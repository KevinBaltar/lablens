import { Request, Response } from 'express'
import { prisma } from '../index'
import { CreateLensInput, UpdateLensInput } from '../validations/lens'

export async function createLens(req: Request, res: Response) {
  try {
    const { name, type, addition, grades } = req.body as CreateLensInput

    const lens = await prisma.lens.create({
      data: {
        name,
        type,
        addition,
        grades: {
          create: grades,
        },
      },
      include: {
        grades: true,
      },
    })

    return res.status(201).json(lens)
  } catch (error) {
    console.error('Create lens error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function getLenses(req: Request, res: Response) {
  try {
    const { type } = req.query

    const lenses = await prisma.lens.findMany({
      where: type ? { type: type as any } : undefined,
      include: {
        grades: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return res.json(lenses)
  } catch (error) {
    console.error('Get lenses error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function getLensById(req: Request, res: Response) {
  try {
    const { id } = req.params

    const lens = await prisma.lens.findUnique({
      where: { id },
      include: {
        grades: true,
        _count: {
          select: { orders: true },
        },
      },
    })

    if (!lens) {
      return res.status(404).json({ error: 'Lente não encontrada' })
    }

    return res.json(lens)
  } catch (error) {
    console.error('Get lens error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function updateLens(req: Request, res: Response) {
  try {
    const { id } = req.params
    const data = req.body as UpdateLensInput

    const lens = await prisma.lens.findUnique({
      where: { id },
    })

    if (!lens) {
      return res.status(404).json({ error: 'Lente não encontrada' })
    }

    const updated = await prisma.lens.update({
      where: { id },
      data,
      include: {
        grades: true,
      },
    })

    return res.json(updated)
  } catch (error) {
    console.error('Update lens error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function deleteLens(req: Request, res: Response) {
  try {
    const { id } = req.params

    const lens = await prisma.lens.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    })

    if (!lens) {
      return res.status(404).json({ error: 'Lente não encontrada' })
    }

    if (lens._count.orders > 0) {
      return res.status(400).json({ error: 'Não é possível excluir lente com pedidos vinculados' })
    }

    await prisma.lens.delete({ where: { id } })

    return res.status(204).send()
  } catch (error) {
    console.error('Delete lens error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
