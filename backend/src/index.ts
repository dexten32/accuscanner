import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import scannerRoutes from './routes/scanner.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
import { authenticateToken } from './middleware/auth.middleware';
import { authorizePlan } from './middleware/role.middleware';
import { me } from './controllers/auth.controller';

import paymentRoutes from './routes/payment.routes';

// Routes
app.use('/auth', authRoutes);
app.use('/scanner', authenticateToken, authorizePlan(['FREE', 'TRIAL', 'PRO']), scannerRoutes);
app.use('/payment', paymentRoutes);
app.get('/me', authenticateToken, me as any);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
