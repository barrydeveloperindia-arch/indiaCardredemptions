import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

export default function Inventory() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    // Modal States
    const [showRestock, setShowRestock] = useState(false);
    const [showNewApp, setShowNewApp] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [qtyInput, setQtyInput] = useState('');

    // New Item Form
    const [newItemData, setNewItemData] = useState({
        item_id: '', name: '', material_type: 'PLA', unit_cost: 0, unit: 'kg'
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/inventory/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (err) {
            console.error("API Error", err);
        } finally {
            setLoading(false);
        }
    };

    // Stats Calculation
    const stats = useMemo(() => {
        return items.reduce((acc, item) => {
            acc.totalValue += (item.quantity_on_hand * item.unit_cost);
            if (item.quantity_on_hand < 10) acc.lowStock++; // Threshold 10
            return acc;
        }, { totalValue: 0, lowStock: 0 });
    }, [items]);

    // Actions
    const handleRestock = async () => {
        if (!selectedItem || !qtyInput) return;
        try {
            const res = await fetch(`${API_BASE_URL}/inventory/${selectedItem.item_id}/transaction`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity_change: parseFloat(qtyInput) })
            });
            if (res.ok) {
                fetchItems();
                setShowRestock(false);
                setQtyInput('');
                setSelectedItem(null);
            }
        } catch (err) {
            alert('Failed to update stock');
        }
    };

    const handleCreate = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/inventory/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newItemData)
            });
            if (res.ok) {
                fetchItems();
                setShowNewApp(false);
                setNewItemData({ item_id: '', name: '', material_type: 'PLA', unit_cost: 0, unit: 'kg' });
            } else {
                alert('Failed to create item');
            }
        } catch (err) {
            alert('Error creating item');
        }
    };

    const quickUsage = async (item) => {
        const qty = prompt(`How much ${item.unit} of ${item.name} was used?`);
        if (!qty) return;
        try {
            await fetch(`${API_BASE_URL}/inventory/${item.item_id}/transaction`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity_change: -parseFloat(qty) })
            });
            fetchItems();
        } catch (err) {
            alert('Failed to record usage');
        }
    };

    return (
        <div>
            <header className="mb-8 flex justify-between items-center border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl font-light text-gray-900 tracking-tight">Material Inventory</h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Stock Levels & Valuation</p>
                </div>
                <div className="space-x-4">
                    <button onClick={() => setShowNewApp(true)} className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 transition shadow-sm">
                        New Material
                    </button>
                    <button onClick={() => setShowRestock(true)} className="bg-englabs-primary text-white px-6 py-2 rounded-lg hover:bg-englabs-primary_hover transition shadow-sm hover:shadow-md">
                        + Restock
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Value</h3>
                    <p className="text-2xl font-bold text-gray-800">₹{stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Low Stock Alerts</h3>
                    <p className={`text-2xl font-bold ${stats.lowStock > 0 ? 'text-red-500' : 'text-green-500'}`}>{stats.lowStock}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">System Status</h3>
                    <p className="text-2xl font-bold text-blue-500">Active</p>
                </div>
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                {loading ? (
                    <div className="col-span-full flex items-center justify-center p-12 text-englabs-grey-400">
                        Loading Inventory...
                    </div>
                ) : items.map((item) => (
                    <div key={item.item_id} className="relative group bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-englabs-glass hover:shadow-englabs-neon transition-all duration-300">

                        {/* Status Indicator */}
                        <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${item.quantity_on_hand < 10 ? 'bg-red-500 animate-pulse' : 'bg-englabs-green'}`} />

                        <div className="mb-4">
                            <span className="text-xs font-bold text-englabs-blue uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">{item.material_type}</span>
                        </div>

                        <h3 className="text-xl font-bold text-englabs-grey-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-englabs-grey-500 font-mono mb-4">{item.item_id}</p>

                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <div className="text-3xl font-bold text-englabs-grey-900">{item.quantity_on_hand}</div>
                                <div className="text-xs text-englabs-grey-500 uppercase">{item.unit} On Hand</div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-semibold text-englabs-grey-700">₹{item.unit_cost}</div>
                                <div className="text-xs text-englabs-grey-500 uppercase">Per Unit</div>
                            </div>
                        </div>

                        <div className="flex space-x-2 pt-4 border-t border-englabs-grey-50/50">
                            <button
                                onClick={() => quickUsage(item)}
                                className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                            >
                                Report Usage
                            </button>
                            <button
                                onClick={() => { setSelectedItem(item); setShowRestock(true); }}
                                className="flex-1 px-3 py-2 bg-englabs-blue/10 text-englabs-blue rounded-lg hover:bg-englabs-blue/20 transition text-sm font-medium"
                            >
                                Restock
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Restock Modal */}
            {showRestock && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
                        <h2 className="text-xl font-bold mb-4">Restock Inventory</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Code</label>
                                <select
                                    className="w-full border p-2 rounded bg-white"
                                    onChange={(e) => setSelectedItem(items.find(i => i.item_id === e.target.value))}
                                >
                                    <option value="">Select Item Code...</option>
                                    {items.map(i => (
                                        <option key={i.item_id} value={i.item_id}>
                                            {i.item_id} - {i.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity to Add</label>
                                <input
                                    type="number"
                                    className="w-full border p-2 rounded"
                                    value={qtyInput}
                                    onChange={(e) => setQtyInput(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-2">
                            <button onClick={() => setShowRestock(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleRestock} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Confirm Restock</button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Item Modal */}
            {showNewApp && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
                        <h2 className="text-xl font-bold mb-4">New Material</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Code</label>
                                <input
                                    placeholder="e.g. PLA-001"
                                    className="w-full border p-2 rounded"
                                    value={newItemData.item_id}
                                    onChange={e => setNewItemData({ ...newItemData, item_id: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                                <input
                                    placeholder="Material Name"
                                    className="w-full border p-2 rounded"
                                    value={newItemData.name}
                                    onChange={e => setNewItemData({ ...newItemData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit of 1 Quantity</label>
                                <input
                                    placeholder="e.g. kg, liter, piece"
                                    className="w-full border p-2 rounded"
                                    value={newItemData.unit}
                                    onChange={e => setNewItemData({ ...newItemData, unit: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                                    <select
                                        className="w-full border p-2 rounded bg-white"
                                        value={newItemData.material_type}
                                        onChange={e => setNewItemData({ ...newItemData, material_type: e.target.value })}
                                    >
                                        <option value="PLA">PLA</option>
                                        <option value="STEEL">Steel</option>
                                        <option value="COOLANT">Coolant</option>
                                        <option value="RESIN">Resin</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit Cost (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full border p-2 rounded"
                                        value={newItemData.unit_cost}
                                        onChange={e => setNewItemData({ ...newItemData, unit_cost: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-2">
                            <button onClick={() => setShowNewApp(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleCreate} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Create Item</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
