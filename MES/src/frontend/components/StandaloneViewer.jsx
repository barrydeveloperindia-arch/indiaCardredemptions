import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CADViewer from './CADViewer';

const StandaloneViewer = () => {
    const [searchParams] = useSearchParams();
    const [url, setUrl] = useState(null);
    const [partId, setPartId] = useState(null);
    const [partData, setPartData] = useState(null);

    useEffect(() => {
        const urlParam = searchParams.get('url');
        const idParam = searchParams.get('part_id');

        if (urlParam) setUrl(urlParam);
        if (idParam) setPartId(idParam);
    }, [searchParams]);

    useEffect(() => {
        if (partId) {
            console.log("Fetching data for part:", partId);
            fetch(`http://localhost:8008/api/part-analysis/parts/${partId}`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch part data");
                    return res.json();
                })
                .then(data => {
                    console.log("Loaded Part Data:", data);
                    setPartData(data);
                })
                .catch(err => console.error("Failed to load part metadata:", err));
        }
    }, [partId]);

    if (!url) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-500">
                <p className="text-xl font-bold mb-4">Viewer Error</p>
                <p>No URL parameter found.</p>
                <p className="text-xs mt-4 font-mono bg-gray-200 p-2 rounded">Raw Params: {searchParams.toString()}</p>
            </div>
        );
    }

    // Debug log
    console.log("StandaloneViewer Loading:", url, "PartID:", partId);

    return (
        <CADViewer url={url} isStandalone={true} onClose={() => window.close()} partData={partData} />
    );
};

export default StandaloneViewer;
