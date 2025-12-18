import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Pagination } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';import PaginationControls from './PaginationControls';
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
        <div className="container mt-4">
            <h2>Exercise Management</h2>

            {/* Filters */}
            <div className="row mb-3">
                <div className="col-md-4">
                    <Form.Control
                        type="number"
                        placeholder="Filter by Lesson ID"
                        value={lessonIdFilter}
                        onChange={(e) => setLessonIdFilter(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchExercises(1)}
                    />
                </div>
                <div className="col-md-4">
                    <Form.Select value={typeFilter} onChange={(e) => {
                        setTypeFilter(e.target.value);
                        fetchExercises(1);
                    }}>
                        <option value="">All Types</option>
                        <option value="pronunciation">Pronunciation</option>
                        <option value="reading">Reading</option>
                        <option value="speaking">Speaking</option>
                    </Form.Select>
                </div>
                <div className="col-md-4">
                    <Button variant="primary" onClick={handleCreate}>
                        Create New Exercise
                    </Button>
                    <Button variant="secondary" onClick={() => fetchExercises(1)} className="ms-2">
                        Apply Filter
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Lesson ID</th>
                        <th>Content</th>
                        <th>Type</th>
                        <th>Order</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {exercises.map(exercise => (
                        <tr key={exercise.id}>
                            <td>{exercise.id}</td>
                            <td>{exercise.lessonId}</td>
                            <td>{exercise.contentText.substring(0, 50)}...</td>
                            <td>{exercise.type}</td>
                            <td>{exercise.orderIndex}</td>
                            <td>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handleEdit(exercise)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDelete(exercise)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Pagination */}
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {/* Create Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Exercise</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Lesson ID *</Form.Label>
                            <Form.Control
                                type="number"
                                value={form.lessonId}
                                onChange={(e) => setForm({ ...form, lessonId: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Content Text *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={form.contentText}
                                onChange={(e) => setForm({ ...form, contentText: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>IPA Transcription</Form.Label>
                            <Form.Control
                                type="text"
                                value={form.ipaTranscription}
                                onChange={(e) => setForm({ ...form, ipaTranscription: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Reference Audio URL</Form.Label>
                            <Form.Control
                                type="url"
                                value={form.referenceAudioUrl}
                                onChange={(e) => setForm({ ...form, referenceAudioUrl: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Type *</Form.Label>
                            <Form.Select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="pronunciation">Pronunciation</option>
                                <option value="reading">Reading</option>
                                <option value="speaking">Speaking</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Order Index</Form.Label>
                            <Form.Control
                                type="number"
                                value={form.orderIndex}
                                onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) })}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Create Exercise
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Exercise</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Lesson ID *</Form.Label>
                            <Form.Control
                                type="number"
                                value={form.lessonId}
                                onChange={(e) => setForm({ ...form, lessonId: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Content Text *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={form.contentText}
                                onChange={(e) => setForm({ ...form, contentText: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>IPA Transcription</Form.Label>
                            <Form.Control
                                type="text"
                                value={form.ipaTranscription}
                                onChange={(e) => setForm({ ...form, ipaTranscription: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Reference Audio URL</Form.Label>
                            <Form.Control
                                type="url"
                                value={form.referenceAudioUrl}
                                onChange={(e) => setForm({ ...form, referenceAudioUrl: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Type *</Form.Label>
                            <Form.Select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="pronunciation">Pronunciation</option>
                                <option value="reading">Reading</option>
                                <option value="speaking">Speaking</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Order Index</Form.Label>
                            <Form.Control
                                type="number"
                                value={form.orderIndex}
                                onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) })}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Update Exercise
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AdminExerciseManagement;