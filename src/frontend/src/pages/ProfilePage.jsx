import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { usePremium } from '../context/PremiumContext';
import userService from '../services/user.service';
import StatCard from '../components/StatCard';
import { motion } from 'framer-motion';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const { subscription, isPremium, isPro, cancelSubscription, refreshSubscription, currentPlan, openPremiumModal } = usePremium();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [cancellingSubscription, setCancellingSubscription] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
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

    const handleCancelSubscription = async () => {
        setCancellingSubscription(true);
        try {
            await cancelSubscription();
            await refreshSubscription();
            toast.success('Đã hủy gói Premium thành công');
            setShowCancelConfirm(false);
            // Force a small delay then refresh to ensure UI updates
            setTimeout(() => {
                refreshSubscription();
            }, 500);
        } catch (error) {
            console.error('Cancel subscription error:', error);
            // Show error message from server if available
            const errorMessage = error.message || 'Không thể hủy gói. Vui lòng thử lại.';
            toast.error(errorMessage);
            setShowCancelConfirm(false);
        } finally {
            setCancellingSubscription(false);
        }
    };

    const formatSubscriptionDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
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
                <div className="bg-linear-to-r from-green-500 to-emerald-600 px-6 py-8">
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
                    <div className="flex items-center gap-3 p-4 bg-linear-to-br from-green-50 to-emerald-50 border border-green-100 rounded-lg">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                            ✅
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Completed</p>
                            <p className="text-2xl font-bold text-green-600">{progressData.completedExercises}</p>
                            <p className="text-xs text-gray-500">exercises</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-linear-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-lg">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl">
                            📝
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Exercises</p>
                            <p className="text-2xl font-bold text-blue-600">{progressData.totalExercises}</p>
                            <p className="text-xs text-gray-500">attempted</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-linear-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-lg">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                            📚
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Topics Covered</p>
                            <p className="text-2xl font-bold text-purple-600">{progressData.topicsCovered}</p>
                            <p className="text-xs text-gray-500">different topics</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-linear-to-br from-orange-50 to-red-50 border border-orange-100 rounded-lg">
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

            {/* Premium Subscription Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-white rounded-xl shadow-md p-6 mt-6"
            >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    Gói đăng ký Premium
                </h3>

                {/* Check if subscription is cancelled */}
                {subscription?.status === 'cancelled' ? (
                    // Cancelled Subscription
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl border bg-orange-50 border-orange-200">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-100 text-orange-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-orange-700">
                                            Gói đã hủy
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Trạng thái: <span className="font-medium text-orange-600">Đã hủy</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Show when access ends */}
                        {subscription?.endDate && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">📅</span>
                                    <div>
                                        <p className="font-medium text-yellow-800">
                                            Bạn vẫn có thể sử dụng các tính năng {subscription?.plan === 'pro' ? 'Pro' : 'Premium'} đến:
                                        </p>
                                        <p className="text-lg font-bold text-yellow-900 mt-1">
                                            {formatSubscriptionDate(subscription.endDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Upgrade again */}
                        <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl p-4 text-white">
                            <h4 className="font-bold mb-1">🔄 Đăng ký lại?</h4>
                            <p className="text-sm text-green-50 mb-3">
                                Bạn có thể đăng ký lại gói Premium bất kỳ lúc nào
                            </p>
                            <button
                                onClick={() => openPremiumModal()}
                                className="px-4 py-2 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
                            >
                                Xem các gói Premium
                            </button>
                        </div>
                    </div>
                ) : (isPremium || isPro) ? (
                    // Active Premium/Pro Subscription
                    <div className="space-y-4">
                        {/* Subscription Status */}
                        <div className={`p-4 rounded-xl border ${
                            isPro 
                                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' 
                                : 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200'
                        }`}>
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                                        isPro ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-emerald-500 to-green-500'
                                    }`}>
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className={`text-lg font-bold ${isPro ? 'text-purple-700' : 'text-emerald-700'}`}>
                                            {currentPlan?.name || (isPro ? 'Pro' : 'Premium')} Plan
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Trạng thái: <span className="font-medium text-green-600">Đang hoạt động</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-2xl font-bold ${isPro ? 'text-purple-600' : 'text-emerald-600'}`}>
                                        ${subscription?.billingCycle === 'yearly' 
                                            ? (currentPlan?.priceYearly || (isPro ? '199.99' : '99.99'))
                                            : (currentPlan?.price || (isPro ? '19.99' : '9.99'))
                                        }
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        /{subscription?.billingCycle === 'yearly' ? 'năm' : 'tháng'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Ngày bắt đầu</p>
                                <p className="font-semibold text-gray-800">
                                    {formatSubscriptionDate(subscription?.startDate)}
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Ngày hết hạn</p>
                                <p className="font-semibold text-gray-800">
                                    {formatSubscriptionDate(subscription?.endDate)}
                                </p>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="border-t pt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Tính năng đang sử dụng:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {currentPlan?.features?.slice(0, 6).map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cancel Subscription Button */}
                        <div className="border-t pt-4">
                            {!showCancelConfirm ? (
                                <button
                                    onClick={() => setShowCancelConfirm(true)}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                                >
                                    Hủy gói đăng ký
                                </button>
                            ) : (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 flex-shrink-0">
                                            ⚠️
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-red-800">Xác nhận hủy gói</h4>
                                            <p className="text-sm text-red-600 mt-1">
                                                Bạn có chắc chắn muốn hủy gói {currentPlan?.name}? Bạn sẽ mất quyền truy cập các tính năng premium sau khi hủy.
                                            </p>
                                            <div className="flex gap-3 mt-4">
                                                <button
                                                    onClick={handleCancelSubscription}
                                                    disabled={cancellingSubscription}
                                                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {cancellingSubscription ? 'Đang hủy...' : 'Xác nhận hủy'}
                                                </button>
                                                <button
                                                    onClick={() => setShowCancelConfirm(false)}
                                                    disabled={cancellingSubscription}
                                                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                                                >
                                                    Giữ gói
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // Free Plan
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-700">Gói Miễn phí</h4>
                                    <p className="text-sm text-gray-500">Bạn đang sử dụng gói miễn phí với các tính năng cơ bản</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Giới hạn gói Free:</p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    <span className="text-yellow-500">⚠️</span>
                                    Chỉ 10 chủ đề
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-yellow-500">⚠️</span>
                                    5 buổi luyện tập mỗi ngày
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-yellow-500">⚠️</span>
                                    Phản hồi cơ bản
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl p-4 text-white">
                            <h4 className="font-bold mb-1">🚀 Nâng cấp ngay!</h4>
                            <p className="text-sm text-green-50 mb-3">
                                Mở khóa toàn bộ tính năng với gói Premium hoặc Pro
                            </p>
                            <button
                                onClick={() => openPremiumModal()}
                                className="px-4 py-2 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
                            >
                                Xem các gói Premium
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ProfilePage;
