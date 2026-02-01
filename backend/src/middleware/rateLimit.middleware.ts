import { Request, Response, NextFunction } from 'express';
import { PLAN_LIMITS } from '../config/plans.config';

interface RateLimitData {
    count: number;
    startTime: number;
}

// In-memory store: userId -> RateLimitData
// Note: In a distributed system, use Redis. For a single instance, this is fine.
const rateLimits = new Map<string, RateLimitData>();

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        // Should catch this in auth middleware, but safety check
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const { userId, plan } = req.user;
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS['FREE']; // Default to free if unknown
    const limit = limits.rateLimit;

    const currentTime = Date.now();
    const windowSize = 60 * 1000; // 1 minute

    const userUsage = rateLimits.get(userId) || { count: 0, startTime: currentTime };

    // Reset window if expired
    if (currentTime - userUsage.startTime > windowSize) {
        userUsage.count = 0;
        userUsage.startTime = currentTime;
    }

    if (userUsage.count >= limit) {
        res.status(429).json({
            error: `Rate limit exceeded. You are on the ${plan} plan which allows ${limit} requests per minute. Upgrade for more.`
        });
        return;
    }

    userUsage.count++;
    rateLimits.set(userId, userUsage);

    next();
};
