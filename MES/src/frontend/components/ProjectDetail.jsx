import { ArrowLeft, Box, Calendar, Cuboid, DollarSign, Layers, Package, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    const fetchProjectDetails = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/sales/projects/${id}`);
            if (!res.ok) throw new Error('Project not found');
            const data = await res.json();
            setProject(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading Project Details...</div>;
    if (error) return <div className="p-12 text-center text-red-500">Error: {error}</div>;
    if (!project) return null;

    const totalVolume = project.parts.reduce((acc, p) => acc + (p.measurements?.volume_cm3 || 0), 0);
    const totalCost = project.parts.reduce((acc, p) => acc + (p.estimated_cost || 0), 0);
    const partCount = project.parts.length;

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header / Back */}
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-4 text-sm font-medium"
                >
                    <ArrowLeft size={16} className="mr-2" /> Back
                </button>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold font-mono">
                                {project.project_id}
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">{project.name || 'Untitled Project'}</h1>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'No Date'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${project.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                {project.status}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                            <Settings size={16} />
                            Process
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                        <Package size={14} /> Part Count
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{partCount}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                        <Cuboid size={14} /> Total Volume
                    </div>
                    <div className="text-2xl font-bold text-indigo-600">{totalVolume.toFixed(2)} <span className="text-sm text-gray-400 font-normal">cm³</span></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                        <Layers size={14} /> Materials
                    </div>
                    <div className="text-xl font-bold text-gray-900 truncate">
                        {Array.from(new Set(project.parts.map(p => p.material || 'N/A'))).join(', ')}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                        <DollarSign size={14} /> Est. Cost
                    </div>
                    <div className="text-2xl font-bold text-green-600">₹{totalCost.toFixed(2)}</div>
                </div>
            </div>

            {/* Components List */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <Box size={18} className="text-blue-500" />
                        Project Components
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-xs uppercase text-gray-500 font-medium tracking-wider">
                                <th className="p-4 pl-6">Preview</th>
                                <th className="p-4">Filename / Component</th>
                                <th className="p-4">Dimensions (mm)</th>
                                <th className="p-4">Volume</th>
                                <th className="p-4">Surface Area</th>
                                <th className="p-4">Watertight</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {project.parts.map(part => {
                                const meta = part.measurements || {};
                                const bbox = meta.bounding_box || {};
                                return (
                                    <tr key={part.part_id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4 pl-6 w-16">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                <Cuboid size={20} />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900 line-clamp-1" title={part.name}>
                                                {part.name}
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono mt-0.5">{part.file_path?.split('/').pop()}</div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 font-mono">
                                            {bbox.x ? `${bbox.x} x ${bbox.y} x ${bbox.z}` : '-'}
                                        </td>
                                        <td className="p-4 text-sm font-medium text-indigo-600">
                                            {meta.volume_cm3 ? `${meta.volume_cm3} cm³` : '-'}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {meta.surface_area_cm2 ? `${meta.surface_area_cm2} cm²` : '-'}
                                        </td>
                                        <td className="p-4">
                                            {meta.is_watertight ? (
                                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Yes</span>
                                            ) : meta.is_watertight === false ? (
                                                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">No</span>
                                            ) : (
                                                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Pending</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {project.parts.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500 italic">No components found for this project.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* JSON Debug Check (Optional) */}
            {/* <div className="mt-8">
                <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Raw Metadata Debug</h4>
                <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs overflow-auto max-h-60">
                    {JSON.stringify(project.parts[0]?.measurements, null, 2)}
                </pre>
            </div> */}
        </div>
    );
};

export default ProjectDetail;
