import { Html, OrbitControls, Stage } from '@react-three/drei';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { jsPDF } from 'jspdf';
import { Box, Download, FileText, Maximize2, Minimize2, Palette, Ruler, Settings } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

const Model = ({ url, color, scale, setBounds }) => {
    const geom = useLoader(STLLoader, url);

    useEffect(() => {
        if (geom) {
            geom.computeBoundingBox();
            if (setBounds) setBounds(geom.boundingBox);
        }
    }, [geom, setBounds]);

    return (
        <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]} scale={[scale.x, scale.y, scale.z]}>
            <meshStandardMaterial color={color} metallic={0.5} roughness={0.5} />
        </mesh>
    );
};

// Component to handle PDF Export logic that needs access to GL context
const PdfExporter = ({ triggerExport, onComplete, bounds }) => {
    const { gl, scene, camera } = useThree();

    useEffect(() => {
        if (triggerExport && bounds) {
            const generatePdf = async () => {
                console.log("Starting 7-View PDF Export...");
                try {
                    const doc = new jsPDF('l', 'mm', 'a4');

                    // 1. Calculate Center and Size
                    const center = new THREE.Vector3();
                    bounds.getCenter(center);
                    const size = new THREE.Vector3();
                    bounds.getSize(size);
                    const maxDim = Math.max(size.x, size.y, size.z);

                    // 2. Calculate optimal distance to fit object
                    // fov is vertical. 
                    const fov = camera.fov * (Math.PI / 180);
                    const distance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5; // 1.5x buffer

                    console.log(`Export Setup - Center: ${center.toArray()}, Distance: ${distance}`);

                    // 3. Define Views relative to Center
                    const views = [
                        { name: 'Isometric', pos: [distance, distance, distance] },
                        { name: 'Top', pos: [0, distance, 0] },
                        { name: 'Bottom', pos: [0, -distance, 0] },
                        { name: 'Front', pos: [0, 0, distance] },
                        { name: 'Back', pos: [0, 0, -distance] },
                        { name: 'Right', pos: [distance, 0, 0] },
                        { name: 'Left', pos: [-distance, 0, 0] },
                    ];

                    const oldPos = camera.position.clone();
                    const oldRot = camera.rotation.clone();
                    const oldQuat = camera.quaternion.clone();

                    for (let i = 0; i < views.length; i++) {
                        const view = views[i];

                        // Position camera relative to object center
                        camera.position.set(
                            center.x + view.pos[0],
                            center.y + view.pos[1],
                            center.z + view.pos[2]
                        );
                        camera.lookAt(center);

                        // Force update
                        camera.updateMatrixWorld();
                        camera.updateProjectionMatrix();

                        // Render
                        gl.render(scene, camera);

                        // Capture
                        const imgData = gl.domElement.toDataURL('image/png');

                        // PDF Page
                        if (i > 0) doc.addPage();
                        doc.setFontSize(16);
                        doc.text(`${view.name} View`, 10, 10);
                        doc.addImage(imgData, 'PNG', 10, 20, 280, 160);
                    }

                    // Restore Camera
                    camera.position.copy(oldPos);
                    camera.rotation.copy(oldRot);
                    camera.quaternion.copy(oldQuat);
                    camera.updateProjectionMatrix();

                    const filename = `part_views_${new Date().getTime()}.pdf`;
                    doc.save(filename);
                    console.log("PDF Saved!");
                } catch (e) {
                    console.error("PDF Export Failed:", e);
                    alert("Export Failed: " + e.message);
                } finally {
                    onComplete();
                }
            };

            setTimeout(() => generatePdf(), 100);
        } else if (triggerExport && !bounds) {
            alert("Cannot export: Model bounds not ready. Please wait a moment.");
            onComplete();
        }
    }, [triggerExport, gl, scene, camera, onComplete, bounds]);

    return null;
};

