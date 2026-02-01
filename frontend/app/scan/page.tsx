"use client";
import { useState, useEffect } from "react";
import { Navbar } from "../../components/Navbar";
import { RangeSlider } from "../../components/ui/RangeSlider";
import { Calendar, Search, Filter, Play, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface ScanResult {
    symbol: string;
    close: number;
    price_change_pct: number;
    volume: number;
    avg_volume: number;
    volume_multiplier: number;
    delivery_percent: number;
    signal_tag: string;
    score: number;
    is_fno: boolean;
}

export default function ScannerPage() {
    // State
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Authenticate user before showing anything
        const checkAuth = async () => {
            try {
                const res = await fetch('http://localhost:3001/me', { credentials: 'include' });
                const data = await res.json();
                if (!data.user) {
                    router.push('/login');
                }
            } catch (e) {
                router.push('/login');
            }
        };
        checkAuth();
    }, [router]);
    const [date, setDate] = useState<string>('');
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
    const [results, setResults] = useState<ScanResult[]>([]);
    const [loading, setLoading] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Filters
    // Filters (Range: [min, max])
    const [deliveryRange, setDeliveryRange] = useState<[number, number]>([40, 100]);
    const [volRange, setVolRange] = useState<[number, number]>([1.5, 50]);
    const [priceRange, setPriceRange] = useState<[number, number]>([-10, 20]);
    const [isFnO, setIsFnO] = useState<'all' | 'true' | 'false'>('false');

    // API Base URL (Proxy should be set up or CORS enabled)
    const API_URL = "http://localhost:3001/scanner";

    // Fetch available dates on mount
    useEffect(() => {

        const fetchDates = async () => {
            try {
                const res = await fetch(`${API_URL}/dates`, { credentials: 'include' });
                if (res.ok) {
                    const dates = await res.json();
                    setAvailableDates(dates);
                    console.log("Dates Fetched (inside function)", dates)
                    if (dates.length > 0) {
                        setDate(dates[0]); // Default to latest
                    }
                    console.log("Dates Fetched", dates)
                }

            } catch (e) {
                console.error("Failed to fetch dates", e);
            }
        };
        fetchDates();
        console.log("Dates Fetched function hit")
    }, []);

    const runScan = async () => {
        if (!date) return;
        try {
            setStatus('running');
            setLoading(true);
            setResults([]); // Clear previous results

            // Trigger Run
            console.log(`[Frontend] Triggering scan for ${date}...`);
            const res = await fetch(`${API_URL}/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date }),
                credentials: 'include'
            });
            const data = await res.json();
            console.log("[Frontend] Run API Response:", data);

            if (data.status === 'running' || data.status === 'completed') {
                console.log("[Frontend] Status is running/completed. Starting poll...");
                pollStatus();
            } else {
                console.error("[Frontend] Run failed with status:", data.status);
                setStatus('failed');
                setLoading(false);
            }
        } catch (e) {
            console.error("[Frontend] Error triggering scan:", e);
            setStatus('failed');
            setLoading(false);
        }
    };

    const pollStatus = async () => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_URL}/status?date=${date}`, { credentials: 'include' });
                const data = await res.json();

                if (data.status === 'completed') {
                    clearInterval(interval);
                    setStatus('completed');
                    fetchResults();
                } else if (data.status === 'failed') {
                    clearInterval(interval);
                    setStatus('failed');
                    setLoading(false);
                }
            } catch (e) {
                clearInterval(interval);
            }
        }, 2000);
    };

    const fetchResults = async () => {
        try {
            const query = new URLSearchParams({
                date,
                min_delivery: deliveryRange[0].toString(),
                max_delivery: deliveryRange[1].toString(),
                min_vol: volRange[0].toString(),
                max_vol: volRange[1].toString(),
                min_price: priceRange[0].toString(),
                max_price: priceRange[1].toString(),
                is_fno: isFnO
            });

            const res = await fetch(`${API_URL}/results?${query}`, { credentials: 'include' });
            const data = await res.json();

            if (!res.ok) {
                console.error("Fetch results failed:", data.error);
                // Optional: You might want to show this error to the user via a toast or alert
                setResults([]);
                return;
            }

            if (Array.isArray(data)) {
                setResults(data);
            } else {
                setResults([]);
            }
        } catch (e) {
            console.error(e);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch results when filters change if status is completed
    useEffect(() => {
        if (status === 'completed') {
            fetchResults();
        }
    }, [deliveryRange, volRange, priceRange, isFnO]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = results.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(results.length / itemsPerPage);

    // Reset to page 1 when filters change (results length changes)
    useEffect(() => {
        setCurrentPage(1);
    }, [results.length]);

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <div className="fixed inset-0 bg-[url('/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>
            <Navbar />

            <main className="pt-24 px-6 w-full flex flex-col md:flex-row gap-8 relative z-10 min-h-screen">

                {/* Sidebar Filters - Sticky */}
                <aside className="w-full md:w-80 flex-shrink-0 space-y-8 p-6 rounded-3xl bg-zinc-900/50 border border-white/5 backdrop-blur-xl sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-emerald-400">
                            <Filter className="w-5 h-5" /> Config
                        </h2>

                        {/* Date Picker */}
                        {/* Date Dropdown */}
                        <div className="space-y-3 mb-6">
                            <label className="text-sm text-zinc-400 font-medium">Trading Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                <select
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-8 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none text-white cursor-pointer hover:bg-white/5"
                                >
                                    {availableDates.length === 0 && <option value="">Loading dates...</option>}
                                    {availableDates.map((d) => (
                                        <option key={d} value={d} className="bg-zinc-900 text-white">
                                            {d}
                                        </option>
                                    ))}
                                </select>
                                {/* Custom arrow icon */}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {availableDates.length === 0 && (
                                <>
                                    {console.log("Available Dates:", availableDates)}
                                    <p className="text-xs text-rose-400 mt-1">
                                        No dates found. Please ingest data.
                                    </p>
                                </>
                            )}
                        </div>

                        <button
                            onClick={runScan}
                            disabled={loading || status === 'running' || !date}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${loading || !date
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:scale-[1.02] active:scale-[0.98] text-white shadow-emerald-500/20'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <RefreshCw className="w-5 h-5 animate-spin" /> Running...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Play className="w-5 h-5 fill-current" /> Run Scanner
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-white/5">

                        <div className="space-y-3">
                            <label className="text-sm text-zinc-400">Delivery %</label>
                            <RangeSlider
                                min={0} max={100}
                                value={deliveryRange}
                                onValueChange={setDeliveryRange}
                                formatLabel={(v) => `${v}%`}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm text-zinc-400">Volume Spike</label>
                            <RangeSlider
                                min={0} max={10} step={0.1}
                                value={volRange}
                                onValueChange={setVolRange}
                                formatLabel={(v) => `${v}x`}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm text-zinc-400">Price Change</label>
                            <RangeSlider
                                min={-20} max={20} step={0.5}
                                value={priceRange}
                                onValueChange={setPriceRange}
                                formatLabel={(v) => `${v}%`}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm text-zinc-400">Is F&O?</label>
                            <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                                <button
                                    onClick={() => setIsFnO('true')}
                                    className={`py-2 text-xs font-medium rounded-lg transition-all ${isFnO === 'true'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-900/20'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() => setIsFnO('false')}
                                    className={`py-2 text-xs font-medium rounded-lg transition-all ${isFnO === 'false'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-900/20'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                >
                                    No
                                </button>
                            </div>
                        </div>

                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-8">

                    {/* Header Block */}
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                            Delivery Accumulation Scanner
                        </h1>
                        <h2 className="text-xl md:text-2xl font-semibold text-emerald-400">
                            See accumulation before the move
                        </h2>
                        <div className="text-zinc-400 max-w-3xl space-y-4 leading-relaxed">
                            <p>
                                Our tool highlights stocks showing heavy delivery-based buying without significant price expansion.
                                These patterns often appear before base formation and trend reversals.
                            </p>
                            <p>
                                We identify NSE stocks showing abnormal volume and high delivery activity without price expansion
                                a common signature of accumulation. The output helps traders focus on stocks worth deeper chart analysis.
                            </p>
                        </div>
                    </div>

                    {/* Stats Block */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
                            <div className="text-sm text-zinc-500 mb-1">Results for <span className="text-zinc-300 ml-1 font-mono">{date}</span></div>
                            <div className="text-3xl font-bold text-white mb-2">{results.length}</div>
                            <div className="text-xs text-zinc-400 uppercase tracking-wide">Signals Found</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
                            <div className="text-sm text-zinc-500 mb-1 opacity-0">Hidden</div>
                            <div className="text-3xl font-bold text-emerald-400 mb-2">
                                {results.filter(r => r.signal_tag === 'Strong Accumulation').length}
                            </div>
                            <div className="text-xs text-zinc-400 uppercase tracking-wide">Strong Signals</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
                            <div className="text-sm text-zinc-500 mb-1 opacity-0">Hidden</div>
                            <div className="text-3xl font-bold text-emerald-400 mb-2 truncate">
                                {results.length > 0 ? results[0].symbol : '-'}
                            </div>
                            <div className="text-xs text-zinc-400 uppercase tracking-wide">Top Result</div>
                        </div>
                    </div>

                    {/* Results Table Section */}
                    <section className="bg-zinc-900/30 border border-white/5 rounded-3xl backdrop-blur-md flex flex-col overflow-hidden min-h-[500px]">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-white">Scanner Results</h1>
                            <div className="text-sm text-zinc-500">
                                {results.length} stocks found
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-0">
                            {loading && results.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                                    <RefreshCw className="w-10 h-10 animate-spin opacity-50" />
                                    <p>Analyzing market data...</p>
                                </div>
                            ) : results.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
                                    <Search className="w-12 h-12 opacity-20" />
                                    <p>No results found for these criteria.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse min-w-[1200px]">
                                    <thead className="bg-[#18181b] sticky top-0 backdrop-blur-md z-10 text-xs uppercase tracking-wider text-zinc-500 font-medium">
                                        <tr>
                                            <th className="p-4 pl-6 border-b border-zinc-800">Symbol</th>
                                            <th className="p-4 text-right border-b border-zinc-800">Close</th>
                                            <th className="p-4 text-right border-b border-zinc-800">Price Chg %</th>
                                            <th className="p-4 text-right border-b border-zinc-800">Volume</th>
                                            <th className="p-4 text-right border-b border-zinc-800">Avg Volume</th>
                                            <th className="p-4 text-right border-b border-zinc-800">Vol Spike</th>
                                            <th className="p-4 text-right border-b border-zinc-800">Del %</th>
                                            <th className="p-4 text-left border-b border-zinc-800">Signal Tag</th>
                                            <th className="p-4 text-center border-b border-zinc-800">F&O</th>
                                            <th className="p-4 text-left border-b border-zinc-800 w-48">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800 text-sm">
                                        {currentItems.map((row) => (
                                            <tr key={row.symbol} className="hover:bg-zinc-800/50 transition-colors group">
                                                <td className="p-4 pl-6 font-bold text-zinc-200 group-hover:text-white transition-colors">
                                                    {row.symbol}
                                                </td>
                                                <td className="p-4 text-right text-zinc-300 font-mono">
                                                    {Number(row.close).toFixed(2)}
                                                </td>
                                                <td className={`p-4 text-right font-mono font-bold ${row.price_change_pct > 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                                    {row.price_change_pct > 0 ? '+' : ''}{Number(row.price_change_pct).toFixed(2)}%
                                                </td>
                                                <td className="p-4 text-right text-zinc-300 font-mono">
                                                    {Number(row.volume).toLocaleString()}
                                                </td>
                                                <td className="p-4 text-right text-zinc-400 font-mono">
                                                    {Number(row.avg_volume).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                                                </td>
                                                <td className="p-4 text-right font-mono text-emerald-400 font-bold">
                                                    {Number(row.volume_multiplier).toFixed(2)}x
                                                </td>
                                                <td className="p-4 text-right font-mono font-bold text-emerald-400">
                                                    {Number(row.delivery_percent).toFixed(2)}%
                                                </td>
                                                <td className="p-4 text-left">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${row.signal_tag === 'Strong Accumulation'
                                                        ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20'
                                                        : 'text-zinc-400'
                                                        }`}>
                                                        {row.signal_tag || '-'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${row.is_fno
                                                        ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
                                                        : 'text-zinc-500'
                                                        }`}>
                                                        {row.is_fno ? 'YES' : '-'}
                                                    </span>
                                                </td>
                                                <td className="p-4 pr-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-2 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                                                                style={{ width: `${Math.min((row.score / 300) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="font-mono text-xs text-zinc-400 w-12 text-right">
                                                            {Number(row.score).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {results.length > itemsPerPage && ( // Note: ITEMS_PER_PAGE needs to be used here, but I defined itemsPerPage as const in component. I should use itemsPerPage state/variable or just > 0
                            <div className="p-4 border-t border-white/5 flex items-center justify-between bg-zinc-900/50">
                                <div className="text-sm text-zinc-400">
                                    Showing <span className="text-white">{indexOfFirstItem + 1}</span> to <span className="text-white">{Math.min(indexOfLastItem, results.length)}</span> of <span className="text-white">{results.length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-zinc-400" />
                                    </button>
                                    <span className="text-sm font-medium text-zinc-300 px-2">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5 text-zinc-400" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Disclaimer Footer */}
                    <footer className="mt-8 pb-12 border-t border-white/5 pt-8 text-zinc-500 text-sm space-y-4">
                        <div className="flex items-center gap-2 text-amber-500 font-bold">
                            <AlertCircle className="w-5 h-5" /> Disclaimer
                        </div>
                        <p>
                            This tool is intended for informational and analytical purposes only.
                        </p>
                        <p>
                            It does not constitute investment advice, trading recommendations, or solicitation to buy or sell any securities.
                        </p>
                        <p>
                            The creator is not a SEBI-registered investment advisor or research analyst, and users are solely responsible for their own trading and investment decisions.
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    );
}
