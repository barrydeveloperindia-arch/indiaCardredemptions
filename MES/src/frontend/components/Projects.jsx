import { Calendar, ChevronRight, Folder, LayoutGrid, List, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useSearch } from '../context/SearchContext';

const Projects = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');

    const { searchTerm } = useSearch(); // Global Search
    const [filterStatus, setFilterStatus] = useState('All');
    const [expandedYears, setExpandedYears] = useState({});

    // Keep rest ...

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/sales/projects`);
            if (!res.ok) throw new Error('Failed to fetch projects');
            const data = await res.json();
            setProjects(data);

            // Auto-expand the most recent year
            if (data.length > 0) {
                const recentYear = new Date(data[0].start_date).getFullYear();
                setExpandedYears({ [recentYear]: true });
            }
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

    // Grouping Logic
    const groupedProjects = useMemo(() => {
        const filtered = projects.filter(p => {
            const matchesSearch =
                (p.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (p.project_id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (p.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
            return matchesSearch && matchesStatus;
        });

        // ... [Rest of Grouping] ...
        const groups = {};

        filtered.forEach(p => {
            const date = p.start_date ? new Date(p.start_date) : null;
            const year = date ? date.getFullYear() : 'Undated';
            const month = date ? date.toLocaleString('default', { month: 'long' }) : 'General';
            const monthIndex = date ? date.getMonth() : 99; // For sorting

            if (!groups[year]) groups[year] = { _count: 0, months: {} };
            if (!groups[year].months[month]) groups[year].months[month] = { _index: monthIndex, items: [] };

            groups[year]._count++;
            groups[year].months[month].items.push(p);
        });

        return groups;
    }, [projects, searchTerm, filterStatus]);

    // ... [Rest of Logic] ...

    // Sorted Years (Descending)
    const sortedYears = Object.keys(groupedProjects).sort((a, b) => {
        if (a === 'Undated') return 1;
        if (b === 'Undated') return -1;
        return b - a;
    });

    const toggleYear = (year) => {
        setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                    <p className="text-gray-500 mt-1">Manage client projects categorized by timeline</p>
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
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">2025 Projects</div>
                    <div className="text-2xl font-bold text-indigo-600">{projects.filter(p => p.start_date && p.start_date.substring(0, 4) === '2025').length}</div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4 flex-1">
                    {/* Search Input Removed - Using Global */}
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

            {/* Grouped Content */}
            {loading ? (
                <div className="p-12 text-center text-gray-500">Loading projects timeline...</div>
            ) : sortedYears.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No projects found for current filter.</div>
            ) : (
                <div className="space-y-8">
                    {sortedYears.map(year => {
                        const yearGroup = groupedProjects[year];
                        const isExpanded = expandedYears[year];

                        return (
                            <div key={year} className="animate-fade-in-up">
                                {/* Year Header */}
                                <div
                                    className="flex items-center gap-3 cursor-pointer py-2 hover:bg-gray-50 rounded-lg select-none mb-3"
                                    onClick={() => toggleYear(year)}
                                >
                                    <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                        <ChevronRight size={20} className="text-gray-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">{year}</h2>
                                    <span className="text-sm font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        {yearGroup._count} Projects
                                    </span>
                                    <div className="flex-1 border-b border-gray-200 ml-4"></div>
                                </div>

                                {/* Month Groups */}
                                <div className={`space-y-6 pl-4 border-l-2 border-gray-100 ml-2.5 transition-all duration-300 ${isExpanded ? 'opacity-100 max-h-[5000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                                    {Object.entries(yearGroup.months)
                                        .sort(([, a], [, b]) => b._index - a._index) // Sort Months Descending
                                        .map(([month, monthGroup]) => (
                                            <div key={month}>
                                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {month}
                                                </h3>

                                                {/* Projects Grid/List for this Month */}
                                                {viewMode === 'list' ? (
                                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                                        <table className="w-full text-left border-collapse">
                                                            <tbody className="divide-y divide-gray-100">
                                                                {monthGroup.items.map(project => (
                                                                    <tr key={project.project_id}
                                                                        onClick={() => navigate(`/projects/${project.project_id}`)}
                                                                        className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                                                                    >
                                                                        <td className="p-4 w-1/3">
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
                                                                        <td className="p-4 w-1/4">
                                                                            {project.client ? (
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                                                                        {project.client.name.charAt(0)}
                                                                                    </div>
                                                                                    <span className="text-sm text-gray-700">{project.client.name}</span>
                                                                                </div>
                                                                            ) : <span className="text-sm text-gray-400 italic">No Client</span>}
                                                                        </td>
                                                                        <td className="p-4 w-1/6">
                                                                            <StatusBadge status={project.status} />
                                                                        </td>
                                                                        <td className="p-4 text-sm text-gray-600">
                                                                            {project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}
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
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                        {monthGroup.items.map(project => (
                                                            <div
                                                                key={project.project_id}
                                                                onClick={() => navigate(`/projects/${project.project_id}`)}
                                                                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
                                                            >
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs ring-1 ring-blue-100">
                                                                        {project.project_id.substring(0, 2)}
                                                                    </div>
                                                                    <StatusBadge status={project.status} />
                                                                </div>
                                                                <h3 className="font-bold text-sm text-gray-900 mb-1 truncate">{project.name}</h3>
                                                                <p className="text-xs text-gray-500 mb-3">{project.project_id}</p>
                                                                <div className="flex items-center gap-2 text-xs text-gray-600 pt-3 border-t border-gray-50">
                                                                    <Users size={12} />
                                                                    <span className="truncate">{project.client?.name || 'No Client'}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Projects;
