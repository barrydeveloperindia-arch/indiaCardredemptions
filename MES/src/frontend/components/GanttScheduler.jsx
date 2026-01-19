import React, { useEffect, useState } from 'react';
import { Calendar, User, Clock, AlertCircle, RefreshCw, Zap } from 'lucide-react';

const GanttScheduler = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [draggedJob, setDraggedJob] = useState(null);

    const fetchData = () => {
        setLoading(true);
        fetch('http://localhost:8000/api/scheduling/gantt')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch schedule", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAutoSchedule = () => {
        fetch('http://localhost:8000/api/scheduling/jobs/auto-schedule', { method: 'POST' })
            .then(res => res.json())
            .then(() => fetchData());
    };

    const handleDrop = (machineId, newStartTimeStr) => {
        if (!draggedJob) return;

        // Call backend to reschedule
        fetch(`http://localhost:8000/api/scheduling/jobs/${draggedJob.id}/reschedule`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                new_start_time: newStartTimeStr,
                machine_id: machineId
            })
        })
            .then(res => {
                if (res.ok) fetchData();
                setDraggedJob(null);
            });
    };

    if (loading && !data) return <div className="p-8 text-center text-englabs-grey-500">Loading Schedule...</div>;

    // Time scaling
    const startTime = data ? new Date(data.timeline_start).getTime() : Date.now();
    const endTime = data ? new Date(data.timeline_end).getTime() : Date.now();
    const totalDuration = endTime - startTime || 1;

    const getPosition = (dateStr) => {
        const time = new Date(dateStr).getTime();
        return Math.max(0, ((time - startTime) / totalDuration) * 100);
    };

    const getWidth = (startStr, endStr) => {
        const start = new Date(startStr).getTime();
        const end = new Date(endStr).getTime();
        return ((end - start) / totalDuration) * 100;
    };

    const nowPos = getPosition(new Date().toISOString());

    // Drag Helpers
    const handleDragStart = (e, job) => {
        setDraggedJob(job);
        e.dataTransfer.setData("jobId", job.id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Allow drop
    };

    const handleLaneDrop = (e, machineId) => {
        e.preventDefault();
        // Calculate new time based on X position
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;

        const newTimeMs = startTime + (percentage * totalDuration);
        const newDate = new Date(newTimeMs).toISOString();

        handleDrop(machineId, newDate);
    };

    return (
        <div className="p-6 h-screen flex flex-col bg-englabs-grey-100 overflow-hidden">
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

            <div className="flex-1 bg-white rounded-lg shadow-englabs-card overflow-hidden flex flex-col border border-englabs-grey-200">
                {/* Timeline Header */}
                <div className="h-10 border-b border-englabs-grey-200 bg-englabs-grey-50 relative">
                    {[0, 6, 12, 18, 24].map(h => (
                        <div key={h} className="absolute top-0 bottom-0 border-l border-englabs-grey-200 text-xs pl-1 pt-1 text-gray-400"
                            style={{ left: `${(h / 36) * 100}%` }}>+{h}h</div>
                    ))}
                    <div className="absolute top-0 bottom-0 border-l-2 border-red-500 z-10" style={{ left: `${nowPos}%` }} />
                </div>

                {/* Machines Rows */}
                <div className="flex-1 overflow-y-auto">
                    {data?.machines.map(machine => (
                        <div key={machine.id} className="flex border-b border-englabs-grey-100 min-h-[80px]">
                            {/* Header */}
                            <div className="w-48 p-4 border-r border-englabs-grey-200 bg-englabs-grey-50 flex flex-col justify-center">
                                <div className="font-semibold text-sm text-englabs-grey-900">{machine.name}</div>
                                <div className="text-xs text-englabs-grey-500">{machine.group}</div>
                            </div>

                            {/* Drop Lane */}
                            <div
                                className="flex-1 relative bg-white transition-colors hover:bg-blue-50/30"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleLaneDrop(e, machine.id)}
                            >
                                {/* Grid Lines */}
                                {[0, 6, 12, 18, 24].map(h => (
                                    <div key={h} className="absolute top-0 bottom-0 border-l border-englabs-grey-100" style={{ left: `${(h / 36) * 100}%` }} />
                                ))}

                                {/* Jobs */}
                                {data.jobs.filter(j => j.machine_id === machine.id).map(job => (
                                    <div
                                        key={job.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, job)}
                                        className="absolute top-2 bottom-2 rounded px-2 py-1 text-xs text-white shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing flex flex-col justify-center transition-all opacity-90 hover:opacity-100 hover:scale-[1.02]"
                                        style={{
                                            left: `${getPosition(job.start_time)}%`,
                                            width: `${getWidth(job.start_time, job.end_time)}%`,
                                            backgroundColor: job.color
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
            </div>
        </div>
    );
};

export default GanttScheduler;
