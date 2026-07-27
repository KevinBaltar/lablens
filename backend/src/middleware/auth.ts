import { Request, Response, NextFunction } from 'express'
import { verifyToken, TokenPayload } from '../utils/token'
import { prisma } from '../index'

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  // Buscar token do cookie httpOnly
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).json({ error: 'Não autenticado' })
  }

  try {
    const payload = verifyToken(token)
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) {
      return res.status(401).json({ error: 'Sessão inválida' })
    }
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      filialId: user.filialId ?? undefined,
    }
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

export function requireMaster(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'MASTER') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' })
  }
  next()
}

export function requireFilial(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'FILIAL') {
    return res.status(403).json({ error: 'Acesso negado. Apenas filiais.' })
  }
  next()
}
