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

    useEffect(() => {
        fetchBoard();
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

        // Fallback for source if needed, but we have state sourceCol
        // let source = sourceCol; 
        // Or decode json
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
        } catch (err) {
            alert("Delete failed");
        }
    };

    const handleEdit = (job) => {
        const newMachine = prompt("Edit Machine Assignment:", job.machine || "");
        if (newMachine !== null && newMachine !== job.machine) {
            // Simple inline edit for prototype
            fetch(`${API_BASE_URL}/api/dispatch/jobs/${job.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ machine_id: newMachine })
            }).then(() => fetchBoard());
        }
    };

    const handlePrintQC = (id) => {
        window.open(`${API_BASE_URL}/api/dispatch/jobs/${id}/qc-report`, '_blank');
    };

    const renderCard = (job, colName) => (
        <div
            key={job.id}
            draggable
            onDragStart={(e) => handleDragStart(e, job.id, colName)}
            className="glass-card p-4 rounded-xl cursor-grab active:cursor-grabbing group relative mb-3 hover:shadow-lg transition-all"
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 tracking-tight text-sm">{job.id}</h3>
                <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(job); }} className="text-xs text-blue-500 hover:text-blue-700 px-1">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(job.id, colName); }} className="text-xs text-red-500 hover:text-red-700 px-1">✕</button>
                </div>
            </div>

            <p className="text-xs text-slate-500 font-medium mb-1">{job.part_name}</p>
            <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>{job.machine || "Unassigned"}</span>
                <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">{job.eta}</span>
            </div>

            {colName === 'qc' && (
                <button
                    onClick={() => handlePrintQC(job.id)}
                    className="mt-3 w-full py-1 text-xs bg-emerald-50 text-emerald-600 rounded border border-emerald-100 font-medium hover:bg-emerald-100"
                >
                    Export QC Report (PDF)
                </button>
            )}
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
                {['planning', 'production', 'qc'].map(col => (
                    <div
                        key={col}
                        className={`flex flex-col h-full bg-gray-50/50 rounded-2xl border-2 ${sourceCol && sourceCol !== col ? 'border-dashed border-blue-200 bg-blue-50/20' : 'border-transparent'}`}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                        onDragEnter={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, col)}
                    >
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-slate-700 text-xs uppercase tracking-widest">{col.replace('_', ' ')}</h2>
                            <span className="bg-white text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">{columns[col]?.length || 0}</span>
                        </div>
                        <div className="flex-1 p-3 overflow-y-auto">
                            {columns[col]?.map(job => renderCard(job, col))}
                            {columns[col]?.length === 0 && (
                                <div className="h-full flex items-center justify-center text-slate-300 text-xs italic">
                                    Drop items here
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
