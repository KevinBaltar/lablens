import { Router } from 'express'
import { login, register, logout, getProfile, forgotPassword } from '../controllers/auth'
import { authenticate, requireMaster } from '../middleware/auth'
import { sensitiveLimiter } from '../middleware/rateLimit'
import { validate } from '../middleware/validate'
import { loginSchema, registerSchema } from '../validations/auth'

const router = Router()

router.post('/login', validate(loginSchema), login)
router.post('/register', authenticate, requireMaster, validate(registerSchema), register)
router.post('/logout', authenticate, logout)
router.get('/profile', authenticate, getProfile)
router.post('/forgot-password', sensitiveLimiter, validate(loginSchema.pick({ email: true })), forgotPassword)

export default router
