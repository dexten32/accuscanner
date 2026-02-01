'use client';

import Link from "next/link";
import { ArrowRight, BarChart3, TrendingUp, ShieldCheck, Info, Zap, Activity } from "lucide-react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";

// --- Components ---

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className={`group relative border border-white/10 bg-gray-900/50 overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionValueTemplate`radial-gradient(650px circle at ${mouseX}px ${mouseY}px, rgba(16, 185, 129, 0.15), transparent 80%)`,
                }}
            />
            {children}
        </div>
    );
}

function useMotionValueTemplate(strings: TemplateStringsArray, ...values: any[]) {
    return useTransform(values, (v) => {
        let result = "";
        for (let i = 0; i < strings.length; i++) {
            result += strings[i];
            if (i < v.length) {
                result += v[i];
            }
        }
        return result;
    });
}





const Hero = () => {
    const { scrollY } = useScroll();

    // Parallax Effects for Text
    const yText = useTransform(scrollY, [0, 500], [0, 150]);
    const ySubText = useTransform(scrollY, [0, 500], [0, 100]);
    const opacityText = useTransform(scrollY, [0, 300], [1, 0]);

    // Deep Parallax for Floating Elements
    const y1 = useTransform(scrollY, [0, 1000], [0, 400]);
    const y2 = useTransform(scrollY, [0, 1000], [0, -300]);
    const rotate1 = useTransform(scrollY, [0, 1000], [-6, 12]);
    const rotate2 = useTransform(scrollY, [0, 1000], [6, -12]);
    const opacityFloat = useTransform(scrollY, [0, 500], [0.6, 0]);

    return (
        <section className="relative min-h-[120vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-20 perspective-[1000px]">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-black fixed top-0 w-full h-full -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] mix-blend-screen animate-blob" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
                <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-purple-500/10 blur-[100px] mix-blend-screen animate-blob animation-delay-4000" />
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto text-center space-y-10">
                <motion.div style={{ y: yText, opacity: opacityText }} className="space-y-2">
                    <motion.h1
                        className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-500 leading-[0.9]"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Identify Accumulation
                    </motion.h1>
                    <motion.h1
                        className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.9]"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <span className="text-stroke-white bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-300 bg-[length:200%_auto] animate-gradient">Activity</span>
                    </motion.h1>
                </motion.div>

                <motion.div style={{ y: ySubText }}>
                    <motion.p
                        className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-light mt-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        Analyze stocks where <span className="text-zinc-200 font-medium">delivery participation</span> and <span className="text-zinc-200 font-medium">trading volume</span> significantly exceed recent averages while price movement remains controlled.
                    </motion.p>
                </motion.div>

                <motion.div
                    style={{ y: ySubText }}
                    className="flex flex-col sm:flex-row gap-6 justify-center pt-10"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <Link href="/scan">
                        <button className="group relative px-10 py-5 bg-white text-black rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_-15px_rgba(255,255,255,0.3)]">
                            <span className="relative z-10 flex items-center gap-2">
                                Run Scanner <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                    </Link>
                    <Link href="#how-it-works">
                        <button className="px-10 py-5 bg-white/5 text-white rounded-full font-bold text-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105 active:scale-95 backdrop-blur-md">
                            How it Works
                        </button>
                    </Link>
                </motion.div>
            </div>

            {/* Abstract Floating UI Cards with 3D Transforms */}
            <motion.div
                style={{ y: y1, rotate: rotate1, opacity: opacityFloat }}
                className="absolute md:top-[15%] md:left-[5%] z-0 hidden md:block"
            >
                <div className="p-5 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-2xl w-72 shadow-2xl shadow-emerald-500/10">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                        <span className="text-xs text-zinc-400 font-mono tracking-wider">RELIANCE</span>
                        <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">+2.4%</span>
                    </div>
                    <div className="space-y-3">
                        <div className="h-2 bg-white/5 rounded-full w-3/4"></div>
                        <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                style={{ y: y2, rotate: rotate2, opacity: opacityFloat }}
                className="absolute md:bottom-[20%] md:right-[5%] z-0 hidden md:block"
            >
                <div className="p-5 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-2xl w-72 shadow-2xl shadow-blue-500/10">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                        <span className="text-xs text-zinc-400 font-mono tracking-wider">TATASTEEL</span>
                        <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded">Accumulating</span>
                    </div>
                    <div className="h-20 w-full bg-gradient-to-t from-blue-500/10 via-blue-500/5 to-transparent rounded-lg border border-blue-500/20 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 h-full w-full bg-[url('/noise.svg')] opacity-10"></div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

const BentoGrid = () => {
    const { scrollYProgress } = useScroll();

    // Parallax logic for columns
    const yColumn1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const yColumn2 = useTransform(scrollYProgress, [0, 1], [0, 50]);
    const yColumn3 = useTransform(scrollYProgress, [0, 1], [0, -50]);

    return (
        <section id="how-it-works" className="py-32 px-4 bg-black relative z-20 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="mb-24 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-7xl font-black mb-8 text-white tracking-tighter"
                    >
                        How the Scanner Works
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Column 1 */}
                    <motion.div style={{ y: yColumn1 }} className="space-y-8">
                        <SpotlightCard className="rounded-[2rem] p-10 bg-zinc-900/40 border-white/5 min-h-[400px] flex flex-col justify-between group">
                            <div className="z-10 relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-transparent flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform duration-300">
                                    <ShieldCheck className="text-emerald-400 w-7 h-7" />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight group-hover:text-emerald-100 transition-colors">Delivery Participation</h3>
                                <p className="text-zinc-400 leading-relaxed text-lg">Filters stocks where a large portion of traded shares result in <span className="text-zinc-200">delivery</span>, indicating reduced speculative churn.</p>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        </SpotlightCard>

                        <SpotlightCard className="rounded-[2rem] p-10 bg-zinc-900/40 border-white/5 min-h-[300px] group">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-transparent flex items-center justify-center mb-6 border border-purple-500/20 shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="text-purple-400 w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Volume Relative to History</h3>
                            <p className="text-zinc-400 leading-relaxed">Compares daily trading volume against a configurable historical lookback average to identify <span className="text-zinc-200">abnormal activity</span>.</p>
                        </SpotlightCard>
                    </motion.div>

                    {/* Column 2 (Middle - Moves Opposite) */}
                    <motion.div style={{ y: yColumn2 }} className="space-y-8 md:pt-20">
                        <SpotlightCard className="rounded-[2rem] p-10 bg-zinc-900/40 border-white/5 min-h-[500px] group">
                            <div className="z-10 relative h-full flex flex-col">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-transparent flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform duration-300">
                                    <BarChart3 className="text-blue-400 w-7 h-7" />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight group-hover:text-blue-100 transition-colors">Price Control Filter</h3>
                                <p className="text-zinc-400 mb-10 leading-relaxed">Excludes stocks with large price expansion to focus on <span className="text-zinc-200">accumulation style behavior</span>.</p>

                                <div className="mt-auto relative h-48 w-full bg-black/50 rounded-2xl overflow-hidden border border-white/5 p-5 shadow-inner group-hover:border-blue-500/30 transition-colors">
                                    <div className="flex items-end justify-between h-full gap-1.5">
                                        {[30, 35, 32, 38, 33, 36, 34, 40, 35].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: "10%" }}
                                                whileInView={{ height: `${h}%` }}
                                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                                className="w-full bg-zinc-800/80 hover:bg-blue-500 transition-colors rounded-t-md"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>
                    </motion.div>

                    {/* Column 3 */}
                    <motion.div style={{ y: yColumn3 }} className="space-y-8">
                        <div className="hidden md:block h-20"></div> {/* Spacer to offset layout */}
                        <SpotlightCard className="rounded-[2rem] p-10 bg-zinc-900/40 border-white/5 min-h-[300px] group">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-transparent flex items-center justify-center mb-6 border border-amber-500/20 shadow-[0_0_30px_-10px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform duration-300">
                                <Info className="text-amber-400 w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Analysis Output</h3>
                            <p className="text-zinc-400 leading-relaxed">The output is a shortlist for further chart and structure analysis not trade recommendations.</p>
                        </SpotlightCard>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const Footer = () => (
    <footer id="disclaimer" className="py-12 bg-black border-t border-white/10 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-center gap-2 mb-8 opacity-50">
                <BarChart3 className="w-6 h-6" />
                <span className="font-bold text-lg">AccuScan</span>
            </div>

            <div className="p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
                <h4 className="text-amber-500 font-bold mb-2 uppercase tracking-wide text-sm">Important Disclaimer</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                    Data is sourced from publicly available NSE bhavcopy files.
                    <br />
                    This tool is for analytical and educational purposes only and does not constitute investment advice.
                </p>
            </div>

            <div className="pt-8 border-t border-white/5 text-xs text-zinc-600">
                &copy; {new Date().getFullYear()} AccuScan. All rights reserved.
            </div>
        </div>
    </footer>
);

export default function LandingPage() {
    return (
        <div className="bg-black min-h-screen text-white selection:bg-emerald-500/30 selection:text-emerald-300 scroll-smooth">
            <Navbar />
            <Hero />
            <BentoGrid />
            <Footer />
        </div>
    );
}
