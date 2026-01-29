import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

export default function Inventory() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token, logout } = useAuth();
    const { searchTerm } = useSearch(); // Global Search
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Missing State Restored
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [showRestock, setShowRestock] = useState(false);
    const [qtyInput, setQtyInput] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [showNewApp, setShowNewApp] = useState(false);
    const [newItemData, setNewItemData] = useState({ item_id: '', name: '', material_type: 'PLA', unit_cost: 0, unit: '' });
    const [showEdit, setShowEdit] = useState(false);
    const [editData, setEditData] = useState({});

    const handleAuthError = () => {
        alert("Session expired. Please login again.");
        logout();
        navigate('/');
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/inventory/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) return handleAuthError();

            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (err) {
            console.error("Failed to load inventory:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [token]);

    const categories = useMemo(() => {
        if (!items) return ["All"];
        return ["All", ...new Set(items.map(i => i.material_type || "General").filter(Boolean))].sort();
    }, [items]);

    // Filter Logic
    const filteredItems = useMemo(() => {
        let result = items;

        // 1. Filter by Category
        if (selectedCategory !== "All") {
            result = result.filter(item => (item.material_type || "General") === selectedCategory);
        }

        // 2. Filter by Search (Global)
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(item =>
                (item.name && item.name.toLowerCase().includes(lowerSearch)) ||
                (item.item_id && item.item_id.toLowerCase().includes(lowerSearch)) ||
                (item.material_type && item.material_type.toLowerCase().includes(lowerSearch))
            );
        }

        return result;
    }, [items, selectedCategory, searchTerm]);

    const sortedItems = useMemo(() => {
        let sortableItems = [...filteredItems];

        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];
                if (typeof aValue === 'string') aValue = aValue.toLowerCase();
                if (typeof bValue === 'string') bValue = bValue.toLowerCase();
                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredItems, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
        }
        return '';
    };

    // Stats Calculation
    const stats = useMemo(() => {
        if (!Array.isArray(items)) return { totalValue: 0, lowStock: 0 };
        return items.reduce((acc, item) => {
            acc.totalValue += (item.quantity_on_hand * item.unit_cost);
            if (item.quantity_on_hand < 10) acc.lowStock++; // Threshold 10
            return acc;
        }, { totalValue: 0, lowStock: 0 });
    }, [items]);

    const handleRestock = async () => {
        if (!selectedItem || !qtyInput) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/inventory/${selectedItem.item_id}/transaction`, {
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
            const res = await fetch(`${API_BASE_URL}/api/inventory/`, {
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
                setNewItemData({ item_id: '', name: '', material_type: 'PLA', unit_cost: 0, unit: '' });
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

        const val = parseFloat(qty);
        if (isNaN(val) || val <= 0) {
            alert("Please enter a valid positive number.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/inventory/${item.item_id}/transaction`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity_change: -val })
            });

            if (res.status === 401) return handleAuthError();

            if (res.ok) {
                fetchItems();
            } else {
                const data = await res.json();
                alert(`Failed: ${data.detail || 'Unknown error'}`);
            }
        } catch (err) {
            alert('Failed to record usage');
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/inventory/import`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.status === 401) return handleAuthError();

            const data = await res.json();
            if (res.ok) {
                alert(`Import Successful! Added: ${data.added}, Updated: ${data.updated}`);
                fetchItems();
            } else {
                alert(`Import Failed: ${data.detail || 'Unknown error'}`);
            }
        } catch (err) {
            console.error("Import Error", err);
            alert('Error importing file');
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        }
    };

    // --- Bulk Actions ---
    const toggleSelect = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === sortedItems.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(sortedItems.map(i => i.item_id)));
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} items?`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/inventory/bulk-delete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ item_ids: Array.from(selectedIds) })
            });
            if (res.ok) {
                alert("Items deleted successfully.");
                setSelectedIds(new Set());
                fetchItems();
            } else {
                alert("Failed to delete items.");
            }
        } catch (err) {
            alert("Error deleting items.");
        }
    };

    const handleEditSave = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/inventory/${editData.item_id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: editData.name,
                    material_type: editData.material_type,
                    unit_cost: editData.unit_cost,
                    unit: editData.unit
                })
            });
            if (res.ok) {
                fetchItems();
                setShowEdit(false);
            } else {
                alert("Failed to update item.");
            }
        } catch (err) {
            alert("Error updating item.");
        }
    };

    const openEdit = (item) => {
        setEditData({ ...item });
        setShowEdit(true);
    };

    return (
        <div>
            <header className="mb-8 flex justify-between items-center border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl font-light text-gray-900 tracking-tight">Material Inventory</h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Stock Levels & Valuation</p>
                </div>
                <div className="space-x-4 flex items-center">
                    {/* Bulk Delete Action */}
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition shadow-sm font-bold animate-fade-in"
                        >
                            Delete ({selectedIds.size})
                        </button>
                    )}

                    <select
                        className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".xlsx,.xls"
                    />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 transition shadow-sm font-medium"
                    >
                        Import Excel
                    </button>
                    <button onClick={() => setShowNewApp(true)} className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 transition shadow-sm font-medium">
                        New Material
                    </button>
                    <button onClick={() => setShowRestock(true)} className="bg-englabs-primary text-white px-6 py-2 rounded-lg hover:bg-englabs-primary_hover transition shadow-sm hover:shadow-md font-medium">
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

            {/* Inventory Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-fade-in-up">
                {loading ? (
                    <div className="flex items-center justify-center p-12 text-gray-400">
                        Loading Inventory...
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider cursor-pointer">
                                <th className="p-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                                        checked={sortedItems.length > 0 && selectedIds.size === sortedItems.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th onClick={() => requestSort('item_id')} className="p-4 pl-2 hover:bg-gray-100">Item Code{getSortIndicator('item_id')}</th>
                                <th onClick={() => requestSort('name')} className="p-4 hover:bg-gray-100">Name{getSortIndicator('name')}</th>
                                <th onClick={() => requestSort('material_type')} className="p-4 hover:bg-gray-100">Category{getSortIndicator('material_type')}</th>
                                <th onClick={() => requestSort('quantity_on_hand')} className="p-4 hover:bg-gray-100">In Stock{getSortIndicator('quantity_on_hand')}</th>
                                <th onClick={() => requestSort('unit')} className="p-4 hover:bg-gray-100">Unit{getSortIndicator('unit')}</th>
                                <th onClick={() => requestSort('unit_cost')} className="p-4 hover:bg-gray-100">Cost / Unit{getSortIndicator('unit_cost')}</th>
                                <th className="p-4 text-right pr-6 cursor-default">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sortedItems.map((item) => (
                                <tr key={item.item_id} className={`hover:bg-blue-50/30 transition-colors group ${selectedIds.has(item.item_id) ? 'bg-blue-50' : ''}`}>
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                                            checked={selectedIds.has(item.item_id)}
                                            onChange={() => toggleSelect(item.item_id)}
                                        />
                                    </td>
                                    <td className="p-4 pl-2 font-mono text-sm text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => openEdit(item)}>{item.item_id}</td>
                                    <td className="p-4 font-medium text-gray-900">{item.name}</td>
                                    <td className="p-4">
                                        <span className="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-xs font-bold border border-gray-200">
                                            {item.material_type || 'General'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`font-bold ${item.quantity_on_hand < 10 ? 'text-red-500' : 'text-gray-700'}`}>
                                            {item.quantity_on_hand}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500 uppercase">{item.unit}</td>
                                    <td className="p-4 text-sm text-gray-700">₹{item.unit_cost}</td>
                                    <td className="p-4 text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => quickUsage(item)}
                                                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs font-bold uppercase"
                                            >
                                                Use
                                            </button>
                                            <button
                                                onClick={() => openEdit(item)}
                                                className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-200 transition text-xs font-bold uppercase"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => { setSelectedItem(item); setShowRestock(true); }}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-xs font-bold uppercase"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sortedItems.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-500 italic">No inventory items found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Restock Modal */}
            {showRestock && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-start justify-center z-50 pt-20">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 transform transition-all animate-fade-in-down">
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
                                <select
                                    className="w-full border p-2 rounded bg-white"
                                    value={newItemData.unit}
                                    onChange={e => setNewItemData({ ...newItemData, unit: e.target.value })}
                                >
                                    <option value="" disabled>Select the unit</option>
                                    <option value="ml">ml</option>
                                    <option value="ltr.">ltr.</option>
                                    <option value="g">g</option>
                                    <option value="kg">kg</option>
                                    <option value="pcs">pcs</option>
                                    <option value="pack">pack</option>
                                    <option value="roll">roll</option>
                                    <option value="box">box</option>
                                    <option value="bottle">bottle</option>
                                    <option value="pair">pair</option>
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
                        <div className="mt-6 flex justify-end space-x-2">
                            <button onClick={() => setShowNewApp(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleCreate} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Create Item</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Item Modal */}
            {showEdit && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-start justify-center z-50 pt-20">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 transform transition-all animate-fade-in-down">
                        <h2 className="text-xl font-bold mb-4">Edit Item: {editData.item_id}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                                <input
                                    className="w-full border p-2 rounded"
                                    value={editData.name}
                                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                <input
                                    className="w-full border p-2 rounded"
                                    value={editData.material_type}
                                    onChange={e => setEditData({ ...editData, material_type: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit Cost</label>
                                <input
                                    type="number"
                                    className="w-full border p-2 rounded"
                                    value={editData.unit_cost}
                                    onChange={e => setEditData({ ...editData, unit_cost: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-2">
                            <button onClick={() => setShowEdit(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleEditSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
