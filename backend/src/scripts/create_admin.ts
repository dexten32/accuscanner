import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';


async function main() {
    const email = 'admin@accuscan.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + 30);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password_hash: hashedPassword,
                subscription: {
                    create: {
                        plan: 'PRO',
                        status: 'ACTIVE',
                        starts_at: new Date(),
                        ends_at: endsAt
                    }
                }
            },
            include: { subscription: true }
        });

        console.log(`User created: ${user.email}`);
        console.log(`Plan: ${user.subscription?.plan}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
