import { Calendar, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { useSearch } from '../context/SearchContext';
import SystemStatus from './SystemStatus';

export default function DispatchBoard() {
    const [columns, setColumns] = useState({
        planning: [],
        production: [],
        qc: []
    });
    const { searchTerm } = useSearch();
    const [draggingId, setDraggingId] = useState(null);
    const [sourceCol, setSourceCol] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);

    // Initial Data Fetch
    useEffect(() => {
        fetchBoardData();
    }, []);

    const fetchBoardData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/dispatch/board`);
            if (res.ok) {
                const data = await res.json();
                // Ensure data structure matches columns
                setColumns({
                    planning: data.planning || [],
                    production: data.production || [],
                    qc: data.qc || []
                });
            }
        } catch (error) {
            console.error("Failed to fetch dispatch board:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragStart = (e, id, col) => {
        setDraggingId(id);
        setSourceCol(col);
        e.dataTransfer.effectAllowed = "move";
        // Ghost image handling could go here
    };

    const handleDrop = async (e, targetCol) => {
        e.preventDefault();
        if (!draggingId || !sourceCol || sourceCol === targetCol) {
            setDraggingId(null);
            setSourceCol(null);
            return;
        }

        // Optimistic Update
        const item = columns[sourceCol].find(i => i.id === draggingId);
        if (!item) return;

        const newColumns = { ...columns };
        newColumns[sourceCol] = newColumns[sourceCol].filter(i => i.id !== draggingId);
        newColumns[targetCol] = [...newColumns[targetCol], { ...item, status: targetCol.toUpperCase() }];

        setColumns(newColumns);
        setDraggingId(null);
        setSourceCol(null);

        // API Call to Update Status
        try {
            await fetch(`${API_BASE_URL}/api/dispatch/move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_id: draggingId,
                    target_status: targetCol.toUpperCase(),
                    source_status: sourceCol.toUpperCase()
                })
            });
        } catch (err) {
            console.error("Failed to move item:", err);
            fetchBoardData(); // Revert on error
        }
    };

    const toggleSelectAll = (col) => {
        const rawItems = columns[col] || [];
        // Apply filter first to only select visible items? 
        // Better to select all visible items.

        const colItems = rawItems.filter(job => {
            if (!searchTerm) return true;
            const s = searchTerm.toLowerCase();
            return (
                (job.id && job.id.toLowerCase().includes(s)) ||
                (job.part_name && job.part_name.toLowerCase().includes(s)) ||
                (job.project_id && job.project_id.toLowerCase().includes(s)) ||
                (job.client_id && job.client_id.toLowerCase().includes(s))
            );
        });

        const allSelected = colItems.length > 0 && colItems.every(i => selectedIds.has(i.id));
        const newSelected = new Set(selectedIds);

        if (allSelected) {
            colItems.forEach(i => newSelected.delete(i.id));
        } else {
            colItems.forEach(i => newSelected.add(i.id));
        }
        setSelectedIds(newSelected);
    };

    const handleBulkDelete = (col) => {
        if (!window.confirm("Are you sure you want to delete selected items?")) return;

        // Filter out selected IDs from local state
        const newColumns = { ...columns };
        newColumns[col] = newColumns[col].filter(i => !selectedIds.has(i.id));
        setColumns(newColumns);

        // Clear selection for deleted items
        const newSelected = new Set(selectedIds);
        columns[col].forEach(i => {
            if (selectedIds.has(i.id)) newSelected.delete(i.id);
        });
        setSelectedIds(newSelected);

        // TODO: API Call for deletion
        console.log("Bulk delete not fully implemented on backend yet");
    };

    const renderCard = (job, col) => {
        const isSelected = selectedIds.has(job.id);

        return (
            <div
                key={job.id}
                draggable
                onDragStart={(e) => handleDragStart(e, job.id, col)}
                className={`bg-white p-3 rounded-xl shadow-sm border mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${isSelected ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-100'}`}
            >
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                                e.stopPropagation();
                                const newSet = new Set(selectedIds);
                                if (newSet.has(job.id)) newSet.delete(job.id);
                                else newSet.add(job.id);
                                setSelectedIds(newSet);
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-mono text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{job.id}</span>
                    </div>
                    {job.priority === 'High' && <div className="w-2 h-2 rounded-full bg-red-500" title="High Priority"></div>}
                </div>

                <h4 className="font-bold text-sm text-slate-800 mb-1 truncate" title={job.part_name}>{job.part_name}</h4>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="truncate max-w-[80px]" title={job.project_id}>{job.project_id}</span>
                    <span>•</span>
                    <span className="truncate max-w-[80px]" title={job.client_id}>{job.client_id}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                    <div className="flex items-center text-[10px] text-gray-400 font-medium">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(job.created_at || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex -space-x-1">
                        {/* Avatar placeholders if needed */}
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-bold ring-2 ring-white">AB</div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col p-6">
            <header className="mb-6 flex justify-between items-end pb-4 border-b border-gray-200">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <span>Operations</span>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">Dispatch Board</span>
                    </div>
                    <h1 className="text-3xl font-light text-slate-800 tracking-tight">Dispatch Operations</h1>
                    <div className="flex items-center mt-2">
                        <SystemStatus />
                    </div>
                </div>
                <button
                    onClick={() => alert('Create Order via PLM module')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                >
                    + New Order
                </button>
            </header>

            <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
                {['planning', 'production', 'qc'].map(col => {
                    const rawItems = columns[col] || [];

                    // Filter by Global Search
                    const colItems = rawItems.filter(job => {
                        if (!searchTerm) return true;
                        const s = searchTerm.toLowerCase();
                        return (
                            (job.id && job.id.toLowerCase().includes(s)) ||
                            (job.part_name && job.part_name.toLowerCase().includes(s)) ||
                            (job.project_id && job.project_id.toLowerCase().includes(s)) ||
                            (job.client_id && job.client_id.toLowerCase().includes(s))
                        );
                    });

                    const selectedInColCount = colItems.filter(i => selectedIds.has(i.id)).length;

                    return (
                        <div
                            key={col}
                            className={`flex flex-col h-full bg-gray-50/50 rounded-2xl border-2 transition-colors ${sourceCol && sourceCol !== col ? 'border-dashed border-blue-200 bg-blue-50/20' : 'border-transparent'}`}
                            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                            onDragEnter={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, col)}
                        >
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="font-bold text-slate-700 text-xs uppercase tracking-widest">{col.replace('_', ' ')}</h2>
                                    <span className="bg-white text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">{colItems.length}</span>
                                </div>

                                {/* Bulk Actions Header */}
                                <div className="flex items-center justify-between text-xs text-gray-500 h-8">
                                    <label className="flex items-center gap-2 cursor-pointer hover:text-gray-700 select-none">
                                        <input
                                            type="checkbox"
                                            checked={colItems.length > 0 && colItems.every(i => selectedIds.has(i.id))}
                                            onChange={() => toggleSelectAll(col)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            disabled={colItems.length === 0}
                                        />
                                        Select All
                                    </label>

                                    {selectedInColCount > 0 && (
                                        <button
                                            onClick={() => handleBulkDelete(col)}
                                            className="text-red-600 hover:text-red-800 font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                        >
                                            Delete ({selectedInColCount})
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                                {colItems.map(job => renderCard(job, col))}
                                {colItems.length === 0 && (
                                    <div className="h-full flex items-center justify-center text-slate-300 text-xs italic flex-col gap-2">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 opacity-20" />
                                        </div>
                                        <span>No items found</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
