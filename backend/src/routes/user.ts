import { Router } from 'express'
import { getUsers, getUserById, updateUser, changePassword, deleteUser } from '../controllers/user'
import { authenticate, requireMaster } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { updateUserSchema, changePasswordSchema } from '../validations/user'

const router = Router()

router.get('/', authenticate, requireMaster, getUsers)
router.get('/:id', authenticate, getUserById)
router.put('/:id', authenticate, validate(updateUserSchema), updateUser)
router.put('/:id/password', authenticate, validate(changePasswordSchema), changePassword)
router.delete('/:id', authenticate, requireMaster, deleteUser)

export default router
