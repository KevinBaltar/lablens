import { Router } from 'express'
import { 
  createEstablishment, 
  getEstablishments, 
  getEstablishmentById, 
  updateEstablishment, 
  deleteEstablishment,
  toggleEstablishmentStatus
} from '../controllers/establishment'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { createEstablishmentSchema, updateEstablishmentSchema } from '../validations/establishment'

const router = Router()

router.get('/', authenticate, getEstablishments)
router.get('/:id', authenticate, getEstablishmentById)
router.post('/', authenticate, validate(createEstablishmentSchema), createEstablishment)
router.put('/:id', authenticate, validate(updateEstablishmentSchema), updateEstablishment)
router.patch('/:id/toggle-status', authenticate, toggleEstablishmentStatus)
router.delete('/:id', authenticate, deleteEstablishment)

export default router
