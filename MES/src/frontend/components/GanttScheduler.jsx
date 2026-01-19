import React, { useEffect, useState } from 'react';
import { Calendar, User, Clock, AlertCircle } from 'lucide-react';

const GanttScheduler = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/scheduling/gantt')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-8 text-center text-englabs-grey-500">Loading Schedule...</div>;

    // Simple time scaling logic
    const startTime = new Date(data.timeline_start).getTime();
    const endTime = new Date(data.timeline_end).getTime();
    const totalDuration = endTime - startTime;

    const getPosition = (dateStr) => {
        const time = new Date(dateStr).getTime();
        return ((time - startTime) / totalDuration) * 100;
    };

    const getWidth = (startStr, endStr) => {
        const start = new Date(startStr).getTime();
        const end = new Date(endStr).getTime();
        return ((end - start) / totalDuration) * 100;
    };

    const nowPos = getPosition(new Date().toISOString());

    return (
        <div className="p-6 h-screen flex flex-col bg-englabs-grey-100 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-englabs-grey-900">Agile Scheduler</h1>
                <div className="flex items-center space-x-4">
                    <span className="flex items-center text-sm text-englabs-grey-700">
                        <span className="w-3 h-3 bg-englabs-blue rounded-full mr-2"></span> Running
                    </span>
                    <span className="flex items-center text-sm text-englabs-grey-700">
                        <span className="w-3 h-3 bg-englabs-green rounded-full mr-2"></span> Completed
                    </span>
                    <span className="flex items-center text-sm text-englabs-grey-700">
                        <span className="w-3 h-3 bg-englabs-grey-500 rounded-full mr-2"></span> Planned
                    </span>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-lg shadow-englabs-card overflow-hidden flex flex-col border border-englabs-grey-200">

                {/* Timeline Header */}
                <div className="h-10 border-b border-englabs-grey-200 bg-englabs-grey-50 relative">
                    {/* Simple markers every 6 hours */}
                    {[0, 6, 12, 18, 24, 30, 36].map(hour => (
                        <div
                            key={hour}
                            className="absolute top-0 bottom-0 border-l border-englabs-grey-200 text-xs text-englabs-grey-500 pl-1 pt-1"
                            style={{ left: `${(hour / 36) * 100}%` }}
                        >
                            +{hour}h
                        </div>
                    ))}
                    {/* Current Time Marker */}
                    <div
                        className="absolute top-0 bottom-0 border-l-2 border-red-500 z-10"
                        style={{ left: `${nowPos}%` }}
                    >
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                </div>

                {/* Machines Rows */}
                <div className="flex-1 overflow-y-auto">
                    {data.machines.map(machine => (
                        <div key={machine.id} className="flex border-b border-englabs-grey-100 min-h-[80px]">
                            {/* Machine Header */}
                            <div className="w-48 p-4 border-r border-englabs-grey-200 bg-englabs-grey-50 flex flex-col justify-center">
                                <div className="font-semibold text-sm text-englabs-grey-900">{machine.name}</div>
                                <div className="text-xs text-englabs-grey-500">{machine.group}</div>
                            </div>

                            {/* Timeline Lane */}
                            <div className="flex-1 relative bg-white">
                                {/* Grid Lines */}
                                {[0, 6, 12, 18, 24, 30, 36].map(hour => (
                                    <div
                                        key={hour}
                                        className="absolute top-0 bottom-0 border-l border-englabs-grey-100"
                                        style={{ left: `${(hour / 36) * 100}%` }}
                                    />
                                ))}

                                {/* Current Time Line Extension */}
                                <div
                                    className="absolute top-0 bottom-0 border-l border-red-200 pointer-events-none"
                                    style={{ left: `${nowPos}%` }}
                                />

                                {/* Jobs */}
                                {data.jobs.filter(j => j.machine_id === machine.id).map(job => (
                                    <div
                                        key={job.id}
                                        className="absolute top-2 bottom-2 rounded px-2 py-1 text-xs text-white overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-center"
                                        style={{
                                            left: `${getPosition(job.start_time)}%`,
                                            width: `${getWidth(job.start_time, job.end_time)}%`,
                                            backgroundColor: job.color
                                        }}
                                        title={`${job.part_name} (${job.status})`}
                                    >
                                        <div className="font-bold truncate">{job.part_name}</div>
                                        <div className="truncate opacity-80 text-[10px]">{job.order_id}</div>
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
