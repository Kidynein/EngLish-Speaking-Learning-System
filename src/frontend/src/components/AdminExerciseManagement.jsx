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
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken');
        if (!token) {
            toast.error('Session expired, please login again');
            navigate('/login');
        } else {
            fetchExercises(currentPage);
        }
        return() => {
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
        } catch (error) {
            toast.error('Failed to save exercise');
        }
    };

    const handleDelete = async (exercise) => {
        if (window.confirm(`Are you sure you want to delete this exercise?`)) {
            try {
                await api.delete(`/exercises/${exercise.id}`);
                toast.success('Exercise deleted successfully');
                fetchExercises(currentPage);
            } catch (error) {
                toast.error('Failed to delete exercise');
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Exercise Management</h2>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <input
                            type="number"
                            placeholder="Filter by Lesson ID"
                            value={lessonIdFilter}
                            onChange={(e) => setLessonIdFilter(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchExercises(1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <select
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                fetchExercises(1);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Create New Exercise
                        </button>
                        <button
                            onClick={() => fetchExercises(1)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            Apply Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Loading exercises...</p>
                        </div>
                    ) : (
                        <table className="w-full table-auto">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lesson ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {exercises.map(exercise => (
                                    <tr key={exercise.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exercise.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exercise.lessonId}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{exercise.contentText.substring(0, 50)}...</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exercise.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exercise.orderIndex}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleEdit(exercise)}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(exercise)}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                            <p className="text-gray-500">No exercises found.</p>
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
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Create Exercise</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <span className="text-2xl">&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lesson ID *</label>
                                    <input
                                        type="number"
                                        value={form.lessonId}
                                        onChange={(e) => setForm({ ...form, lessonId: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content Text *</label>
                                    <textarea
                                        rows={3}
                                        value={form.contentText}
                                        onChange={(e) => setForm({ ...form, contentText: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">IPA Transcription</label>
                                    <input
                                        type="text"
                                        value={form.ipaTranscription}
                                        onChange={(e) => setForm({ ...form, ipaTranscription: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference Audio URL</label>
                                    <input
                                        type="url"
                                        value={form.referenceAudioUrl}
                                        onChange={(e) => setForm({ ...form, referenceAudioUrl: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select Type</option>
                                        <option value="pronunciation">Pronunciation</option>
                                        <option value="reading">Reading</option>
                                        <option value="speaking">Speaking</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Index</label>
                                    <input
                                        type="number"
                                        value={form.orderIndex}
                                        onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Create Exercise
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Edit Exercise</h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <span className="text-2xl">&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lesson ID *</label>
                                    <input
                                        type="number"
                                        value={form.lessonId}
                                        onChange={(e) => setForm({ ...form, lessonId: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content Text *</label>
                                    <textarea
                                        rows={3}
                                        value={form.contentText}
                                        onChange={(e) => setForm({ ...form, contentText: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">IPA Transcription</label>
                                    <input
                                        type="text"
                                        value={form.ipaTranscription}
                                        onChange={(e) => setForm({ ...form, ipaTranscription: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference Audio URL</label>
                                    <input
                                        type="url"
                                        value={form.referenceAudioUrl}
                                        onChange={(e) => setForm({ ...form, referenceAudioUrl: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select Type</option>
                                        <option value="pronunciation">Pronunciation</option>
                                        <option value="reading">Reading</option>
                                        <option value="speaking">Speaking</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Index</label>
                                    <input
                                        type="number"
                                        value={form.orderIndex}
                                        onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Update Exercise
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminExerciseManagement;