import { Calendar, RefreshCw, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

import { API_BASE_URL } from '../config';

const GanttScheduler = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [draggedJob, setDraggedJob] = useState(null);

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
        const url = `${API_BASE_URL}/api/scheduling/gantt`;
        console.log("Fetching from:", url);

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(d => {
                console.log("Data received:", d);
                setData(d);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch schedule", err);
                setError(err.message + " to " + url);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAutoSchedule = () => {
        fetch(`${API_BASE_URL}/api/scheduling/jobs/auto-schedule`, { method: 'POST' })
            .then(res => res.json())
            .then(() => fetchData());
    };

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
        return (duration / WINDOW_MS) * 100;
    };

    // Percent position for "Now" line
    const nowPos = ((new Date().getTime() - windowStart) / WINDOW_MS) * 100;

    // --- Drag and Drop Handlers ---
    const handleDragStart = (e, job) => {
        setDraggedJob(job);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleLaneDrop = (e, machineId) => {
        e.preventDefault();
        if (!draggedJob) return;

        // Calculate new start time based on drop position x
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = x / width;

        const newTimeMs = windowStart + (percentage * WINDOW_MS);
        const newDate = new Date(newTimeMs);

        // Round to nearest 15 mins for cleanliness
        const minutes = newDate.getMinutes();
        const roundedMinutes = Math.round(minutes / 15) * 15;
        newDate.setMinutes(roundedMinutes);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);

        const newStartTimeStr = newDate.toISOString();

        console.log(`Dropping job ${draggedJob.id} to ${machineId} at ${newStartTimeStr}`);

        // Call backend to reschedule
        fetch(`${API_BASE_URL}/api/scheduling/jobs/${draggedJob.id}/reschedule`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                new_start_time: newStartTimeStr,
                machine_id: machineId
            })
        })
            .then(res => {
                if (res.ok) {
                    fetchData();
                } else {
                    console.error("Failed to reschedule");
                }
                setDraggedJob(null);
            })
            .catch(err => {
                console.error("Error rescheduling:", err);
                setDraggedJob(null);
            });
    };

    return (
        <div className="p-6 h-screen flex flex-col bg-englabs-grey-100 overflow-hidden relative">
            {/* Debug overlay removed */}

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-englabs-grey-900 flex items-center gap-2">
                    <Calendar className="w-6 h-6" /> Agile Scheduler
                </h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleAutoSchedule}
                        className="flex items-center gap-2 px-3 py-1 bg-englabs-blue text-white rounded hover:bg-blue-600 transition"
                    >
                        <Zap className="w-4 h-4" /> Auto-Schedule
                    </button>
                    <button onClick={fetchData} className="p-1 hover:bg-gray-200 rounded">
                        <RefreshCw className="w-4 h-4 text-englabs-grey-600" />
                    </button>
                </div>
            </div>

            {/* Main Content Area with Conditional Rendering */}
            <div className="flex-1 bg-white rounded-lg shadow-englabs-card overflow-hidden flex flex-col border border-englabs-grey-200">
                {loading && (
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

                {!loading && !error && !data && (
                    <div className="flex-1 flex items-center justify-center text-englabs-grey-500">
                        No Data Received.
                    </div>
                )}

                {!loading && !error && data && (
                    <>
                        {/* Timeline Header */}
                        <div className="h-10 border-b border-englabs-grey-200 bg-englabs-grey-50 relative">
                            {[0, 6, 12, 18, 24, 30, 36].map(h => (
                                <div key={h} className="absolute top-0 bottom-0 border-l border-englabs-grey-200 text-xs pl-1 pt-1 text-gray-400"
                                    style={{ left: `${(h / 36) * 100}%` }}>+{h}h</div>
                            ))}
                            <div className="absolute top-0 bottom-0 border-l-2 border-red-500 z-10" style={{ left: `${nowPos}%` }} title="Current Time" />
                        </div>

                        {/* Machines Rows */}
                        <div className="flex-1 overflow-y-auto">
                            {data?.machines?.map(machine => (
                                <div key={machine.id} className="flex border-b border-englabs-grey-100 min-h-[80px]">
                                    <div className="w-48 p-4 border-r border-englabs-grey-200 bg-englabs-grey-50 flex flex-col justify-center">
                                        <div className="font-semibold text-sm text-englabs-grey-900">{machine.name}</div>
                                        <div className="text-xs text-englabs-grey-500">{machine.group}</div>
                                    </div>

                                    <div
                                        className="flex-1 relative bg-white transition-colors hover:bg-blue-50/30"
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleLaneDrop(e, machine.id)}
                                    >
                                        {[0, 6, 12, 18, 24, 30, 36].map(h => (
                                            <div key={h} className="absolute top-0 bottom-0 border-l border-englabs-grey-100" style={{ left: `${(h / 36) * 100}%` }} />
                                        ))}

                                        {data?.jobs?.filter(j => j.machine_id === machine.id).map(job => (
                                            <div
                                                key={job.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, job)}
                                                className="absolute top-2 bottom-2 rounded px-2 py-1 text-xs text-white shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing flex flex-col justify-center transition-all opacity-90 hover:opacity-100 hover:scale-[1.02]"
                                                style={{
                                                    left: `${getPosition(job.start_time)}%`,
                                                    width: `${getWidth(job.start_time, job.end_time)}%`,
                                                    backgroundColor: job.color || '#3b82f6'
                                                }}
                                                title={`${job.part_name} - ${job.status}`}
                                            >
                                                <div className="font-bold truncate">{job.part_name}</div>
                                                <div className="truncate opacity-80 text-[10px]">{job.status}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GanttScheduler;
