"use client";
import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import Link from 'next/link';
import { API_BASE } from "@/lib/config";
import { useAuth } from "@/context/AuthContext";

function LoginContent() {
    const searchParams = useSearchParams();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const { user, login } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            router.push("/scan");
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return; // Prevent double submission

        setError("");
        setIsSubmitting(true);

        if (!isLogin && password !== confirmPassword) {
            setError("Passwords do not match");
            setIsSubmitting(false);
            return;
        }

        const endpoint = isLogin ? "/login" : "/register";
        console.log(`[Frontend] Submitting to ${endpoint}`, { email, isLogin });
        try {
            const res = await fetch(`${API_BASE}/auth${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include", // Important for cookies
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "An error occurred");
                setIsSubmitting(false);
                return;
            }

            // Redirect to scanner on success
            if (isLogin) {
                // Update context state
                // Re-fetch user to update context
                window.location.href = '/scan'; // Force reload to ensure cookies are set and context is fresh
            } else {
                router.push("/login?state=created");
                setIsLogin(true);
                setIsSubmitting(false);
            }
        } catch (err) {
            setError("Failed to connect to server");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative isolate overflow-hidden">
            <Navbar />

            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 mt-20">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-3xl font-extrabold tracking-tight text-white">
                        {isLogin ? "Sign in to your account" : "Create a new account"}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Or{' '}
                        <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-emerald-500 hover:text-emerald-400">
                            {isLogin ? "create a new account" : "log in to existing account"}
                        </button>
                    </p>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 pl-3"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
                                    Password
                                </label>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 pl-3"
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-white">
                                        Confirm Password
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 pl-3"
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${isSubmitting ? 'bg-emerald-500/50 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400'}`}
                            >
                                {isSubmitting ? 'Processing...' : (isLogin ? "Sign in" : "Sign up")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
