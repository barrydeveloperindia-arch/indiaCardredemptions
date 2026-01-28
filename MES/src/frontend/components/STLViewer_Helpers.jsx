
const CameraController = ({ bounds }) => {
    const { camera, controls } = useThree();

    useEffect(() => {
        if (bounds) {
            fitCamera(bounds, camera, controls);
        }
    }, [bounds, camera, controls]);

    return null;
};

const fitCamera = (bounds, camera, controls) => {
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);

    // Since we use <Center>, the center is (0,0,0) actually, 
    // but bounds are computed on the raw geometry before centering? 
    // No, bounds passed here are from the Model component which has the raw geometry.
    // If we wrap in <Center>, the visual position shifts, but the geometry bounding box is local.
    // Let's rely on standard 'fit to bounds' logic assuming centered object.

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const distance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5; // 1.5x zoom out

    // New position: look at center (0,0,0) from distance Z
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
    }
};
