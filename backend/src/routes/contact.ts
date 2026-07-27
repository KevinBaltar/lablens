import { Router } from 'express'
import { getContacts, createContact, updateContact, deleteContact } from '../controllers/contact'
import { authenticate, requireMaster } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, getContacts)
router.post('/', authenticate, requireMaster, createContact)
router.put('/:id', authenticate, requireMaster, updateContact)
router.delete('/:id', authenticate, requireMaster, deleteContact)

export default router
