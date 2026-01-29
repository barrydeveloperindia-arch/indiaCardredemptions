import { Mail, Paperclip } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearch } from '../context/SearchContext';

const Communications = () => {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL'); // ALL, PO, Enquiry, Payment

    // Use Global Search Context
    const { searchTerm } = useSearch();

    // Reader State
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [emailBody, setEmailBody] = useState('');
    const [bodyLoading, setBodyLoading] = useState(false);

    const openEmail = async (email) => {
        setSelectedEmail(email);
        setEmailBody(''); // Clear previous
        setBodyLoading(true);

        try {
            // Updated to fetch actual body from new endpoint
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/communications/emails/${email.id}/body`);
            if (res.ok) {
                const data = await res.json();
                setEmailBody(data.uniqueBody || data.content || email.body_preview);
            } else {
                setEmailBody(email.body_preview + '<br/><br/><i class="text-red-500">Failed to load full content from Outlook.</i>');
            }
        } catch (e) {
            console.error(e);
            setEmailBody(email.body_preview + '<br/><br/><i class="text-red-500">Error loading content.</i>');
        } finally {
            setBodyLoading(false);
        }
    };

    const fetchEmails = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            // Updated to /api/communications/emails
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/communications/emails?limit=2000`);
            if (!response.ok) throw new Error('Failed to load emails');
            const data = await response.json();
            setEmails(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails(true);
        const interval = setInterval(() => fetchEmails(false), 3000); // Auto-refresh every 3s
        return () => clearInterval(interval);
    }, []);

    const getIntentColor = (intent) => {
        switch (intent) {
            case 'PO_Received': return 'bg-green-100 text-green-800 border-green-200';
            case 'Enquiry': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Payment': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Quote_Sent': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredEmails = emails.filter(e => {
        // 1. Filter by Intent
        const matchesIntent = (filter === 'ALL') ? true : (filter === 'PO' ? e.intent === 'PO_Received' : e.intent === filter);

        // 2. Filter by Search Term (Global)
        const search = searchTerm.toLowerCase();
        const matchesSearch = !search ||
            (e.subject && e.subject.toLowerCase().includes(search)) ||
            (e.sender_name && e.sender_name.toLowerCase().includes(search)) ||
            (e.project_id && e.project_id.toLowerCase().includes(search)) ||
            (e.body_preview && e.body_preview.toLowerCase().includes(search));

        return matchesIntent && matchesSearch;
    });

    return (
        <div>
            <header className="mb-8 flex justify-between items-center border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl font-light text-gray-900 tracking-tight">Communications Center</h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Track all customer interactions and scanned emails</p>
                </div>
            </header>

            {/* Controls */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    {/* Search Input Removed - Now using Global Header Search */}

                    <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border shadow-sm">
                        {['ALL', 'PO', 'Enquiry', 'Payment'].map(f => {
                            // Calculate Count
                            let count = 0;
                            if (f === 'ALL') count = emails.length;
                            else if (f === 'PO') count = emails.filter(e => e.intent === 'PO_Received').length;
                            else count = emails.filter(e => e.intent === f).length;

                            return (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${filter === f ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <span>{f === 'ALL' ? 'All' : f}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* Email List */}
            <div className="space-y-4">
                {loading && <div className="text-center py-10 text-gray-500">Loading communications...</div>}

                {!loading && filteredEmails.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No emails found</h3>
                        <p className="text-gray-500">
                            {searchTerm ? `No matches for "${searchTerm}"` : "Run the Intelligence Scanner to populate this list."}
                        </p>
                    </div>
                )}

                {filteredEmails.map((email) => (
                    <div
                        key={email.id}
                        onClick={() => openEmail(email)}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 group cursor-pointer relative overflow-hidden"
                    >
                        {/* Status Stripe */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${getIntentColor(email.intent).replace('bg-', 'bg-').replace('text-', 'bg-').split(' ')[0]}`}></div>

                        <div className="flex justify-between items-start pl-3">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-semibold text-gray-900">{email.subject || '(No Subject)'}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getIntentColor(email.intent)}`}>
                                        {email.intent || 'Unknown'}
                                    </span>
                                    {email.project_id && (
                                        <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                                            {email.project_id}
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                    <span className="font-medium text-gray-800">{email.sender_name}</span>
                                    <span className="text-gray-400">&lt;{email.sender_email}&gt;</span>
                                    <span>•</span>
                                    <span>{new Date(email.received_at).toLocaleString()}</span>
                                </div>
                            </div>

                            {email.has_attachments && (
                                <div className="text-gray-400" title="Has Attachments">
                                    <Paperclip className="w-4 h-4" />
                                </div>
                            )}
                        </div>

                        {/* Preview */}
                        <div className="mt-3 pl-3 text-sm text-gray-500 line-clamp-2 border-l-2 border-gray-100 pl-3 italic">
                            {email.body_preview}
                        </div>
                    </div>
                ))}
            </div>

            {/* Email Reader Modal */}
            {selectedEmail && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-start justify-center pt-10 p-4" onClick={() => setSelectedEmail(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                            <div className="flex-1 mr-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedEmail.subject || '(No Subject)'}</h2>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                            {selectedEmail.sender_name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{selectedEmail.sender_name}</div>
                                            <div className="text-gray-500">{selectedEmail.sender_email}</div>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-gray-500">
                                        <div>{new Date(selectedEmail.received_at).toLocaleDateString()}</div>
                                        <div>{new Date(selectedEmail.received_at).toLocaleTimeString()}</div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedEmail(null)} className="text-gray-400 hover:text-gray-600 p-1">
                                <span className="text-xl">×</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 bg-white selection:bg-blue-100">
                            {bodyLoading ? (
                                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="text-sm text-gray-500">Fetching email content...</span>
                                </div>
                            ) : (
                                <div className="prose prose-sm max-w-none prose-blue">
                                    <div dangerouslySetInnerHTML={{ __html: emailBody || '<p class="text-gray-400 italic">No content available.</p>' }} />
                                </div>
                            )}
                        </div>

                        {/* Modal Footer (Actions) */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            {selectedEmail.has_attachments && (
                                <div className="flex items-center gap-2 mr-auto text-sm text-gray-600 bg-white px-3 py-1.5 rounded border border-gray-200 shadow-sm">
                                    <Paperclip size={14} />
                                    <span>Attachments found (View in Outlook)</span>
                                </div>
                            )}
                            <button onClick={() => setSelectedEmail(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                                Close
                            </button>
                            <button
                                onClick={() => window.open(`https://outlook.office.com/mail/deeplink/compose?subject=${encodeURIComponent("Re: " + selectedEmail.subject)}&to=${selectedEmail.sender_email}`, '_blank')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Reply in Outlook
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Communications;
