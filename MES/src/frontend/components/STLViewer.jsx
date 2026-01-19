import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

const Model = ({ url }) => {
    const geom = useLoader(STLLoader, url);
    return (
        <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#2563EB" metallic={0.5} roughness={0.5} />
        </mesh>
    );
};

const STLViewer = ({ url, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl relative">

                {/* Header */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={onClose}
                        className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Canvas */}
                <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-200">
                    <Canvas shadows camera={{ position: [0, 0, 150], fov: 50 }}>
                        <Suspense fallback={null}>
                            <Stage environment="city" intensity={0.6} castShadow={false}>
                                <Model url={url} />
                            </Stage>
                        </Suspense>
                        <OrbitControls autoRotate />
                    </Canvas>
                </div>

                {/* Instructions */}
                <div className="p-4 bg-white border-t border-gray-100 text-center text-sm text-gray-500">
                    Left Click to Rotate • Right Click to Pan • Scroll to Zoom
                </div>
            </div>
        </div>
    );
};

export default STLViewer;
