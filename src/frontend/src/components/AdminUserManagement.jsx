import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PaginationControls from './PaginationControls';

const AdminUserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ fullName: '', role: '' });

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const response = await api.get('/users/admin', {
                params: { page, limit: 10, search, role: roleFilter }
            });
            setUsers(response.data.data.users);
            setTotalPages(Math.ceil(response.data.data.total / 10));
            setCurrentPage(page);
        } catch (error) {
            toast.error('Failed to fetch users');
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
            fetchUsers(currentPage);
        }
    }, [currentPage, search, roleFilter]);

    const handleEdit = (user) => {
        setEditingUser(user);
        setEditForm({
            fullName: user.fullName,
            role: user.role
            // isActive: user.isActive // TODO: Add is_active column
        });
        setShowEditModal(true);
    };

    const handleUpdateUser = async () => {
        try {
            await api.put(`/users/${editingUser.id}`, {
                fullName: editForm.fullName,
                role: editForm.role
                // isActive: editForm.isActive // TODO: Add is_active column
            });
            toast.success('User updated successfully');
            setShowEditModal(false);
            fetchUsers(currentPage);
        } catch (error) {
            toast.error('Failed to update user');
        }
    };

    // const handleToggleActive = async (user) => {
    //     try {
    //         await api.put(`/users/${user.id}`, { isActive: !user.isActive });
    //         toast.success('User status updated');
    //         fetchUsers(currentPage);
    //     } catch (error) {
    //         toast.error('Failed to update user status');
    //     }
    // };

    const handleDelete = async (user) => {
        if (window.confirm(`Are you sure you want to delete ${user.fullName}?`)) {
            try {
                await api.delete(`/users/${user.id}`);
                toast.success('User deleted successfully');
                
                // Immediately update local state
                setUsers(prev => prev.filter(u => u.id !== user.id));
                
                // Handle edge case: if this was the last item on the page and not page 1
                const remainingUsers = users.filter(u => u.id !== user.id);
                if (remainingUsers.length === 0 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
                
                // Refetch to update total count and ensure consistency
                fetchUsers(currentPage);
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to delete user';
                toast.error(`Error: ${errorMessage}`);
                console.error('Delete user error:', error);
            }
        }
    };

    return (
        <div className="container mt-4">
            <h2>User Management</h2>

            {/* Filters */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <Form.Control
                        type="text"
                        placeholder="Search by name or email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)}
                    />
                </div>
                <div className="col-md-3">
                    <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="learner">Learner</option>
                    </Form.Select>
                </div>
            </div>

            {/* Table */}
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        {/* <th>Status</th> TODO: Add is_active column */}
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.fullName}</td>
                            <td>{user.email}</td>
                            <td>
                                <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                                    {user.role}
                                </Badge>
                            </td>
                            {/* <td>
                                <Badge bg={user.isActive ? 'success' : 'secondary'}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </td> TODO: Add is_active column */}
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handleEdit(user)}
                                >
                                    Edit
                                </Button>
                                {/* <Button
                                    variant={user.isActive ? "outline-warning" : "outline-success"}
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handleToggleActive(user)}
                                >
                                    {user.isActive ? 'Deactivate' : 'Activate'}
                                </Button> TODO: Add is_active column */}
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDelete(user)}
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

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={editForm.fullName}
                                onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Role</Form.Label>
                            <Form.Select
                                value={editForm.role}
                                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                            >
                                <option value="learner">Learner</option>
                                <option value="admin">Admin</option>
                            </Form.Select>
                        </Form.Group>
                        {/* <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Active"
                                checked={editForm.isActive}
                                onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                            />
                        </Form.Group> TODO: Add is_active column */}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleUpdateUser}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminUserManagement;