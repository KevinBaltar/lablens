import { Request, Response } from 'express'
import { prisma } from '../index'
import { CreateEstablishmentInput, UpdateEstablishmentInput } from '../validations/establishment'
import { canAccessFilial } from '../utils/authorization'

export async function createEstablishment(req: Request, res: Response) {
  try {
    const userId = req.user?.userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.filialId) {
      return res.status(403).json({ error: 'Apenas filiais podem cadastrar estabelecimentos' })
    }

    const data = req.body as CreateEstablishmentInput

    // Verificar se CNPJ já existe
    if (data.cnpj) {
      const existingEstablishment = await prisma.establishment.findUnique({
        where: { cnpj: data.cnpj },
      })

      if (existingEstablishment) {
        return res.status(400).json({ error: 'CNPJ já cadastrado' })
      }
    }

    const establishment = await prisma.establishment.create({
      data: {
        ...data,
        filialId: user.filialId,
      },
    })

    return res.status(201).json(establishment)
  } catch (error) {
    console.error('Create establishment error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function getEstablishments(req: Request, res: Response) {
  try {
    const userId = req.user?.userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const { search, type, active, filialId } = req.query

    const where: any = {}

    // Filial só vê seus estabelecimentos
    if (user.role === 'FILIAL') {
      where.filialId = user.filialId
    } else if (filialId) {
      where.filialId = filialId as string
    }

    // Filtros
    if (type) {
      where.type = type as string
    }

    if (active !== undefined) {
      where.active = active === 'true'
    }

    // Busca por nome, CNPJ ou responsável
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { cnpj: { contains: search as string, mode: 'insensitive' } },
        { responsible: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    const establishments = await prisma.establishment.findMany({
      where,
      include: {
        filial: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return res.json(establishments)
  } catch (error) {
    console.error('Get establishments error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function getEstablishmentById(req: Request, res: Response) {
  try {
    const { id } = req.params

    const establishment = await prisma.establishment.findUnique({
      where: { id },
      include: {
        filial: {
          select: { id: true, name: true, cnpj: true },
        },
      },
    })

    if (!establishment) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' })
    }

    if (!canAccessFilial(req.user, establishment.filialId)) {
      return res.status(403).json({ error: 'Não autorizado' })
    }

    return res.json(establishment)
  } catch (error) {
    console.error('Get establishment error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function updateEstablishment(req: Request, res: Response) {
  try {
    const { id } = req.params
    const data = req.body as UpdateEstablishmentInput

    const establishment = await prisma.establishment.findUnique({
      where: { id },
    })

    if (!establishment) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' })
    }

    // Verificar se o usuário tem permissão
    const userId = req.user?.userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !canAccessFilial(req.user, establishment.filialId)) {
      return res.status(403).json({ error: 'Não é possível editar estabelecimentos de outra filial' })
    }

    // Verificar se CNPJ já existe (se estiver alterando)
    if (data.cnpj && data.cnpj !== establishment.cnpj) {
      const existingEstablishment = await prisma.establishment.findUnique({
        where: { cnpj: data.cnpj },
      })

      if (existingEstablishment) {
        return res.status(400).json({ error: 'CNPJ já cadastrado' })
      }
    }

    const updated = await prisma.establishment.update({
      where: { id },
      data,
    })

    return res.json(updated)
  } catch (error) {
    console.error('Update establishment error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function deleteEstablishment(req: Request, res: Response) {
  try {
    const { id } = req.params

    const establishment = await prisma.establishment.findUnique({
      where: { id },
    })

    if (!establishment) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' })
    }

    if (!canAccessFilial(req.user, establishment.filialId)) {
      return res.status(403).json({ error: 'Não autorizado' })
    }

    await prisma.establishment.delete({ where: { id } })

    return res.status(204).send()
  } catch (error) {
    console.error('Delete establishment error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function toggleEstablishmentStatus(req: Request, res: Response) {
  try {
    const { id } = req.params

    const establishment = await prisma.establishment.findUnique({
      where: { id },
    })

    if (!establishment) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' })
    }

    if (!canAccessFilial(req.user, establishment.filialId)) {
      return res.status(403).json({ error: 'Não autorizado' })
    }

    const updated = await prisma.establishment.update({
      where: { id },
      data: { active: !establishment.active },
    })

    return res.json(updated)
  } catch (error) {
    console.error('Toggle establishment status error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
