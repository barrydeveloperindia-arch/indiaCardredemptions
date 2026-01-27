import { OrbitControls, Stage } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import { AlertTriangle, Box, CheckCircle, RefreshCw, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { API_BASE_URL } from '../config';

function STLModel({ url }) {
    const geom = useLoader(STLLoader, url);
    return <primitive object={geom} attach="geometry" />;
}

const PartAnalysis = () => {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [showFusionModal, setShowFusionModal] = useState(false);

    const [manufacturingProcess, setManufacturingProcess] = useState('');
    const [customProcess, setCustomProcess] = useState('');
    const [material, setMaterial] = useState('');
    const [customMaterial, setCustomMaterial] = useState('');
    const [projectId, setProjectId] = useState('');
    const [clientId, setClientId] = useState('');
    const [customClient, setCustomClient] = useState('');
    const [errors, setErrors] = useState({});
    const [shake, setShake] = useState(false);
    const [fileName, setFileName] = useState('');

    // Dynamic Lists State
    const [processList, setProcessList] = useState([
        "MJF", "FDM", "3-AXIS", "5-AXIS", "SLA", "SLS", "SHEET METAL", "VACUUM CASTING", "INJECTION MOLDING", "Others"
    ]);
    const [materialList, setMaterialList] = useState([
        "ABS", "NYLON PA-12", "NYLON PA-3200", "NYLON PA-2200", "NYLON PA-11",
        "PLA", "TPU", "PET-G", "ALUMINIUM", "SS", "MS", "WOOD", "SILICONE", "Others"
    ]);
    const [clientList, setClientList] = useState([
        "3BA Printing", "ADSL", "Aebocode", "Arpee Tech", "Arvind Kumar", "ASA Industries", "Ashwani Sihag",
        "Atomberg", "Aveer Industries(DRDO)", "Baaz Bikes", "Bajaj", "BCH", "C&S Electric", "Compactec",
        "Crompton", "Daikin", "Deepak (Model Artician)", "Designfying", "E3D PRO", "Eklawya Enterprises",
        "Elin", "EndureAir", "ENERTICS", "Falcon", "Godrej", "Goel Enterprises", "Group SEB", "Havells",
        "HC Robotics", "Hella", "Henkel", "Hybrid Customs", "INDRONES", "IZI VENTURE PRIVATE LTD", "Jal",
        "Labat Asia", "LALTESH YADAV", "Marbles Health", "Marcopolo", "Marelli", "Menthosa", "MSAFE GROUP",
        "MSL INDIA", "My Design Minds", "Nipa", "Orient", "P2P", "Parashar Industries", "Parikalpana",
        "Prabha Electonics", "Remedio", "Renforced", "Rishabh Aggarwal", "Rukman Udyog", "San Foams",
        "Scope Medical", "SG Engineering", "Signoraware", "SML Isuzu", "Sofly", "Somafusion/Dalmitra",
        "Sonalika", "Spray Engineering", "Surjeet Paul", "V N G Medical", "Vigor Industry", "Yash Appliances",
        "Others"
    ]);

    // Modal State
    const [showNewDataModal, setShowNewDataModal] = useState(false);
    const [newDataCategory, setNewDataCategory] = useState('CLIENT'); // CLIENT, PROCESS, MATERIAL
    const [newDataValue, setNewDataValue] = useState('');

    // Fetch Metadata on Mount
    React.useEffect(() => {
        fetch(`${API_BASE_URL}/api/metadata/`)
            .then(res => res.json())
            .then(data => {
                if (data.processes && data.processes.length > 0) {
                    setProcessList(prev => [...new Set([...prev, ...data.processes])]);
                }
                if (data.materials && data.materials.length > 0) {
                    setMaterialList(prev => [...new Set([...prev, ...data.materials])]);
                }
                if (data.clients && data.clients.length > 0) {
                    setClientList(prev => [...new Set([...prev, ...data.clients])]);
                }
            })
            .catch(err => console.error("Failed to fetch metadata", err));
    }, []);

    const handleSaveNewData = () => {
        if (!newDataValue.trim()) return;

        // Optimistic Update
        if (newDataCategory === 'CLIENT') {
            setClientList(prev => [...prev.filter(i => i !== 'Others'), newDataValue, 'Others']);
        } else if (newDataCategory === 'PROCESS') {
            setProcessList(prev => [...prev.filter(i => i !== 'Others'), newDataValue, 'Others']);
        } else if (newDataCategory === 'MATERIAL') {
            setMaterialList(prev => [...prev.filter(i => i !== 'Others'), newDataValue, 'Others']);
        }

        // Persist
        fetch(`${API_BASE_URL}/api/metadata/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: newDataCategory, value: newDataValue })
        });

        setShowNewDataModal(false);
        setNewDataValue('');
    };



    const handleUploadClick = (e) => {
        const newErrors = {};
        if (!manufacturingProcess) newErrors.process = "Required";
        if (!material) newErrors.material = "Required";
        if (!projectId) newErrors.projectId = "Required";
        if (!clientId) newErrors.clientId = "Required";

        if (Object.keys(newErrors).length > 0) {
            e.preventDefault(); // Stop file dialog from opening
            setErrors(newErrors);
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Double check just in case, though click handler should catch it
        if (!manufacturingProcess || !material || !projectId || !clientId) return;

        setFileName(file.name);

        // Create local preview URL
        const url = URL.createObjectURL(file);
        setFileUrl(url);

        setAnalyzing(true);
        setResult(null);

        // API Call
        const formData = new FormData();
        formData.append('file', file);
        formData.append('manufacturing_process', manufacturingProcess === 'Others' ? customProcess : manufacturingProcess);
        formData.append('material', material === 'Others' ? customMaterial : material);
        formData.append('project_id', projectId);
        formData.append('client_id', clientId === 'Others' ? customClient : clientId);

        fetch(`${API_BASE_URL}/api/part-analysis/analyze`, {
            method: 'POST',
            body: formData,
        })
            .then(res => res.json())
            .then(data => {
                console.log("Analyzed Data:", data);
                setTimeout(() => { // Artifical delay for effect
                    setResult(data);
                    setAnalyzing(false);
                }, 1500);
            })
            .catch(err => {
                console.error(err);
                setAnalyzing(false);
            });
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-englabs-grey-900 mb-2">Agile PLM: Part Analysis</h1>
            <p className="text-englabs-grey-700 mb-8">Upload 3D models (STL/STEP) for instant manufacturability checks and quoting.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Upload Zone */}
                <div className="bg-white rounded-lg shadow-englabs-card p-8 flex flex-col items-center justify-center border-2 border-dashed border-englabs-grey-300 hover:border-englabs-blue transition-colors relative">

                    {/* Manufacturing Process Selection */}
                    <div className="w-full mb-6 grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturing Process <span className="text-red-500">*</span></label>
                            <select
                                value={manufacturingProcess}
                                onChange={(e) => {
                                    setManufacturingProcess(e.target.value);
                                    if (errors.process) setErrors(prev => ({ ...prev, process: null }));
                                }}
                                className={`w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.process ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                            >
                                <option value="" disabled>Select the process</option>
                                {processList.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            {errors.process && <p className="text-xs text-red-500 mt-1">Please select a manufacturing process first.</p>}

                            {manufacturingProcess === 'Others' && (
                                <input
                                    type="text"
                                    placeholder="Enter custom process type..."
                                    value={customProcess}
                                    onChange={(e) => setCustomProcess(e.target.value)}
                                    className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Material <span className="text-red-500">*</span></label>
                            <select
                                value={material}
                                onChange={(e) => {
                                    setMaterial(e.target.value);
                                    if (errors.material) setErrors(prev => ({ ...prev, material: null }));
                                }}
                                className={`w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.material ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                            >
                                <option value="" disabled>Select the material</option>
                                {materialList.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            {errors.material && <p className="text-xs text-red-500 mt-1">Please select a material first.</p>}

                            {material === 'Others' && (
                                <input
                                    type="text"
                                    placeholder="Enter custom material..."
                                    value={customMaterial}
                                    onChange={(e) => setCustomMaterial(e.target.value)}
                                    className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project ID <span className="text-red-500">*</span> <span className="text-gray-400 font-normal ml-1">(CXXX)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter Project ID (e.g. C123)"
                                value={projectId}
                                onChange={(e) => {
                                    setProjectId(e.target.value);
                                    if (errors.projectId) setErrors(prev => ({ ...prev, projectId: null }));
                                }}
                                className={`w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.projectId ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                            />
                            {errors.projectId && <p className="text-xs text-red-500 mt-1">Project ID is required.</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Client <span className="text-red-500">*</span></label>
                            <select
                                value={clientId}
                                onChange={(e) => {
                                    setClientId(e.target.value);
                                    if (errors.clientId) setErrors(prev => ({ ...prev, clientId: null }));
                                }}
                                className={`w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.clientId ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                            >
                                <option value="" disabled>Select the client</option>
                                {clientList.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            {errors.clientId && <p className="text-xs text-red-500 mt-1">Please select a client.</p>}

                            {clientId === 'Others' && (
                                <input
                                    type="text"
                                    placeholder="Enter custom client..."
                                    value={customClient}
                                    onChange={(e) => setCustomClient(e.target.value)}
                                    className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            )}
                        </div>
                    </div>


                    <div className="w-full mb-6 flex justify-end">
                        <button
                            onClick={() => setShowNewDataModal(true)}
                            className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-200 transition-colors"
                        >
                            + NEW DATA
                        </button>
                    </div>

                    <div className="bg-englabs-blue/10 p-4 rounded-full mb-4">
                        <Upload className="w-8 h-8 text-englabs-blue" />
                    </div>
                    <h3 className="text-lg font-semibold text-englabs-grey-900 mb-2">Upload CAD File</h3>
                    <p className="text-sm text-englabs-grey-500 mb-6 text-center">Drag & drop or click to browse<br />(STL, STEP, SLDPRT, X_T supported)</p>
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept=".stl,.step,.stp,.obj,.sldprt,.x_t"
                    />
                    <label
                        htmlFor="file-upload"
                        onClick={handleUploadClick}
                        className={`inline-block px-8 py-2.5 bg-englabs-blue text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer transition-all shadow-md hover:shadow-lg z-10 select-none ${shake ? 'animate-shake border-2 border-red-500 bg-red-500 hover:bg-red-600' : ''}`}
                    >
                        Select File
                    </label>

                    {fileName && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                            <span className="font-semibold text-blue-600">Selected:</span>
                            <span className="truncate max-w-[200px]" title={fileName}>{fileName}</span>
                        </div>
                    )}

                    {/* Extension Integrations */}
                    <div className="mt-8 pt-6 border-t border-englabs-grey-100 w-full flex flex-col items-center">
                        <p className="text-xs text-englabs-grey-400 mb-2 font-semibold uppercase tracking-wider">Extensions</p>
                        <button
                            onClick={() => setShowFusionModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium"
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Autodesk_Fusion_360_icon.svg/2048px-Autodesk_Fusion_360_icon.svg.png" className="w-5 h-5 object-contain" alt="Fusion 360" />
                            Import from Fusion 360
                        </button>
                    </div>
                </div>

                {/* Fusion Modal */}
                {showFusionModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-fade-in-up">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Autodesk_Fusion_360_icon.svg/2048px-Autodesk_Fusion_360_icon.svg.png" className="w-6 h-6 object-contain" />
                                    Fusion 360 Connector
                                </h2>
                                <button onClick={() => setShowFusionModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <Upload className="w-6 h-6 rotate-45" /> {/* Close Icon Simulation */}
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg text-sm text-orange-800">
                                    <strong>How to Use:</strong> This extension script allows you to send CAD data directly from your local Fusion 360 to this MES application.
                                </div>

                                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                                    <li>Open <strong>Autodesk Fusion 360</strong> on your PC.</li>
                                    <li>Go to the <strong>UTILITIES</strong> tab &rarr; <strong>Scripts and Add-Ins</strong> (Shift+S).</li>
                                    <li>Create a new Script (Python) and paste the code below code into it.</li>
                                    <li>Run the script whenever you want to send your active design to Englabs MES.</li>
                                </ol>

                                <div className="relative">
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(fusionScript)}
                                            className="text-xs bg-gray-800 text-white px-2 py-1 rounded hover:bg-black transition"
                                        >
                                            Copy Code
                                        </button>
                                    </div>
                                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto h-48 font-mono">
                                        {fusionScript}
                                    </pre>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowFusionModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* New Data Modal */}
                {showNewDataModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-96 animate-fade-in-up">
                            <h3 className="text-lg font-bold mb-4">Add New Data</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={newDataCategory}
                                    onChange={(e) => setNewDataCategory(e.target.value)}
                                >
                                    <option value="CLIENT">Client</option>
                                    <option value="PROCESS">Manufacturing Process</option>
                                    <option value="MATERIAL">Material</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    placeholder="Enter name..."
                                    value={newDataValue}
                                    onChange={(e) => setNewDataValue(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowNewDataModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNewData}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Analysis */}
                <div className="bg-white rounded-lg shadow-englabs-card p-6 min-h-[400px] relative">

                    {!analyzing && !result && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-englabs-grey-300">
                            {!fileUrl ? (
                                <>
                                    <Box className="w-16 h-16 mb-2 opacity-20" />
                                    <p>Analysis results will appear here</p>
                                </>
                            ) : (
                                <Canvas shadows dpr={[1, 2]} camera={{ fov: 50, position: [0, 0, 150] }}>
                                    <React.Suspense fallback={null}>
                                        <Stage environment="city" intensity={0.6}>
                                            <mesh>
                                                <STLModel url={fileUrl} />
                                                <meshStandardMaterial color="#60a5fa" />
                                            </mesh>
                                        </Stage>
                                    </React.Suspense>
                                    <OrbitControls makeDefault />
                                </Canvas>
                            )}
                        </div>
                    )}

                    {analyzing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20 pointer-events-none">
                            <RefreshCw className="w-12 h-12 text-englabs-blue animate-spin mb-4" />
                            <p className="text-englabs-blue font-medium animate-pulse">Analyzing Geometry...</p>
                        </div>
                    )}

                    {result && (
                        <div className="animate-fade-in-up">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-englabs-grey-100">
                                <div>
                                    <h2 className="text-xl font-bold text-englabs-grey-900">{result.filename}</h2>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 mr-2 bg-blue-100 text-blue-800`}>
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Saved to Catalog
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${result.status === 'PRINTABLE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {result.status}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-englabs-grey-900">{result.printability_score}/100</div>
                                    <div className="text-xs text-englabs-grey-500 uppercase">Printability Score</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-englabs-grey-50 rounded">
                                    <div className="text-sm text-englabs-grey-500">Volume</div>
                                    <div className="text-lg font-semibold">{result.volume_cm3} cm³</div>
                                </div>
                                <div className="p-4 bg-englabs-grey-50 rounded">
                                    <div className="text-sm text-englabs-grey-500">Material</div>
                                    <div className="text-lg font-semibold">{result.material_suggestion}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-englabs-grey-50 rounded">
                                    <div className="text-sm text-englabs-grey-500">Dimensions (mm)</div>
                                    <div className="text-lg font-semibold">
                                        {result.bounding_box ?
                                            `${result.bounding_box.x} x ${result.bounding_box.y} x ${result.bounding_box.z}`
                                            : 'N/A'}
                                    </div>
                                </div>
                                <div className="p-4 bg-englabs-grey-50 rounded">
                                    <div className="text-sm text-englabs-grey-500">Poly Count</div>
                                    <div className="text-lg font-semibold">{result.poly_count ? result.poly_count.toLocaleString() : 'N/A'}</div>
                                </div>
                                {result.project_id && (
                                    <div className="p-4 bg-englabs-grey-50 rounded col-span-2">
                                        <div className="text-sm text-englabs-grey-500">Project ID</div>
                                        <div className="text-lg font-semibold text-indigo-600">{result.project_id}</div>
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <h4 className="font-semibold text-englabs-grey-900 mb-3 flex items-center">
                                    <AlertTriangle className="w-4 h-4 mr-2" /> Analysis Checks
                                </h4>
                                <div className="space-y-2">
                                    {(result.issues || []).length === 0 ? (
                                        <div className="flex items-center text-englabs-green">
                                            <CheckCircle className="w-4 h-4 mr-2" /> All geometric checks passed.
                                        </div>
                                    ) : (
                                        (result.issues || []).map((issue, idx) => (
                                            <div key={idx} className="flex items-center text-englabs-red">
                                                <AlertTriangle className="w-4 h-4 mr-2" /> {issue}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-englabs-grey-100 flex justify-end">
                                <button
                                    onClick={() => window.location.href = '/catalog'}
                                    className="text-englabs-blue font-medium hover:text-blue-800"
                                >
                                    Go to Catalog &rarr;
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default PartAnalysis;