const STLViewer = ({ url, onClose, isStandalone = false, partData }) => {
    const [color, setColor] = useState("#2563EB");
    const [scale, setScale] = useState({ x: 1, y: 1, z: 1, pct: 100 });
    const [scaleMode, setScaleMode] = useState('uniform'); // 'uniform' | 'non-uniform'
    const [bounds, setBounds] = useState(null);
    const [dimensions, setDimensions] = useState({ x: 0, y: 0, z: 0 });
    const [volume, setVolume] = useState(partData?.measurements?.volume_cm3 || 0);
    const [toolbarOpen, setToolbarOpen] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (bounds) {
            setDimensions({
                x: (bounds.max.x - bounds.min.x) * scale.x,
                y: (bounds.max.y - bounds.min.y) * scale.y,
                z: (bounds.max.z - bounds.min.z) * scale.z,
            });
        }
    }, [bounds, scale]);

    const handleScaleChange = (val, axis) => {
        const num = parseFloat(val);
        if (isNaN(num)) return;

        if (axis === '%') {
            const factor = num / 100;
            setScale({ x: factor, y: factor, z: factor, pct: num });
        } else {
            setScale(prev => ({ ...prev, [axis]: num }));
        }
    };

    const containerClass = isStandalone
        ? "w-screen h-screen flex flex-col bg-gray-50"
        : "bg-white rounded-2xl w-full max-w-6xl h-full md:h-[90vh] flex flex-col overflow-hidden shadow-2xl relative mx-4 my-4";

    return (
        <div className={isStandalone ? "" : "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"}>
            <div className={containerClass}>

                {/* Header (Standalone or Modal) */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <div className="bg-white/90 p-2 rounded shadow backdrop-blur-sm">
                        <h1 className="font-bold text-gray-800">{partData?.name || 'Unknown Part'}</h1>
                        <p className="text-xs text-gray-500">{partData?.part_id || 'ID: --'}</p>
                    </div>
                </div>

                {!isStandalone && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 bg-white/90 p-2 rounded-full shadow-lg hover:bg-gray-100"
                    >
                        <Minimize2 size={24} />
                    </button>
                )}

                {/* Main 3D Canvas */}
                <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                    <Canvas shadows camera={{ position: [0, 0, 150], fov: 50 }} gl={{ preserveDrawingBuffer: true }}>
                        <Suspense fallback={<Html center>Loading...</Html>}>
                            <Stage environment="city" intensity={0.6} castShadow={false}>
                                <Model url={url} color={color} scale={scale} setBounds={setBounds} />
                            </Stage>
                            <PdfExporter triggerExport={exporting} onComplete={() => setExporting(false)} bounds={bounds} />
                        </Suspense>
                        {/* Middle Click Pan: mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.PAN }} */}
                        <OrbitControls makeDefault mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.PAN }} />
                    </Canvas>

                    {/* Dimensions Overlay */}
                    <div className="absolute bottom-6 left-6 pointer-events-none bg-black/70 text-white p-3 rounded-lg backdrop-blur-md">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm font-mono">
                            <span className="text-gray-400">Dim X:</span> <span>{dimensions.x.toFixed(2)} mm</span>
                            <span className="text-gray-400">Dim Y:</span> <span>{dimensions.y.toFixed(2)} mm</span>
                            <span className="text-gray-400">Dim Z:</span> <span>{dimensions.z.toFixed(2)} mm</span>
                            <span className="text-gray-400 border-t border-gray-600 pt-1 mt-1">Vol:</span>
                            <span className="border-t border-gray-600 pt-1 mt-1 font-bold text-green-400">
                                {(volume * scale.x * scale.y * scale.z).toFixed(2)} cc
                            </span>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="absolute top-16 right-4 w-64 bg-white/95 backdrop-blur shadow-xl rounded-xl border border-gray-100 overflow-hidden flex flex-col transition-all">
                    <div
                        className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                        onClick={() => setToolbarOpen(!toolbarOpen)}
                    >
                        <span className="font-semibold text-sm flex items-center gap-2"><Settings size={14} /> Viewer Tools</span>
                        {toolbarOpen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </div>

                    {toolbarOpen && (
                        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
                            {/* Color */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex items-center gap-2">
                                    <Palette size={12} /> Color
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {['#2563EB', '#DC2626', '#16A34A', '#F59E0B', '#9CA3AF', '#ffffff'].map(c => (
                                        <button
                                            key={c}
                                            className={`w-6 h-6 rounded-full border border-gray-300 ${color === c ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                                            style={{ backgroundColor: c }}
                                            onClick={() => setColor(c)}
                                        />
                                    ))}
                                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                                </div>
                            </div>

                            {/* Scale */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex items-center gap-2">
                                    <Ruler size={12} /> Scale
                                </label>

                                {/* Mode Toggle via Checkbox */}
                                <div className="flex items-center gap-2 mb-3">
                                    <input
                                        type="checkbox"
                                        id="uniform-scale"
                                        checked={scaleMode === 'uniform'}
                                        onChange={(e) => setScaleMode(e.target.checked ? 'uniform' : 'non-uniform')}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <label htmlFor="uniform-scale" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
                                        Uniform Scaling
                                    </label>
                                </div>

                                {scaleMode === 'uniform' ? (
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>Percentage</span>
                                                <span className="font-mono">{scale.pct}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="500"
                                                value={scale.pct}
                                                onChange={e => handleScaleChange(e.target.value, '%')}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            />
                                        </div>
                                        <input
                                            type="number"
                                            step="1"
                                            value={scale.pct}
                                            onChange={e => handleScaleChange(e.target.value, '%')}
                                            className="w-16 text-xs border rounded px-1 py-1 text-center"
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold block text-center">X Axis</span>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={scale.x}
                                                onChange={e => handleScaleChange(e.target.value, 'x')}
                                                className="w-full text-xs border rounded px-1 py-1 text-center font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold block text-center">Y Axis</span>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={scale.y}
                                                onChange={e => handleScaleChange(e.target.value, 'y')}
                                                className="w-full text-xs border rounded px-1 py-1 text-center font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold block text-center">Z Axis</span>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={scale.z}
                                                onChange={e => handleScaleChange(e.target.value, 'z')}
                                                className="w-full text-xs border rounded px-1 py-1 text-center font-mono"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex items-center gap-2">
                                    <Download size={12} /> Exports
                                </label>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setExporting(true)}
                                        disabled={exporting}
                                        className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                                    >
                                        {exporting ? 'Generating...' : <><FileText size={14} /> 7-View PDF</>}
                                    </button>
                                    <button
                                        onClick={() => alert("Manual 2D Drawing Export feature coming in v2.1")}
                                        className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-2 rounded text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Box size={14} /> 2D Drawing (Coming Soon)
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer instructions */}
                <div className="p-2 bg-white border-t border-gray-100 text-center text-xs text-gray-400">
                    Middle Click: Pan • Left Click: Rotate • Scroll: Zoom
                </div>
            </div>
        </div>
    );
};

export default STLViewer;
