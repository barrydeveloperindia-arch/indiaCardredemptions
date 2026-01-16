import React, { useState } from 'react';

// Mock Data for Prototype
const MOCK_QUEUE = [
    { id: 'JOB-101', part: 'Tesla Bracket v9', machine: 'CNC-HighPerf-05', status: 'QUEUED', eta: '2h 30m' },
    { id: 'JOB-102', part: 'Prototype Gear', machine: '3D-Printer-02', status: 'PRINTING', eta: '45m' },
];

export default function DispatchBoard() {
    const [queue] = useState(MOCK_QUEUE);

    const handleManualOverride = () => {
        alert("Manual Override: Drag and Drop functionality would activate here.");
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header with Glass Effect */}
            <header className="mb-6 flex justify-between items-end pb-4 border-b border-white/20">
                <div>
                    <h1 className="text-4xl font-extralight text-slate-800 tracking-tight">
                        Dispatch Command
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm font-medium tracking-wide uppercase">
                        Intelligent Production Allocation System
                    </p>
                </div>
                <button
                    onClick={handleManualOverride}
                    className="glass-card px-6 py-2.5 rounded-xl text-slate-700 hover:text-blue-600 font-semibold tracking-wide flex items-center group active:scale-95 transition-transform"
                >
                    <span className="mr-2 text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
                    New Order
                </button>
            </header>

            {/* Mission Control Kanban Board */}
            <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">

                {/* Column 1: Planning */}
                <div className="flex flex-col glass-panel rounded-2xl overflow-hidden h-full">
                    {/* Column Header */}
                    <div className="p-4 border-b border-white/40 flex justify-between items-center z-10 bg-white/10 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                            <h2 className="font-bold text-slate-700 text-xs uppercase tracking-widest">Planning</h2>
                        </div>
                        <span className="bg-white/50 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold font-mono border border-white/60">1</span>
                    </div>

                    {/* Drop Zone */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                        {/* Draggable Card */}
                        <div className="glass-card p-4 rounded-xl cursor-grab active:cursor-grabbing group relative animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <div className="absolute top-3 right-3 text-slate-300 group-hover:text-blue-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                            </div>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="bg-blue-50/50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-blue-100/50">Draft</span>
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg tracking-tight">ORD-2091</h3>
                            <p className="text-xs text-slate-500 font-medium mb-4">Aero Strut x4 • High Priority</p>

                            <div className="pt-3 border-t border-slate-100/50 flex justify-between items-center">
                                <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                    <span>AI Analysis</span>
                                </div>
                                <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-2/3 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Production Queue */}
                <div className="flex flex-col glass-panel rounded-2xl overflow-hidden h-full">
                    <div className="p-4 border-b border-white/40 flex justify-between items-center z-10 bg-white/10 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            <h2 className="font-bold text-slate-700 text-xs uppercase tracking-widest">Production Queue</h2>
                        </div>
                        <span className="bg-white/50 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold font-mono border border-white/60">{queue.length}</span>
                    </div>

                    <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                        {queue.map((job, idx) => (
                            <div key={job.id} className="glass-card p-4 rounded-xl cursor-grab active:cursor-grabbing group animate-fade-in" style={{ animationDelay: `${0.1 + (idx * 0.05)}s` }}>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-800 tracking-tight">{job.id}</h3>
                                    <span className="text-[10px] font-mono text-slate-500 bg-slate-50/80 px-1.5 py-0.5 rounded border border-slate-100">{job.machine}</span>
                                </div>
                                <p className="text-sm text-slate-600 font-medium mb-4">{job.part}</p>

                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-semibold flex items-center bg-white/40 px-2 py-1 rounded">
                                        ⏱ {job.eta}
                                    </span>
                                    <span className={`font-bold px-2 py-1 rounded ${job.status === 'PRINTING' ? 'text-emerald-600 bg-emerald-50/50 border border-emerald-100/50' : 'text-slate-400 bg-slate-100/50'}`}>
                                        {job.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 3: Quality Control */}
                <div className="flex flex-col glass-panel rounded-2xl overflow-hidden h-full">
                    <div className="p-4 border-b border-white/40 flex justify-between items-center z-10 bg-white/10 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <h2 className="font-bold text-slate-700 text-xs uppercase tracking-widest">Ready for QC</h2>
                        </div>
                        <span className="bg-white/50 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold font-mono border border-white/60">0</span>
                    </div>

                    <div className="flex-1 p-3 overflow-y-auto flex items-center justify-center">
                        <div className="text-slate-400 text-sm font-medium italic border-2 border-dashed border-slate-300/50 m-3 rounded-xl w-full h-32 flex items-center justify-center bg-slate-50/30">
                            Drop items here to start QC
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
