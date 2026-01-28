import { Calendar, ChevronRight, Folder, LayoutGrid, List, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/sales/projects`);
            if (!res.ok) throw new Error('Failed to fetch projects');
            const data = await res.json();
            setProjects(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            'ACTIVE': 'bg-green-100 text-green-700',
            'COMPLETED': 'bg-blue-100 text-blue-700',
            'ARCHIVED': 'bg-gray-100 text-gray-700',
            'ON_HOLD': 'bg-yellow-100 text-yellow-700'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
                {status}
            </span>
        );
    };

    const filteredProjects = projects.filter(p => {
        const matchesSearch =
            (p.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.project_id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = filterStatus === 'All' || p.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                    <p className="text-gray-500 mt-1">Manage client projects and view their status</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                    <Folder size={18} />
                    New Project
                </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Total Projects</div>
                    <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Active</div>
                    <div className="text-2xl font-bold text-green-600">{projects.filter(p => p.status === 'ACTIVE').length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Completed</div>
                    <div className="text-2xl font-bold text-blue-600">{projects.filter(p => p.status === 'COMPLETED').length}</div>
                </div>
                {/* Placeholder for Revenue or other metric */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">This Month</div>
                    <div className="text-2xl font-bold text-indigo-600">{projects.filter(p => {
                        if (!p.start_date) return false;
                        const d = new Date(p.start_date);
                        const now = new Date();
                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    }).length}</div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none w-80 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <List size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <LayoutGrid size={18} />
                    </button>
                </div>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-medium tracking-wider">
                                <th className="p-4">Project</th>
                                <th className="p-4">Client</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Start Date</th>
                                <th className="p-4">Parts</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProjects.map(project => (
                                <tr key={project.project_id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                {project.project_id.substring(0, 2)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{project.name || project.project_id}</div>
                                                <div className="text-xs text-gray-500">{project.project_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {project.client ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                                    {project.client.name.charAt(0)}
                                                </div>
                                                <span className="text-sm text-gray-700">{project.client.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">No Client</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge status={project.status} />
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {project.parts_count || 0}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors">
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredProjects.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            {loading ? "Loading projects..." : "No projects found."}
                        </div>
                    )}
                </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProjects.map(project => (
                        <div key={project.project_id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow cursor-pointer group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs ring-1 ring-blue-100">
                                    {project.project_id.substring(0, 2)}
                                </div>
                                <StatusBadge status={project.status} />
                            </div>

                            <h3 className="font-bold text-gray-900 mb-1 truncate" title={project.name}>{project.name || project.project_id}</h3>
                            <p className="text-xs text-gray-500 font-mono mb-4">{project.project_id}</p>

                            <div className="space-y-2 border-t border-gray-100 pt-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users size={14} className="text-gray-400" />
                                    <span className="truncate">{project.client?.name || 'No Client'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar size={14} className="text-gray-400" />
                                    <span>{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'No Date'}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 flex justify-between items-center text-xs border-t border-gray-100">
                                <span className="text-gray-500">{project.parts_count || 0} items</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Projects;
