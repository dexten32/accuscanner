"use client";
import { useEffect, useState } from "react";
import { Navbar } from "../../components/Navbar";
import { User, Shield, CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/config";

import { BillingModal } from "../../components/BillingModal";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${API_BASE}/me`, { credentials: 'include' });
                if (!res.ok) {
                    console.error(`Fetch failed: ${res.status} ${res.statusText}`);
                    const text = await res.text();
                    console.error(`Response body: ${text}`);
                    throw new Error('Failed to fetch user');
                }
                const data = await res.json();
                setUser(data.user);
            } catch (error) {
                console.error("Profile Fetch Error:", error);
                // router.push('/login'); // Commented out for debugging
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        const res = await loadRazorpayScript();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        try {
            // 1. Create Order
            const orderRes = await fetch(`${API_BASE}/payment/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const order = await orderRes.json();

            if (!orderRes.ok) throw new Error(order.error || 'Order creation failed');

            // 2. Open Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Should specific in env
                amount: order.amount,
                currency: order.currency,
                name: 'AccuScan Pro',
                description: 'Upgrade to Professional Plan',
                order_id: order.id,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    const verifyRes = await fetch(`${API_BASE}/payment/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }),
                        credentials: 'include'
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyRes.ok) {
                        alert("Payment Successful! Plan Upgraded.");
                        window.location.reload(); // Refresh to show new plan
                    } else {
                        alert("Verification Failed: " + verifyData.error);
                    }
                },
                prefill: {
                    email: user.email,
                },
                theme: {
                    color: '#10b981' // Emerald-500
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error(error);
            alert("Payment failed");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
            <Navbar />

            <main className="pt-24 px-6 max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/scan" className="inline-flex items-center text-zinc-400 hover:text-emerald-400 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Scanner
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                        My Profile
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* User Info Card */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                                    <User className="w-8 h-8 text-zinc-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">{user.email.split('@')[0]}</h2>
                                    <p className="text-zinc-500 text-sm">{user.email}</p>
                                    <div className="mt-2 inline-flex items-center px-2 py-1 rounded bg-zinc-800 border border-white/5 text-xs text-zinc-400">
                                        User ID: <span className="font-mono ml-1 text-zinc-500">{user.userId?.slice(0, 8) || 'N/A'}...</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Plan Details */}
                        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Shield className="w-5 h-5 text-emerald-500" />
                                        <h3 className="text-lg font-semibold text-white">Current Plan</h3>
                                    </div>
                                    <p className="text-zinc-400 text-sm">Your subscription status and limits.</p>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${user.plan === 'PRO'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                                    }`}>
                                    {user.plan}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                                <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                                    <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Rate Limit</div>
                                    <div className="text-white font-mono text-lg">
                                        {user.plan === 'FREE' ? '5' : user.plan === 'TRIAL' ? '20' : '100'} <span className="text-sm text-zinc-500">req/min</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                                    <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">History Access</div>
                                    <div className="text-white font-mono text-lg">
                                        {user.plan === 'FREE' ? '7 Days' : user.plan === 'TRIAL' ? '30 Days' : 'Unlimited'}
                                    </div>
                                </div>
                            </div>

                            {user.plan !== 'PRO' && (
                                <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
                                    <button
                                        onClick={handlePayment}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-[0.98]"
                                    >
                                        Upgrade to PRO (₹4999)
                                    </button>
                                    <p className="text-center text-xs text-zinc-500 mt-2">Unlock unlimited history and higher rate limits.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar / Extra Info */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="w-5 h-5 text-zinc-400" />
                                <h3 className="font-semibold text-white">Billing</h3>
                            </div>
                            <p className="text-sm text-zinc-400 mb-4">Manage your payment methods and billing history.</p>
                            <button
                                onClick={() => setIsBillingModalOpen(true)}
                                className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors"
                            >
                                Manage Billing
                            </button>
                        </div>
                    </div>
                </div>

                <BillingModal
                    isOpen={isBillingModalOpen}
                    onClose={() => setIsBillingModalOpen(false)}
                    user={user}
                    onUpgrade={handlePayment}
                />
            </main>
        </div>
    );
}
