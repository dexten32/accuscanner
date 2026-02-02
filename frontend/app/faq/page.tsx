'use client';

import Link from "next/link";
import { ArrowLeft, BarChart3, HelpCircle } from "lucide-react";

const FAQ = () => {
    const faqs = [
        {
            question: "Is this a participation pattern signal or buy/sell recommendation?",
            answer: "This tool highlights stocks showing participation patterns based on delivery % and volume. It does NOT provide buy/sell recommendations or investment advice."
        },
        {
            question: "What timeframe does this scanner use?",
            answer: "All results are based on daily (end-of-day) NSE data. It is designed for analysis of delivery and volume participation patterns."
        },
        {
            question: "What does delivery % mean?",
            answer: "Delivery % shows how much of a stock's trading volume was taken for holding, not quick buying and selling. Higher delivery usually means serious participants."
        },
        {
            question: "Why is price movement small even with high volume?",
            answer: "Sometimes, large trading activity happens without immediate price movement. This can occur when buying and selling balance each other with controlled price movement."
        },
        {
            question: "What is the difference between Activity and High Activity?",
            answer: "Activity indicates moderate delivery and volume above recent averages. High Activity indicates significantly higher delivery & volume relative to recent averages. These show relative participation strength, not certainty."
        },
        {
            question: "Does this guarantee future price movement?",
            answer: "No. Markets are uncertain, and no tool can guarantee future outcomes. This tool is meant to support analysis, not replace decision-making."
        },
        {
            question: "What does the Score mean?",
            answer: "The Score is a relative ranking within the scan results. Higher score means stronger participation pattern compared to other stocks in the same scan."
        },
        {
            question: "Is this tool SEBI registered or providing advice?",
            answer: "No. This is an analytical tool for educational purposes only. It does not provide investment advice or portfolio recommendations."
        },
        {
            question: "Can I use historical dates to backtest?",
            answer: "Yes. The scanner allows you to run scans on past trading dates using the same filters for study and analysis purposes only."
        },
        {
            question: "Why don't I see today's data?",
            answer: "Demo mode shows selected historical dates so users can understand how the tool works. Live daily results are available with a subscription."
        },
        {
            question: "Should I rely only on this tool for trading decisions?",
            answer: "No. This tool should be used as a shortlisting aid alongside charts, broader market context, and personal risk assessment. Always conduct your own research."
        },
        {
            question: "Is the payment refundable?",
            answer: "No. All payments are final and non-refundable."
        }
    ];

    return (
        <div className="bg-black min-h-screen text-white">
            {/* Header */}
            <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                            <BarChart3 className="text-white w-4 h-4 sm:w-6 sm:h-6" />
                        </div>
                        <span className="text-lg sm:text-xl font-bold tracking-tight text-white">AccuScan</span>
                    </Link>
                    <Link href="/">
                        <button className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-xs sm:text-sm">
                            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Back to Home</span>
                            <span className="sm:hidden">Back</span>
                        </button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-12 sm:py-16 md:py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 -z-10">
                    <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[150px] sm:h-[300px] bg-emerald-500/5 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2 sm:mb-4">
                        <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                        <span className="text-emerald-400 text-xs sm:text-sm font-bold tracking-wide uppercase">Help Center</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight px-4 sm:px-0">
                        Frequently Asked{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 relative">
                            Questions
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-300/20 blur-2xl -z-10"></div>
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl mx-auto px-4 sm:px-0">
                        Everything you need to know about AccuScan and how to use it effectively
                    </p>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="max-w-4xl mx-auto px-4 pb-12 sm:pb-16 md:pb-20">
                <div className="space-y-3 sm:space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="p-4 sm:p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-emerald-500/30 transition-all duration-300 group"
                        >
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                                    <span className="text-emerald-400 font-bold text-xs sm:text-sm">{index + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold text-base sm:text-lg mb-2 sm:mb-3 leading-tight">
                                        {faq.question}
                                    </h3>
                                    <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-zinc-950/50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                                <BarChart3 className="text-white w-5 h-5" />
                            </div>
                            <span className="text-lg font-bold text-white">AccuScan</span>
                        </div>
                        <p className="text-zinc-500 text-sm">
                            For educational and analytical purposes only
                        </p>
                        <p className="text-zinc-600 text-xs">
                            © {new Date().getFullYear()} AccuScan. Not SEBI registered. Not investment advice.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FAQ;
