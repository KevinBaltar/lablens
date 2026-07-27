import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const configuredSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test-only-secret' : undefined)
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '5h'

if (!configuredSecret) {
  throw new Error('JWT_SECRET deve ser configurado fora do ambiente de teste')
}

const JWT_SECRET: string = configuredSecret

export interface TokenPayload {
  userId: string
  email: string
  role: 'MASTER' | 'FILIAL'
  filialId?: string
}

export function generateToken(payload: TokenPayload): string {
  // Convert "5h" to seconds: 5 * 60 * 60 = 18000
  const expirationMatch = JWT_EXPIRATION.match(/^(\d+)([hms])$/)
  let expiresIn: number = 18000 // default 5 hours in seconds

  if (expirationMatch) {
    const value = parseInt(expirationMatch[1])
    const unit = expirationMatch[2]
    switch (unit) {
      case 'h':
        expiresIn = value * 60 * 60
        break
      case 'm':
        expiresIn = value * 60
        break
      case 's':
        expiresIn = value
        break
    }
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as unknown as TokenPayload
}
