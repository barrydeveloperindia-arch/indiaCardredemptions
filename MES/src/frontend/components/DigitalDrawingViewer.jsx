import { Download, FileText, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const DigitalDrawingViewer = () => {
    const [searchParams] = useSearchParams();
    const [partId, setPartId] = useState(null);
    const [drawingData, setDrawingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const idParam = searchParams.get('part_id');
        if (idParam) setPartId(idParam);
    }, [searchParams]);

    useEffect(() => {
        if (partId) {
            fetchDrawing();
        }
    }, [partId]);

    const fetchDrawing = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/part-analysis/generate-drawing/${partId}`, {
                method: 'POST'
            });
            if (!res.ok) throw new Error("Failed to generate or retrieve drawing.");
            const data = await res.json();
            setDrawingData(data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!partId) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-500">
                No Part ID provided.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">Generating Technical Drawing...</h2>
                <p className="text-gray-400 mt-2">Calculating views and dimensions</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-red-600">
                <p className="text-xl font-bold">Generation Failed</p>
                <p>{error}</p>
                <button
                    onClick={fetchDrawing}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    const pdfUrl = drawingData?.pdf_url ? `${API_BASE_URL}${encodeURI(drawingData.pdf_url)}` : null;

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded text-blue-600">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-800 text-lg">Technical Drawing Viewer</h1>
                        <p className="text-xs text-gray-500 font-mono">ID: {partId}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {pdfUrl && (
                        <>
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch(pdfUrl);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = `drawing_${partId}.pdf`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(url);
                                    } catch (e) {
                                        console.error("Download failed", e);
                                        alert("Failed to download PDF");
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                            >
                                <Download size={16} /> Download
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors"
                            >
                                <Printer size={16} /> Print
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Content using Browser PDF Viewer or Grid */}
            <div className="flex-1 overflow-hidden relative">
                {pdfUrl ? (
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full border-none"
                        title="Engineering Drawing PDF"
                    >
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <p>Your browser does not support inline PDF viewing. <a href={pdfUrl} className="text-blue-600 underline">Download instead</a>.</p>
                        </div>
                    </iframe>
                ) : (
                    <div className="p-8 grid grid-cols-2 gap-8 h-full overflow-y-auto">
                        {Object.entries(drawingData).map(([view, url]) => (
                            view !== 'pdf_url' && (
                                <div key={view} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                                    <h3 className="text-sm font-bold uppercase text-gray-400 mb-4 border-b pb-2">{view} View</h3>
                                    <img
                                        src={`${API_BASE_URL}${encodeURI(url)}`}
                                        alt={view}
                                        className="w-full object-contain flex-1 bg-gray-50 p-4 rounded"
                                    />
                                </div>
                            )
                        ))}
                        {Object.keys(drawingData).length === 0 && (
                            <div className="col-span-2 text-center text-gray-500 py-12">No drawing data available.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DigitalDrawingViewer;
