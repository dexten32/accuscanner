import { X, Check, CreditCard, Shield, Clock } from "lucide-react";

interface BillingModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onUpgrade: () => void;
}

export const BillingModal = ({ isOpen, onClose, user, onUpgrade }: BillingModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900/50">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-500" />
                        Billing & Plans
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Current Plan Status */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/5 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <p className="text-zinc-400 text-sm mb-1">Current Plan</p>
                                <h4 className="text-2xl font-bold text-white tracking-tight">{user.plan}</h4>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${user.plan === 'PRO'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-zinc-700/50 border-zinc-600 text-zinc-400'
                                }`}>
                                {user.plan === 'PRO' ? 'Active' : 'Basic'}
                            </div>
                        </div>

                        {user.plan === 'PRO' ? (
                            <div className="flex items-center gap-2 text-sm text-emerald-400/80">
                                <Check className="w-4 h-4" />
                                <span>Plan validates until next billing cycle</span>
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-500">Upgrade to PRO to unlock full potential.</p>
                        )}
                    </div>

                    {/* Features List (if not PRO) */}
                    {user.plan !== 'PRO' && (
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-white">Pro Benefits:</p>
                            <ul className="space-y-2">
                                {[
                                    'Unlimited Historical Data',
                                    '100 Requests / Minute',
                                    'Priority Support',
                                    'Advanced Filters'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-emerald-500" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Billing History (Mock) */}
                    <div>
                        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-zinc-500" />
                            Recent Activity
                        </h4>
                        <div className="rounded-lg border border-white/5 bg-black/20 overflow-hidden">
                            {user.plan === 'PRO' ? (
                                <div className="p-3 flex items-center justify-between border-b border-white/5 last:border-0">
                                    <div>
                                        <p className="text-sm text-white">Pro Plan Subscription</p>
                                        <p className="text-xs text-zinc-500">Feb 01, 2026</p>
                                    </div>
                                    <span className="text-sm font-mono text-emerald-400">₹4999.00</span>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-zinc-500 text-sm">
                                    No billing history available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="p-6 pt-0">
                    {user.plan !== 'PRO' ? (
                        <button
                            onClick={() => {
                                onUpgrade();
                                onClose();
                            }}
                            className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                        >
                            Upgrade to PRO (₹4999)
                        </button>
                    ) : (
                        <button
                            className="w-full py-3 rounded-xl bg-zinc-800 text-zinc-400 font-medium cursor-not-allowed border border-white/5"
                            disabled
                        >
                            Manage Subscription
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
