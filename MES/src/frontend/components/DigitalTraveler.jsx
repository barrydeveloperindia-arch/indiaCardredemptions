import React, { useState } from 'react';
import { Camera, CheckSquare, ChevronRight, AlertOctagon, Box } from 'lucide-react';

const DigitalTraveler = () => {
    // Mock State for a "Day in the life" of an operator
    const [activeJob, setActiveJob] = useState({
        id: "JOB-8821",
        part: "Turbine Housing V2",
        material: "Inconel 718",
        status: "Running",
        step: 2,
        totalSteps: 4,
        nextStep: "Quality Inspection (CMM)"
    });

    return (
        <div className="min-h-screen bg-englabs-grey-900 text-white pb-20">
            {/* Mobile Header */}
            <div className="bg-englabs-grey-900 border-b border-englabs-grey-700 p-4 sticky top-0 z-20 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">Station: CNC-01</h2>
                    <p className="text-englabs-grey-500 text-sm">Operator: Alex M.</p>
                </div>
                <button className="bg-englabs-blue/20 p-2 rounded-full text-englabs-blue">
                    <Camera className="w-6 h-6" />
                </button>
            </div>

            {/* Active Job Card */}
            <div className="p-4">
                <div className="bg-englabs-grey-800 rounded-xl p-6 shadow-lg border border-englabs-grey-700 animate-slide-in">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="bg-englabs-blue text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">In Production</span>
                            <h1 className="text-3xl font-bold mt-2">{activeJob.id}</h1>
                            <p className="text-xl text-englabs-grey-300">{activeJob.part}</p>
                        </div>
                        <Box className="w-12 h-12 text-englabs-grey-600" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-englabs-grey-900/50 p-3 rounded">
                            <span className="block text-xs text-englabs-grey-500">Material</span>
                            <span className="font-semibold">{activeJob.material}</span>
                        </div>
                        <div className="bg-englabs-grey-900/50 p-3 rounded">
                            <span className="block text-xs text-englabs-grey-500">Run Time</span>
                            <span className="font-semibold text-englabs-green">02:14:50</span>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-2 flex justify-between text-sm text-englabs-grey-400">
                        <span>Step {activeJob.step} of {activeJob.totalSteps}</span>
                        <span>50%</span>
                    </div>
                    <div className="h-2 bg-englabs-grey-700 rounded-full overflow-hidden mb-6">
                        <div className="h-full bg-englabs-blue w-1/2"></div>
                    </div>

                    {/* Next Action (Big Button for Finger Tap) */}
                    <button className="w-full bg-englabs-blue hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between transition-all active:scale-95 shadow-lg shadow-blue-900/20">
                        <span>Complete Step</span>
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Upcoming Queue */}
            <div className="px-4">
                <h3 className="text-englabs-grey-500 font-semibold mb-3 uppercase text-sm tracking-wider">Up Next</h3>

                <div className="space-y-3">
                    <div className="bg-englabs-grey-800 p-4 rounded-lg border border-englabs-grey-700 flex justify-between items-center opacity-70">
                        <div>
                            <div className="font-semibold">JOB-8822</div>
                            <div className="text-sm text-englabs-grey-400">Bracket Mount - Steel</div>
                        </div>
                        <span className="text-englabs-grey-500 text-sm">Queued</span>
                    </div>
                </div>
            </div>

            {/* Bottom Floating Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-englabs-grey-800 border-t border-englabs-grey-700 p-4 flex justify-around">
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
