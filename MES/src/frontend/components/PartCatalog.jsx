import { AlertTriangle, Grid, List, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

const PartCatalog = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [processFilter, setProcessFilter] = useState('All');
    const [clientFilter, setClientFilter] = useState('All');
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
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPartFor3D, setSelectedPartFor3D] = useState(null);
    const [drawingModalOpen, setDrawingModalOpen] = useState(false);
    const [drawingData, setDrawingData] = useState(null);
    const [generatingDrawing, setGeneratingDrawing] = useState(false);
    const [error, setError] = useState(null);

    const [selectedIds, setSelectedIds] = useState(new Set());

    // Edit State
    const [editingPart, setEditingPart] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '', client_id: '', project_id: '', manufacturing_process: '', material: ''
    });



    useEffect(() => {
        fetchParts();

        // Fetch Metadata
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

    const fetchParts = () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        fetch(`${API_BASE_URL}/api/part-analysis/parts`, { signal: controller.signal })
            .then(async res => {
                clearTimeout(timeoutId);
                if (!res.ok) throw new Error(res.statusText);
                return res.json();
            })
            .then(data => {
                setParts(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch Error:", err);
                if (err.name === 'AbortError') {
                    setError("Request timed out. Server might be busy.");
                } else {
                    setError("Failed to load parts. Server unavailable.");
                }
                setLoading(false);
            });
    };

    const handleSelect = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleSelectAll = () => {
        const allVisibleSelected = filteredParts.length > 0 && filteredParts.every(p => selectedIds.has(p.part_id));

        if (allVisibleSelected) {
            // Deselect all visible
            const newSet = new Set(selectedIds);
            filteredParts.forEach(p => newSet.delete(p.part_id));
            setSelectedIds(newSet);
        } else {
            // Select all visible
            const newSet = new Set(selectedIds);
            filteredParts.forEach(p => newSet.add(p.part_id));
            setSelectedIds(newSet);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedIds.size} selected parts?`)) return;

        const ids = Array.from(selectedIds);
        const promises = ids.map(id =>
            fetch(`${API_BASE_URL}/api/part-analysis/parts/${id}`, { method: 'DELETE' })
        );

        try {
            await Promise.all(promises);
            setParts(prev => prev.filter(p => !selectedIds.has(p.part_id)));
            setSelectedIds(new Set());
        } catch (err) {
            alert("Some items failed to delete.");
        }
    };

    const handleDelete = async (partId, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this part?")) return;

        try {
            await fetch(`${API_BASE_URL}/api/part-analysis/parts/${partId}`, { method: 'DELETE' });
            setParts(prev => prev.filter(p => p.part_id !== partId));
            if (selectedIds.has(partId)) {
                const newSet = new Set(selectedIds);
                newSet.delete(partId);
                setSelectedIds(newSet);
            }
        } catch (err) {
            alert("Error deleting part.");
        }
    };

    const handleGenerateDrawing = async (partId, e) => {
        e.stopPropagation();
        setGeneratingDrawing(true);
        setDrawingData(null);
        setDrawingModalOpen(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/part-analysis/generate-drawing/${partId}`, {
                method: 'POST'
            });
            if (!res.ok) throw new Error("Failed to generate drawing");
            const data = await res.json();
            setDrawingData(data);
        } catch (err) {
            console.error(err);
            alert("Failed to generate drawing");
            setDrawingModalOpen(false);
        } finally {
            setGeneratingDrawing(false);
        }
    };

    const openEditModal = (part, e) => {
        e.stopPropagation();
        setEditingPart(part);
        setEditForm({
            name: part.name || '',
            client_id: part.client_id || '',
            project_id: part.project_id || '',
            manufacturing_process: part.manufacturing_process || '',
            material: part.material || ''
        });
    };

    const handleSaveEdit = async () => {
        if (!editingPart) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/part-analysis/parts/${editingPart.part_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (!res.ok) throw new Error("Failed to update part");

            const updatedPart = await res.json();

            // Update local state
            setParts(prev => prev.map(p => p.part_id === updatedPart.part_id ? { ...p, ...updatedPart } : p));
            setEditingPart(null);
        } catch (err) {
            console.error(err);
            alert("Failed to update part details");
        }
    };

    const filteredParts = parts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.project_id && p.project_id.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesProcess = processFilter === 'All' ||
            (processFilter === 'Others'
                ? !processOptions.filter(opt => opt !== 'Others').includes(p.manufacturing_process)
                : p.manufacturing_process === processFilter);

        const matchesClient = clientFilter === 'All' ||
            (clientFilter === 'Others'
                ? !clientOptions.filter(c => c !== 'Others').includes(p.client_id)
                : p.client_id === clientFilter);

        return matchesSearch && matchesProcess && matchesClient;
    });

    return (
        <div className="p-6 h-full bg-gray-50 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Catalog</h1>
                    <p className="text-gray-500 mt-1">Manage and order parts from your verified library</p>
                </div>
                <div className="flex gap-2">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200"
                        >
                            <Trash2 size={20} />
                            Delete ({selectedIds.size})
                        </button>
                    )}
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        <Plus size={20} />
                        Create Part
                    </button>
                </div>
            </div>

            {/* Selection Bar */}
            <div className="flex items-center gap-3 mb-4 p-2 bg-white rounded-lg border border-gray-200">
                <input
                    type="checkbox"
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                    checked={filteredParts.length > 0 && filteredParts.every(p => selectedIds.has(p.part_id))}
                    onChange={handleSelectAll}
                />
                <span className="text-sm font-medium text-gray-700">Select All ({filteredParts.length})</span>
            </div>



            {error && (
                <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-center border border-red-200">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search parts..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                    {/* Process Filter */}
                    <select
                        className="p-2 bg-transparent text-sm border-r border-gray-200 outline-none"
                        value={processFilter}
                        onChange={(e) => setProcessFilter(e.target.value)}
                    >
                        <option value="All">All Processes</option>
                        {processOptions.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>

                    {/* Client Filter */}
                    <select
                        className="p-2 bg-transparent text-sm border-r border-gray-200 outline-none max-w-[150px]"
                        value={clientFilter}
                        onChange={(e) => setClientFilter(e.target.value)}
                    >
                        <option value="All">All Clients</option>
                        {clientOptions.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Grid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
                    {filteredParts.map(part => (
                        <div key={part.part_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group relative">
                            {/* Conditional Rendering: Edit Mode or View Mode */}
                            {editingPart?.part_id === part.part_id ? (
                                <div className="absolute inset-0 bg-white z-50 p-4 flex flex-col h-full overflow-y-auto">
                                    <h3 className="font-bold text-gray-900 mb-3 text-sm">Edit Part Details</h3>

                                    <div className="space-y-3 flex-1">
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Name</label>
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                                className="w-full p-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Client</label>
                                                <select
                                                    value={editForm.client_id}
                                                    onChange={e => setEditForm(p => ({ ...p, client_id: e.target.value }))}
                                                    className="w-full p-1.5 border border-gray-200 rounded text-xs"
                                                >
                                                    <option value="">Select</option>
                                                    {clientOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Project ID</label>
                                                <input
                                                    type="text"
                                                    value={editForm.project_id}
                                                    onChange={e => setEditForm(p => ({ ...p, project_id: e.target.value }))}
                                                    className="w-full p-1.5 border border-gray-200 rounded text-xs"
                                                    placeholder="CXXX"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Process</label>
                                            <select
                                                value={editForm.manufacturing_process}
                                                onChange={e => setEditForm(p => ({ ...p, manufacturing_process: e.target.value }))}
                                                className="w-full p-1.5 border border-gray-200 rounded text-xs"
                                            >
                                                {processOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Material</label>
                                            <select
                                                value={editForm.material}
                                                onChange={e => setEditForm(p => ({ ...p, material: e.target.value }))}
                                                className="w-full p-1.5 border border-gray-200 rounded text-xs"
                                            >
                                                {materialOptions.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingPart(null); }}
                                            className="flex-1 py-1.5 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }}
                                            className="flex-1 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Image Area */}
                                    <div className="aspect-square bg-gray-100 relative flex items-center justify-center overflow-hidden">
                                        {part.preview_url ? (
                                            <img
                                                src={part.preview_url?.startsWith('http') ? part.preview_url : `${API_BASE_URL.replace(/\/$/, '')}/${encodeURI(part.preview_url.replace(/^\//, ''))}`}
                                                alt={part.name}
                                                className="w-full h-48 object-contain p-4 bg-gray-50"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/placeholder.svg';
                                                    console.warn("Failed to load image:", part.preview_url);
                                                }}
                                            />
                                        ) : (
                                            <div className="text-gray-300">No Preview</div>
                                        )}

                                        {/* Checkbox Overlay */}
                                        <div
                                            className="absolute top-3 left-3 z-20 p-2 -m-2 cursor-pointer hover:bg-white/20 rounded-full"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(part.part_id);
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shadow-sm pointer-events-none"
                                                checked={selectedIds.has(part.part_id)}
                                                readOnly
                                            />
                                        </div>

                                        {/* Top Actions */}
                                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 w-full justify-end px-3">
                                            <button
                                                className="bg-white p-2 rounded-full shadow-sm hover:bg-red-50 text-red-600"
                                                onClick={(e) => handleDelete(part.part_id, e)}
                                                title="Delete Part"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (!window.confirm("Add this part to Dispatch Planning?")) return;
                                                    try {
                                                        const res = await fetch(`${API_BASE_URL}/api/dispatch/orders/create-from-part/${part.part_id}`, {
                                                            method: 'POST'
                                                        });
                                                        if (res.ok) {
                                                            alert("Added to Dispatch Planning!");
                                                        } else {
                                                            alert("Failed to add to dispatch.");
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert("Error connecting to server.");
                                                    }
                                                }}
                                                className="bg-white p-2 rounded-full shadow-sm hover:bg-gray-50 text-blue-600"
                                                title="Add to Dispatch"
                                            >
                                                <Plus size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => openEditModal(part, e)}
                                                className="bg-white p-2 rounded-full shadow-sm hover:bg-gray-50 text-gray-600"
                                                title="Edit Part"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                            </button>
                                        </div>

                                        {/* 3D View Trigger */}
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    // Backend converts STEP/SLDPRT to STL, so we point viewer to the STL version
                                                    let viewerUrl = part.file_path;
                                                    console.log("Original File Path:", viewerUrl);
                                                    const lowerUrl = viewerUrl.toLowerCase();
                                                    if (lowerUrl.endsWith('.step') || lowerUrl.endsWith('.stp') || lowerUrl.endsWith('.sldprt') || lowerUrl.endsWith('.x_t')) {
                                                        viewerUrl = viewerUrl.substring(0, viewerUrl.lastIndexOf('.')) + '.stl';
                                                    }

                                                    // Ensure viewerUrl has no backslashes
                                                    viewerUrl = viewerUrl.replace(/\\/g, '/');

                                                    console.log("Viewer URL (Processed):", viewerUrl);

                                                    // Construct full URL with Base URL
                                                    // We need to pass the FULL path to the standalone viewer so it can load it.
                                                    // Or relative? StandaloneViewer takes 'url'.
                                                    // The CADViewer inside expects a URL it can fetch.
                                                    const fullAssetUrl = `${API_BASE_URL.replace(/\/$/, '')}/${encodeURI(viewerUrl.replace(/^\//, ''))}`;

                                                    // Open in new window
                                                    // Route is /viewer?url=...&part_id=...
                                                    const viewerPageUrl = `/viewer?url=${encodeURIComponent(fullAssetUrl)}&part_id=${part.part_id}`;
                                                    window.open(viewerPageUrl, '_blank');
                                                }}
                                                className="bg-black/75 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-black backdrop-blur-sm"
                                            >
                                                View 3D
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`/drawing-viewer?part_id=${part.part_id}`, '_blank');
                                                }}
                                                className="bg-white/90 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-white backdrop-blur-sm shadow-sm ml-2"
                                            >
                                                2D Dwg
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        {/* Project Badge */}
                                        {part.project_id && (
                                            <span className="inline-block bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded mb-2 uppercase tracking-wide mr-2">
                                                {part.project_id}
                                            </span>
                                        )}
                                        {part.client_id && (
                                            <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded mb-2 uppercase tracking-wide">
                                                {part.client_id}
                                            </span>
                                        )}
                                        <h3 className="font-semibold text-gray-900 truncate" title={part.name}>{part.name}</h3>
                                        <p className="text-xs text-gray-500 font-mono mt-1">#{part.part_id.slice(0, 8).toUpperCase()}</p>

                                        <div className="mt-4 flex justify-between items-end">
                                            <div>
                                                <span className="block text-xs text-gray-400">Material</span>
                                                <span className="text-sm font-medium text-gray-700">{part.material}</span>
                                                <span className="text-[10px] text-gray-500 block">({part.manufacturing_process || 'N/A'})</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-xs text-gray-400">Cost</span>
                                                <span className="text-lg font-bold text-blue-600">€{part.estimated_cost.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Geometric Details */}
                                        {part.measurements && part.measurements.volume_cm3 && (
                                            <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                                <div>
                                                    <span className="block text-gray-300 uppercase text-[10px] tracking-wider font-semibold">Volume</span>
                                                    <span className="font-mono text-gray-700">{part.measurements.volume_cm3} cm³</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-gray-300 uppercase text-[10px] tracking-wider font-semibold">Dimensions</span>
                                                    <span className="font-mono text-gray-700">
                                                        {part.measurements.bounding_box ?
                                                            `${part.measurements.bounding_box.x}x${part.measurements.bounding_box.y}x${part.measurements.bounding_box.z}`
                                                            : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-3 text-xs text-gray-400">
                                            Shipped in 4-8 days
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    {filteredParts.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            No parts found matching your search.
                        </div>
                    )}
                </div>
            )}

            {/* Modal removed in favor of new window viewer */}


        </div >
    );
};

export default PartCatalog;
