'use client';

import { ArrowUpRight, ArrowDownLeft, Wallet, PieChart, Activity, RefreshCw } from 'lucide-react';
import { RecentTransactions } from './components/RecentTransactions';
import { SpendPieChart } from './components/charts/SpendPieChart';
import { TrendBarChart } from './components/charts/TrendBarChart';
import { BudgetWidget } from './components/BudgetWidget';
import { ImportWidget } from './components/ImportWidget';
import { ForecastWidget } from './components/ForecastWidget';
import { BankConnectWidget } from './components/BankConnectWidget';
import { useEffect, useState } from 'react';

interface DashboardStats {
    total_spend: number;
    total_income: number;
    net_balance: number;
    category_breakup: { name: string; value: number }[];
    monthly_trend: { month: string; spend: number }[];
}

export default function Dashboard() {
    const [importStatus, setImportStatus] = useState<string>('');
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        // Fetch Stats
        fetch('http://localhost:8000/api/v1/dashboard/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Failed to fetch dashboard stats", err));

        // Auto-read files on load
        async function triggerImport() {
            try {
                setImportStatus('Scanning...');
                const res = await fetch('http://localhost:8000/api/v1/import/trigger', { method: 'POST' });
                const data = await res.json();
                setImportStatus(data.message || 'Scan complete');
                setTimeout(() => setImportStatus(''), 3000);
            } catch (e) {
                console.error("Import failed", e);
                setImportStatus('Scan failed');
            }
        }
        triggerImport();
    }, []);

    return (
        <div className="flex h-screen bg-gray-50/50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 hidden md:block">
                <div className="p-6">
                    <h1 className="text-xl font-bold tracking-tight text-black flex items-center gap-2">
                        <Wallet className="w-6 h-6" />
                        FinApp
                    </h1>
                </div>
                <nav className="px-4 space-y-1">
                    <NavItem icon={<Activity className="w-4 h-4" />} label="Overview" active />
                    <NavItem icon={<PieChart className="w-4 h-4" />} label="Analysis" />
                    <NavItem icon={<ArrowUpRight className="w-4 h-4" />} label="Transactions" />
                    <NavItem icon={<Wallet className="w-4 h-4" />} label="Accounts" />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-16 bg-white border-b border-gray-100 flex items-center px-8 justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-semibold text-gray-800">Overview</h2>
                        {importStatus && (
                            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full flex items-center gap-1 animate-pulse">
                                <RefreshCw className="w-3 h-3" />
                                {importStatus}
                            </span>
                        )}
                    </div>
                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        AB
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    {/* Net Worth Section */}
                    <section>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Net Worth</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard
                                label="Total Balance"
                                value={`₹${(stats?.net_balance || 0).toLocaleString('en-IN')}`}
                                trend="+12.5%"
                                trendUp
                            />
                            <StatCard
                                label="Total Spends"
                                value={`₹${(stats?.total_spend || 0).toLocaleString('en-IN')}`}
                                trend="+2.1%"
                            />
                            <StatCard
                                label="Total Income"
                                value={`₹${(stats?.total_income || 0).toLocaleString('en-IN')}`}
                                trend="+5.0%"
                                trendUp
                            />
                        </div>
                    </section>

                    {/* Charts & Budgets Section */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80">
                                <h4 className="text-sm font-semibold text-gray-500 mb-4">Spend Analysis</h4>
                                <div className="h-full pb-6">
                                    <SpendPieChart data={stats?.category_breakup || []} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80">
                                <h4 className="text-sm font-semibold text-gray-500 mb-4">Monthly Trend</h4>
                                <div className="h-full pb-6">
                                    <TrendBarChart data={stats?.monthly_trend || []} />
                                </div>
                            </div>
                        </div>

                        {/* Budget Widget */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80 overflow-y-auto">
                            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-50">
                                <h4 className="text-sm font-semibold text-gray-500">Budgets</h4>
                                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Set Limit</button>
                            </div>
                            <BudgetWidget />
                        </div>
                    </section>

                    {/* AI & Operations Section */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 h-64">
                            <ForecastWidget />
                        </div>
                        <div className="md:col-span-1 h-64">
                            <ImportWidget />
                        </div>
                        <div className="md:col-span-1 h-64">
                            <BankConnectWidget />
                        </div>
                    </section>

                    {/* Recent Transactions */}
                    <section>
                        <RecentTransactions />
                    </section>
                </div>
            </main>
        </div>
    );
}

// Simple Components
function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <button className={`flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'
            }`}>
            {icon}
            {label}
        </button>
    );
}

function StatCard({ label, value, trend, trendUp }: { label: string, value: string, trend: string, trendUp?: boolean }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-black tracking-tight">{value}</span>
                <span className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-gray-400'}`}>
                    {trend}
                </span>
            </div>
        </div>
    );
}
