import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import userService from '../services/user.service';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { motion } from 'framer-motion';

const HistoryPage = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        currentStreak: 0,
        totalPracticeSeconds: 0,
        averageScore: 0,
        totalLessons: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const fetchHistory = async (page = 1) => {
        if (!user || !user.id) return;

        setLoading(true);
        try {
            const response = await api.get(`/users/${user.id}/history`, {
                params: { page, limit: 10, startDate, endDate, type: typeFilter }
            });
            setHistory(response.data.data.history || []);
            setTotalPages(Math.ceil((response.data.data.total || 0) / 10));
            // Assuming the history response might also return a total count we can use for "Total Lessons" unless we get it from stats
            // For now, let's rely on getUserStats for the summary cards
        } catch (error) {
            console.error('Failed to fetch history:', error);
            toast.error('Failed to fetch history');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            const response = await userService.getUserStats();
            if (response && response.data) {
                setStats(prev => ({ ...prev, ...response.data }));
            }
        } catch (error) {
            console.error('Failed to fetch user stats:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserStats();
            fetchHistory(currentPage);
        }
    }, [currentPage, user]);

    const handleFilter = () => {
        setCurrentPage(1);
        fetchHistory(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }) + ' • ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'word': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'sentence': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            case 'paragraph': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-white [.light-theme_&]:text-teal-900 mb-2">My Learning Journey</h2>
                    <p className="text-slate-400 [.light-theme_&]:text-teal-700">Track your progress and review past improvements</p>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-5 sm:grid-cols-3 mb-12">
                    <StatCard
                        label="Total Lessons"
                        value={stats.total_lessons_completed || history.length || 0} // Fallback if API doesn't return total_lessons_completed
                        description="completed exercises"
                        color="primary"
                    />
                    <StatCard
                        label="Average Score"
                        value={`${Math.round(stats.averageScore || 0)}%`}
                        description="overall performance"
                        color="secondary"
                    />
                    <StatCard
                        label="Learning Streak"
                        value={`${stats.currentStreak || 0} days`}
                        description="consistency is key"
                        color="orange"
                    />
                </div>

                {/* Filters */}
                <div className="bg-slate-800/50 [.light-theme_&]:bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700/50 [.light-theme_&]:border-teal-100 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 [.light-theme_&]:text-teal-700 uppercase tracking-wider mb-2">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-900/50 [.light-theme_&]:bg-white border border-slate-600 [.light-theme_&]:border-teal-200 rounded-xl text-white [.light-theme_&]:text-teal-900 focus:outline-none focus:ring-2 focus:ring-brand-tertiary [.light-theme_&]:focus:ring-emerald-400 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 [.light-theme_&]:text-teal-700 uppercase tracking-wider mb-2">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-900/50 [.light-theme_&]:bg-white border border-slate-600 [.light-theme_&]:border-teal-200 rounded-xl text-white [.light-theme_&]:text-teal-900 focus:outline-none focus:ring-2 focus:ring-brand-tertiary [.light-theme_&]:focus:ring-emerald-400 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 [.light-theme_&]:text-teal-700 uppercase tracking-wider mb-2">Type</label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-900/50 [.light-theme_&]:bg-white border border-slate-600 [.light-theme_&]:border-teal-200 rounded-xl text-white [.light-theme_&]:text-teal-900 focus:outline-none focus:ring-2 focus:ring-brand-tertiary [.light-theme_&]:focus:ring-emerald-400 focus:border-transparent transition-all"
                            >
                                <option value="">All Types</option>
                                <option value="word">Word</option>
                                <option value="sentence">Sentence</option>
                                {/* <option value="paragraph">Paragraph</option> */}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleFilter}
                                className="w-full bg-brand-primary text-slate-900 [.light-theme_&]:bg-emerald-500 [.light-theme_&]:text-white [.light-theme_&]:hover:bg-emerald-600 font-bold px-4 py-2.5 rounded-xl hover:bg-brand-primary-dark active:scale-95 transition-all duration-200 shadow-lg shadow-brand-primary/20 [.light-theme_&]:shadow-emerald-500/20"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* History Table */}
                <div className="bg-slate-800/50 [.light-theme_&]:bg-white backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-slate-700/50 [.light-theme_&]:border-teal-100">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-600 border-t-brand-primary mb-4"></div>
                                <p className="text-slate-400">Loading your history...</p>
                            </div>
                        ) : (
                            <>
                                <table className="w-full table-auto">
                                    <thead className="bg-slate-900/50 [.light-theme_&]:bg-teal-50 border-b border-slate-700 [.light-theme_&]:border-teal-100">
                                        <tr>
                                            <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 [.light-theme_&]:text-teal-800 uppercase tracking-wider">Lesson Detail</th>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 [.light-theme_&]:text-teal-800 uppercase tracking-wider">Exercise</th>
                                            <th className="px-6 py-5 text-center text-xs font-bold text-slate-400 [.light-theme_&]:text-teal-800 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-5 text-center text-xs font-bold text-brand-primary [.light-theme_&]:text-emerald-600 uppercase tracking-wider">Score</th>
                                            <th className="px-6 py-5 text-center text-xs font-bold text-slate-400 [.light-theme_&]:text-teal-800 uppercase tracking-wider">Session</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50 [.light-theme_&]:divide-teal-100">
                                        {history.map(item => (
                                            <motion.tr
                                                key={item.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-slate-700/30 [.light-theme_&]:hover:bg-teal-50/50 transition-colors duration-200 group"
                                            >
                                                {/* Lesson & Date Column */}
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-base font-bold text-white [.light-theme_&]:text-slate-800 mb-1 group-hover:text-brand-tertiary transition-colors">{item.topicName || 'Unknown Topic'} - {item.lessonName || 'Lesson'}</span>
                                                        <span className="text-xs font-medium text-slate-500 [.light-theme_&]:text-teal-600/70 font-mono tracking-wide">{formatDate(item.date)}</span>
                                                    </div>
                                                </td>

                                                {/* Exercise Column with Tooltip */}
                                                <td className="px-6 py-6 max-w-xs">
                                                    <div className="group/tooltip relative">
                                                        <p className="text-sm text-slate-300 [.light-theme_&]:text-slate-600 font-medium line-clamp-2 leading-relaxed cursor-help">
                                                            {item.exerciseContent || 'No content details available for this exercise.'}
                                                        </p>
                                                        {item.exerciseContent && item.exerciseContent.length > 50 && (
                                                            <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-300 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                                                {item.exerciseContent}
                                                                <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-700"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Type Column */}
                                                <td className="px-6 py-6 text-center">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getTypeColor(item.exerciseType)} uppercase tracking-wide`}>
                                                        {item.exerciseType || 'Generic'}
                                                    </span>
                                                </td>

                                                {/* Score Column */}
                                                <td className="px-6 py-6 text-center">
                                                    {item.score > 0 ? (
                                                        <span className={`inline-flex items-center justify-center px-4 py-1.5 min-w-[80px] text-sm font-bold rounded-full shadow-lg border ${item.score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                            item.score >= 60 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                                                'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                                            }`}>
                                                            {item.score}
                                                            {/* <span className="text-[10px] opacity-70 ml-0.5">/100</span> */}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold rounded-full bg-slate-700/50 [.light-theme_&]:bg-slate-100 text-slate-500 [.light-theme_&]:text-slate-400 border border-slate-700 [.light-theme_&]:border-slate-200">
                                                            Not Graded
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Session Score */}
                                                <td className="px-6 py-6 text-center">
                                                    {
                                                        item.sessionScore > 0 ? (
                                                            <span className={`text-sm font-bold ${item.sessionScore >= 80 ? 'text-emerald-400' :
                                                                item.sessionScore >= 60 ? 'text-amber-400' :
                                                                    'text-rose-400'
                                                                }`}>
                                                                {item.sessionScore}%
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-slate-600 font-medium">-</span>
                                                        )
                                                    }
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>

                                {history.length === 0 && (
                                    <div className="text-center py-24">
                                        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">No History Yet</h3>
                                        <p className="text-slate-400 max-w-sm mx-auto">Start your first lesson to see your progress and stats appear here!</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {
                    totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-bold text-slate-400 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>

                            <div className="flex items-center space-x-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-9 h-9 flex items-center justify-center text-sm font-bold rounded-xl transition-all ${currentPage === page
                                            ? 'text-slate-900 bg-brand-primary shadow-lg shadow-brand-primary/20 scale-110'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-bold text-slate-400 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                            </button>
                        </div>
                    )
                }
            </div >
        </div >
    );
};

export default HistoryPage;