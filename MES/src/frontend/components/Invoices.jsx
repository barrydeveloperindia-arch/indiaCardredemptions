import React from 'react';

export default function Invoices() {
    const invoices = [
        { id: "INV-1718001", customer: "SpaceX Corp", date: "Today", amount: "$1,035.00", status: "SYNCED", erpRef: "GL-456" },
        { id: "INV-1717942", customer: "General Electric", date: "Yesterday", amount: "$4,500.00", status: "PAID", erpRef: "GL-123" },
        { id: "INV-1717880", customer: "Englabs Internal", date: "Jan 12", amount: "$120.50", status: "DRAFT", erpRef: "GL-789" },
    ];

    return (
        <div>
            <header className="mb-8 flex justify-between items-center border-b border-white/20 pb-4">
                <div>
                    <h1 className="text-3xl font-light text-gray-900 tracking-tight">Financial Ledger</h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Internal ERP & Costing</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-800">$142,500.00</p>
                </div>
            </header>

            <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-700">Recent Transactions</h2>
                    <button className="text-englabs-blue text-sm font-medium hover:underline">Export CSV</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200/50">
                                <th className="py-4 font-semibold text-xs text-gray-400 uppercase tracking-wider">Invoice ID</th>
                                <th className="py-4 font-semibold text-xs text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="py-4 font-semibold text-xs text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="py-4 font-semibold text-xs text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="py-4 font-semibold text-xs text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="py-4 font-semibold text-xs text-gray-400 uppercase tracking-wider text-right">GL Ref</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/30">
                            {invoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-white/40 transition-colors group">
                                    <td className="py-4 font-mono text-sm text-englabs-blue font-medium">{inv.id}</td>
                                    <td className="py-4 font-medium text-gray-800">{inv.customer}</td>
                                    <td className="py-4 text-gray-500 text-sm">{inv.date}</td>
                                    <td className="py-4 font-bold text-gray-900">{inv.amount}</td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold tracking-wide ${inv.status === 'PAID' ? 'bg-green-100/80 text-green-700' :
                                                inv.status === 'SYNCED' ? 'bg-blue-100/80 text-blue-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right font-mono text-xs text-gray-400 group-hover:text-gray-600">
                                        {inv.erpRef}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
