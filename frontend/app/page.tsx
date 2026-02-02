'use client';

import Link from "next/link";
import { ArrowRight, BarChart3, Info, Activity } from "lucide-react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { API_BASE } from "@/lib/config";
import { useRouter } from "next/navigation";

const ResultInterpretation = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const [currentSlide, setCurrentSlide] = useState(0);

    // Update slide based on scroll progress
    useEffect(() => {
        return scrollYProgress.on("change", (latest) => {
            if (latest < 0.33) setCurrentSlide(0);
            else if (latest < 0.66) setCurrentSlide(1);
            else setCurrentSlide(2);
        });
    }, [scrollYProgress]);

    const slides = [
        {
            id: 0,
            content: (
                <div className="space-y-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                            <span className="text-emerald-400 text-xs font-bold tracking-wide uppercase">Guide</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight leading-tight">
                            Reading the{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 relative">
                                Results
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-300/20 blur-2xl -z-10"></div>
                            </span>
                        </h2>
                        <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-xl">
                            AccuScan results are for <span className="text-zinc-300 font-medium">educational purposes only</span>, not investment advice or trade recommendations.
                        </p>
                    </div>
                    <InterpretationCard title="What is Delivery %?">
                        <p className="text-zinc-400 leading-relaxed">
                            Delivery % shows how much of a stock's trading volume was taken for <span className="text-white font-medium">holding</span>, not quick buying and selling.
                        </p>
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <span className="text-emerald-400 font-semibold flex items-center gap-2">
                                <span className="text-lg">→</span> Higher delivery usually means serious participants
                            </span>
                        </div>
                    </InterpretationCard>
                    <InterpretationCard title="What is the Score?">
                        <p className="text-zinc-400 leading-relaxed">
                            A <span className="text-white font-medium">relative ranking</span> within today's scan results.
                        </p>
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <span className="text-emerald-400 font-semibold flex items-center gap-2">
                                <span className="text-lg">→</span> Higher score = stronger participation pattern
                            </span>
                        </div>
                    </InterpretationCard>
                </div>
            )
        },
        {
            id: 1,
            content: (
                <div className="flex flex-col justify-center h-full">
                    <InterpretationCard title="What did AccuScan do here?">
                        <div className="space-y-4">
                            <p>AccuScan filters stocks where:</p>
                            <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-2">
                                <li>Delivery is <span className="text-zinc-200">unusually high</span></li>
                                <li>Volume is <span className="text-zinc-200">higher than normal</span></li>
                                <li>Price movement is <span className="text-zinc-200">controlled</span></li>
                            </ul>
                            <p className="pt-4 text-zinc-300">This indicates a <strong>potential participation pattern</strong> with controlled price movement.</p>
                        </div>
                    </InterpretationCard>
                    {/* Stats Row */}
                    <motion.div
                        className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 pt-4 md:pt-6 px-4 sm:px-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                            <span className="text-zinc-400 text-xs sm:text-sm font-medium">NSE</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                            <span className="text-zinc-400 text-xs sm:text-sm font-medium">Live</span>
                        </div>
                    </motion.div>
                </div>
            )
        },
        {
            id: 2,
            content: (
                <div className="space-y-6">
                    <InterpretationCard title="Understanding Signal Levels">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="p-5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-zinc-500"></div>
                                <div className="ml-3">
                                    <span className="text-zinc-300 font-bold block mb-2">Activity</span>
                                    <span className="text-zinc-400 text-sm">Moderate delivery and volume above recent averages.</span>
                                </div>
                            </div>
                            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 relative overflow-hidden group hover:bg-emerald-500/15 transition-colors">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-400"></div>
                                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-emerald-400/20 text-6xl font-black">⚡</div>
                                <div className="ml-3 relative z-10">
                                    <span className="text-emerald-300 font-bold block mb-2 text-base">High Activity</span>
                                    <span className="text-emerald-100/90 text-sm leading-relaxed">Significantly higher delivery & volume relative to recent averages.</span>
                                </div>
                            </div>
                        </div>
                    </InterpretationCard>

                    <div className="p-6 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.02]"></div>
                        <div className="relative z-10">
                            <h4 className="text-red-300 font-bold text-base mb-3 flex items-center gap-2">
                                <Info className="w-5 h-5" /> Critical Disclaimer
                            </h4>
                            <p className="text-red-100/90 text-sm leading-relaxed">
                                These are <strong className="text-red-200">NOT buy or sell recommendations</strong>. This scanner is for educational and analytical purposes only. Always conduct your own research.
                            </p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <section id="how-it-works" ref={containerRef} className="h-[300vh] relative bg-zinc-900/20 border-t border-white/5">
            <div className="sticky top-0 h-screen overflow-hidden">
                <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-[60%_40%] gap-16 items-center px-4">

                    {/* Sticky Image (Always Visible) */}
                    <div className="relative hidden lg:block">
                        <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 group z-10 bg-black">
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
                            <img
                                src="/scanner-results.png"
                                alt="Scanner Results Interface"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -inset-10 bg-gradient-to-r from-emerald-500/30 to-blue-500/30 blur-[60px] -z-10 opacity-40"></div>

                        {/* Floating Badges (Static) */}
                        <div className="absolute -top-6 -right-6 bg-black/80 border border-white/10 p-4 rounded-xl z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-zinc-400 font-mono uppercase">Pattern</div>
                                    <div className="text-emerald-400 font-bold text-sm">High Activity</div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-black/80  border border-white/10 p-4 rounded-xl shadow-xl z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-zinc-400 font-mono uppercase">Delivery</div>
                                    <div className="text-blue-400 font-bold text-sm">High Participation</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sliding Text Content */}
                    <div className="relative h-full flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="w-full"
                            >
                                {slides[currentSlide].content}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
};

// Features Scrollytelling Section
const FeaturesScrollytelling = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const [currentSlide, setCurrentSlide] = useState(0);

    // Update slide based on scroll progress
    useEffect(() => {
        return scrollYProgress.on("change", (latest) => {
            if (latest < 0.5) setCurrentSlide(0);
            else setCurrentSlide(1);
        });
    }, [scrollYProgress]);

    const slides = [
        {
            id: 0,
            image: "/historical-dates.png",
            alt: "Historical date selection",
            content: (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                            Historical Scan{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 relative">
                                Access
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-300/20 blur-2xl -z-10"></div>
                            </span>
                        </h2>
                        <div className="space-y-4">
                            <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
                                Run AccuScan on <span className="text-white font-semibold">past trading dates</span> using the same filters.
                            </p>
                            <div className="p-4 rounded-lg bg-zinc-800/40 border border-zinc-700/50">
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    See which stocks appeared on a given day and analyze subsequent price action using your own charting platform.
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <span className="text-xs text-yellow-300/90 italic">For study and analysis purposes only</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 1,
            image: "/filters-config.png",
            alt: "Scanner filter configuration",
            content: (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 md:mb-4 tracking-tight leading-tight">
                            Smart{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 relative">
                                Filters
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-300/20 blur-2xl -z-10"></div>
                            </span>
                        </h2>
                        <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-6">
                            Fine-tune your scan with powerful, customizable parameters
                        </p>
                    </div>
                    <div className="space-y-3">
                        <FeatureItem
                            label="Universe Selection"
                            description="All Stocks or FNO-only filtering"
                        />
                        <FeatureItem
                            label="Delivery Percentage"
                            description="Set min/max delivery participation range"
                        />
                        <FeatureItem
                            label="Volume Spike"
                            description="Filter by volume multiples vs recent average"
                        />
                        <FeatureItem
                            label="Max Price Move"
                            description="Control price change tolerance"
                        />
                        <FeatureItem
                            label="Lookback Period"
                            description="Choose 10, 20, or 30-day comparison window"
                        />
                    </div>
                </div>
            )
        }
    ];

    return (
        <section id="features" ref={containerRef} className="h-[200vh] relative bg-zinc-950/50 border-t border-white/5">
            <div className="sticky top-0 h-screen overflow-hidden">
                {/* Centered Static Heading */}
                <div className="absolute top-32 left-0 right-0 z-30 text-center">
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">
                        Features
                    </h2>
                </div>

                <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-[55%_45%] gap-16 items-center px-4 pt-32">

                    {/* Sticky Image (Exact fit with decorative background) */}
                    <div className="relative hidden lg:block">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, x: -100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 100 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                className="relative max-w-md mx-auto"
                            >
                                <div className="relative rounded-xl overflow-hidden border border-white/10 z-10 bg-black">
                                    <img
                                        src={slides[currentSlide].image}
                                        alt={slides[currentSlide].alt}
                                        className="w-full h-auto object-cover max-h-[60vh]"
                                    />
                                </div>
                                {/* Decorative Elements */}
                                <div className="absolute -inset-10 bg-gradient-to-r from-emerald-500/30 to-blue-500/30 blur-[60px] -z-10 opacity-40"></div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Sliding Text Content */}
                    <div className="relative h-full flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="w-full"
                            >
                                {slides[currentSlide].content}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
};

const FeatureItem = ({ label, description }: { label: string; description: string }) => {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-blue-500/30 hover:bg-zinc-900/70 transition-all group relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-2 h-2 rounded-full bg-blue-400 mt-1 flex-shrink-0 group-hover:scale-125 transition-transform"></div>
            <div className="flex-1">
                <h4 className="text-white font-bold text-sm mb-1">{label}</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">{description}</p>
            </div>
        </div>
    );
};


// --- Components ---






const Navbar = () => {
    const router = useRouter();
    const scrollToSection = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleRunScanner = async () => {
        try {
            const res = await fetch(`${API_BASE}/me`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    router.push('/scan');
                    return;
                }
            }
            router.push('/login');
        } catch (e) {
            router.push('/login');
        }
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/70 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                        <BarChart3 className="text-white w-4 h-4 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-lg sm:text-xl font-bold tracking-tight text-white">AccuScan</span>
                </div>
                <div className="hidden md:flex items-center gap-6 lg:gap-8 text-zinc-300 text-sm">
                    <button
                        onClick={(e) => scrollToSection(e, 'how-it-works')}
                        className="hover:text-emerald-400 transition-colors bg-transparent border-none cursor-pointer"
                    >
                        How it Works
                    </button>
                    <button
                        onClick={(e) => scrollToSection(e, 'features')}
                        className="hover:text-emerald-400 transition-colors bg-transparent border-none cursor-pointer"
                    >
                        Features
                    </button>
                    <Link href="/faq">
                        <button className="hover:text-emerald-400 transition-colors bg-transparent border-none cursor-pointer">
                            Faq
                        </button>
                    </Link>
                </div>
                <button
                    onClick={handleRunScanner}
                    className="px-4 sm:px-5 py-2 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:scale-105 transition-transform active:scale-95 cursor-pointer"
                >
                    Run Scanner
                </button>
            </div>
        </nav>
    );
};


const Hero = () => {
    const { scrollY } = useScroll();
    const router = useRouter();

    // Parallax Effects for Text
    const yText = useTransform(scrollY, [0, 500], [0, 150]);
    const ySubText = useTransform(scrollY, [0, 500], [0, 100]);
    const opacityText = useTransform(scrollY, [0, 300], [1, 0]);

    // Deep Parallax for Floating Elements
    const y1 = useTransform(scrollY, [0, 1000], [0, 400]);
    const y2 = useTransform(scrollY, [0, 1000], [0, -300]);
    const y3 = useTransform(scrollY, [0, 1000], [0, 200]);
    const y4 = useTransform(scrollY, [0, 1000], [0, -150]);

    const rotate1 = useTransform(scrollY, [0, 1000], [-6, 12]);
    const rotate2 = useTransform(scrollY, [0, 1000], [6, -12]);
    const rotate3 = useTransform(scrollY, [0, 1000], [-4, 8]);
    const rotate4 = useTransform(scrollY, [0, 1000], [4, -8]);

    const opacityFloat = useTransform(scrollY, [0, 500], [0.6, 0]);

    const scrollToHowItWorks = (e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById('how-it-works');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleRunScanner = async () => {
        try {
            const res = await fetch(`${API_BASE}/me`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    router.push('/scan');
                    return;
                }
            }
            router.push('/login');
        } catch (e) {
            router.push('/login');
        }
    };

    return (
        <section className="relative min-h-[100vh] flex flex-col items-center justify-start px-4 pt-40 perspective-[1000px]">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 fixed top-0 w-full h-full -z-10">
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto text-center space-y-4 sm:space-y-5 md:space-y-6">
                <motion.div style={{ y: yText, opacity: opacityText }}>
                    <motion.h1
                        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-500 leading-tight pb-1"
                        style={{ WebkitBoxDecorationBreak: 'clone' }}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Market
                    </motion.h1>
                    <motion.h1
                        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-500 leading-tight pb-1 -mt-2 sm:-mt-4 md:-mt-6 lg:-mt-8 xl:-mt-10"
                        style={{ WebkitBoxDecorationBreak: 'clone' }}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.25 }}
                    >
                        Participation
                    </motion.h1>
                    <motion.h1
                        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-tight -mt-2 sm:-mt-4 md:-mt-6 lg:-mt-8 xl:-mt-10"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <span className="text-stroke-white bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-300 bg-[length:200%_auto] animate-gradient">Scanner</span>
                    </motion.h1>
                </motion.div>

                <motion.div style={{ y: ySubText }}>
                    <motion.p
                        className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-light mt-4 md:mt-6 px-4 sm:px-6 md:px-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        Analyze stocks where <span className="text-zinc-200 font-medium">delivery participation</span> and <span className="text-zinc-200 font-medium">trading volume</span> significantly exceed recent averages while price movement remains controlled.
                    </motion.p>
                </motion.div>


                <motion.div
                    style={{ y: ySubText }}
                    className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center pt-6 md:pt-10 px-4 sm:px-0"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <button
                        onClick={handleRunScanner}
                        className="group relative px-8 sm:px-10 py-4 sm:py-5 bg-white text-black rounded-full font-bold text-base md:text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_-15px_rgba(255,255,255,0.3)] w-full sm:w-auto cursor-pointer"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Run Scanner <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </button>
                    <button
                        onClick={scrollToHowItWorks}
                        className="px-8 sm:px-10 py-4 sm:py-5 bg-white/5 text-white rounded-full font-bold text-base md:text-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer w-full sm:w-auto"
                    >
                        How it Works
                    </button>
                </motion.div>
            </div>

            {/* Abstract Floating UI Cards with 3D Transforms */}
            <motion.div
                style={{ y: y1, rotate: rotate1, opacity: opacityFloat }}
                className="absolute md:top-[15%] md:left-[5%] z-0 hidden md:block"
            >
                <div className="p-5 rounded-3xl bg-black/40 border border-white/10 w-72">
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
                <div className="p-5 rounded-3xl bg-black/40 border border-white/10 w-72">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                        <span className="text-xs text-zinc-400 font-mono tracking-wider">TATASTEEL</span>
                        <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded">Accumulating</span>
                    </div>
                    <div className="h-20 w-full bg-gradient-to-t from-blue-500/10 via-blue-500/5 to-transparent rounded-lg border border-blue-500/20 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 h-full w-full bg-[url('/noise.svg')] opacity-10"></div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                style={{ y: y3, rotate: rotate3, opacity: opacityFloat }}
                className="absolute md:bottom-[15%] md:left-[10%] z-0 hidden md:block"
            >
                <div className="p-5 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-2xl w-64 shadow-2xl shadow-purple-500/10">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                        <span className="text-xs text-zinc-400 font-mono tracking-wider">HDFCBANK</span>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <div className="w-2 h-2 rounded-full bg-emerald-500/30"></div>
                            <div className="w-2 h-2 rounded-full bg-emerald-500/10"></div>
                        </div>
                    </div>
                    <div className="flex items-end gap-2 h-10">
                        <div className="w-2 bg-purple-500/20 h-4 rounded-t"></div>
                        <div className="w-2 bg-purple-500/40 h-6 rounded-t"></div>
                        <div className="w-2 bg-purple-500/60 h-3 rounded-t"></div>
                        <div className="w-2 bg-purple-500/80 h-8 rounded-t"></div>
                        <div className="w-2 bg-purple-500 h-10 rounded-t shadow-[0_0_10px_rgba(168,85,247,0.4)]"></div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                style={{ y: y4, rotate: rotate4, opacity: opacityFloat }}
                className="absolute md:top-[20%] md:right-[15%] z-0 hidden md:block"
            >
                <div className="p-5 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-2xl w-64 shadow-2xl shadow-orange-500/10">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                        <span className="text-xs text-zinc-400 font-mono tracking-wider">ADANIENT</span>
                        <span className="text-xs text-orange-400 font-bold bg-orange-500/10 px-2 py-1 rounded">Vol Spike</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-zinc-500">
                            <span>Del%</span>
                            <span className="text-zinc-300">68%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full w-full overflow-hidden">
                            <div className="h-full bg-orange-500 w-[68%] rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)]"></div>
                        </div>
                    </div>
                </div>
            </motion.div>
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

const InterpretationCard = ({ title, children }: { title: string; children: React.ReactNode }) => {
    return (
        <div className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-500 hover:bg-white/[0.07] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h4 className="text-white font-bold text-lg mb-3 relative z-10">{title}</h4>
            <div className="text-zinc-400 leading-relaxed text-sm relative z-10">
                {children}
            </div>
        </div>
    );
};



export default function LandingPage() {
    return (
        <div className="bg-black min-h-screen text-white selection:bg-emerald-500/30 selection:text-emerald-300 scroll-smooth">
            <Navbar />
            <Hero />

            <ResultInterpretation />
            <FeaturesScrollytelling />
            <Footer />
        </div>
    );
}
