import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Box, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { Canvas, useLoader } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls, Stage } from '@react-three/drei';

function STLModel({ url }) {
    const geom = useLoader(STLLoader, url);
    return <primitive object={geom} attach="geometry" />;
}

const PartAnalysis = () => {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Create local preview URL
        const url = URL.createObjectURL(file);
        setFileUrl(url);

        setAnalyzing(true);
        setResult(null);

        // Simulate API Call
        const formData = new FormData();
        formData.append('file', file);

        fetch(`${API_BASE_URL}/api/part-analysis/analyze`, {
            method: 'POST',
            body: formData,
        })
            .then(res => res.json())
            .then(data => {
                console.log("Analyzed Data:", data); // DEBUG
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
                <div className="bg-white rounded-lg shadow-englabs-card p-8 flex flex-col items-center justify-center border-2 border-dashed border-englabs-grey-300 hover:border-englabs-blue transition-colors">
                    <div className="bg-englabs-blue/10 p-4 rounded-full mb-4">
                        <Upload className="w-8 h-8 text-englabs-blue" />
                    </div>
                    <h3 className="text-lg font-semibold text-englabs-grey-900 mb-2">Upload CAD File</h3>
                    <p className="text-sm text-englabs-grey-500 mb-6 text-center">Drag & drop or click to browse<br />(STL, STEP, SLDPRT supported)</p>
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept=".stl,.step,.stp,.obj,.sldprt"
                    />
                    <label
                        htmlFor="file-upload"
                        className="px-6 py-2 bg-englabs-blue text-white rounded font-medium hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                        Select File
                    </label>
                </div>

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
                                <button className="text-englabs-blue font-medium hover:text-blue-800">
                                    Save to Catalog &rarr;
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PartAnalysis;
