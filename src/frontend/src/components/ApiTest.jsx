import React, { useState } from 'react';
import scoringService from '../services/scoring.service';
import { toast } from 'react-toastify';

const ApiTest = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleTestApi = async () => {
        setLoading(true);
        setResult(null);

        // Fake data for testing
        const payload = {
            test: "Hello from Frontend",
            timestamp: new Date().toISOString()
        };

        try {
            // Call Service
            const response = await scoringService.submitScoring(payload);
            setResult(response);
            toast.success('API connected successfully!');
        } catch (error) {
            console.error('API Error:', error);
            // Toast is already handled in api.js interceptor, but we can add specific logic here if needed
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md space-y-4 max-w-sm mx-auto mt-10 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Backend Connection Test</h2>

            <p className="text-sm text-gray-500">
                Click below to send a POST request to <code className="bg-gray-100 px-1 rounded">/api/scoring/submit</code>
            </p>

            <button
                onClick={handleTestApi}
                disabled={loading}
                className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'
                    }`}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                    </span>
                ) : (
                    'Test Connection'
                )}
            </button>

            {result && (
                <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-100 text-sm overflow-auto">
                    <p className="font-semibold text-green-700 mb-1">Response:</p>
                    <pre className="text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default ApiTest;
