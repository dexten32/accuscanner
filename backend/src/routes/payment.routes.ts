import { Router } from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Protect all payment routes
router.use(authenticateToken);

router.post('/order', createOrder);
router.post('/verify', verifyPayment);

export default router;
