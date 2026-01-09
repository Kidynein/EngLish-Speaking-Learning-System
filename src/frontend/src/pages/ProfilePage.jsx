import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import userService from '../services/user.service';
import StatCard from '../components/StatCard';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const fullNameInputRef = useRef(null);

    const [profileData, setProfileData] = useState(null);
    const [stats, setStats] = useState({
        currentStreak: 0,
        totalPracticeSeconds: 0,
        averageScore: 0,
        lastPracticeDate: null
    });
    const [progressData, setProgressData] = useState({
        totalExercises: 0,
        completedExercises: 0,
        topicsCovered: 0
    });

    const [profileFormData, setProfileFormData] = useState({
        fullName: ''
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [profileRes, statsRes, progressRes] = await Promise.all([
                userService.getProfile(),
                userService.getUserStats(),
                userService.getUserProgress()
            ]);

            if (profileRes.success && profileRes.data) {
                setProfileData(profileRes.data);
                setProfileFormData({
                    fullName: profileRes.data.fullName || ''
                });
            }

            if (statsRes.success && statsRes.data) {
                setStats(statsRes.data);
            }

            if (progressRes.status === 'success' && progressRes.data) {
                const { summary, topics } = progressRes.data;
                setProgressData({
                    totalExercises: summary?.totalExercises || 0,
                    completedExercises: summary?.completedExercises || 0,
                    topicsCovered: topics?.length || 0
                });
            }

        } catch (error) {
            console.error('Failed to load profile data:', error);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        setProfileFormData({
            ...profileFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleStartEditProfile = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();

        setProfileFormData({
            fullName: profileData?.fullName || user?.fullName || ''
        });

        setIsEditingProfile(true);

        setTimeout(() => {
            fullNameInputRef.current?.focus?.();
            fullNameInputRef.current?.select?.();
        }, 0);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if ((profileData?.fullName || '') === (profileFormData.fullName || '')) {
            setIsEditingProfile(false);
            return;
        }

        setSaving(true);
        try {
            await userService.updateProfile({ fullName: profileFormData.fullName });

            updateUser({ ...user, fullName: profileFormData.fullName });
            setProfileData(prev => ({ ...prev, fullName: profileFormData.fullName }));
            toast.success('Profile updated successfully');
            setIsEditingProfile(false);
        } catch (error) {
            console.error('Update error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to update profile';
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleCancelProfile = () => {
        setIsEditingProfile(false);
        setProfileFormData({
            fullName: profileData?.fullName || ''
        });
    };

    const formatTime = (seconds) => {
        if (!seconds) return "0 mins";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes} mins`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">My Profile</h1>
                    <p className="text-slate-400 mt-2">Manage your account settings and view your learning statistics</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        label="Current Streak"
                        value={`${stats.currentStreak} days`}
                        description="Keep practicing daily!"
                        color="primary"
                    />
                    <StatCard
                        label="Total Practice Time"
                        value={formatTime(stats.totalPracticeSeconds)}
                        description="Time spent learning"
                        color="secondary"
                    />
                    <StatCard
                        label="Average Score"
                        value={`${Math.round(stats.averageScore)}%`}
                        description="Across all exercises"
                        color="tertiary"
                    />
                </div>

                {/* Profile Information Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-800 rounded-xl shadow-md overflow-hidden mb-6 border border-slate-700"
                >
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-8">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-brand-primary font-bold text-4xl shadow-lg border-4 border-white/20">
                                {((profileData?.fullName || user?.fullName || 'U').charAt(0) || 'U').toUpperCase()}
                            </div>
                            <div className="text-slate-900">
                                <h2 className="text-2xl font-bold">{profileData?.fullName || user?.fullName || 'User'}</h2>
                                <p className="text-slate-800 mt-1">{profileData?.email || user?.email}</p>
                                <div className="flex gap-2 mt-3">
                                    <div className="inline-block px-3 py-1 bg-slate-900/30 rounded-full text-sm font-medium text-white">
                                        {profileData?.role === 'admin' || user?.role === 'admin' ? '👑 Admin' : '🎓 Student'}
                                    </div>
                                    <div className="inline-block px-3 py-1 bg-slate-900/30 rounded-full text-sm font-medium text-white">
                                        ✅ Active
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <form onSubmit={handleUpdateProfile}>
                            {/* Basic Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <span className="text-2xl">👤</span>
                                    Basic Information
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Full Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={profileFormData.fullName}
                                            onChange={handleProfileChange}
                                            disabled={!isEditingProfile}
                                            ref={fullNameInputRef}
                                            className="w-full px-4 py-3 border border-slate-600 rounded-lg text-white bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-tertiary disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={profileData?.email || user?.email || ''}
                                            disabled
                                            className="w-full px-4 py-3 border border-slate-600 rounded-lg text-slate-400 bg-slate-800 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">📧 Email cannot be changed</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Member Since
                                            </label>
                                            <input
                                                type="text"
                                                value={formatDate(profileData?.createdAt || user?.createdAt)}
                                                disabled
                                                className="w-full px-4 py-3 border border-slate-600 rounded-lg text-slate-400 bg-slate-800 cursor-not-allowed"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Last Updated
                                            </label>
                                            <input
                                                type="text"
                                                value={formatDate(profileData?.updatedAt || user?.updatedAt)}
                                                disabled
                                                className="w-full px-4 py-3 border border-slate-600 rounded-lg text-slate-400 bg-slate-800 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons for Profile */}
                            <div className="flex gap-4">
                                {!isEditingProfile ? (
                                    <button
                                        type="button"
                                        onClick={handleStartEditProfile}
                                        disabled={saving}
                                        className="px-6 py-3 bg-brand-primary text-slate-900 font-medium rounded-lg hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-300 shadow-sm"
                                    >
                                        ✏️ Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-6 py-3 bg-brand-primary text-slate-900 font-medium rounded-lg hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
                                        >
                                            {saving ? '💾 Saving...' : '💾 Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelProfile}
                                            disabled={saving}
                                            className="px-6 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                        >
                                            ❌ Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* Learning Statistics Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-slate-800 rounded-xl shadow-md p-6 mb-6 border border-slate-700"
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">📊</span>
                        Learning Statistics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-brand-primary/10 border border-brand-primary/30 rounded-lg">
                            <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-slate-900 text-xl">
                                ✅
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Completed</p>
                                <p className="text-2xl font-bold text-brand-primary">{progressData.completedExercises}</p>
                                <p className="text-xs text-slate-500">exercises</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-brand-tertiary/10 border border-brand-tertiary/30 rounded-lg">
                            <div className="w-12 h-12 bg-brand-tertiary rounded-full flex items-center justify-center text-slate-900 text-xl">
                                📝
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Total Exercises</p>
                                <p className="text-2xl font-bold text-brand-tertiary">{progressData.totalExercises}</p>
                                <p className="text-xs text-slate-500">attempted</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                                📚
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Topics Covered</p>
                                <p className="text-2xl font-bold text-purple-400">{progressData.topicsCovered}</p>
                                <p className="text-xs text-slate-500">different topics</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-brand-secondary/10 border border-brand-secondary/30 rounded-lg">
                            <div className="w-12 h-12 bg-brand-secondary rounded-full flex items-center justify-center text-slate-900 text-xl">
                                🔥
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Streak</p>
                                <p className="text-2xl font-bold text-brand-secondary">{stats.currentStreak}</p>
                                <p className="text-xs text-slate-500">day{stats.currentStreak !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Account Information Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-slate-800 rounded-xl shadow-md p-6 border border-slate-700"
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">ℹ️</span>
                        Account Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors duration-300">
                            <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary text-lg">
                                ✅
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Account Status</p>
                                <p className="font-semibold text-white">Active</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors duration-300">
                            <div className="w-10 h-10 bg-brand-tertiary/20 rounded-full flex items-center justify-center text-brand-tertiary text-lg">
                                🎭
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Role</p>
                                <p className="font-semibold text-white capitalize">
                                    {profileData?.role || user?.role || 'Student'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors duration-300">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-lg">
                                ⏱️
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Last Practice</p>
                                <p className="font-semibold text-white">
                                    {stats.lastPracticeDate ? formatDate(stats.lastPracticeDate) : 'Never'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors duration-300">
                            <div className="w-10 h-10 bg-brand-secondary/20 rounded-full flex items-center justify-center text-brand-secondary text-lg">
                                📅
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Member Since</p>
                                <p className="font-semibold text-white">
                                    {formatDate(profileData?.createdAt || user?.createdAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfilePage;
