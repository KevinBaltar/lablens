import { Router } from 'express'
import { createClient, getClients, getClientById, updateClient, deleteClient } from '../controllers/client'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { createClientSchema, updateClientSchema } from '../validations/client'

const router = Router()

router.get('/', authenticate, getClients)
router.get('/:id', authenticate, getClientById)
router.post('/', authenticate, validate(createClientSchema), createClient)
router.put('/:id', authenticate, validate(updateClientSchema), updateClient)
router.delete('/:id', authenticate, deleteClient)

export default router
