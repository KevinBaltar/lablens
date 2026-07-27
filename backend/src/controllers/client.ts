import { Request, Response } from 'express'
import { prisma } from '../index'
import { CreateClientInput, UpdateClientInput } from '../validations/client'
import { canAccessFilial } from '../utils/authorization'

export async function createClient(req: Request, res: Response) {
  try {
    const userId = req.user?.userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.filialId) {
      return res.status(403).json({ error: 'Apenas filiais podem cadastrar clientes' })
    }

    const data = req.body as CreateClientInput

    // Verificar se CPF já existe
    if (data.cpf) {
      const existingClient = await prisma.client.findUnique({
        where: { cpf: data.cpf },
      })

      if (existingClient) {
        return res.status(400).json({ error: 'CPF já cadastrado' })
      }
    }

    const client = await prisma.client.create({
      data: {
        ...data,
        filialId: user.filialId,
      },
    })

    return res.status(201).json(client)
  } catch (error) {
    console.error('Create client error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function getClients(req: Request, res: Response) {
  try {
    const userId = req.user?.userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const { search, filialId } = req.query

    const where: any = {}

    // Filial só vê seus clientes
    if (user.role === 'FILIAL') {
      where.filialId = user.filialId
    } else if (filialId) {
      where.filialId = filialId as string
    }

    // Busca por nome, CPF ou email
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { cpf: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        filial: {
          select: { id: true, name: true },
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return res.json(clients)
  } catch (error) {
    console.error('Get clients error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function getClientById(req: Request, res: Response) {
  try {
    const { id } = req.params

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        filial: {
          select: { id: true, name: true, cnpj: true },
        },
        orders: {
          select: {
            id: true,
            os: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { orders: true },
        },
      },
    })

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' })
    }

    if (!canAccessFilial(req.user, client.filialId)) {
      return res.status(403).json({ error: 'Não autorizado' })
    }

    return res.json(client)
  } catch (error) {
    console.error('Get client error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function updateClient(req: Request, res: Response) {
  try {
    const { id } = req.params
    const data = req.body as UpdateClientInput

    const client = await prisma.client.findUnique({
      where: { id },
    })

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' })
    }

    // Verificar se o usuário tem permissão
    const userId = req.user?.userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !canAccessFilial(req.user, client.filialId)) {
      return res.status(403).json({ error: 'Não é possível editar clientes de outra filial' })
    }

    // Verificar se CPF já existe (se estiver alterando)
    if (data.cpf && data.cpf !== client.cpf) {
      const existingClient = await prisma.client.findUnique({
        where: { cpf: data.cpf },
      })

      if (existingClient) {
        return res.status(400).json({ error: 'CPF já cadastrado' })
      }
    }

    const updated = await prisma.client.update({
      where: { id },
      data,
    })

    return res.json(updated)
  } catch (error) {
    console.error('Update client error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function deleteClient(req: Request, res: Response) {
  try {
    const { id } = req.params

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    })

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' })
    }

    if (!canAccessFilial(req.user, client.filialId)) {
      return res.status(403).json({ error: 'Não autorizado' })
    }

    if (client._count.orders > 0) {
      return res.status(400).json({ error: 'Não é possível excluir cliente com pedidos vinculados' })
    }

    await prisma.client.delete({ where: { id } })

    return res.status(204).send()
  } catch (error) {
    console.error('Delete client error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
