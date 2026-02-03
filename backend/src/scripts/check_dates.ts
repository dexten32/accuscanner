
import dotenv from 'dotenv';
dotenv.config();

console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);

import prisma from '../prisma';

async function checkDates() {
    try {
        console.log("Fetching distinct trade_dates from ScannerResults...");
        const dates = await prisma.scannerResults.findMany({
            select: { trade_date: true },
            distinct: ['trade_date'],
            orderBy: { trade_date: 'desc' }
        });

        console.log(`Found ${dates.length} dates.`);
        dates.forEach(d => {
            console.log(d.trade_date.toISOString().split('T')[0]);
        });

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkDates();
