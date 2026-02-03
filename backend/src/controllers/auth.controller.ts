import { Request, Response } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET || 'secret';



export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        console.log("[Backend] Register Request for:", email);

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password required' });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        console.log("[Backend] Existing user found?", existingUser ? "YES" : "NO", existingUser?.id);

        if (existingUser) {
            console.log("[Backend] Returning 409 Conflict");
            res.status(409).json({ error: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password_hash: hashedPassword,
                subscription: {
                    create: {
                        plan: 'FREE',
                        status: 'ACTIVE',
                        starts_at: new Date(),
                        ends_at: null // Free plan has no expiry
                    }
                }
            },
            include: { subscription: true }
        });

        // Auto login
        const token = jwt.sign(
            { userId: user.id, email: user.email, plan: user.subscription?.plan || 'FREE' },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            domain: isProduction ? ".accuscan.co.in" : undefined,
            maxAge: 86400000 // 1 day
        });

        res.status(201).json({ message: 'Registered successfully', user: { email: user.email, plan: user.subscription?.plan } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
            include: { subscription: true }
        });

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Check if subscription is ACTIVE
        if (user.subscription?.status !== 'ACTIVE') {
            res.status(403).json({ error: 'Subscription is not active.' });
            return;
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, plan: user.subscription?.plan || 'FREE' },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax', // Lax for local dev
            domain: isProduction ? ".accuscan.co.in" : undefined, // Undefined for localhost
            maxAge: 86400000
        });

        res.json({ message: 'Login successful', user: { email: user.email, plan: user.subscription?.plan } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
};

export const me = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.json({ user: null });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { subscription: true }
        });

        if (user) {
            res.json({ user: { userId: user.id, email: user.email, plan: user.subscription?.plan } });
        } else {
            res.json({ user: null });
        }
    } catch (error) {
        console.error("Error in /me endpoint:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
