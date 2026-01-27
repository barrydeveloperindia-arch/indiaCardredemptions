import { Calendar, FileText, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { API_BASE_URL } from '../config';

const AgileScheduler = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [draggedJob, setDraggedJob] = useState(null);
    const [processRows, setProcessRows] = useState([
        "MJF", "FDM", "3-AXIS", "5-AXIS", "SLA", "SLS", "SHEET METAL", "VACUUM CASTING", "INJECTION MOLDING", "Others"
    ]);

    // Client Requirements Modal State
    const [reqModalOpen, setReqModalOpen] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [reqForm, setReqForm] = useState({ quantity: '', finish: '', colour: '', customFinish: '', customColour: '' });
    const [reportForm, setReportForm] = useState({ selectedProjects: [], clientName: 'All' });
    // Storage for saved requirements: { [projectId]: { quantity, finish, colour } }
    const [savedRequirements, setSavedRequirements] = useState({});

    const finishOptions = ["Standard", "Matte", "Glossy", "Sandblasted", "Polished", "Anodized", "Plated", "Custom"];
    const colourOptions = ["Natural", "Black", "White", "Grey", "Red", "Blue", "Green", "Yellow", "Custom"];

    // Calculate window reference (Today 00:00)
    const getWindowStart = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    };
    const windowStart = getWindowStart();
    const WINDOW_HOURS = 36;
    const WINDOW_MS = WINDOW_HOURS * 60 * 60 * 1000;

    const fetchData = () => {
        setLoading(true);
        setError(null);
        // Use Dispatch Board endpoint as requested
        // Fetch Metadata first or in parallel
        fetch(`${API_BASE_URL}/api/metadata/`)
            .then(res => res.json())
            .then(meta => {
                if (meta.processes && meta.processes.length > 0) {
                    setProcessRows(prev => [...new Set([...prev, ...meta.processes])]);
                }
            })
            .catch(e => console.error(e));

        const url = `${API_BASE_URL}/api/dispatch/board`;
        console.log("Fetching from:", url);

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(d => {
                console.log("Data received:", d);

                // Transform Production Jobs for Scheduler
                const schedulerJobs = (d.production || []).map(job => {
                    // Determine start time
                    const startMs = job.actual_start_time ? new Date(job.actual_start_time).getTime() :
                        (job.planned_start_time ? new Date(job.planned_start_time).getTime() : new Date().getTime());

                    // Determine duration (ms)
                    const durationMs = (job.estimated_runtime_seconds || 3600) * 1000;

                    return {
                        id: job.id,
                        part_name: job.part_name,
                        status: job.status,
                        process: job.manufacturing_process || "Others",
                        material: job.material || "N/A", // Ensure mapping
                        start_time: new Date(startMs).toISOString(),
                        end_time: new Date(startMs + durationMs).toISOString(),
                        color: getStatusColor(job.status),
                        color: getStatusColor(job.status),
                        project_id: job.project_id || "N/A",
                        client_id: job.client_id || ((job.order && job.order.customer_id) ? job.order.customer_id : "N/A"),
                        preview_url: job.preview_url
                    };
                });

                setData({
                    rows: processRows.map(p => ({ id: p, name: p })), // Rows are processes now
                    jobs: schedulerJobs
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch schedule", err);
                setError(err.message + " to " + url);
                setLoading(false);
            });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'RUNNING': return '#3b82f6'; // Blue
            case 'COMPLETED': return '#10b981'; // Green
            case 'QUEUED': return '#f59e0b'; // Amber
            default: return '#6b7280'; // Gray
        }
    };

    useEffect(() => {
        fetchData();
        // Polling for "automatic" updates as requested
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    // --- Helpers for Visualization ---
    const getPosition = (dateStr) => {
        if (!dateStr) return 0;
        const time = new Date(dateStr).getTime();
        const diff = time - windowStart;
        return (diff / WINDOW_MS) * 100;
    };

    const getWidth = (startStr, endStr) => {
        if (!startStr || !endStr) return 0;
        const start = new Date(startStr).getTime();
        const end = new Date(endStr).getTime();
        const duration = end - start;
        return Math.max((duration / WINDOW_MS) * 100, 1); // Min width 1%
    };

    // Percent position for "Now" line
    const nowPos = ((new Date().getTime() - windowStart) / WINDOW_MS) * 100;

    // --- Drag and Drop Handlers (Visual only for now, logic would require updating Dispatch Job params) ---
    const handleDragStart = (e, job) => {
        setDraggedJob(job);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleLaneDrop = (e, processName) => {
        e.preventDefault();
        // Here we would presumably update the manufacturing_process of the part?
        // For now, this is a visualized scheduler as requested.
        console.log(`Dropped ${draggedJob?.part_name} on ${processName}`);
        setDraggedJob(null);
    };

    // --- Image Helper ---
    const getBase64Image = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Ensure reasonable resolution for PDF
                canvas.width = img.width || 300;
                canvas.height = img.height || 220;
                const ctx = canvas.getContext('2d');
                // White background for transparent SVGs
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                try {
                    resolve(canvas.toDataURL('image/png'));
                } catch (e) {
                    reject(e);
                }
            };
            img.onerror = (e) => {
                console.error("Image load failed for URL:", url, e);
                reject(e);
            };
            img.src = url;
        });
    };

    const handleGenerateBatchReport = async () => {
        if (reportForm.selectedProjects.length === 0) {
            alert("Please select at least one Project ID");
            return;
        }

        // Validate Quantity
        const projectJobs = (data?.jobs || []).filter(j =>
            reportForm.selectedProjects.includes(j.project_id) &&
            (reportForm.clientName === 'All' || j.client_id === reportForm.clientName)
        );

        const missingQtyJobs = projectJobs.filter(j => !reportForm.jobQuantities?.[j.id]);
        if (missingQtyJobs.length > 0) {
            alert(`Please enter quantities for the following parts: ${missingQtyJobs.map(j => j.part_name).join(', ')}`);
            return;
        }

        if (!window.jspdf) {
            alert("PDF Library loading... Please try again in a moment.");
            return;
        }

        // Already filtered above for validation
        // const projectJobs = ...

        if (projectJobs.length === 0) {
            alert("No jobs found for the selected Project/Client.");
            return;
        }

        // Pre-fetch images
        const jobsWithImages = await Promise.all(projectJobs.map(async (job) => {
            let imgData = null;
            if (job.preview_url) {
                try {
                    const fullUrl = job.preview_url.startsWith('http')
                        ? job.preview_url
                        : `${API_BASE_URL.replace(/\/$/, '')}/${encodeURI(job.preview_url.replace(/^\//, ''))}`;
                    imgData = await getBase64Image(fullUrl);
                } catch (e) {
                    console.error("Failed to load image for report", e);
                }
            }
            return { ...job, imgData };
        }));

        const doc = new window.jspdf.jsPDF('l', 'mm', 'a4'); // Landscape for table

        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text(`Build Report: ${reportForm.selectedProjects.join(', ')}`, 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Client: ${reportForm.clientName} | Generated: ${new Date().toLocaleDateString()}`, 14, 28);

        const tableColumn = ["Sr. No.", "Part Name", "Client", "Project", "Qty", "Finish", "Colour", "Process", "Visual"];
        const tableRows = [];

        jobsWithImages.forEach((job, index) => {
            const reqs = savedRequirements[job.project_id] || { finish: 'Standard', colour: 'Natural' };
            const qty = reportForm.jobQuantities?.[job.id] || 'N/A';
            const rowData = [
                index + 1,
                job.part_name,
                job.client_id || "N/A",
                job.project_id || "N/A",
                qty,
                reqs.finish,
                reqs.colour,
                job.process,
                "" // Placeholder for image
            ];
            tableRows.push(rowData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [22, 163, 74], textColor: 255 }, // Green header
            styles: { valign: 'middle', fontSize: 10, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 15 },
                1: { cellWidth: 40 },
                8: { cellWidth: 40, minCellHeight: 30 } // Space for image
            },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 8) {
                    const job = jobsWithImages[data.row.index];
                    if (job && job.imgData) {
                        try {
                            // Fit image in cell
                            const cell = data.cell;
                            const pad = 2;
                            // Calculate simple fit (contain)
                            const dim = Math.min(cell.width - pad * 2, cell.height - pad * 2);
                            doc.addImage(job.imgData, 'PNG', cell.x + pad, cell.y + pad, dim * 1.3, dim); // approx aspect
                        } catch (e) {
                            console.error("Image draw error", e);
                        }
                    }
                }
            }
        });

        doc.save(`Batch_Report_${new Date().getTime()}.pdf`);
        setReportModalOpen(false);
    };

    const handleDownloadReport = async (e, job) => {
        e.stopPropagation();

        if (!window.jspdf) {
            alert("PDF Library loading... Please try again in a moment.");
            return;
        }

        const doc = new window.jspdf.jsPDF();
        const reqs = savedRequirements[job.project_id] || { quantity: 'Not Specified', finish: 'Standard', colour: 'Natural' };

        // --- PDF Generation ---
        doc.setFontSize(22);
        doc.setTextColor(40, 44, 52);
        doc.text("Build Report", 20, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 26);

        // -- Section: Part Details --
        doc.setDrawColor(200);
        doc.line(20, 30, 190, 30);

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Part Specification", 20, 40);

        doc.setFontSize(11);
        doc.setTextColor(50);
        let y = 50;
        const addField = (label, value) => {
            doc.setFont(undefined, 'bold');
            doc.text(`${label}:`, 20, y);
            doc.setFont(undefined, 'normal');
            doc.text(`${value}`, 60, y);
            y += 8;
        };

        addField("Part Name", job.part_name);
        addField("Client Name", job.client_id || "N/A");
        addField("Project ID", job.project_id || "N/A");
        addField("Required Qty", reqs.quantity);
        addField("Finish", reqs.finish);
        addField("Colour", reqs.colour);
        addField("Process", job.process);

        // -- Section: Visual Reference --
        y += 10;
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Visual Reference", 20, y);
        y += 5;
        doc.line(20, y, 60, y);
        y += 10;

        // Fetch Image
        if (job.preview_url) {
            try {
                const fullUrl = job.preview_url.startsWith('http')
                    ? job.preview_url
                    : `${API_BASE_URL.replace(/\/$/, '')}/${encodeURI(job.preview_url.replace(/^\//, ''))}`;

                const base64data = await getBase64Image(fullUrl);
                doc.addImage(base64data, "PNG", 20, y, 100, 75);
                doc.save(`Build_Report_${job.part_name}.pdf`);
            } catch (err) {
                console.error("Image processing error", err);
                doc.setTextColor(150);
                doc.text("(Image Load Failed)", 20, y + 10);
                doc.save(`Build_Report_${job.part_name}.pdf`);
            }
        } else {
            doc.setTextColor(150);
            doc.text("(No Image Available)", 20, y + 10);
            doc.save(`Build_Report_${job.part_name}.pdf`);
        }
    };

    const getOverallStatus = (job) => {
        const now = new Date().getTime();
        const end = new Date(job.end_time).getTime();
        if (job.status === 'COMPLETED') return { label: 'Completed', color: 'text-green-600 bg-green-50' };
        if (end < now && job.status !== 'COMPLETED') return { label: 'Delayed', color: 'text-red-600 bg-red-50' };
        return { label: 'On Track', color: 'text-blue-600 bg-blue-50' };
    };

    const handleProjectClick = (e, projectId) => {
        e.stopPropagation();
        setSelectedProject(projectId);
        // Reset form or load existing (mock logic)
        setReqForm({ quantity: '', finish: '', colour: '', customFinish: '', customColour: '' });
        setReqModalOpen(true);
    };

    const handleSaveRequirements = () => {
        const finalData = {
            quantity: reqForm.quantity || 'N/A',
            finish: reqForm.finish === 'Custom' ? reqForm.customFinish : (reqForm.finish || 'Standard'),
            colour: reqForm.colour === 'Custom' ? reqForm.customColour : (reqForm.colour || 'Natural'),
        };
        console.log(`Saving requirements for Project ${selectedProject}:`, finalData);

        setSavedRequirements(prev => ({
            ...prev,
            [selectedProject]: finalData
        }));

        setReqModalOpen(false);
        setSelectedProject(null);
    };

    return (
        <div className="p-6 h-screen flex flex-col bg-englabs-grey-100 overflow-hidden relative">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-englabs-grey-900 flex items-center gap-2">
                    <Calendar className="w-6 h-6" /> Agile Scheduler
                </h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setReportModalOpen(true)}
                        disabled={!data || loading}
                        className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 ${(!data || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <FileText size={18} />
                        Build Report
                    </button>
                    <button onClick={fetchData} className="p-1 hover:bg-gray-200 rounded">
                        <RefreshCw className="w-4 h-4 text-englabs-grey-600" />
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-lg shadow-englabs-card overflow-hidden flex flex-col border border-englabs-grey-200">
                {loading && !data && (
                    <div className="flex-1 flex items-center justify-center text-englabs-grey-500">
                        Loading...
                    </div>
                )}

                {error && (
                    <div className="flex-1 flex items-center justify-center text-red-500 bg-red-50 p-8">
                        <div>
                            <h3 className="font-bold">Connection Error</h3>
                            <p>{error}</p>
                            <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-100 rounded">Retry</button>
                        </div>
                    </div>
                )}

                {!loading && !error && data && (
                    <>
                        {/* Timeline Header */}
                        <div className="h-10 border-b border-englabs-grey-200 bg-englabs-grey-50 relative flex overflow-x-auto">
                            {/* First Column Header: Process */}
                            <div className="w-40 border-r border-englabs-grey-200 p-2 font-bold text-xs text-slate-700 uppercase tracking-wide flex items-center bg-gray-50 z-20 shrink-0 sticky left-0">
                                Process
                            </div>
                            {/* Second Column Header: Client */}
                            <div className="w-28 border-r border-englabs-grey-200 p-2 font-bold text-xs text-slate-700 uppercase tracking-wide flex items-center bg-gray-50 z-20 shrink-0">
                                Client
                            </div>
                            {/* Third Column Header: Project ID */}
                            <div className="w-28 border-r border-englabs-grey-200 p-2 font-bold text-xs text-slate-700 uppercase tracking-wide flex items-center bg-gray-50 z-20 shrink-0">
                                Project ID
                            </div>
                            {/* Fourth Column Header: Process Status */}
                            <div className="w-32 border-r border-englabs-grey-200 p-2 font-bold text-xs text-slate-700 uppercase tracking-wide flex items-center bg-gray-50 z-20 shrink-0">
                                Process Status
                            </div>
                            {/* Fifth Column Header: Post Process */}
                            <div className="w-32 border-r border-englabs-grey-200 p-2 font-bold text-xs text-slate-700 uppercase tracking-wide flex items-center bg-gray-50 z-20 shrink-0">
                                Post Process
                            </div>
                            {/* Sixth Column Header: Overall Status */}
                            <div className="flex-1 border-r border-englabs-grey-200 p-2 font-bold text-xs text-slate-700 uppercase tracking-wide flex items-center bg-gray-50 z-20 shrink-0">
                                Overall Status
                            </div>
                        </div>

                        {/* Rows */}
                        <div className="flex-1 overflow-y-auto">
                            {data.rows.map(row => {
                                // Filter jobs for this row
                                const rowJobs = data.jobs.filter(j => {
                                    if (row.id === "Others") {
                                        return !processRows.filter(pr => pr !== 'Others').includes(j.process) || j.process === "Others";
                                    }
                                    return j.process === row.id;
                                });

                                return (
                                    <div key={row.id} className="flex border-b border-englabs-grey-100 min-h-[100px]">
                                        {/* Column 1: Process */}
                                        <div className="w-40 p-4 border-r border-englabs-grey-200 bg-englabs-grey-50 flex flex-col justify-center shrink-0 sticky left-0 z-10">
                                            <div className="font-semibold text-sm text-englabs-grey-900">{row.name}</div>
                                            <div className="text-xs text-englabs-grey-500">Processing Line</div>
                                            <div className="mt-2 text-xs font-medium text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full w-fit">{rowJobs.length} Jobs</div>
                                        </div>

                                        {/* Column 2: Client */}
                                        <div className="w-28 p-2 border-r border-englabs-grey-200 bg-white overflow-y-auto shrink-0 max-h-[200px]">
                                            {rowJobs.length > 0 ? (
                                                <div className="space-y-2">
                                                    {rowJobs.map(job => (
                                                        <div key={job.id} className="h-8 flex items-center justify-center">
                                                            <div className="text-xs p-1.5 bg-blue-50 border border-blue-100 rounded text-center text-blue-700 font-semibold truncate w-full" title={job.client_id}>
                                                                {job.client_id}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-300 italic text-center mt-4">-</div>
                                            )}
                                        </div>

                                        {/* Column 3: Project IDs */}
                                        <div className="w-28 p-2 border-r border-englabs-grey-200 bg-white overflow-y-auto shrink-0 max-h-[200px]">
                                            {rowJobs.length > 0 ? (
                                                <div className="space-y-2">
                                                    {rowJobs.map(job => (
                                                        <div key={job.id} className="h-8 flex items-center justify-center">
                                                            <div
                                                                onClick={(e) => handleProjectClick(e, job.project_id)}
                                                                className="text-xs p-1.5 bg-indigo-50 border border-indigo-100 rounded text-center text-indigo-700 font-semibold w-full cursor-pointer hover:bg-indigo-100 hover:scale-105 transition-all"
                                                            >
                                                                {job.project_id}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-300 italic text-center mt-4">-</div>
                                            )}
                                        </div>

                                        {/* Column 4: Process Status */}
                                        <div className="w-32 p-2 border-r border-englabs-grey-200 bg-white overflow-y-auto shrink-0 max-h-[200px]">
                                            <div className="space-y-2">
                                                {rowJobs.map(job => (
                                                    <div key={job.id} className="h-8 flex items-center justify-center">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${job.status === 'RUNNING' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                                                            job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {job.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Column 5: Post Process */}
                                        <div className="w-32 p-2 border-r border-englabs-grey-200 bg-white overflow-y-auto shrink-0 max-h-[200px]">
                                            <div className="space-y-2">
                                                {rowJobs.map(job => (
                                                    <div key={job.id} className="h-8 flex items-center justify-center">
                                                        <span className="text-[10px] text-gray-600">
                                                            {job.status === 'COMPLETED' ? 'Painting' : 'Pending'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Column 6: Overall Status */}
                                        <div className="flex-1 p-2 border-r border-englabs-grey-200 bg-white overflow-y-auto shrink-0 max-h-[200px]">
                                            <div className="space-y-2">
                                                {rowJobs.map(job => {
                                                    const status = getOverallStatus(job);
                                                    return (
                                                        <div key={job.id} className="h-8 flex items-center justify-center">
                                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${status.color}`}>
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
            {/* Client Requirements Overlay Modal */}
            {reqModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-start justify-center pt-20 z-50 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-96 overflow-hidden transform transition-all scale-100">
                        <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg">Client Requirements</h3>
                            <button onClick={() => setReqModalOpen(false)} className="hover:bg-white/20 rounded p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                Project: <span className="text-indigo-600 font-bold">{selectedProject}</span>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Required Quantity</label>
                                <input
                                    type="number"
                                    value={reqForm.quantity}
                                    onChange={e => setReqForm(p => ({ ...p, quantity: e.target.value }))}
                                    placeholder="Enter quantity"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Finish</label>
                                    <select
                                        value={reqForm.finish}
                                        onChange={e => setReqForm(p => ({ ...p, finish: e.target.value }))}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="">Select Finish</option>
                                        {finishOptions.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                    {reqForm.finish === 'Custom' && (
                                        <input
                                            type="text"
                                            value={reqForm.customFinish}
                                            onChange={e => setReqForm(p => ({ ...p, customFinish: e.target.value }))}
                                            placeholder="Type custom finish..."
                                            className="w-full mt-2 p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 bg-gray-50 animate-fade-in"
                                            autoFocus
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Colour</label>
                                    <select
                                        value={reqForm.colour}
                                        onChange={e => setReqForm(p => ({ ...p, colour: e.target.value }))}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="">Select Colour</option>
                                        {colourOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {reqForm.colour === 'Custom' && (
                                        <input
                                            type="text"
                                            value={reqForm.customColour}
                                            onChange={e => setReqForm(p => ({ ...p, customColour: e.target.value }))}
                                            placeholder="Type custom colour..."
                                            className="w-full mt-2 p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 bg-gray-50 animate-fade-in"
                                            autoFocus
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setReqModalOpen(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveRequirements}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]"
                                >
                                    Save Requirements
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Report Generation Modal */}
            {reportModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-start justify-center pt-20 z-50 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-96 overflow-hidden transform transition-all scale-100">
                        <div className="bg-green-600 p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg">Generate Build Report</h3>
                            <button onClick={() => setReportModalOpen(false)} className="hover:bg-white/20 rounded p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Projects</label>
                                <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto p-2 bg-gray-50">
                                    {Array.from(new Set((data?.jobs || []).map(j => j.project_id).filter(id => id && id !== 'N/A'))).sort().map(pid => {
                                        const isSelected = reportForm.selectedProjects.includes(pid);
                                        const projectJobs = (data?.jobs || []).filter(j => j.project_id === pid);

                                        return (
                                            <div key={pid} className="flex flex-col gap-1 py-1 hover:bg-white rounded px-1 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`proj-${pid}`}
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setReportForm(prev => ({
                                                                ...prev,
                                                                selectedProjects: checked
                                                                    ? [...prev.selectedProjects, pid]
                                                                    : prev.selectedProjects.filter(p => p !== pid)
                                                            }));
                                                        }}
                                                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                                                    />
                                                    <label htmlFor={`proj-${pid}`} className="font-semibold text-gray-800 cursor-pointer flex-1 select-none">{pid}</label>
                                                </div>

                                                {isSelected && (
                                                    <div className="ml-6 border-l-2 border-gray-200 pl-2 space-y-2 mt-1 animate-fade-in">
                                                        {projectJobs.map(job => (
                                                            <div key={job.id} className="flex items-center justify-between text-xs bg-gray-50 p-1.5 rounded">
                                                                <span className="text-gray-700 font-medium truncate max-w-[140px]" title={job.part_name}>{job.part_name}</span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Qty"
                                                                    className="w-16 p-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500 outline-none text-center"
                                                                    value={reportForm.jobQuantities?.[job.id] || ''}
                                                                    onChange={(e) => setReportForm(prev => ({
                                                                        ...prev,
                                                                        jobQuantities: { ...prev.jobQuantities, [job.id]: e.target.value }
                                                                    }))}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="mt-2 text-xs text-gray-500 text-right">
                                    {reportForm.selectedProjects.length} selected
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Client (Optional)</label>
                                <select
                                    value={reportForm.clientName}
                                    onChange={e => setReportForm(p => ({ ...p, clientName: e.target.value }))}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                >
                                    <option value="All">All Clients</option>
                                    {Array.from(new Set((data?.jobs || []).map(j => j.client_id).filter(id => id && id !== 'N/A'))).sort().map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setReportModalOpen(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleGenerateBatchReport}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-lg shadow-green-200 transition-all hover:scale-[1.02]"
                                >
                                    Generate PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgileScheduler;
