import { Request, Response, NextFunction } from 'express';

export const authorizePlan = (allowedPlans: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !allowedPlans.includes(req.user.plan)) {
            res.status(403).json({ error: 'Access forbidden: Insufficient plan' });
            return;
        }
        next();
    };
};
