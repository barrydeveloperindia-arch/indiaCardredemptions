import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Plus } from 'lucide-react';
import STLViewer from './STLViewer';

const PartCatalog = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPartFor3D, setSelectedPartFor3D] = useState(null);

    useEffect(() => {
        fetchParts();
    }, []);

    const fetchParts = () => {
        fetch('http://localhost:8000/api/part-analysis/parts')
            .then(res => res.json())
            .then(data => {
                setParts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch parts", err);
                setLoading(false);
            });
    };

    const filteredParts = parts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 h-full bg-gray-50 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Catalog</h1>
                    <p className="text-gray-500 mt-1">Manage and order parts from your verified library</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <Plus size={20} />
                    Create Part
                </button>
            </div>

            {selectedPartFor3D && (
                <STLViewer
                    url={`http://localhost:8000/${selectedPartFor3D.file_path}`}
                    onClose={() => setSelectedPartFor3D(null)}
                />
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
                        <div key={part.part_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                            {/* Image Area */}
                            <div className="aspect-square bg-gray-100 relative flex items-center justify-center overflow-hidden">
                                {part.preview_url ? (
                                    <img src={part.preview_url} alt={part.name} className="object-cover w-full h-full mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <div className="text-gray-300">No Preview</div>
                                )}
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="bg-white p-2 rounded-full shadow-sm hover:bg-gray-50">
                                        <Plus size={16} className="text-blue-600" />
                                    </button>
                                </div>

                                {/* 3D View Trigger */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setSelectedPartFor3D(part)}
                                        className="bg-black/75 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-black backdrop-blur-sm"
                                    >
                                        View 3D
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
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
        </div>
    );
};

export default PartCatalog;
