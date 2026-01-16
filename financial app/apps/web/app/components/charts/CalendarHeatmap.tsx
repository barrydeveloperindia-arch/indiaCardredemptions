'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayData {
    date: string;
    value: number;
}

export function CalendarHeatmap() {
    const [data, setData] = useState<DayData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const fetchMonth = async (month: number, year: number) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8000/api/v1/analytics/daily-spend?month=${month}&year=${year}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonth(currentDate.getMonth() + 1, currentDate.getFullYear());
    }, [currentDate]);

    const handlePrev = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNext = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Helper to get color based on intensity
    // We need relative scale. Let's find max first or use fixed thresholds.
    // Financial apps usually have fixed thresholds (e.g. > 5k is high) or relative to user history.
    // For now, let's use relative to MAX of this month to show "My Highest Spend Days".
    const maxVal = Math.max(...data.map(d => d.value), 100); // Avoid div/0

    const getColor = (val: number) => {
        if (val === 0) return 'bg-gray-100'; // No spend
        const ratio = val / maxVal;
        if (ratio < 0.2) return 'bg-green-100';
        if (ratio < 0.5) return 'bg-yellow-100';
        if (ratio < 0.8) return 'bg-orange-200';
        return 'bg-red-400'; // High spend
    };

    // Generate Grid
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0=Sun

    // Create array for grid
    const grid = [];
    // Padding
    for (let i = 0; i < startDay; i++) grid.push(null);
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayData = data.find(d => d.date === dateStr);
        grid.push({ day: i, value: dayData ? dayData.value : 0 });
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-900">Spending Calendar</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 w-32 text-center">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <div className="flex gap-1">
                        <button onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
                        <button onClick={handleNext} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 h-64 content-start">
                {grid.map((cell, i) => (
                    cell === null ? (
                        <div key={`pad-${i}`} />
                    ) : (
                        <div
                            key={`day-${cell.day}`}
                            title={`Day ${cell.day}: ₹${cell.value.toLocaleString()}`}
                            className={`
                                aspect-square rounded-md flex items-center justify-center text-xs
                                ${getColor(cell.value)}
                                ${cell.value > 0 ? 'hover:scale-110 transition-transform cursor-pointer' : ''}
                            `}
                        >
                            <span className={cell.value > maxVal * 0.8 ? 'text-white font-bold' : 'text-gray-600'}>
                                {cell.day}
                            </span>
                        </div>
                    )
                ))}
            </div>

            <div className="flex justify-end gap-3 mt-4 text-xs text-gray-400">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-100" /> Low</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-100" /> Med</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-400" /> High</div>
            </div>
        </div>
    );
}
