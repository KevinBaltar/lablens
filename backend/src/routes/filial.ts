import { Router } from 'express'
import { createFilial, getFiliais, getFilialById, updateFilial, deleteFilial } from '../controllers/filial'
import { authenticate, requireMaster } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { createFilialSchema, updateFilialSchema } from '../validations/filial'

const router = Router()

router.get('/', authenticate, getFiliais)
router.get('/:id', authenticate, getFilialById)
router.post('/', authenticate, requireMaster, validate(createFilialSchema), createFilial)
router.put('/:id', authenticate, requireMaster, validate(updateFilialSchema), updateFilial)
router.delete('/:id', authenticate, requireMaster, deleteFilial)

export default router
