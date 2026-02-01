import { Router } from 'express';
import { runScanner, getResults, getRunStatus, getAvailableDates } from '../controllers/scanner.controller';
import { authenticateToken } from '../middleware/auth.middleware';

import { rateLimitMiddleware } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/run', authenticateToken, rateLimitMiddleware, runScanner);
router.get('/results', authenticateToken, rateLimitMiddleware, getResults);
router.get('/status', authenticateToken, getRunStatus); // No rate limit on polling
router.get('/dates', authenticateToken, rateLimitMiddleware, getAvailableDates);

export default router;
