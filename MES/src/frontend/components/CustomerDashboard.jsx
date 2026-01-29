import { ArrowLeft, Building2, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useSearch } from '../context/SearchContext';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('list'); // 'list' (all customers) | 'detail' (specific customer)
    const [customers, setCustomers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    const { searchTerm } = useSearch();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [contactsRes, projectsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/sales/contacts?type=CUSTOMER&limit=2000`),
                fetch(`${API_BASE_URL}/api/sales/projects`)
            ]);

            const contacts = await contactsRes.json();
            const projectsData = await projectsRes.json();

            setCustomers(contacts);
            setProjects(projectsData);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    // ... [Processing Logic remains same] ...

    // Calculate aggregated stats for each customer
    const customerStats = customers.map(c => {
        const customerProjects = projects.filter(p => p.customer_id === c.contact_id);
        const activeCount = customerProjects.filter(p => p.status === 'ACTIVE').length;
        const completeCount = customerProjects.filter(p => p.status === 'COMPLETED').length;

        // Find most recent project date
        let lastActivity = null;
        if (customerProjects.length > 0) {
            const dates = customerProjects.map(p => p.start_date ? new Date(p.start_date) : new Date(0));
            lastActivity = new Date(Math.max(...dates));
        }

        return {
            ...c,
            projectCount: customerProjects.length,
            activeCount,
            completeCount,
            lastActivity,
            projects: customerProjects.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)) // Newest first
        };
    }).sort((a, b) => b.projectCount - a.projectCount); // Sort by most projects

    const filteredCustomers = customerStats.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleCustomerClick = (customer) => {
        setSelectedCustomer(customer);
        setView('detail');
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

    if (loading) return <div className="p-12 text-center text-gray-500">Loading Customer Data...</div>;

    // --- DETAIL VIEW ---
    if (view === 'detail' && selectedCustomer) {
        return (
            <div className="space-y-6 animate-fade-in">
                {/* Back Button */}
                <button
                    onClick={() => setView('list')}
                    className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-4"
                >
                    <ArrowLeft size={18} className="mr-2" /> Back to Customers
                </button>

                {/* Header Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-3xl font-bold ring-4 ring-indigo-50/50">
                            {selectedCustomer.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{selectedCustomer.name}</h1>
                            <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
                                <span className="flex items-center gap-1"><Building2 size={14} /> Client</span>
                                {selectedCustomer.email && <span>• {selectedCustomer.email}</span>}
                                {selectedCustomer.phone && <span>• {selectedCustomer.phone}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Total Revenue</div>
                            <div className="text-2xl font-bold text-gray-900">₹0.00</div> {/* Placeholder for now */}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Total Projects</div>
                        <div className="text-3xl font-bold text-gray-900">{selectedCustomer.projectCount}</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Active Jobs</div>
                        <div className="text-3xl font-bold text-green-600">{selectedCustomer.activeCount}</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Completed</div>
                        <div className="text-3xl font-bold text-blue-600">{selectedCustomer.completeCount}</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Last Activity</div>
                        <div className="text-lg font-bold text-gray-800">
                            {selectedCustomer.lastActivity ? selectedCustomer.lastActivity.toLocaleDateString() : 'Never'}
                        </div>
                    </div>
                </div>

                {/* Projects List */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Project History</h3>
                    </div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-xs uppercase text-gray-500 font-medium tracking-wider">
                                <th className="p-4 pl-6">Project ID</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Start Date</th>
                                <th className="p-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {selectedCustomer.projects.map(project => (
                                <tr
                                    key={project.project_id}
                                    onClick={() => navigate(`/projects/${project.project_id}`)}
                                    className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
                                >
                                    <td className="p-4 pl-6 font-mono text-sm text-blue-600 font-medium">{project.project_id}</td>
                                    <td className="p-4 font-medium text-gray-900">{project.name || '-'}</td>
                                    <td className="p-4"><StatusBadge status={project.status} /></td>
                                    <td className="p-4 text-gray-500 text-sm">{project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}</td>
                                    <td className="p-4 text-right pr-6">
                                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {selectedCustomer.projects.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500 italic">No projects found for this customer.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // --- LIST VIEW ---
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                    <p className="text-gray-500 mt-1">Directory of all clients and their project portfolios</p>
                </div>
                {/* Local Search Removed - Using Global */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCustomers.map(customer => (
                    <div
                        key={customer.contact_id}
                        onClick={() => handleCustomerClick(customer)}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-gray-50 text-gray-600 rounded-lg flex items-center justify-center text-lg font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                {customer.name.charAt(0)}
                            </div>
                            <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                                {customer.projectCount} Projects
                            </div>
                        </div>

                        <h3 className="font-bold text-gray-900 text-lg mb-1 truncate" title={customer.name}>{customer.name}</h3>
                        <p className="text-sm text-gray-500 truncate mb-4">{customer.email || 'No email'}</p>

                        <div className="pt-4 border-t border-gray-50 flex justify-between text-sm">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 uppercase font-bold">Active</span>
                                <span className="font-semibold text-green-600">{customer.activeCount}</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-xs text-gray-400 uppercase font-bold">Last Activity</span>
                                <span className="font-medium text-gray-700">
                                    {customer.lastActivity ? customer.lastActivity.toLocaleDateString() : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCustomers.length === 0 && (
                <div className="p-12 text-center text-gray-500">No customers found.</div>
            )}
        </div>
    );
};

export default CustomerDashboard;
