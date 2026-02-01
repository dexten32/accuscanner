import { Router } from 'express';
import { register, login, logout } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login as any);

router.post('/register', register as any);

router.post('/logout', logout as any);

export default router;
