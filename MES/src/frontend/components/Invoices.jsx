import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

export default function Invoices() {
    const { token } = useAuth();
    const { searchTerm } = useSearch(); // Global Search
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, year: {}, month: {} });
    const [selectedCustomer, setSelectedCustomer] = useState('ALL');

    // Filter Logic
    const customers = ['ALL', ...new Set(projects.map(p =>
        p.name.includes('(') ? p.name.split('(').pop().replace(')', '').trim() : 'N/A'
    ))].sort();

    const filteredProjects = projects.filter(p => {
        const cName = p.name.includes('(') ? p.name.split('(').pop().replace(')', '').trim() : 'N/A';

        // 1. Customer Dropdown Filter
        if (selectedCustomer !== 'ALL' && cName !== selectedCustomer) return false;

        // 2. Global Search Filter
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            return (
                (p.project_id && p.project_id.toLowerCase().includes(s)) ||
                (cName && cName.toLowerCase().includes(s)) ||
                (p.po_number && p.po_number.toLowerCase().includes(s))
            );
        }

        return true;
    });

    const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:8008' : '/api';

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/sales/projects?limit=1000`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setProjects(data);
                processStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load ledger:", err);
                setLoading(false);
            });
    }, [token]);

    const processStats = (data) => {
        let total = 0;
        const yearStats = {};
        const monthStats = {};

        data.forEach(p => {
            const val = p.po_value || p.quote_value || 0; // Prioritize PO Value
            if (val > 0) {
                total += val;
                const d = new Date(p.start_date || new Date());
                const y = d.getFullYear();
                const m = d.toLocaleString('default', { month: 'short' }) + ' ' + y;

                yearStats[y] = (yearStats[y] || 0) + val;
                monthStats[m] = (monthStats[m] || 0) + val;
            }
        });
        setStats({ total, year: yearStats, month: monthStats });
    };

    // Helper for Bar Chart
    const Bar = ({ label, value, max }) => {
        const h = max > 0 ? (value / max) * 100 : 0;
        return (
            <div className="flex flex-col items-center group w-12 mx-1">
                <div className="w-full bg-gray-100 rounded-t-lg relative h-32 flex items-end overflow-hidden">
                    <div
                        style={{ height: `${h}%` }}
                        className="w-full bg-gradient-to-t from-englabs-blue to-blue-400 group-hover:from-blue-600 transition-all duration-500"
                    ></div>
                </div>
                <span className="text-[10px] text-gray-400 mt-2 font-mono uppercase">{label}</span>
                <span className="text-[10px] font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-4 bg-white shadow-lg px-2 rounded-full">
                    {value.toLocaleString()}
                </span>
            </div>
        );
    };

    if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">Loading Ledger...</div>;

    const maxYear = Math.max(...Object.values(stats.year), 1);
    const maxMonth = Math.max(...Object.values(stats.month), 1);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <header className="mb-6 flex justify-between items-center bg-white/50 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-sm">
                <div>
                    <h1 className="text-3xl font-light text-gray-900 tracking-tight">Financial Ledger</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <select
                            value={selectedCustomer}
                            onChange={(e) => setSelectedCustomer(e.target.value)}
                            className="text-xs bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 text-gray-700 max-w-[200px]"
                        >
                            {customers.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <span className="text-gray-400 text-xs">· PO Tracking</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Total Revenue</p>
                    <p className="text-4xl font-bold text-englabs-blue">₹{stats.total.toLocaleString()}</p>
                </div>
            </header>

            {/* Dashboards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Yearly Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-6">Yearly Performance</h3>
                    <div className="flex items-end justify-center h-48 border-b border-gray-100 pb-2">
                        {Object.entries(stats.year).sort().map(([k, v]) => (
                            <Bar key={k} label={k} value={v} max={maxYear} />
                        ))}
                    </div>
                </div>

                {/* Monthly Chart (Last 12) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-x-auto">
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-6">Monthly Trends</h3>
                    <div className="flex items-end justify-start h-48 border-b border-gray-100 pb-2 min-w-[500px]">
                        {Object.entries(stats.month).slice(-12).map(([k, v]) => (
                            <Bar key={k} label={k.split(' ')[0]} value={v} max={maxMonth} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between">
                    <h3 className="text-lg font-bold text-gray-700">Purchase Orders Received</h3>
                    <span className="text-xs font-mono bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{filteredProjects.length} Entries</span>
                </div>
                <div className="overflow-auto flex-1 p-0">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="py-3 px-6 text-xs text-gray-400 uppercase font-semibold">Project ID</th>
                                <th className="py-3 px-6 text-xs text-gray-400 uppercase font-semibold">Customer</th>
                                <th className="py-3 px-6 text-xs text-gray-400 uppercase font-semibold">PO Number</th>
                                <th className="py-3 px-6 text-xs text-gray-400 uppercase font-semibold">Date</th>
                                <th className="py-3 px-6 text-xs text-gray-400 uppercase font-semibold text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProjects.map(p => (
                                <tr key={p.project_id} className="hover:bg-blue-50/50 transition-colors group cursor-default">
                                    <td className="py-3 px-6 font-mono text-xs text-englabs-blue font-medium whitespace-nowrap">{p.project_id}</td>
                                    <td className="py-3 px-6 text-sm text-gray-800 font-medium truncate max-w-[200px]" title={p.name}>
                                        {p.name.includes('(') ? p.name.split('(').pop().replace(')', '') : 'N/A'}
                                    </td>
                                    <td className="py-3 px-6 text-sm text-gray-600 font-mono">
                                        {p.po_number || <span className="text-gray-300 italic">-</span>}
                                    </td>
                                    <td className="py-3 px-6 text-xs text-gray-500">
                                        {new Date(p.start_date || new Date()).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-6 text-right font-mono text-sm font-bold text-gray-900">
                                        ₹{(p.po_value || p.quote_value || 0).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {projects.filter(p => (p.po_value || p.quote_value) > 0).length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center text-gray-400">No financial data found. Check Import.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
