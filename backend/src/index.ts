import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import scannerRoutes from './routes/scanner.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
    'https://accuscan.co.in',
    'https://www.accuscan.co.in'
];

if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000');
}

app.use(cors({
    origin: allowedOrigins,
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

// Static files (frontend build)
// In prod (dist/), public is ../public
// In dev (src/), public is ../public
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// SPA fallback (must be last, before error handler)
app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/auth') || req.path.startsWith('/scanner') || req.path.startsWith('/payment') || req.path.startsWith('/me')) {
        return next();
    }
    res.sendFile(path.join(publicPath, "index.html"));
});



app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});