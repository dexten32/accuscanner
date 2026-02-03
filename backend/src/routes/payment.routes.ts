import { Router } from 'express';
import { createOrder, verifyPayment, mockPaymentSuccess } from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Protect all payment routes
router.use(authenticateToken);

router.post('/order', createOrder);
router.post('/verify', verifyPayment);
router.post('/mock', mockPaymentSuccess);

export default router;
