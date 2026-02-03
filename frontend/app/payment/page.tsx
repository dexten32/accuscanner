
'use client';

import { Navbar } from "@/components/Navbar";

export default function PaymentPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
            <Navbar />

            <main className="max-w-4xl mx-auto pt-32 px-6 text-center">
                <div className="bg-[#111] border border-white/10 rounded-2xl p-12 shadow-2xl backdrop-blur-sm">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>

                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Payment Gateway
                    </h1>

                    <p className="text-xl text-white/60 mb-8 max-w-lg mx-auto">
                        We are currently integrating a secure payment gateway. Please check back later to complete your upgrade.
                    </p>

                    <button
                        onClick={() => window.history.back()}
                        className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium transition-all"
                    >
                        Go Back
                    </button>
                </div>
            </main>
        </div>
    );
}
