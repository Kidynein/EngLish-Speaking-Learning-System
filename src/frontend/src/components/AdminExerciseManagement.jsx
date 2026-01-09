import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PaginationControls from './PaginationControls';

const AdminExerciseManagement = () => {
    const navigate = useNavigate();
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lessonIdFilter, setLessonIdFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingExercise, setEditingExercise] = useState(null);
    const [form, setForm] = useState({
        lessonId: '',
        contentText: '',
        ipaTranscription: '',
        referenceAudioUrl: '',
        type: '',
        orderIndex: 0
    });
    const abortControllerRef = useRef(null);

    const fetchExercises = async (page = 1) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        setLoading(true);
        try {
            const response = await api.get('/exercises', {
                params: { page, limit: 10, lessonId: lessonIdFilter, type: typeFilter },
                signal: abortControllerRef.current.signal
            });
            setExercises(response.data.data.exercises);
            setTotalPages(Math.ceil(response.data.data.total / 10));
            setCurrentPage(page);
        } catch (error) {
            if (error.name === 'CanceledError' || error.name === 'AbortError') {
                console.log('Request canceled');
                return;
            }
            toast.error('Failed to fetch exercises');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = sessionStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('authToken');
        if (!token) {
            toast.error('Session expired, please login again');
            navigate('/login');
        } else {
            fetchExercises(currentPage);
        }
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [currentPage, lessonIdFilter, typeFilter]);

    const resetForm = () => {
        setForm({
            lessonId: '',
            contentText: '',
            ipaTranscription: '',
            referenceAudioUrl: '',
            type: '',
            orderIndex: 0
        });
    };

    const handleCreate = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const handleEdit = (exercise) => {
        setEditingExercise(exercise);
        setForm({
            lessonId: exercise.lessonId,
            contentText: exercise.contentText,
            ipaTranscription: exercise.ipaTranscription || '',
            referenceAudioUrl: exercise.referenceAudioUrl || '',
            type: exercise.type,
            orderIndex: exercise.orderIndex
        });
        setShowEditModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.lessonId || !form.contentText || !form.type) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (editingExercise) {
                await api.put(`/exercises/${editingExercise.id}`, form);
                toast.success('Exercise updated successfully');
                setShowEditModal(false);
            } else {
                await api.post('/exercises', form);
                toast.success('Exercise created successfully');
                setShowCreateModal(false);
            }
            fetchExercises(currentPage);
        } catch {
            toast.error('Failed to save exercise');
        }
    };

    const handleDelete = async (exercise) => {
        if (window.confirm(`Are you sure you want to delete this exercise?`)) {
            try {
                await api.delete(`/exercises/${exercise.id}`);
                toast.success('Exercise deleted successfully');
                fetchExercises(currentPage);
            } catch {
                toast.error('Failed to delete exercise');
            }
        }
    };

    // Reusable modal form component
    const ExerciseFormModal = ({ isOpen, onClose, title, onSubmit, submitText }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-slate-900/80 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border border-slate-700 w-full max-w-2xl shadow-lg rounded-xl bg-slate-800">
                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-white">{title}</h3>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-white transition-colors duration-300"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Lesson ID *</label>
                                <input
                                    type="number"
                                    value={form.lessonId}
                                    onChange={(e) => setForm({ ...form, lessonId: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:border-brand-tertiary transition-all duration-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Content Text *</label>
                                <textarea
                                    rows={3}
                                    value={form.contentText}
                                    onChange={(e) => setForm({ ...form, contentText: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:border-brand-tertiary transition-all duration-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">IPA Transcription</label>
                                <input
                                    type="text"
                                    value={form.ipaTranscription}
                                    onChange={(e) => setForm({ ...form, ipaTranscription: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:border-brand-tertiary transition-all duration-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Reference Audio URL</label>
                                <input
                                    type="url"
                                    value={form.referenceAudioUrl}
                                    onChange={(e) => setForm({ ...form, referenceAudioUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:border-brand-tertiary transition-all duration-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Type *</label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:border-brand-tertiary transition-all duration-300"
                                >
                                    <option value="">Select Type</option>
                                    <option value="pronunciation">Pronunciation</option>
                                    <option value="reading">Reading</option>
                                    <option value="speaking">Speaking</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Order Index</label>
                                <input
                                    type="number"
                                    value={form.orderIndex}
                                    onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:border-brand-tertiary transition-all duration-300"
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-slate-900 bg-brand-primary border border-transparent rounded-md hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-300"
                                >
                                    {submitText}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl font-bold text-white mb-6">Exercise Management</h2>

                {/* Filters */}
                <div className="bg-slate-800 p-6 rounded-lg shadow-md mb-6 border border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <input
                                type="number"
                                placeholder="Filter by Lesson ID"
                                value={lessonIdFilter}
                                onChange={(e) => setLessonIdFilter(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchExercises(1)}
                                className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:border-brand-tertiary transition-all duration-300"
                            />
                        </div>
                        <div>
                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value);
                                    fetchExercises(1);
                                }}
                                className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:border-brand-tertiary transition-all duration-300"
                            >
                                <option value="">All Types</option>
                                <option value="pronunciation">Pronunciation</option>
                                <option value="reading">Reading</option>
                                <option value="speaking">Speaking</option>
                            </select>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleCreate}
                                className="px-4 py-2 bg-brand-primary text-slate-900 rounded-md hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all duration-300 font-medium"
                            >
                                Create New Exercise
                            </button>
                            <button
                                onClick={() => fetchExercises(1)}
                                className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-300"
                            >
                                Apply Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden border border-slate-700">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-8">
                                <p className="text-slate-400">Loading exercises...</p>
                            </div>
                        ) : (
                            <table className="w-full table-auto">
                                <thead className="bg-slate-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Lesson ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Content</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Order</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-800 divide-y divide-slate-700">
                                    {exercises.map((exercise, index) => (
                                        <tr key={exercise.id || `exercise-${index}`} className="hover:bg-slate-700/50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{exercise.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{exercise.lessonId}</td>
                                            <td className="px-6 py-4 text-sm text-slate-300">{exercise.contentText?.substring(0, 50) || 'N/A'}...</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-brand-tertiary/20 text-brand-tertiary">
                                                    {exercise.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{exercise.orderIndex}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleEdit(exercise)}
                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-brand-tertiary bg-brand-tertiary/20 hover:bg-brand-tertiary/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-tertiary transition-all duration-300"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(exercise)}
                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-400 bg-red-500/20 hover:bg-red-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {exercises.length === 0 && !loading && (
                            <div className="text-center py-8">
                                <p className="text-slate-400">No exercises found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />

                {/* Create Modal */}
                <ExerciseFormModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    title="Create Exercise"
                    onSubmit={handleSubmit}
                    submitText="Create Exercise"
                />

                {/* Edit Modal */}
                <ExerciseFormModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    title="Edit Exercise"
                    onSubmit={handleSubmit}
                    submitText="Update Exercise"
                />
            </div>
        </div>
    );
};

export default AdminExerciseManagement;