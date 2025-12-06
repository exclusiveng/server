import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const orderController = new OrderController();

router.use(authenticate);

router.post('/checkout', (req, res) => orderController.checkout(req, res));
router.post('/verify', (req, res) => orderController.verifyPayment(req, res));
router.get('/', (req, res) => orderController.getUserOrders(req, res));

export default router;
