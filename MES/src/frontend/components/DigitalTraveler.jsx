import { AlertOctagon, Box, Camera, CheckSquare, ChevronRight, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

const DigitalTraveler = () => {
    // Hardcoded for demo - effectively "logged in" as Operator for CNC-01
    const MACHINE_ID = "CNC-001"; // Should match seed data

    const [activeJob, setActiveJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scanMode, setScanMode] = useState(false);

    const fetchActiveJob = () => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/shop-floor/operator/${MACHINE_ID}/active-job`)
            .then(res => res.json())
            .then(data => {
                setActiveJob(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch active job", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchActiveJob();
        // Poll every 10s
        const interval = setInterval(fetchActiveJob, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleStatusUpdate = (newStatus) => {
        if (!activeJob || !activeJob.job_id) return;

        fetch(`${API_BASE_URL}/api/shop-floor/jobs/${activeJob.job_id}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        })
            .then(res => res.json())
            .then(() => fetchActiveJob());
    };

    // Simulate QR Scan
    const handleScan = () => {
        setScanMode(true);
        setTimeout(() => {
            setScanMode(false);
            fetchActiveJob(); // "Found" job
            alert("QR Code Scanned: Linked to Machine CNC-001");
        }, 1500);
    };

    if (loading && !activeJob) return <div className="min-h-screen bg-englabs-grey-900 text-white p-8 text-center pt-24">Loading Station...</div>;

    const hasJob = activeJob && activeJob.status !== "NO_JOB";

    return (
        <div className="min-h-screen bg-englabs-grey-900 text-white pb-20 font-sans">
            {/* Mobile Header */}
            <div className="bg-englabs-grey-900 border-b border-englabs-grey-700 p-4 sticky top-0 z-20 flex justify-between items-center backdrop-blur-md bg-opacity-90">
                <div>
                    <h2 className="text-xl font-bold">Station: {MACHINE_ID}</h2>
                    <p className="text-englabs-grey-500 text-sm">Operator: Admin</p>
                </div>
                <button
                    onClick={handleScan}
                    className={`p-3 rounded-full transition-all ${scanMode ? 'bg-green-500 animate-pulse' : 'bg-englabs-blue/20 text-englabs-blue'}`}
                >
                    <Camera className="w-6 h-6" />
                </button>
            </div>

            {/* Active Job Card */}
            <div className="p-4">
                {hasJob ? (
                    <div className="bg-englabs-grey-800 rounded-xl p-6 shadow-lg border border-englabs-grey-700 animate-slide-in">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${activeJob.status === 'RUNNING' ? 'bg-englabs-green text-white' : 'bg-yellow-500 text-black'
                                    }`}>
                                    {activeJob.status}
                                </span>
                                <h1 className="text-3xl font-bold mt-2 truncate w-64">{activeJob.job_id}</h1>
                                <p className="text-xl text-englabs-grey-300">{activeJob.part_name}</p>
                            </div>
                            <Box className="w-12 h-12 text-englabs-grey-600" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-englabs-grey-900/50 p-3 rounded">
                                <span className="block text-xs text-englabs-grey-500">Material</span>
                                <span className="font-semibold">{activeJob.material}</span>
                            </div>
                            <div className="bg-englabs-grey-900/50 p-3 rounded">
                                <span className="block text-xs text-englabs-grey-500">Order ID</span>
                                <span className="font-semibold text-englabs-green text-xs">{activeJob.order_id}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        {activeJob.status === "QUEUED" && (
                            <button
                                onClick={() => handleStatusUpdate('RUNNING')}
                                className="w-full bg-englabs-blue hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                            >
                                <span className="flex items-center gap-3">
                                    <Play className="fill-current w-5 h-5" /> START JOB
                                </span>
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}

                        {activeJob.status === "RUNNING" && (
                            <button
                                onClick={() => handleStatusUpdate('COMPLETED')}
                                className="w-full bg-englabs-green hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between transition-all active:scale-95 shadow-lg shadow-green-900/20"
                            >
                                <span className="flex items-center gap-3">
                                    <CheckSquare className="w-5 h-5" /> COMPLETE JOB
                                </span>
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}

                    </div>
                ) : (
                    <div className="bg-englabs-grey-800 rounded-xl p-12 text-center border border-englabs-grey-700 opacity-60">
                        <Box className="w-16 h-16 text-englabs-grey-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-englabs-grey-400">No Active Jobs</h3>
                        <p className="text-englabs-grey-500 mt-2">Station is IDLE</p>
                        <button onClick={fetchActiveJob} className="mt-6 flex items-center justify-center gap-2 mx-auto text-englabs-blue hover:text-white transition">
                            <RotateCcw className="w-4 h-4" /> Refresh
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Floating Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-englabs-grey-800 border-t border-englabs-grey-700 p-4 flex justify-around backdrop-blur-md bg-opacity-95">
                <button className="flex flex-col items-center text-englabs-blue">
                    <Box className="w-6 h-6" />
                    <span className="text-xs mt-1">Jobs</span>
                </button>
                <button className="flex flex-col items-center text-englabs-grey-400">
                    <AlertOctagon className="w-6 h-6" />
                    <span className="text-xs mt-1">Issues</span>
                </button>
                <button className="flex flex-col items-center text-englabs-grey-400">
                    <CheckSquare className="w-6 h-6" />
                    <span className="text-xs mt-1">QC</span>
                </button>
            </div>
        </div>
    );
};

export default DigitalTraveler;
