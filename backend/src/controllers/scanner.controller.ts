import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import path from 'path';
import prisma from '../prisma';


// @ts-ignore
BigInt.prototype.toJSON = function () { return Number(this) }

// --- Global Cache ---
let dateCache: { data: string[], timestamp: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 1 Day in milliseconds

function invalidateCache() {
    console.log("[Cache] Invalidating date cache...");
    dateCache = null;
}

export const runScanner = async (req: Request, res: Response) => {
    try {
        const { date } = req.body; // YYYY-MM-DD
        console.log(`[Backend] Received run request for date: ${date}`);

        if (!date) {
            res.status(400).json({ error: "Date is required" });
            return;
        }

        // 1. Check if run exists
        const existingRun = await prisma.scannerRuns.findUnique({
            where: { run_date: new Date(date) }
        });

        if (existingRun) {
            // Only strictly block if it's fully completed
            if (existingRun.status === 'completed') {
                res.json({ message: "Scan already completed", status: 'completed' });
                return;
            }
            // Logic change: Allow re-run even if 'running' (to fix stuck state) or 'failed'
            console.log(`[Backend] Overwriting existing run with status: ${existingRun.status}`);
        }

        // 2. Create Run Record (upsert to be safe)
        await prisma.scannerRuns.upsert({
            where: { run_date: new Date(date) },
            update: { status: 'running', error_message: null, started_at: new Date() },
            create: {
                run_date: new Date(date),
                status: 'running'
            }
        });

        // 3. Spawn Python Process
        // Assuming python folder is at ../../python relative to dist/src or root depending on run
        // We act as if running from backend root
        const pythonScriptPath = path.resolve(__dirname, '../../../python/worker.py');
        const pythonCommand = process.env.PYTHON_EXECUTABLE || 'python';

        console.log(`Spawning python script at: ${pythonScriptPath} for date ${date}`);
        console.log(`Using Python Interpreter: ${pythonCommand}`);

        const pythonProcess = spawn(pythonCommand, [pythonScriptPath, '--date', date], {
            env: { ...process.env } // Pass environment variables (DATABASE_URL)
        });

        pythonProcess.stdout.on('data', (data) => {
            console.log(`[Python]: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`[Python Error]: ${data}`);
        });

        pythonProcess.on('close', async (code) => {
            console.log(`Python process exited with code ${code}`);
            if (code !== 0) {
                await prisma.scannerRuns.update({
                    where: { run_date: new Date(date) },
                    data: { status: 'failed', error_message: `Exited with code ${code}` }
                });
            } else {
                // Success! Invalidate cache so new dates appear immediately
                invalidateCache();
            }
        });

        res.json({ message: "Scanner started", status: 'running' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

import { PLAN_LIMITS } from '../config/plans.config';

export const getResults = async (req: Request, res: Response) => {
    try {
        const {
            date,
            min_delivery, max_delivery,
            min_vol, max_vol,
            min_price, max_price,
            is_fno
        } = req.query;

        if (!date) {
            res.status(400).json({ error: "Date is required" });
            return;
        }

        // ... existing security checks ...

        // Defaults
        const minDel = min_delivery ? Number(min_delivery) : 0;
        const maxDel = max_delivery ? Number(max_delivery) : 100;

        const minV = min_vol ? Number(min_vol) : 0;
        const maxV = max_vol ? Number(max_vol) : 1000;

        const minP = min_price ? Number(min_price) : -100;
        const maxP = max_price ? Number(max_price) : 100;

        // Build Where Clause
        const whereClause: any = {
            trade_date: new Date(date as string),
            delivery_percent: { gte: minDel, lte: maxDel },
            volume_multiplier: { gte: minV, lte: maxV },
            price_change_pct: { gte: minP, lte: maxP }
        };

        if (is_fno === 'true') {
            whereClause.is_fno = true;
        } else if (is_fno === 'false') {
            whereClause.is_fno = false;
        }

        const results = await prisma.scannerResults.findMany({
            where: whereClause,
            orderBy: {
                score: 'desc'
            }
        });

        res.json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: String(error) });
    }
};

export const getRunStatus = async (req: Request, res: Response) => {
    try {
        const { date } = req.query;
        if (!date) {
            res.status(400).json({ error: "Date is required" });
            return;
        }

        const run = await prisma.scannerRuns.findUnique({
            where: { run_date: new Date(date as string) }
        });

        res.json(run || { status: 'missing' });

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getAvailableDates = async (req: Request, res: Response) => {
    console.log("Date controller hit");

    try {
        let allDates: string[];

        // 1. Check Cache
        if (dateCache && (Date.now() - dateCache.timestamp < CACHE_TTL)) {
            console.log("[Cache] Serving dates from memory");
            allDates = dateCache.data;
        } else {
            // 2. Refresh Cache
            console.log("[Cache] Miss or expired. Fetching from DB...");
            const dates = await prisma.rawMarketData.findMany({
                select: { trade_date: true },
                distinct: ['trade_date'],
                orderBy: { trade_date: 'desc' },
                // DO NOT LIMIT HERE. Fetch ALL for cache.
            });

            allDates = dates.map(d => d.trade_date.toISOString().split('T')[0]);

            // Update Cache
            dateCache = {
                data: allDates,
                timestamp: Date.now()
            };
            console.log(`[Cache] Updated with ${allDates.length} dates.`);
        }

        // 3. Slice based on User Plan
        let resultDates = allDates;
        if (req.user) {
            const plan = req.user.plan;
            const limits = PLAN_LIMITS[plan] || PLAN_LIMITS['FREE'];
            if (limits.dateRangeDays !== null) {
                resultDates = allDates.slice(0, limits.dateRangeDays);
            }
        }

        res.json(resultDates);
    } catch (error) {
        console.error("Error fetching dates:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
