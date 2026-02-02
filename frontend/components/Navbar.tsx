"use client";
import Link from "next/link";
import { BarChart3, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { API_BASE } from "@/lib/config";

export const Navbar = () => {
    const [user, setUser] = useState<any>(null);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Simple check if user is logged in via /me endpoint
        const checkUser = async () => {
            try {
                // Use localhost URL directly or a proper env var in real app
                // We need credentials execution
                const res = await fetch(`${API_BASE}/me`, {
                    credentials: 'include'
                });
                const data = await res.json();
                setUser(data.user);
            } catch (e) {
                setUser(null);
            }
        };
        checkUser();
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
            setUser(null);
            router.push('/login');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-black/20 border-b border-white/5">
            <div className="flex items-center gap-3">
                <Link href="/">
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <BarChart3 className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">AccuScan</span>
                    </div>
                </Link>
            </div>
            {pathname !== '/scan' && pathname !== '/me' && (
                <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
                    <Link href="/#how-it-works" className="hover:text-emerald-400 transition-colors">How it Works</Link>
                    <Link href="/#disclaimer" className="hover:text-emerald-400 transition-colors">Disclaimer</Link>
                </div>
            )}
            <div className="flex gap-4 items-center">
                {user && user.email ? (
                    <>

                        {pathname !== '/scan' && pathname !== '/me' && (
                            <Link href="/scan">
                                <button className="px-5 py-2 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 transition-transform active:scale-95">
                                    Scanner
                                </button>
                            </Link>
                        )}
                        <div className="relative">
                            <button
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                            >
                                <User className="w-5 h-5 text-zinc-300" />
                            </button>

                            {userDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl py-1 z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-white/5">
                                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                                        <p className="text-xs text-zinc-500 capitalize">{user.plan} Plan</p>
                                    </div>
                                    <Link
                                        href="/me"
                                        className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                        onClick={() => setUserDropdownOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex gap-3">
                        <Link href="/login">
                            <button className="px-5 py-2 rounded-full text-zinc-300 font-medium text-sm hover:text-white transition-colors">
                                Login
                            </button>
                        </Link>
                        <Link href="/login?mode=signup">
                            <button className="px-5 py-2 rounded-full bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
                                Sign Up
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};
