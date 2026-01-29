import { CheckCircle, Loader, Server } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

const SystemStatus = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/analysis/admin/thumbnail-status`);
            if (res.ok) {
                const data = await res.json();
                setStatus(data);
            }
        } catch (err) {
            console.error("Status fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const isComplete = status?.progress >= 100;

    return (
        <div className="flex items-center space-x-4 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm ml-4">
            <div className="flex items-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                <Server size={14} className="mr-2 text-englabs-primary" />
                System Health
            </div>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            {/* Content */}
            {(loading || !status) ? (
                <div className="text-xs text-gray-400 flex items-center">
                    <Loader size={12} className="animate-spin mr-2" />
                    Connecting...
                </div>
            ) : (
                <div className="flex flex-col min-w-[200px]">
                    <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-gray-600 font-medium">Preview Generation</span>
                        <span className="text-gray-900 font-bold">{status.done} / {status.total}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}
                            style={{ width: `${status.progress}%` }}
                        ></div>
                    </div>
                    {!isComplete && (
                        <span className="text-[10px] text-blue-600 mt-1 flex items-center">
                            <Loader size={10} className="animate-spin mr-1" /> Processing... {status.progress}%
                        </span>
                    )}
                    {isComplete && (
                        <span className="text-[10px] text-green-600 mt-1 flex items-center">
                            <CheckCircle size={10} className="mr-1" /> All Previews Generated
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default SystemStatus;
