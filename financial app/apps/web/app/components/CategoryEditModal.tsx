'use client';

import { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';

interface CategoryEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCategory: string;
    transactionId: string;
    onSuccess: (newCategory: string) => void;
}

export function CategoryEditModal({ isOpen, onClose, currentCategory, transactionId, onSuccess }: CategoryEditModalProps) {
    const [category, setCategory] = useState(currentCategory);
    const [loading, setLoading] = useState(false);

    // Sync state when prop changes, or just init. 
    // Effect might be better if re-opening for diff txn.
    // For simplicity, we assume parent mounts/unmounts or passes key.

    const categories = [
        "Food & Dining", "Travel", "Shopping", "Utilities", "Housing",
        "Health & Medicine", "Entertainment", "Investment", "Salary", "Uncategorized"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`http://localhost:8000/api/v1/transactions/${transactionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category })
            });

            if (!res.ok) throw new Error('Update failed');

            setLoading(false);
            onSuccess(category);
            onClose();
        } catch (err) {
            console.error(err);
            setLoading(false);
            alert("Failed to update category");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-xs overflow-hidden shadow-xl border border-gray-100">
                <div className="p-3 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-900">Edit Category</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-black">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-3">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Save</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
