import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

export default function ShopFloor() {
    const { token } = useAuth();
    const [machines, setMachines] = useState([]);

    useEffect(() => {
        const fetchTelemetry = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/shop-floor-summary`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setMachines(data);
                }
            } catch (err) {
                console.error("Telemetry Poll Error:", err);
            }
        };

        fetchTelemetry();
        const interval = setInterval(fetchTelemetry, 2000);
        return () => clearInterval(interval);
    }, [token]);

    const sendCommand = async (machineId, cmd) => {
        try {
            console.log(`Sending ${cmd} to ${machineId}`);
            const res = await fetch(`${API_BASE_URL}/machines/${machineId}/control`, {
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
            <header className="mb-8 flex justify-between items-center border-b border-white/20 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-englabs-text-primary tracking-tight">Shop Floor</h1>
                    <p className="text-englabs-text-secondary mt-1 text-sm">Real-Time Telemetry & Control</p>
                </div>
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider bg-green-50/80 text-englabs-success px-4 py-1.5 rounded-full border border-green-100 backdrop-blur-sm shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-englabs-success animate-pulse"></span>
                    <span>OPC-UA Active</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {machines.map(m => {
                    const isHP = m.type === 'HP';
                    const machineId = m.machine_id || m.id; // Support both for robustness

                    return (
                        <div key={machineId} className={`glass-card flex flex-col h-[380px] group hover:border-englabs-primary/40 transition-all duration-300 ${isHP ? 'border-l-4 border-l-purple-500' : ''}`}>
                            {/* Status Bar Top */}
                            <div className={`h-1.5 w-full ${m.status === 'RUNNING' || m.status === 'PRINTING' ? 'bg-englabs-success shadow-[0_2px_10px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div>

                            <div className="p-6 flex-1 flex flex-col justify-between">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 leading-none tracking-tight">{machineId}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{m.type}</span>
                                            {isHP && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">MJF</span>}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border shadow-sm backdrop-blur-sm ${m.status === 'RUNNING' || m.status === 'PRINTING' ? 'bg-emerald-50/80 text-emerald-600 border-emerald-100' : 'bg-slate-100/50 text-slate-500 border-slate-200'
                                        }`}>
                                        {m.status}
                                    </span>
                                </div>

                                {/* HP Specific Telemetry */}
                                {isHP ? (
                                    <div className="space-y-4 my-2">
                                        {/* Main Stats */}
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Chamber Temp</div>
                                                <div className="text-3xl font-mono font-bold text-slate-900 tracking-tighter">
                                                    {typeof m.temp === 'number' ? m.temp.toFixed(1) : m.temp}<span className="text-lg text-slate-400 ml-1">°C</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Printhead</div>
                                                <div className={`text-sm font-bold ${m.subsystems?.printhead === 'HEALTHY' ? 'text-green-600' : 'text-red-500'}`}>
                                                    {m.subsystems?.printhead || 'N/A'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Material Bars */}
                                        <div className="space-y-2">
                                            {m.materials?.map((mat, idx) => (
                                                <div key={idx} className="w-full">
                                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                                                        <span>{mat.type}</span>
                                                        <span>{mat.level}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${mat.level < 20 ? 'bg-red-400' : 'bg-englabs-primary'}`}
                                                            style={{ width: `${mat.level}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    /* Standard Telemetry */
                                    <div className="flex items-end space-x-6 my-4">
                                        <div>
                                            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Temperature</div>
                                            <div className="text-4xl font-mono font-bold text-slate-900 tracking-tighter">
                                                {typeof m.temp === 'number' ? m.temp.toFixed(1) : m.temp}<span className="text-xl text-slate-400 ml-1">°C</span>
                                            </div>
                                        </div>
                                        <div className="h-10 w-px bg-slate-200"></div>
                                        <div>
                                            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Load</div>
                                            <div className="text-4xl font-mono font-bold text-slate-900 tracking-tighter">
                                                {m.status === 'RUNNING' ? '84' : '0'}<span className="text-xl text-slate-400 ml-1">%</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Controls */}
                                <div className="grid grid-cols-2 gap-4 mt-auto">
                                    <button
                                        onClick={() => sendCommand(machineId, 'START')}
                                        className="h-12 flex items-center justify-center bg-englabs-success/90 text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-emerald-600 shadow-md active:scale-95 transition-all backdrop-blur-sm"
                                    >
                                        Start
                                    </button>
                                    <button
                                        onClick={() => sendCommand(machineId, 'STOP')}
                                        className="h-12 flex items-center justify-center bg-white/50 text-englabs-danger border-2 border-slate-100 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-red-50 hover:border-red-100 shadow-sm active:scale-95 transition-all"
                                    >
                                        Stop
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
