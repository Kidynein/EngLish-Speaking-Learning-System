import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import userService from '../services/user.service';
import StatCard from '../components/StatCard';
import { motion } from 'framer-motion';

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
            // Fetch profile, stats, and progress in parallel
            const [profileRes, statsRes, progressRes] = await Promise.all([
                userService.getProfile(),
                userService.getUserStats(),
                userService.getUserProgress()
            ]);

            // Set profile data
            if (profileRes.success && profileRes.data) {
                setProfileData(profileRes.data);
                setProfileFormData({
                    fullName: profileRes.data.fullName || ''
                });
            }

            // Set stats data
            if (statsRes.success && statsRes.data) {
                setStats(statsRes.data);
            }

            // Set progress data
            if (progressRes.status === 'success' && progressRes.data) {
                const { summary, topics, skills } = progressRes.data;
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
        // Defensive: ensure button click never triggers form submit or navigation
        e?.preventDefault?.();
        e?.stopPropagation?.();

        // Keep form in sync with latest loaded data
        setProfileFormData({
            fullName: profileData?.fullName || user?.fullName || ''
        });

        setIsEditingProfile(true);

        // Focus after state update / re-render
        setTimeout(() => {
            fullNameInputRef.current?.focus?.();
            fullNameInputRef.current?.select?.();
        }, 0);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        // Optional: avoid calling API if nothing changed
        if ((profileData?.fullName || '') === (profileFormData.fullName || '')) {
            setIsEditingProfile(false);
            return;
        }

        setSaving(true);
        try {
            // If the request does not throw, treat it as success
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                <p className="text-gray-600 mt-2">Manage your account settings and view your learning statistics</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    label="Current Streak"
                    value={`${stats.currentStreak} days`}
                    description="Keep practicing daily!"
                    color="green"
                />
                <StatCard
                    label="Total Practice Time"
                    value={formatTime(stats.totalPracticeSeconds)}
                    description="Time spent learning"
                    color="blue"
                />
                <StatCard
                    label="Average Score"
                    value={`${Math.round(stats.averageScore)}%`}
                    description="Across all exercises"
                    color="purple"
                />
            </div>

            {/* Profile Information Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden mb-6"
            >
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-green-600 font-bold text-4xl shadow-lg">
                            {((profileData?.fullName || user?.fullName || 'U').charAt(0) || 'U').toUpperCase()}
                        </div>
                        <div className="text-white">
                            <h2 className="text-2xl font-bold">{profileData?.fullName || user?.fullName || 'User'}</h2>
                            <p className="text-green-50 mt-1">{profileData?.email || user?.email}</p>
                            <div className="flex gap-2 mt-3">
                                <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                                    {profileData?.role === 'admin' || user?.role === 'admin' ? '👑 Admin' : '🎓 Student'}
                                </div>
                                <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
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
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="text-2xl">👤</span>
                                Basic Information
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={profileFormData.fullName}
                                        onChange={handleProfileChange}
                                        disabled={!isEditingProfile}
                                        ref={fullNameInputRef}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData?.email || user?.email || ''}
                                        disabled
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-500 bg-gray-50 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">📧 Email cannot be changed</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Member Since
                                        </label>
                                        <input
                                            type="text"
                                            value={formatDate(profileData?.createdAt || user?.createdAt)}
                                            disabled
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-500 bg-gray-50 cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Updated
                                        </label>
                                        <input
                                            type="text"
                                            value={formatDate(profileData?.updatedAt || user?.updatedAt)}
                                            disabled
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-500 bg-gray-50 cursor-not-allowed"
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
                                    className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors shadow-sm"
                                >
                                    ✏️ Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                    >
                                        {saving ? '💾 Saving...' : '💾 Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelProfile}
                                        disabled={saving}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                className="bg-white rounded-xl shadow-md p-6 mb-6"
            >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Learning Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-lg">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                            ✅
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Completed</p>
                            <p className="text-2xl font-bold text-green-600">{progressData.completedExercises}</p>
                            <p className="text-xs text-gray-500">exercises</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-lg">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl">
                            📝
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Exercises</p>
                            <p className="text-2xl font-bold text-blue-600">{progressData.totalExercises}</p>
                            <p className="text-xs text-gray-500">attempted</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-lg">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                            📚
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Topics Covered</p>
                            <p className="text-2xl font-bold text-purple-600">{progressData.topicsCovered}</p>
                            <p className="text-xs text-gray-500">different topics</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 rounded-lg">
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl">
                            🔥
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Streak</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.currentStreak}</p>
                            <p className="text-xs text-gray-500">day{stats.currentStreak !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Account Information Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white rounded-xl shadow-md p-6"
            >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">ℹ️</span>
                    Account Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-lg">
                            ✅
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Account Status</p>
                            <p className="font-semibold text-gray-800">Active</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-lg">
                            🎭
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Role</p>
                            <p className="font-semibold text-gray-800 capitalize">
                                {profileData?.role || user?.role || 'Student'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-lg">
                            ⏱️
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Last Practice</p>
                            <p className="font-semibold text-gray-800">
                                {stats.lastPracticeDate ? formatDate(stats.lastPracticeDate) : 'Never'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-lg">
                            📅
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Member Since</p>
                            <p className="font-semibold text-gray-800">
                                {formatDate(profileData?.createdAt || user?.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfilePage;
