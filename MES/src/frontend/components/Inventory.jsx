import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Inventory() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/inventory/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            } else {
                console.error("Failed to fetch inventory");
            }
        } catch (err) {
            console.error("API Connection Error", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <header className="mb-8 flex justify-between items-center border-b border-white/20 pb-4">
                <div>
                    <h1 className="text-3xl font-light text-gray-900 tracking-tight">Material Inventory</h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Stock Levels & Valuation</p>
                </div>
                <button className="bg-englabs-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-englabs-blue/30 backdrop-blur-sm">
                    + Restock
                </button>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Value</h3>
                    <p className="text-2xl font-bold text-gray-800">$4,250.00</p>
                </div>
                <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Low Stock Alerts</h3>
                    <p className="text-2xl font-bold text-red-500">0</p>
                </div>
                <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Active Jobs Usage</h3>
                    <p className="text-2xl font-bold text-blue-500">12.5 kg</p>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-8 shadow-sm min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">Loading Inventory...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200/50">
                                <th className="py-4 font-semibold text-xs text-gray-400 uppercase tracking-wider">Item ID</th>
                                <th className="py-4 font-semibold text-xs text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="py-4 font-semibold text-xs text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="py-4 font-semibold text-xs text-gray-400 uppercase tracking-wider">Qty Hand</th>
                                <th className="py-4 font-semibold text-xs text-gray-400 uppercase tracking-wider">Unit Cost</th>
                                <th className="py-4 font-semibold text-xs text-gray-400 uppercase tracking-wider text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/30">
                            {items.map(item => (
                                <tr key={item.item_id} className="hover:bg-white/40 transition-colors group">
                                    <td className="py-4 font-mono text-sm text-gray-500">{item.item_id}</td>
                                    <td className="py-4 font-medium text-gray-900">{item.name}</td>
                                    <td className="py-4 text-xs font-bold text-gray-400 uppercase">{item.material_type}</td>
                                    <td className="py-4 font-bold text-gray-800">{item.quantity_on_hand} <span className="text-xs font-normal text-gray-500">{item.unit}</span></td>
                                    <td className="py-4 text-gray-600">${item.unit_cost}</td>
                                    <td className="py-4 text-right">
                                        <span className="bg-green-100/80 text-green-700 px-2 py-1 rounded-md text-xs font-bold tracking-wide">
                                            IN STOCK
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
