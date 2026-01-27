import { Calendar, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { API_BASE_URL } from '../config';

const AgileScheduler = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [draggedJob, setDraggedJob] = useState(null);
    const [processRows, setProcessRows] = useState([
        "MJF", "FDM", "3-AXIS", "5-AXIS", "SLA", "SLS", "SHEET METAL", "VACUUM CASTING", "INJECTION MOLDING", "Others"
    ]);

    // Calculate window reference (Today 00:00)
    const getWindowStart = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    };
    const windowStart = getWindowStart();
    const WINDOW_HOURS = 36;
    const WINDOW_MS = WINDOW_HOURS * 60 * 60 * 1000;

    const fetchData = () => {
        setLoading(true);
        setError(null);
        // Use Dispatch Board endpoint as requested
        // Fetch Metadata first or in parallel
        fetch(`${API_BASE_URL}/api/metadata/`)
            .then(res => res.json())
            .then(meta => {
                if (meta.processes && meta.processes.length > 0) {
                    setProcessRows(prev => [...new Set([...prev, ...meta.processes])]);
                }
            })
            .catch(e => console.error(e));

        const url = `${API_BASE_URL}/api/dispatch/board`;
        console.log("Fetching from:", url);

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(d => {
                console.log("Data received:", d);

                // Transform Production Jobs for Scheduler
                const schedulerJobs = (d.production || []).map(job => {
                    // Determine start time
                    const startMs = job.actual_start_time ? new Date(job.actual_start_time).getTime() :
                        (job.planned_start_time ? new Date(job.planned_start_time).getTime() : new Date().getTime());

                    // Determine duration (ms)
                    const durationMs = (job.estimated_runtime_seconds || 3600) * 1000;

                    return {
                        id: job.id,
                        part_name: job.part_name,
                        status: job.status,
                        process: job.manufacturing_process || "Others",
                        material: job.material || "N/A", // Ensure mapping
                        start_time: new Date(startMs).toISOString(),
                        end_time: new Date(startMs + durationMs).toISOString(),
                        color: getStatusColor(job.status),
                        project_id: job.project_id || "N/A",
                        client_id: job.client_id || ((job.order && job.order.customer_id) ? job.order.customer_id : "N/A")
                    };
                });

                setData({
                    rows: processRows.map(p => ({ id: p, name: p })), // Rows are processes now
                    jobs: schedulerJobs
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch schedule", err);
                setError(err.message + " to " + url);
                setLoading(false);
            });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'RUNNING': return '#3b82f6'; // Blue
            case 'COMPLETED': return '#10b981'; // Green
            case 'QUEUED': return '#f59e0b'; // Amber
            default: return '#6b7280'; // Gray
        }
    };

    useEffect(() => {
        fetchData();
        // Polling for "automatic" updates as requested
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    // --- Helpers for Visualization ---
    const getPosition = (dateStr) => {
        if (!dateStr) return 0;
        const time = new Date(dateStr).getTime();
        const diff = time - windowStart;
        return (diff / WINDOW_MS) * 100;
    };

    const getWidth = (startStr, endStr) => {
        if (!startStr || !endStr) return 0;
        const start = new Date(startStr).getTime();
        const end = new Date(endStr).getTime();
        const duration = end - start;
        return Math.max((duration / WINDOW_MS) * 100, 1); // Min width 1%
    };

    // Percent position for "Now" line
    const nowPos = ((new Date().getTime() - windowStart) / WINDOW_MS) * 100;

    // --- Drag and Drop Handlers (Visual only for now, logic would require updating Dispatch Job params) ---
    const handleDragStart = (e, job) => {
        setDraggedJob(job);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleLaneDrop = (e, processName) => {
        e.preventDefault();
        // Here we would presumably update the manufacturing_process of the part?
        // For now, this is a visualized scheduler as requested.
        console.log(`Dropped ${draggedJob?.part_name} on ${processName}`);
        setDraggedJob(null);
    };

    return (
        <div className="p-6 h-screen flex flex-col bg-englabs-grey-100 overflow-hidden relative">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-englabs-grey-900 flex items-center gap-2">
                    <Calendar className="w-6 h-6" /> Agile Scheduler
                </h1>
                <div className="flex items-center space-x-4">
                    <button onClick={fetchData} className="p-1 hover:bg-gray-200 rounded">
                        <RefreshCw className="w-4 h-4 text-englabs-grey-600" />
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-lg shadow-englabs-card overflow-hidden flex flex-col border border-englabs-grey-200">
                {loading && !data && (
                    <div className="flex-1 flex items-center justify-center text-englabs-grey-500">
                        Loading...
                    </div>
                )}

                {error && (
                    <div className="flex-1 flex items-center justify-center text-red-500 bg-red-50 p-8">
                        <div>
                            <h3 className="font-bold">Connection Error</h3>
                            <p>{error}</p>
                            <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-100 rounded">Retry</button>
                        </div>
                    </div>
                )}

                {!loading && !error && data && (
                    <>
                        {/* Timeline Header */}
                        <div className="h-10 border-b border-englabs-grey-200 bg-englabs-grey-50 relative flex">
                            {/* First Column Header */}
                            <div className="w-48 border-r border-englabs-grey-200 p-2 font-bold text-xs text-slate-700 uppercase tracking-wide flex items-center bg-gray-50 z-20 shrink-0">
                                Manufacturing Processes
                            </div>
                            {/* Second Column Header: Client */}
                            <div className="w-32 border-r border-englabs-grey-200 p-2 font-bold text-xs text-slate-700 uppercase tracking-wide flex items-center bg-gray-50 z-20 shrink-0">
                                Client
                            </div>
                            {/* Third Column Header: Project ID */}
                            <div className="w-32 border-r border-englabs-grey-200 p-2 font-bold text-xs text-slate-700 uppercase tracking-wide flex items-center bg-gray-50 z-20 shrink-0">
                                Project ID
                            </div>
                            {/* Fourth Column Header: Job Details */}
                            <div className="w-48 border-r border-englabs-grey-200 p-2 font-bold text-xs text-slate-700 uppercase tracking-wide flex items-center bg-gray-50 z-20 shrink-0">
                                Job Details
                            </div>

                            <div className="flex-1 relative min-w-[500px]">
                                {[0, 6, 12, 18, 24, 30, 36].map(h => (
                                    <div key={h} className="absolute top-0 bottom-0 border-l border-englabs-grey-200 text-xs pl-1 pt-1 text-gray-400"
                                        style={{ left: `${(h / 36) * 100}%` }}>+{h}h</div>
                                ))}
                                <div className="absolute top-0 bottom-0 border-l-2 border-red-500 z-10" style={{ left: `${nowPos}%` }} title="Current Time" />
                            </div>
                        </div>

                        {/* Rows */}
                        <div className="flex-1 overflow-y-auto">
                            {data.rows.map(row => {
                                // Filter jobs for this row
                                const rowJobs = data.jobs.filter(j => {
                                    if (row.id === "Others") {
                                        return !processRows.filter(pr => pr !== 'Others').includes(j.process) || j.process === "Others";
                                    }
                                    return j.process === row.id;
                                });

                                return (
                                    <div key={row.id} className="flex border-b border-englabs-grey-100 min-h-[100px]">
                                        {/* Column 1: Process */}
                                        <div className="w-48 p-4 border-r border-englabs-grey-200 bg-englabs-grey-50 flex flex-col justify-center shrink-0">
                                            <div className="font-semibold text-sm text-englabs-grey-900">{row.name}</div>
                                            <div className="text-xs text-englabs-grey-500">Processing Line</div>
                                            <div className="mt-2 text-xs font-medium text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full w-fit">{rowJobs.length} Jobs</div>
                                        </div>

                                        {/* Column 2: Client */}
                                        <div className="w-32 p-2 border-r border-englabs-grey-200 bg-white overflow-y-auto shrink-0 max-h-[200px]">
                                            {rowJobs.length > 0 ? (
                                                <div className="space-y-2">
                                                    {Array.from(new Set(rowJobs.map(j => j.client_id))).map(cid => (
                                                        <div key={cid} className="text-xs p-1.5 bg-blue-50 border border-blue-100 rounded text-center text-blue-700 font-semibold truncate" title={cid}>
                                                            {cid}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-300 italic text-center mt-4">-</div>
                                            )}
                                        </div>

                                        {/* Column 3: Project IDs */}
                                        <div className="w-32 p-2 border-r border-englabs-grey-200 bg-white overflow-y-auto shrink-0 max-h-[200px]">
                                            {rowJobs.length > 0 ? (
                                                <div className="space-y-2">
                                                    {Array.from(new Set(rowJobs.map(j => j.project_id))).map(pid => (
                                                        <div key={pid} className="text-xs p-1.5 bg-indigo-50 border border-indigo-100 rounded text-center text-indigo-700 font-semibold">
                                                            {pid}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-300 italic text-center mt-4">-</div>
                                            )}
                                        </div>

                                        {/* Column 4: Job Details List */}
                                        <div className="w-48 p-2 border-r border-englabs-grey-200 bg-white overflow-y-auto shrink-0 max-h-[200px]">
                                            {rowJobs.length > 0 ? (
                                                <div className="space-y-2">
                                                    {rowJobs.map(job => (
                                                        <div key={job.id} className="text-xs p-2 bg-slate-50 border border-slate-100 rounded hover:bg-slate-100">
                                                            <div className="font-bold text-slate-800 truncate" title={job.part_name}>{job.part_name}</div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100 font-medium">
                                                                    {job.material || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-300 italic text-center mt-4">No jobs</div>
                                            )}
                                        </div>

                                        {/* Column 5: Timeline */}
                                        <div
                                            className="flex-1 relative bg-white transition-colors hover:bg-blue-50/10 min-w-[600px]"
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleLaneDrop(e, row.id)}
                                        >
                                            {[0, 6, 12, 18, 24, 30, 36].map(h => (
                                                <div key={h} className="absolute top-0 bottom-0 border-l border-englabs-grey-100" style={{ left: `${(h / 36) * 100}%` }} />
                                            ))}

                                            {rowJobs.map(job => (
                                                <div
                                                    key={job.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, job)}
                                                    className="absolute top-3 bottom-3 rounded px-2 py-1 text-xs text-white shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing flex flex-col justify-center transition-all opacity-90 hover:opacity-100 group"
                                                    style={{
                                                        left: `${getPosition(job.start_time)}%`,
                                                        width: `${getWidth(job.start_time, job.end_time)}%`,
                                                        backgroundColor: job.color
                                                    }}
                                                    title={`${job.part_name} - ${job.material}`}
                                                >
                                                    <div className="font-bold truncate">{job.part_name}</div>
                                                    <div className="truncate opacity-80 text-[10px] hidden group-hover:block">{job.material}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AgileScheduler;
