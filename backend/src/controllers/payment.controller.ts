import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../prisma';

// Initialize Razorpay
// NOTE: User must provide these in .env
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

export const createOrder = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const userId = req.user.userId;
        const amount = 499900; // Amount in paise (e.g., 4999.00 INR) -> Adjust as needed
        const currency = 'INR';

        const options = {
            amount: amount,
            currency: currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // Save pending payment record
        await prisma.payment.create({
            data: {
                user_id: userId,
                razorpay_order_id: order.id,
                amount: amount / 100, // Store in actual currency unit
                currency: currency,
                status: 'pending'
            } as any
        });

        res.json(order);

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
};

export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            res.status(400).json({ error: "Missing payment details" });
            return;
        }

        // Verify Signature
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {

            // 1. Update Payment Status
            // Use findFirst to avoid potential unique constraints type issues
            const payment = await prisma.payment.findFirst({
                where: { razorpay_order_id: razorpay_order_id } as any
            });

            if (payment) {
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        razorpay_payment_id: razorpay_payment_id,
                        status: 'success'
                    } as any // Force cast to avoid type issues if generated client is out of sync
                });
            } else {
                console.error("Payment record not found for order:", razorpay_order_id);
                // Proceeding cautiously, or return error? 
                // If we can't find the payment, we should probably warn but might still want to upgrade user if signature is valid.
                // However, usually we update the payment record.
            }

            // 2. Upgrade User Subscription
            if (req.user) {
                // Upsert subscription
                await prisma.subscription.upsert({
                    where: { user_id: req.user.userId },
                    update: {
                        plan: 'PRO',
                        status: 'ACTIVE',
                        starts_at: new Date(),
                        // Set end date to 30 days from now for example
                        ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    },
                    create: {
                        user: { connect: { id: req.user.userId } },
                        plan: 'PRO',
                        status: 'ACTIVE',
                        starts_at: new Date(),
                        ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    }
                });
            }

            res.json({ status: 'success', message: "Payment verified and Plan Upgraded" });
        } else {
            res.status(400).json({ error: "Invalid Signature" });
        }

    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
