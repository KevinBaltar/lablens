import { Router } from 'express'
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from '../controllers/notification'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, getNotifications)
router.get('/unread-count', authenticate, getUnreadCount)
router.patch('/:id/read', authenticate, markAsRead)
router.patch('/read-all', authenticate, markAllAsRead)
router.delete('/:id', authenticate, deleteNotification)

export default router
