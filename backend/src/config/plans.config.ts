export const PLAN_LIMITS: Record<string, { rateLimit: number; dateRangeDays: number | null }> = {
    FREE: { rateLimit: 60, dateRangeDays: 7 },    // 60 req/min, Last 7 days
    TRIAL: { rateLimit: 20, dateRangeDays: 30 }, // 20 req/min, Last 30 days
    PRO: { rateLimit: 100, dateRangeDays: null } // 100 req/min, Unlimited
};
