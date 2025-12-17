import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();
const orderController = new OrderController();

router.use(authenticate);

router.post('/checkout', (req, res) => orderController.checkout(req, res));
router.post('/verify', (req, res) => orderController.verifyPayment(req, res));
router.get('/', (req, res) => orderController.getUserOrders(req, res));

// Admin Routes
router.get('/all', authorize(UserRole.ADMIN), (req, res) => orderController.getAllOrders(req, res));
router.put('/:id/status', authorize(UserRole.ADMIN), (req, res) => orderController.updateOrderStatus(req, res));

export default router;
