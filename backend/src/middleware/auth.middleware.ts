import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    userId: string;
    email: string;
    plan: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {

    const token = req.cookies.token;


    if (!token) {
        res.status(401).json({ error: 'Access denied, token missing' });
        return;
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = verified as JwtPayload;
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err);
        res.status(403).json({ error: 'Invalid token' });
    }
};
