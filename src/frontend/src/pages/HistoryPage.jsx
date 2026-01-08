import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const HistoryPage = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const fetchHistory = async (page = 1) => {
        if (!user || !user.id) {
            console.log('User not available');
            return;
        }

        setLoading(true);
        try {
            console.log('Fetching history for user:', user.id, 'page:', page);
            const response = await api.get(`/users/${user.id}/history`, {
                params: { page, limit: 10, startDate, endDate, type: typeFilter }
            });
            console.log('History response:', response.data);
            setHistory(response.data.data.history || []);
            setTotalPages(Math.ceil((response.data.data.total || 0) / 10));
        } catch (error) {
            console.error('Failed to fetch history:', error);
            toast.error('Failed to fetch history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(currentPage);
    }, [currentPage, user]);

    const handleFilter = () => {
        setCurrentPage(1);
        fetchHistory(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="min-h-screen bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl font-semibold text-white mb-6">My Learning History</h2>

                {/* Filters */}
                <div className="bg-slate-800 rounded-lg shadow-md p-6 mb-6 border border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-600 rounded-md text-white bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-tertiary transition-all duration-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-600 rounded-md text-white bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-tertiary transition-all duration-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Exercise Type</label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-600 rounded-md text-white bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-tertiary transition-all duration-300"
                            >
                                <option value="">All Types</option>
                                <option value="pronunciation">Pronunciation</option>
                                <option value="reading">Reading</option>
                                <option value="speaking">Speaking</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleFilter}
                                className="w-full bg-brand-primary text-slate-900 px-4 py-2 rounded-md hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-300 font-medium"
                            >
                                Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* History Table */}
                <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden border border-slate-700">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-8">
                                <p className="text-slate-400">Loading history...</p>
                            </div>
                        ) : (
                            <>
                                <table className="w-full table-auto">
                                    <thead className="bg-slate-700/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Topic</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Lesson</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Exercise</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Score</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Session Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                                        {history.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-700/50 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{formatDate(item.date)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.topicName || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.lessonName || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-300">{item.exerciseContent ? item.exerciseContent.substring(0, 50) + '...' : 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-brand-tertiary/20 text-brand-tertiary">
                                                        {item.exerciseType || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.score >= 80 ? 'bg-brand-primary/20 text-brand-primary' :
                                                        item.score >= 60 ? 'bg-brand-secondary/20 text-brand-secondary' :
                                                            'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {item.score || 0}/100
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.sessionScore >= 80 ? 'bg-brand-primary/20 text-brand-primary' :
                                                        item.sessionScore >= 60 ? 'bg-brand-secondary/20 text-brand-secondary' :
                                                            'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {item.sessionScore || 0}/100
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {history.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-slate-400">No history found. Start practicing to see your progress!</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-6">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-600 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ${currentPage === page
                                    ? 'text-slate-900 bg-brand-primary border border-brand-primary'
                                    : 'text-slate-300 bg-slate-800 border border-slate-600 hover:bg-slate-700'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-600 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;