import { Router } from 'express'
import { getChatByOrder, sendMessage, getChatMessages } from '../controllers/chat'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/:orderId', authenticate, getChatByOrder)
router.get('/:orderId/messages', authenticate, getChatMessages)
router.post('/:orderId', authenticate, sendMessage)

export default router
