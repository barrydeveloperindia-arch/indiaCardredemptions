'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Zap } from 'lucide-react';

interface Subscription {
    name: string;
    amount: number;
    frequency: number;
    interval: string;
    last_paid: string; // date
    annual_cost: number;
}

export function SubscriptionWidget() {
    const [subs, setSubs] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/v1/analytics/subscriptions')
            .then(res => res.json())
            .then(data => {
                setSubs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const totalAnnual = subs.reduce((sum, s) => sum + s.annual_cost, 0);

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Subscription Detective
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Detected recurring payments</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400">Total / Year</p>
                    <p className="font-bold text-lg">₹{totalAnnual.toLocaleString()}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin text-gray-300" /></div>
            ) : subs.length === 0 ? (
                <div className="text-center p-8 text-gray-400 text-sm bg-gray-50 rounded-xl">
                    No subscriptions detected yet.
                </div>
            ) : (
                <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                    {subs.map((sub, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                            <div className="flex gap-3 items-center">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg font-bold text-gray-400 border border-gray-100 shadow-sm">
                                    {sub.name[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]" title={sub.name}>
                                        {sub.name.length > 15 ? sub.name.substring(0, 15) + '...' : sub.name}
                                    </p>
                                    <p className="text-[10px] text-gray-500">{sub.interval} • Last: {new Date(sub.last_paid).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-sm">₹{sub.amount.toLocaleString()}</p>
                                <p className="text-[10px] text-gray-400">₹{(sub.annual_cost / 12).toFixed(0)}/mo</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
