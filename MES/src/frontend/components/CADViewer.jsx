import * as OV from 'online-3d-viewer';
import { useEffect, useRef, useState } from 'react';
import STLViewer from './STLViewer';

const CADViewer = ({ url, onClose, isStandalone = false, partData = null }) => {
    const parentRef = useRef(null);
    const viewerRef = useRef(null);
    const [fileType, setFileType] = useState(null);

    useEffect(() => {
        if (url) {
            const ext = url.split('.').pop().toLowerCase();
            setFileType(ext);
        }
    }, [url]);

    useEffect(() => {
        // Only initialize Online 3D Viewer for non-STL files that it supports
        if (fileType && fileType !== 'stl' && parentRef.current && !viewerRef.current) {
            // Set up the library paths to a local directory for offline support
            OV.SetExternalLibLocation('/libs');

            // Initialize the viewer
            const viewer = new OV.EmbeddedViewer(parentRef.current, {
                camera: new OV.Camera(
                    new OV.Coord3D(200.0, 200.0, 200.0),
                    new OV.Coord3D(0.0, 0.0, 0.0),
                    new OV.Coord3D(0.0, 0.0, 1.0),
                    45.0
                ),
                backgroundColor: new OV.RGBAColor(249, 250, 251, 255), // match gray-50
                edgeSettings: {
                    showEdges: true,
                    edgeColor: new OV.RGBColor(0, 0, 0),
                    edgeThreshold: 1
                },
                // environmentSettings removed for offline compatibility (missing assets)
            });

            // Load the model
            viewer.LoadModelFromUrlList([url]);
            viewerRef.current = viewer;

            // Handle resize
            const handleResize = () => {
                viewer.Resize();
            };
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                // The library doesn't have a formal destroy, but we can clear the ref
                viewerRef.current = null;
            };
        }
    }, [fileType, url]);

    // If it's an STL, we can keep using the lightweight STLViewer or use the new one
    // For now, let's use STLViewer for STL and CADViewer for others to minimize disruption
    if (fileType === 'stl') {
        return <STLViewer url={url} onClose={onClose} isStandalone={isStandalone} partData={partData} />;
    }

    if (isStandalone) {
        return (
            <div className="w-screen h-screen flex flex-col bg-white">
                <div className="flex-1 bg-gray-50 relative" ref={parentRef}>
                    {!fileType && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                </div>
                <div className="p-2 bg-white border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                    <div>
                        <span className="uppercase text-blue-600 font-bold mr-2">{fileType}</span>
                        Left: Rotate • Right: Pan • Scroll: Zoom
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-6xl h-full md:h-[90vh] flex flex-col overflow-hidden shadow-2xl relative mx-4 my-4">

                {/* Header */}
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={onClose}
                        className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <span className="uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-sm">{fileType}</span>
                        Model Viewer
                    </h2>
                </div>

                {/* Viewer Container */}
                <div className="flex-1 bg-gray-50 relative" ref={parentRef}>
                    {!fileType && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                </div>

                {/* Footer / Instructions */}
                <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <div>
                        Left Click: Rotate • Right Click: Pan • Scroll: Zoom
                    </div>
                    <div className="text-xs italic">
                        Powered by Online 3D Viewer
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CADViewer;
