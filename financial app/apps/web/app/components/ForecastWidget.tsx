'use client';

import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface ForecastItem {
    category: string;
    predicted_spend: number;
    trend_percentage: number;
}

interface ForecastData {
    total_predicted: number;
    breakdown: ForecastItem[];
}

export function ForecastWidget() {
    const [data, setData] = useState<ForecastData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/v1/analytics/forecast')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex items-center justify-center animate-pulse">
            <div className="flex flex-col items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-gray-400">Generatng AI Forecast...</span>
            </div>
        </div>
    );

    if (!data) return null;

    const nextMonthName = new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleString('default', { month: 'long' });

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Sparkles className="w-24 h-24 text-purple-600" />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <h4 className="text-sm font-semibold text-purple-900">AI Forecast</h4>
                        </div>
                        <p className="text-xs text-gray-500">Predicted spend for {nextMonthName}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <span className="text-3xl font-bold text-gray-900 tracking-tight">
                        ₹{Math.round(data.total_predicted).toLocaleString('en-IN')}
                    </span>
                    <div className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-100">
                        <span className="text-[10px] font-medium text-purple-700">Estimated</span>
                    </div>
                </div>

                <div className="space-y-3">
                    {data.breakdown.slice(0, 3).map((item) => (
                        <div key={item.category} className="flex justify-between items-center group">
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                                    {item.category}
                                </span>
                                <div className="flex items-center gap-1">
                                    {item.trend_percentage > 0 ? (
                                        <TrendingUp className="w-3 h-3 text-red-500" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3 text-green-500" />
                                    )}
                                    <span className={`text-[10px] ${item.trend_percentage > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {Math.abs(Math.round(item.trend_percentage))}% vs avg
                                    </span>
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-gray-900">
                                ₹{Math.round(item.predicted_spend).toLocaleString('en-IN')}
                            </span>
                        </div>
                    ))}
                </div>

                <button className="mt-6 w-full py-2 flex items-center justify-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                    View Full Report <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
