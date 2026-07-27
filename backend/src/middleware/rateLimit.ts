import rateLimit from 'express-rate-limit'

// Skip rate limiting in test environment
const isTest = process.env.NODE_ENV === 'test'

// Rate limiting geral
export const generalLimiter = isTest
  ? (_req: any, _res: any, next: any) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // Máximo 100 requisições por IP
      message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
      standardHeaders: true,
      legacyHeaders: false,
    })

// Rate limiting para login (mais restritivo)
export const loginLimiter = isTest
  ? (_req: any, _res: any, next: any) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 5, // Máximo 5 tentativas de login
      message: { error: 'Muitas tentativas de login. Tente novamente mais tarde.' },
      standardHeaders: true,
      legacyHeaders: false,
    })

// Rate limiting para APIs sensíveis
export const sensitiveLimiter = isTest
  ? (_req: any, _res: any, next: any) => next()
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hora
      max: 20, // Máximo 20 requisições
      message: { error: 'Limite de requisições atingido.' },
      standardHeaders: true,
      legacyHeaders: false,
    })
