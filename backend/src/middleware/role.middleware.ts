import { Request, Response, NextFunction } from 'express';

export const authorizePlan = (allowedPlans: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !allowedPlans.includes(req.user.plan)) {
            console.error(`[RoleGuard] Access Denied. User Plan: ${req.user?.plan}, Allowed: ${allowedPlans}`);
            res.status(403).json({ error: 'Access forbidden: Insufficient plan' });
            return;
        }
        next();
    };
};
