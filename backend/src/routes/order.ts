import { Router } from 'express'
import { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrderStatus, 
  updateOrder,
  getOrderStats 
} from '../controllers/order'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { createOrderSchema, updateOrderStatusSchema, updateOrderSchema } from '../validations/order'

const router = Router()

router.get('/', authenticate, getOrders)
router.get('/stats', authenticate, getOrderStats)
router.get('/:id', authenticate, getOrderById)
router.post('/', authenticate, validate(createOrderSchema), createOrder)
router.put('/:id', authenticate, validate(updateOrderSchema), updateOrder)
router.patch('/:id/status', authenticate, validate(updateOrderStatusSchema), updateOrderStatus)

export default router
