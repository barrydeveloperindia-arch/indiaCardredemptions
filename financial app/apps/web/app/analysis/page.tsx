'use client';

import { SubscriptionWidget } from '../components/SubscriptionWidget';
import { CalendarHeatmap } from '../components/charts/CalendarHeatmap';
import { MoneyFlowSankey } from '../components/charts/MoneyFlowSankey';
import { SpendPieChart } from '../components/charts/SpendPieChart';
import { TrendBarChart } from '../components/charts/TrendBarChart';

export default function AnalysisPage() {
    return (
        <div className="flex h-screen bg-gray-50/50">
            {/* Sidebar (Simplified) */}
            <aside className="w-64 bg-white border-r border-gray-100 hidden md:block">
                <div className="p-6">
                    <h1 className="text-xl font-bold tracking-tight text-black flex items-center gap-2">FinApp</h1>
                </div>
                <nav className="px-4 space-y-1">
                    <a href="/" className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 rounded-md">Overview</a>
                    <a href="/analysis" className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium bg-gray-100 text-black rounded-md">Analysis</a>
                    <a href="/transactions" className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 rounded-md">Transactions</a>
                </nav>
            </aside>

            <main className="flex-1 overflow-y-auto p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Financial Intelligence</h2>
                        <p className="text-sm text-gray-500">Deep dive into your financial habits.</p>
                    </div>
                </header>

                <div className="space-y-6">
                    {/* Top Row: Subscriptions & Heatmap */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <SubscriptionWidget />
                        </div>
                        <div className="lg:col-span-2">
                            <CalendarHeatmap />
                        </div>
                    </div>

                    {/* Middle Row: Sankey & Trends */}
                    {/* 
                      Note: Sankey is demo/static for now. 
                      TrendBarChart and SpendPieChart reuse existing components.
                    */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <MoneyFlowSankey />
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                            <div className="h-[320px]">
                                <TrendBarChart />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
