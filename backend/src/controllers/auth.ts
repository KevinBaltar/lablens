import { Request, Response } from 'express'
import { prisma } from '../index'
import { hashPassword, comparePassword } from '../utils/password'
import { generateToken } from '../utils/token'
import { LoginInput, RegisterInput } from '../validations/auth'

const isSecureEnvironment = process.env.NODE_ENV === 'production' || !!process.env.VERCEL || process.env.HTTPS === 'true'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isSecureEnvironment,
  sameSite: 'strict' as const,
  maxAge: 5 * 60 * 60 * 1000,
  path: '/',
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as LoginInput

    const user = await prisma.user.findUnique({
      where: { email },
      include: { filial: true },
    })

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    const validPassword = await comparePassword(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      filialId: user.filialId ?? undefined,
    })

    // Set token em cookie httpOnly
    res.cookie('token', token, COOKIE_OPTIONS)

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        filialId: user.filialId,
        filialName: user.filial?.name,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { email, name, password, filialId } = req.body as RegisterInput

    if (!filialId) {
      return res.status(400).json({ error: 'Filial é obrigatória para novos usuários' })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' })
    }

    if (filialId) {
      const filial = await prisma.filial.findUnique({
        where: { id: filialId },
      })

      if (!filial) {
        return res.status(400).json({ error: 'Filial não encontrada' })
      }
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'FILIAL',
        filialId,
      },
    })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      filialId: user.filialId ?? undefined,
    })

    // Set token em cookie httpOnly
    res.cookie('token', token, COOKIE_OPTIONS)

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        filialId: user.filialId,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isSecureEnvironment,
    sameSite: 'strict',
    path: '/',
  })
  return res.json({ message: 'Logout realizado com sucesso' })
}

export async function getProfile(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        filialId: true,
        createdAt: true,
        filial: {
          select: {
            id: true,
            name: true,
            cnpj: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    return res.json(user)
  } catch (error) {
    console.error('Get profile error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    // Check if user exists (but don't reveal if user exists or not for security)
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success for security (don't reveal if user exists)
    return res.json({ message: 'Se o email estiver cadastrado, você receberá um link de redefinição de senha.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
