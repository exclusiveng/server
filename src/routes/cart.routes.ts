import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const cartController = new CartController();

router.use(authenticate);

router.get('/', (req, res) => cartController.getCart(req, res));
router.post('/', (req, res) => cartController.addToCart(req, res));
router.put('/:itemId', (req, res) => cartController.updateCartItem(req, res));
router.delete('/:itemId', (req, res) => cartController.removeFromCart(req, res));
router.delete('/', (req, res) => cartController.clearCart(req, res));

export default router;
