'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';

interface BudgetEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function BudgetEditor({ isOpen, onClose, onSuccess }: BudgetEditorProps) {
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    // Common categories - in future, could be fetched
    const categories = [
        "Food & Dining", "Travel", "Shopping", "Utilities", "Housing",
        "Health & Medicine", "Entertainment", "Education", "Other"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const date = new Date();
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        try {
            await fetch('http://localhost:8000/api/v1/budgets/set', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    month, // Sets for current month by default for now
                    limit: parseFloat(amount)
                })
            });
            setLoading(false);
            onSuccess();
            onClose();
            // Reset
            setCategory('');
            setAmount('');
        } catch (err) {
            console.error(err);
            setLoading(false);
            alert(`Failed to save budget: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Set Monthly Budget</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                        <select
                            required
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Limit Amount (₹)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g. 5000"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : <><Check className="w-4 h-4" /> Save Budget</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
