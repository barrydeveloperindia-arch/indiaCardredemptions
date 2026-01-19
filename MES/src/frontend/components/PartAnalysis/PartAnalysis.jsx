import React, { useState, useCallback } from 'react';
import { CloudArrowUpIcon, DocumentChartBarIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'; // Assuming Heroicons v2

const PartAnalysis = () => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setResult(null);
            setError(null);
        }
    }, []);

    const handleChange = useCallback((e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
            setError(null);
        }
    }, []);

    const handleAnalyze = async () => {
        if (!file) return;

        setAnalyzing(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch('/api/part-analysis/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Analysis failed");
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error("Analysis Error:", err);
            setError(err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Agile PLM: Part Analysis</h1>
                <p className="mt-2 text-gray-600">Upload CAD files (STL, STEP, SLDPRT) for instant manufacturability analysis and printability scoring.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div
                    className={`
                        relative flex flex-col items-center justify-center w-full h-80 rounded-xl border-2 border-dashed transition-all duration-200
                        ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}
                        ${file ? "border-green-500 bg-green-50" : ""}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleChange}
                        accept=".stl,.step,.stp,.obj,.sldprt"
                    />

                    {!file ? (
                        <div className="text-center p-6">
                            <CloudArrowUpIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <p className="text-lg font-medium text-gray-700">Drag & Drop CAD File</p>
                            <p className="text-sm text-gray-500 mt-2">or click to browse</p>
                            <p className="text-xs text-gray-400 mt-4">Supports STL, STEP, OBJ</p>
                        </div>
                    ) : (
                        <div className="text-center p-6">
                            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <DocumentChartBarIcon className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-lg font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                            <button
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent triggering input again if bubbling occurs
                                    handleAnalyze();
                                }}
                                disabled={analyzing}
                                className={`mt-6 px-6 py-2 rounded-lg font-semibold text-white transition-colors z-10 relative
                                    ${analyzing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md"}
                                `}
                            >
                                {analyzing ? "Analyzing..." : "Run Analysis"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {analyzing && (
                        <div className="h-80 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500">Processing Geometry...</p>
                        </div>
                    )}

                    {error && (
                        <div className="h-80 flex flex-col items-center justify-center bg-red-50 rounded-xl border border-red-100 p-8 text-center">
                            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-bold text-red-700">Analysis Failed</h3>
                            <p className="text-red-600 mt-2">{error}</p>
                        </div>
                    )}

                    {!analyzing && !error && !result && (
                        <div className="h-80 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 text-gray-400">
                            Results will appear here
                        </div>
                    )}

                    {result && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="font-bold text-lg text-gray-800">Analysis Report</h2>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${result.printability_score > 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    Score: {result.printability_score}/100
                                </span>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Material Volume</p>
                                        <p className="text-xl font-mono font-semibold text-gray-900">{result.volume_cm3} cm³</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Dimensions (mm)</p>
                                        <p className="text-sm font-mono text-gray-700 mt-1">
                                            L: {result.bounding_box.x}<br />
                                            W: {result.bounding_box.y}<br />
                                            H: {result.bounding_box.z}
                                        </p>
                                    </div>
                                </div>
                                <div className="border-t border-gray-100 pt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Manufaturability Feedback</p>
                                    <ul className="space-y-2">
                                        {result.warnings.length === 0 ? (
                                            <li className="flex items-center text-green-600 text-sm">
                                                <CheckCircleIcon className="w-4 h-4 mr-2" />
                                                Geometry is clean and printable.
                                            </li>
                                        ) : (
                                            result.warnings.map((warn, idx) => (
                                                <li key={idx} className="flex items-center text-amber-600 text-sm">
                                                    <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                                                    {warn}
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PartAnalysis;
