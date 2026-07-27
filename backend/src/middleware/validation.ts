import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

// Validação de parâmetros de URL
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as any
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Parâmetros inválidos',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        })
      }
      next(error)
    }
  }
}

// Validação de query params
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Parâmetros de consulta inválidos',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        })
      }
      next(error)
    }
  }
}

// Validação de IDs (CUID format)
export function validateId(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params
  const cuidRegex = /^c[a-z0-9]{24,}$/
  
  if (!cuidRegex.test(id)) {
    return res.status(400).json({ error: 'ID inválido' })
  }
  
  next()
}

// Validação de paginação
export function validatePagination(req: Request, _res: Response, next: NextFunction) {
  const { page, limit } = req.query
  
  if (page) {
    const pageNum = parseInt(page as string)
    if (isNaN(pageNum) || pageNum < 1) {
      req.query.page = '1'
    }
  }
  
  if (limit) {
    const limitNum = parseInt(limit as string)
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      req.query.limit = '10'
    }
  }
  
  next()
}
