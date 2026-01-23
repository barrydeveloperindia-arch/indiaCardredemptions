import { AlertTriangle, Grid, List, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

const PartCatalog = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPartFor3D, setSelectedPartFor3D] = useState(null);
    const [drawingModalOpen, setDrawingModalOpen] = useState(false);
    const [drawingData, setDrawingData] = useState(null);
    const [generatingDrawing, setGeneratingDrawing] = useState(false);
    const [error, setError] = useState(null);

    const [selectedIds, setSelectedIds] = useState(new Set());

    useEffect(() => {
        fetchParts();
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

    const filteredParts = parts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.project_id && p.project_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                                    <button className="bg-white p-2 rounded-full shadow-sm hover:bg-gray-50 text-blue-600">
                                        <Plus size={16} />
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
                                    <span className="inline-block bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded mb-2 uppercase tracking-wide">
                                        {part.project_id}
                                    </span>
                                )}
                                <h3 className="font-semibold text-gray-900 truncate" title={part.name}>{part.name}</h3>
                                <p className="text-xs text-gray-500 font-mono mt-1">#{part.part_id.slice(0, 8).toUpperCase()}</p>

                                <div className="mt-4 flex justify-between items-end">
                                    <div>
                                        <span className="block text-xs text-gray-400">Material</span>
                                        <span className="text-sm font-medium text-gray-700">{part.material}</span>
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
