'use client';

import { useState } from 'react';
import { Smartphone, Lock, CheckCircle, RefreshCw, Loader2, ArrowRight } from 'lucide-react';

export function BankConnectWidget() {
    const [step, setStep] = useState<'input' | 'pending' | 'syncing' | 'success'>('input');
    const [mobile, setMobile] = useState('');
    const [handle, setHandle] = useState<string | null>(null);
    const [consentId, setConsentId] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleInitiate = async () => {
        setError('');
        try {
            const res = await fetch('http://localhost:8000/api/v1/integrations/aa/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile_number: mobile })
            });

            if (!res.ok) throw new Error('Failed to initiate');

            const data = await res.json();
            // Should return { consent_handle, redirect_url }
            setHandle(data.consent_handle);

            // In a real app, we might redirect the user here.
            // For now, move to Pending step.
            setStep('pending');

        } catch (err) {
            setError('Connection failed. Please try again.');
        }
    };

    const handleCheckStatus = async () => {
        if (!handle) return;

        try {
            const res = await fetch(`http://localhost:8000/api/v1/integrations/aa/consent/${handle}/status`);
            if (!res.ok) throw new Error('Check failed');

            const data = await res.json();
            if (data.status === 'ACTIVE') {
                setConsentId(data.consent_id);
                setStep('syncing');
                // Trigger sync with the ID we just got
                handleSync(data.consent_id);
            } else {
                setError('Consent still pending. Please approve in the Setu/Bank app.');
            }
        } catch (err) {
            setError('Status check failed');
        }
    };

    const handleSync = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:8000/api/v1/integrations/aa/sync/${id}`, {
                method: 'POST'
            });

            if (!res.ok) throw new Error('Sync failed');

            const data = await res.json();
            setStep('success');
            // Reload page or trigger global refresh after 2s
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (err) {
            setError('Sync failed during data fetch');
            setStep('pending'); // Go back so they can retry check status
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-64 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Smartphone size={20} />
                    </div>
                    <h3 className="font-semibold text-gray-900">Connect Bank</h3>
                </div>
                <p className="text-sm text-gray-500">
                    Sync HDFC, SBI, Axis & more via Account Aggregator.
                </p>
            </div>

            <div className="mt-4">
                {step === 'input' && (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Mobile Number"
                            className="flex-1 bg-gray-50 border-0 rounded-xl px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                        />
                        <button
                            onClick={handleInitiate}
                            className="bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition-colors"
                        >
                            <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {step === 'pending' && (
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <div className="flex items-center gap-2 text-orange-700 font-medium text-sm mb-2">
                            <Loader2 size={16} className="animate-spin" />
                            Waiting for Approval...
                        </div>
                        <button
                            onClick={handleCheckStatus}
                            className="text-xs bg-white border border-orange-200 text-orange-800 px-3 py-1.5 rounded-lg w-full font-medium hover:bg-orange-100 transition-colors"
                        >
                            Check Status
                        </button>
                    </div>
                )}

                {step === 'syncing' && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600 mr-2" />
                        <span className="text-sm text-blue-700 font-medium">Syncing Transactions...</span>
                    </div>
                )}

                {step === 'success' && (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
                        <CheckCircle className="text-green-600" size={20} />
                        <div>
                            <p className="text-sm font-semibold text-green-800">Connected!</p>
                            <p className="text-xs text-green-600">Transactions synced successfully.</p>
                        </div>
                    </div>
                )}

                {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </div>
        </div>
    );
}
