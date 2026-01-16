import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ShopFloor() {
    const { token } = useAuth();
    const [machines, setMachines] = useState([
        { id: "CNC-HighPerf-05", status: "RUNNING", temp: "42.5", type: "5-Axis Mill" },
        { id: "CNC-001", status: "IDLE", temp: "22.0", type: "Standard Mill" },
        { id: "3D-Printer-02", status: "RUNNING", temp: "210.0", type: "FDM Printer" },
    ]);

    const sendCommand = async (machineId, cmd) => {
        try {
            console.log(`Sending ${cmd} to ${machineId}`);
            const res = await fetch(`http://127.0.0.1:8000/machines/${machineId}/control`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ command: cmd })
            });
            if (res.ok) {
                alert(`Command ${cmd} Sent!`);
            } else {
                alert("Control Failed");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <header className="mb-8 flex justify-between items-center border-b border-englabs-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-englabs-text-primary tracking-tight">Shop Floor</h1>
                    <p className="text-englabs-text-secondary mt-1 text-sm">Real-Time Telemetry & Control</p>
                </div>
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider bg-green-50 text-englabs-success px-4 py-1.5 rounded-full border border-green-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-englabs-success animate-pulse"></span>
                    <span>OPC-UA Active</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {machines.map(m => (
                    <div key={m.id} className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col h-[340px] group transition-all hover:shadow-xl hover:-translate-y-1">
                        {/* Status Bar Top */}
                        <div className={`h-2 w-full ${m.status === 'RUNNING' ? 'bg-englabs-success' : 'bg-slate-300'}`}></div>

                        <div className="p-6 flex-1 flex flex-col justify-between">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 leading-none">{m.id}</h3>
                                    <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wider">{m.type}</p>
                                </div>
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border shadow-sm ${m.status === 'RUNNING' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                                    }`}>
                                    {m.status}
                                </span>
                            </div>

                            {/* Telemetry Hero Section */}
                            <div className="flex items-end space-x-6 my-4">
                                <div>
                                    <div className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Temperature</div>
                                    <div className="text-4xl font-mono font-bold text-slate-900 tracking-tighter">
                                        {m.temp}<span className="text-xl text-slate-400 ml-1">°C</span>
                                    </div>
                                </div>
                                <div className="h-10 w-px bg-slate-200"></div> {/* Divider */}
                                <div>
                                    <div className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Load</div>
                                    <div className="text-4xl font-mono font-bold text-slate-900 tracking-tighter">
                                        84<span className="text-xl text-slate-400 ml-1">%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Massive Touch Controls */}
                            <div className="grid grid-cols-2 gap-4 mt-auto">
                                <button
                                    onClick={() => sendCommand(m.id, 'START')}
                                    className="h-14 flex items-center justify-center bg-englabs-success text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-emerald-600 shadow-md active:scale-95 transition-all"
                                >
                                    Start
                                </button>
                                <button
                                    onClick={() => sendCommand(m.id, 'STOP')}
                                    className="h-14 flex items-center justify-center bg-white text-englabs-danger border-2 border-slate-100 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-slate-50 hover:border-red-100 shadow-sm active:scale-95 transition-all"
                                >
                                    Stop
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
