import React, { useState, useEffect } from 'react';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Search by name or email"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="learner">Learner</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Loading users...</p>
                        </div>
                    ) : (
                        <table className="w-full table-auto">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.fullName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
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

                    {users.length === 0 && !loading && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No users found.</p>
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

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <span className="text-2xl">&times;</span>
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.fullName}
                                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="learner">Learner</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateUser}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;