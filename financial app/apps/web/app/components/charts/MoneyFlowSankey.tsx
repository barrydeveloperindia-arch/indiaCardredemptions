'use client';

import { Sankey, Tooltip, ResponsiveContainer, Layer, Rectangle } from 'recharts';

const data = {
    nodes: [
        { name: 'Income' },
        { name: 'Salary' },
        { name: 'Investments' },
        { name: 'Expenses' },
        { name: 'Savings' },
        { name: 'Food' },
        { name: 'Rent' },
        { name: 'Travel' },
        { name: 'Utilities' }
    ],
    links: [
        { source: 1, target: 0, value: 150000 },
        { source: 2, target: 0, value: 10000 },
        { source: 0, target: 3, value: 100000 },
        { source: 0, target: 4, value: 60000 },
        { source: 3, target: 5, value: 25000 },
        { source: 3, target: 6, value: 40000 },
        { source: 3, target: 7, value: 15000 },
        { source: 3, target: 8, value: 20000 }
    ]
};

// Custom Node to make it look nicer
const DemoSankeyNode = ({ x, y, width, height, index, payload, containerWidth }: any) => {
    const isOut = x + width + 6 > containerWidth;
    return (
        <Layer key={`CustomNode${index}`}>
            <Rectangle x={x} y={y} width={width} height={height} fill="#000" fillOpacity="0.8" rx={4} ry={4} />
            <text
                x={x + width / 2}
                y={y + height / 2}
                textAnchor="middle"
                fontSize="10"
                fill="#fff"
                dominantBaseline="middle"
            >
                {payload.name}
            </text>
        </Layer>
    );
};

export function MoneyFlowSankey() {
    // Note: Recharts Sankey is great but sensitive to data structure. 
    // In a real app, we'd fetch and transform this data from backend.
    // For MVP phase 1, we use static demo or simplified dynamic data.

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[400px]">
            <h3 className="font-semibold text-gray-900 mb-4">Money Flow (Demo)</h3>
            <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <Sankey
                        data={data}
                        nodePadding={50}
                        margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                        link={{ stroke: '#000000', strokeOpacity: 0.1 }}
                        nodeWidth={80}
                        node={<DemoSankeyNode />}
                    >
                        <Tooltip />
                    </Sankey>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
