import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

export default function DispatchBoard() {
    const [columns, setColumns] = useState({
        planning: [],
        production: [],
        qc: []
    });
    const [draggingId, setDraggingId] = useState(null);
    const [sourceCol, setSourceCol] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedIds, setSelectedIds] = useState(new Set());
    const [processOptions, setProcessOptions] = useState([
        "MJF", "FDM", "3-AXIS", "5-AXIS", "SLA", "SLS", "SHEET METAL", "VACUUM CASTING", "INJECTION MOLDING", "Others"
    ]);
    const [clientOptions, setClientOptions] = useState([
        "3BA Printing", "ADSL", "Aebocode", "Arpee Tech", "Arvind Kumar", "ASA Industries", "Ashwani Sihag",
        "Atomberg", "Aveer Industries(DRDO)", "Baaz Bikes", "Bajaj", "BCH", "C&S Electric", "Compactec",
        "Crompton", "Daikin", "Deepak (Model Artician)", "Designfying", "E3D PRO", "Eklawya Enterprises",
        "Elin", "EndureAir", "ENERTICS", "Falcon", "Godrej", "Goel Enterprises", "Group SEB", "Havells",
        "HC Robotics", "Hella", "Henkel", "Hybrid Customs", "INDRONES", "IZI VENTURE PRIVATE LTD", "Jal",
        "Labat Asia", "LALTESH YADAV", "Marbles Health", "Marcopolo", "Marelli", "Menthosa", "MSAFE GROUP",
        "MSL INDIA", "My Design Minds", "Nipa", "Orient", "P2P", "Parashar Industries", "Parikalpana",
        "Prabha Electonics", "Remedio", "Renforced", "Rishabh Aggarwal", "Rukman Udyog", "San Foams",
        "Scope Medical", "SG Engineering", "Signoraware", "SML Isuzu", "Sofly", "Somafusion/Dalmitra",
        "Sonalika", "Spray Engineering", "Surjeet Paul", "V N G Medical", "Vigor Industry", "Yash Appliances",
        "Others"
    ]);
    const [materialOptions, setMaterialOptions] = useState([
        "ABS", "NYLON PA-12", "NYLON PA-3200", "NYLON PA-2200", "NYLON PA-11",
        "PLA", "TPU", "PET-G", "ALUMINIUM", "SS", "MS", "WOOD", "SILICONE", "Others"
    ]);

    useEffect(() => {
        fetchBoard();
        fetch(`${API_BASE_URL}/api/metadata/`)
            .then(res => res.json())
            .then(data => {
                if (data.processes && data.processes.length > 0) {
                    setProcessOptions(prev => [...new Set([...prev, ...data.processes])]);
                }
                if (data.clients && data.clients.length > 0) {
                    setClientOptions(prev => [...new Set([...prev, ...data.clients])]);
                }
                if (data.materials && data.materials.length > 0) {
                    setMaterialOptions(prev => [...new Set([...prev, ...data.materials])]);
                }
            })
            .catch(err => console.error("Failed to fetch metadata", err));
    }, []);

    const fetchBoard = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/dispatch/board`);
            const data = await res.json();
            setColumns(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDragStart = (e, id, colName) => {
        console.log("Drag Start:", { id, colName });
        setDraggingId(id);
        setSourceCol(colName);
        e.dataTransfer.setData("text/plain", id);
        e.dataTransfer.setData("application/json", JSON.stringify({ id, source: colName }));
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDrop = async (e, targetCol) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");

        let source = sourceCol;
        try {
            const data = JSON.parse(e.dataTransfer.getData("application/json"));
            source = data.source;
        } catch (err) {
            // ignore
        }

        console.log("Drop:", { id, source, targetCol });

        if (source === targetCol) return;

        // Optimistic Update
        const item = columns[source].find(i => i.id === id);
        if (!item) return;

        // Determine new status based on column
        let newStatus = "PLANNED";
        if (targetCol === "production") newStatus = "QUEUED";
        if (targetCol === "qc") newStatus = "COMPLETED";

        // Update UI
        setColumns(prev => ({
            ...prev,
            [source]: prev[source].filter(i => i.id !== id),
            [targetCol]: [...prev[targetCol], { ...item, status: newStatus }]
        }));

        // API Call
        try {
            await fetch(`${API_BASE_URL}/api/dispatch/jobs/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (err) {
            console.error("Drop failed", err);
            fetchBoard(); // Revert on error
        }

        setDraggingId(null);
        setSourceCol(null);
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleDelete = async (id, colName) => {
        if (!window.confirm("Delete this job?")) return;

        try {
            await fetch(`${API_BASE_URL}/api/dispatch/jobs/${id}`, { method: 'DELETE' });
            setColumns(prev => ({
                ...prev,
                [colName]: prev[colName].filter(i => i.id !== id)
            }));
            // Remove from selection if present
            if (selectedIds.has(id)) {
                const newSet = new Set(selectedIds);
                newSet.delete(id);
                setSelectedIds(newSet);
            }
        } catch (err) {
            alert("Delete failed");
        }
    };

    const handleBulkDelete = async (colName) => {
        const idsToDelete = columns[colName].filter(i => selectedIds.has(i.id)).map(i => i.id);
        if (idsToDelete.length === 0) return;

        if (!window.confirm(`Delete ${idsToDelete.length} selected jobs from ${colName}?`)) return;

        try {
            await Promise.all(idsToDelete.map(id =>
                fetch(`${API_BASE_URL}/api/dispatch/jobs/${id}`, { method: 'DELETE' })
            ));

            setColumns(prev => ({
                ...prev,
                [colName]: prev[colName].filter(i => !selectedIds.has(i.id))
            }));

            const newSet = new Set(selectedIds);
            idsToDelete.forEach(id => newSet.delete(id));
            setSelectedIds(newSet);
        } catch (err) {
            console.error(err);
            alert("Some items failed to delete. Refreshing...");
            fetchBoard();
        }
    };

    const toggleSelection = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = (colName) => {
        const colItems = columns[colName];
        if (!colItems || colItems.length === 0) return;

        const allSelected = colItems.every(i => selectedIds.has(i.id));
        const newSet = new Set(selectedIds);

        if (allSelected) {
            colItems.forEach(i => newSet.delete(i.id));
        } else {
            colItems.forEach(i => newSet.add(i.id));
        }
        setSelectedIds(newSet);
    };

    // --- Edit Modal State ---
    const [editingJob, setEditingJob] = useState(null);
    const [editForm, setEditForm] = useState({ machine: '', manufacturing_process: '', material: '', part_name: '', client_id: '', project_id: '' });

    const openEditModal = (job) => {
        setEditingJob(job);
        setEditForm({
            machine: job.machine || '',
            manufacturing_process: job.manufacturing_process || '',
            material: job.material || '',
            part_name: job.part_name || '',
            client_id: job.client_id || '',
            project_id: job.project_id || ''
        });
    };

    const handleSaveEdit = async () => {
        if (!editingJob) return;
        try {
            await fetch(`${API_BASE_URL}/api/dispatch/jobs/${editingJob.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    machine_id: editForm.machine,
                    manufacturing_process: editForm.manufacturing_process,
                    material: editForm.material,
                    part_name: editForm.part_name,
                    client_id: editForm.client_id,
                    project_id: editForm.project_id
                })
            });
            setEditingJob(null);
            fetchBoard();
        } catch (err) {
            console.error(err);
            alert("Failed to update job");
        }
    };

    const handlePrintQC = (id) => {
        window.open(`${API_BASE_URL}/api/dispatch/jobs/${id}/qc-report`, '_blank');
    };

    const handlePrintTraveler = (id) => {
        window.open(`${API_BASE_URL}/api/reporting/jobs/${id}/traveler`, '_blank');
    };

    const renderCard = (job, colName) => (
        <div
            key={job.id}
            draggable
            onDragStart={(e) => handleDragStart(e, job.id, colName)}
            className={`glass-card p-4 rounded-xl cursor-grab active:cursor-grabbing group relative mb-3 hover:shadow-lg transition-all ${selectedIds.has(job.id) ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}`}
        >
            <div className="absolute top-2 left-2 z-10">
                <input
                    type="checkbox"
                    checked={selectedIds.has(job.id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelection(job.id); }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
            </div>

            <div className="flex justify-between items-start mb-2 pl-6">
                <h3 className="font-bold text-slate-800 tracking-tight text-sm">{job.id}</h3>
                <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); openEditModal(job); }} className="text-xs text-blue-500 hover:text-blue-700 px-1">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(job.id, colName); }} className="text-xs text-red-500 hover:text-red-700 px-1">✕</button>
                </div>
            </div>

            <div className="pl-6 mb-1">
                <p className="text-xs text-slate-500 font-medium truncate">{job.part_name}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                        {job.manufacturing_process || 'N/A'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100 font-medium">
                        {job.material || 'N/A'}
                    </span>
                    {job.project_id && job.project_id !== 'N/A' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                            {job.project_id}
                        </span>
                    )}
                    {job.client_id && job.client_id !== 'N/A' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                            {job.client_id}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 pl-6 mt-1">
                <span>{job.machine || "Unassigned"}</span>
                <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">{job.eta}</span>
            </div>

            <div className="flex flex-col gap-2 mt-3 pl-6">
                <button
                    onClick={() => handlePrintTraveler(job.id)}
                    className="w-full py-1 text-xs bg-indigo-50 text-indigo-600 rounded border border-indigo-100 font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Traveler
                </button>

                {colName === 'qc' && (
                    <button
                        onClick={() => handlePrintQC(job.id)}
                        className="w-full py-1 text-xs bg-emerald-50 text-emerald-600 rounded border border-emerald-100 font-medium hover:bg-emerald-100 transition-colors"
                    >
                        Export QC Report (PDF)
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col p-6">
            <header className="mb-6 flex justify-between items-end pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-light text-slate-800 tracking-tight">Dispatch Command</h1>
                    <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">Drag & Drop Production Control</p>
                </div>
                <button
                    onClick={() => alert('Create Order via PLM module')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    + New Order
                </button>
            </header>

            <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
                {['planning', 'production', 'qc'].map(col => {
                    const colItems = columns[col] || [];
                    const selectedInColCount = colItems.filter(i => selectedIds.has(i.id)).length;

                    return (
                        <div
                            key={col}
                            className={`flex flex-col h-full bg-gray-50/50 rounded-2xl border-2 ${sourceCol && sourceCol !== col ? 'border-dashed border-blue-200 bg-blue-50/20' : 'border-transparent'}`}
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
                                    <label className="flex items-center gap-2 cursor-pointer hover:text-gray-700">
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

                            <div className="flex-1 p-3 overflow-y-auto">
                                {colItems.map(job => renderCard(job, col))}
                                {colItems.length === 0 && (
                                    <div className="h-full flex items-center justify-center text-slate-300 text-xs italic">
                                        Drop items here
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Edit Modal */}
            {editingJob && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl animate-fade-in-up">
                        <h2 className="text-lg font-bold mb-4">Edit Job Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Part Name</label>
                                <input
                                    type="text"
                                    value={editForm.part_name}
                                    onChange={e => setEditForm(prev => ({ ...prev, part_name: e.target.value }))}
                                    className="w-full p-2 border rounded text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Client</label>
                                    <select
                                        value={editForm.client_id}
                                        onChange={e => setEditForm(prev => ({ ...prev, client_id: e.target.value }))}
                                        className="w-full p-2 border rounded text-sm"
                                    >
                                        <option value="">Select Client</option>
                                        {clientOptions.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Project ID</label>
                                    <input
                                        type="text"
                                        value={editForm.project_id}
                                        onChange={e => setEditForm(prev => ({ ...prev, project_id: e.target.value }))}
                                        className="w-full p-2 border rounded text-sm"
                                        placeholder="CXXX"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Manufacturing Process</label>
                                <select
                                    value={editForm.manufacturing_process}
                                    onChange={e => setEditForm(prev => ({ ...prev, manufacturing_process: e.target.value }))}
                                    className="w-full p-2 border rounded text-sm"
                                >
                                    {processOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Material</label>
                                <select
                                    value={editForm.material}
                                    onChange={e => setEditForm(prev => ({ ...prev, material: e.target.value }))}
                                    className="w-full p-2 border rounded text-sm"
                                >
                                    {materialOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Machine ID</label>
                                <input
                                    type="text"
                                    value={editForm.machine}
                                    onChange={e => setEditForm(prev => ({ ...prev, machine: e.target.value }))}
                                    className="w-full p-2 border rounded text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setEditingJob(null)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm">Cancel</button>
                            <button onClick={handleSaveEdit} className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
