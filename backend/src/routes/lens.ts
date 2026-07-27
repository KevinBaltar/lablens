import { Router } from 'express'
import { createLens, getLenses, getLensById, updateLens, deleteLens } from '../controllers/lens'
import { authenticate, requireMaster } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { createLensSchema, updateLensSchema } from '../validations/lens'

const router = Router()

router.get('/', authenticate, getLenses)
router.get('/:id', authenticate, getLensById)
router.post('/', authenticate, requireMaster, validate(createLensSchema), createLens)
router.put('/:id', authenticate, requireMaster, validate(updateLensSchema), updateLens)
router.delete('/:id', authenticate, requireMaster, deleteLens)

export default router
