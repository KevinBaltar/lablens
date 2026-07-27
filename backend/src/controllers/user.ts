import { Request, Response } from 'express'
import { prisma } from '../index'
import { UpdateUserInput, ChangePasswordInput } from '../validations/user'
import { comparePassword, hashPassword } from '../utils/password'
import { canManageOwnUser } from '../utils/authorization'

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        filialId: true,
        createdAt: true,
        filial: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return res.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params
    if (!canManageOwnUser(req.user, id)) {
      return res.status(403).json({ error: 'Não autorizado' })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        filialId: true,
        createdAt: true,
        filial: {
          select: { id: true, name: true, cnpj: true },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    return res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params
    if (!canManageOwnUser(req.user, id)) {
      return res.status(403).json({ error: 'Não autorizado' })
    }
    const data = req.body as UpdateUserInput

    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' })
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        filialId: true,
      },
    })

    return res.json(updated)
  } catch (error) {
    console.error('Update user error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { id } = req.params
    if (req.user?.userId !== id) {
      return res.status(403).json({ error: 'A senha só pode ser alterada pelo próprio usuário' })
    }
    const { currentPassword, newPassword } = req.body as ChangePasswordInput

    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const validPassword = await comparePassword(currentPassword, user.password)

    if (!validPassword) {
      return res.status(400).json({ error: 'Senha atual incorreta' })
    }

    const hashedPassword = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })

    return res.json({ message: 'Senha alterada com sucesso' })
  } catch (error) {
    console.error('Change password error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true, chatMessages: true },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    if (user.role === 'MASTER') {
      return res.status(400).json({ error: 'Não é possível excluir usuário Master' })
    }

    if (user._count.orders > 0) {
      return res.status(400).json({ error: 'Não é possível excluir usuário com pedidos vinculados' })
    }

    await prisma.user.delete({ where: { id } })

    return res.status(204).send()
  } catch (error) {
    console.error('Delete user error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
