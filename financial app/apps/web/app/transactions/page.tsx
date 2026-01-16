'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, ArrowLeft, ArrowRight, Download, Edit2 } from 'lucide-react';
import { CategoryEditModal } from '../components/CategoryEditModal';

interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: string;
    category: string;
    account_id: string | null;
    tags: string[];
}

interface AccountOption {
    id: string;
    name: string;
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTxn, setEditingTxn] = useState<{ id: string, category: string } | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [type, setType] = useState('All');
    const [page, setPage] = useState(0);
    const LIMIT = 50;

    // Helper Data
    const categories = [
        "All", "Food & Dining", "Travel", "Shopping", "Utilities", "Housing",
        "Health & Medicine", "Entertainment", "Investment", "Salary", "Uncategorized"
    ];

    const fetchTransactions = () => {
        setLoading(true);
        const params = new URLSearchParams({
            skip: (page * LIMIT).toString(),
            limit: LIMIT.toString(),
        });

        if (search) params.append('search', search);
        if (category !== 'All') params.append('category', category);
        if (type !== 'All') params.append('type', type);

        fetch(`http://localhost:8000/api/v1/transactions/?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setTransactions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    // Debounce search/filter
    useEffect(() => {
        const timeout = setTimeout(fetchTransactions, 300);
        return () => clearTimeout(timeout);
    }, [search, category, type, page]);

    return (
        <div className="flex h-screen bg-gray-50/50">
            {/* Sidebar (Simplified) */}
            <aside className="w-64 bg-white border-r border-gray-100 hidden md:block">
                <div className="p-6">
                    <h1 className="text-xl font-bold tracking-tight text-black flex items-center gap-2">FinApp</h1>
                </div>
                <nav className="px-4 space-y-1">
                    <a href="/" className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 rounded-md">Overview</a>
                    <a href="/analysis" className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 rounded-md">Analysis</a>
                    <a href="/transactions" className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium bg-gray-100 text-black rounded-md">Transactions</a>
                </nav>
            </aside>

            <main className="flex-1 overflow-y-auto p-8">
                <header className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </header>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Filters Toolbar */}
                    <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-gray-50/50">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="All">All Types</option>
                            <option value="DEBIT">Expense</option>
                            <option value="CREDIT">Income</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">Loading...</td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No transactions found</td>
                                    </tr>
                                ) : (
                                    transactions.map((txn) => (
                                        <tr key={txn.id} className="hover:bg-gray-50/50 group">
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                <div className="truncate max-w-md" title={txn.description}>
                                                    {txn.description}
                                                </div>
                                                <div className="flex gap-2 mt-1">
                                                    {(txn.tags || []).map(tag => (
                                                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <button
                                                    onClick={() => setEditingTxn({ id: txn.id, category: txn.category })}
                                                    className="px-2 py-1 rounded-full bg-gray-100 text-xs font-medium hover:bg-gray-200 flex items-center gap-1 group/btn"
                                                >
                                                    {txn.category}
                                                    <Edit2 className="w-3 h-3 opacity-0 group-hover/btn:opacity-50" />
                                                </button>
                                            </td>
                                            <td className={`px-6 py-4 text-sm font-bold text-right ${txn.type === 'CREDIT' ? 'text-green-600' : 'text-black'}`}>
                                                {txn.type === 'CREDIT' ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-black disabled:opacity-50"
                        >
                            <ArrowLeft className="w-4 h-4" /> Previous
                        </button>
                        <span className="text-xs text-gray-400">Page {page + 1}</span>
                        <button
                            disabled={transactions.length < LIMIT}
                            onClick={() => setPage(p => p + 1)}
                            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-black disabled:opacity-50"
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
            {editingTxn && (
                <CategoryEditModal
                    isOpen={!!editingTxn}
                    onClose={() => setEditingTxn(null)}
                    transactionId={editingTxn.id}
                    currentCategory={editingTxn.category}
                    onSuccess={(newCat) => {
                        setTransactions(prev => prev.map(t => t.id === editingTxn.id ? { ...t, category: newCat } : t));
                        setEditingTxn(null);
                    }}
                />
            )}
        </div>
    );
}
