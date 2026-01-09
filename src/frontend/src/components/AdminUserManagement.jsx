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
        } catch {
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
        });
        setShowEditModal(true);
    };

    const handleUpdateUser = async () => {
        try {
            await api.put(`/users/${editingUser.id}`, {
                fullName: editForm.fullName,
                role: editForm.role
            });
            toast.success('User updated successfully');
            setShowEditModal(false);
            fetchUsers(currentPage);
        } catch {
            toast.error('Failed to update user');
        }
    };

    const handleDelete = async (user) => {
        if (window.confirm(`Are you sure you want to delete ${user.fullName}?`)) {
            try {
                await api.delete(`/users/${user.id}`);
                toast.success('User deleted successfully');

                setUsers(prev => prev.filter(u => u.id !== user.id));

                const remainingUsers = users.filter(u => u.id !== user.id);
                if (remainingUsers.length === 0 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }

                fetchUsers(currentPage);
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to delete user';
                toast.error(`Error: ${errorMessage}`);
                console.error('Delete user error:', error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>

                {/* Filters */}
                <div className="bg-slate-800 p-6 rounded-lg shadow-md mb-6 border border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Search by name or email"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)}
                                className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:border-brand-tertiary transition-all duration-300"
                            />
                        </div>
                        <div>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:border-brand-tertiary transition-all duration-300"
                            >
                                <option value="">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="learner">Learner</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden border border-slate-700">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-8">
                                <p className="text-slate-400">Loading users...</p>
                            </div>
                        ) : (
                            <table className="w-full table-auto">
                                <thead className="bg-slate-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-800 divide-y divide-slate-700">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-700/50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.fullName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-brand-tertiary/20 text-brand-tertiary'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-brand-tertiary bg-brand-tertiary/20 hover:bg-brand-tertiary/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-tertiary transition-all duration-300"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user)}
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

                        {users.length === 0 && !loading && (
                            <div className="text-center py-8">
                                <p className="text-slate-400">No users found.</p>
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
                    <div className="fixed inset-0 bg-slate-900/80 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border border-slate-700 w-96 shadow-lg rounded-xl bg-slate-800">
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-white">Edit User</h3>
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="text-slate-400 hover:text-white transition-colors duration-300"
                                    >
                                        <span className="text-2xl">&times;</span>
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={editForm.fullName}
                                            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:border-brand-tertiary transition-all duration-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                                        <select
                                            value={editForm.role}
                                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:border-brand-tertiary transition-all duration-300"
                                        >
                                            <option value="learner">Learner</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateUser}
                                        className="px-4 py-2 text-sm font-medium text-slate-900 bg-brand-primary border border-transparent rounded-md hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-300"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUserManagement;